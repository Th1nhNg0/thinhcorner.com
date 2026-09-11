#!/bin/sh
# ---------------------------------------------------------------------------
# thinhcorner.com - sync this machine's AI token usage into the site data.
#
#   curl -fsSL https://raw.githubusercontent.com/Th1nhNg0/thinhcorner.com/master/scripts/sync-ccusage.sh | sh
#   curl -fsSL .../sync-ccusage.sh | sh -s -- --dry-run
#   curl -fsSL .../sync-ccusage.sh | sh -s -- --install-cron
#   curl -fsSL .../sync-ccusage.sh | sh -s -- --install-cron --at 08:30
#   curl -fsSL .../sync-ccusage.sh | sh -s -- --status
#   curl -fsSL .../sync-ccusage.sh | sh -s -- --uninstall-cron
#
# What it does
#   1. shallow-clones the repo into a temp dir (nothing is left behind)
#   2. runs `bun scripts/update-ccusage.ts`, which reads ccusage for every agent
#      home on this machine, merges it into data/ccusage.json, commits, pushes
#   3. Cloudflare Workers rebuilds the site from the pushed commit
#
# Options
#   --dry-run           compute + write data in the temp clone, never commit/push
#   --install-cron      install a daily scheduler for this machine, then sync once
#   --no-sync           with --install-cron: install the schedule only
#   --uninstall-cron    remove the schedule installed by --install-cron
#   --at HH:MM          schedule time, 24h, default 23:55 (also THINHCORNER_AT)
#   --status            show config, cached copy, schedule and recent log
#   --help              this text
#   anything else       passed through to scripts/update-ccusage.ts
#                       (e.g. --no-commit, --since 2026-01-01)
#
# Config file (optional, sourced before anything else runs):
#   ~/.config/thinhcorner/ccusage-sync.env
#     CCUSAGE_SOURCE=DESKTOP-3CH2JO3   # id stored in data/ccusage.json (default:
#                                      # hostname; keep it stable per machine!)
#     GH_TOKEN=github_pat_...          # only needed when git has no stored creds
#     THINHCORNER_AT=23:55             # default schedule time
#     THINHCORNER_REPO_URL=git@github.com:Th1nhNg0/thinhcorner.com.git
#     GIT_AUTHOR_NAME=... / GIT_AUTHOR_EMAIL=...
# ---------------------------------------------------------------------------
set -eu

REPO_SLUG="Th1nhNg0/thinhcorner.com"
BRANCH="master"
SCRIPT_URL="${THINHCORNER_SCRIPT_URL:-https://raw.githubusercontent.com/${REPO_SLUG}/${BRANCH}/scripts/sync-ccusage.sh}"
DEFAULT_AT="23:55"
TASK_NAME="ThinhCornerCcusageSync"
MARKER="thinhcorner-ccusage-sync"

# bun installs here by default; cron/launchd run with a minimal PATH.
BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
PATH="$BUN_INSTALL/bin:$HOME/.bun/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"
export PATH

say() { printf '[ccusage-sync] %s\n' "$*"; }
warn() { printf '[ccusage-sync] warning: %s\n' "$*" >&2; }
die() {
  printf '[ccusage-sync] error: %s\n' "$*" >&2
  exit 1
}

# --- arguments -------------------------------------------------------------
at="$DEFAULT_AT"
at_given=0
dry_run=0
install_cron=0
uninstall_cron=0
do_sync=1
show_status=0
extra_args=""

usage() {
  sed -n '2,40p' "$0" 2>/dev/null | sed 's/^# \{0,1\}//' || printf 'see the script header for usage\n'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)
      dry_run=1
      extra_args="$extra_args --dry-run"
      ;;
    --install-cron | --install-schedule)
      install_cron=1
      ;;
    --uninstall-cron | --uninstall-schedule)
      uninstall_cron=1
      do_sync=0
      ;;
    --no-sync)
      do_sync=0
      ;;
    --at)
      shift
      [ $# -gt 0 ] || die "--at needs a value, e.g. --at 23:55"
      at="$1"
      at_given=1
      ;;
    --at=*)
      at=${1#--at=}
      at_given=1
      ;;
    --status)
      show_status=1
      do_sync=0
      ;;
    --help | -h)
      usage
      exit 0
      ;;
    *)
      extra_args="$extra_args $1"
      ;;
  esac
  shift
done

# --- normalise paths (MSYS/Cygwin may hand us C:\... style paths) ----------
if command -v cygpath >/dev/null 2>&1; then
  normalize() {
    case "$1" in
      [A-Za-z]:[\\/]*) cygpath -u "$1" ;;
      *) printf '%s' "$1" ;;
    esac
  }
  HOME=$(normalize "$HOME")
  XDG_CONFIG_HOME=$(normalize "${XDG_CONFIG_HOME:-}")
  XDG_DATA_HOME=$(normalize "${XDG_DATA_HOME:-}")
  XDG_STATE_HOME=$(normalize "${XDG_STATE_HOME:-}")
fi

config_path="${THINHCORNER_CONFIG:-${XDG_CONFIG_HOME:-$HOME/.config}/thinhcorner/ccusage-sync.env}"
data_home="${XDG_DATA_HOME:-$HOME/.local/share}/thinhcorner"
state_home="${XDG_STATE_HOME:-$HOME/.local/state}/thinhcorner"
cache_path="$data_home/sync-ccusage.sh"
log_path="$state_home/sync.log"

# --- config file -----------------------------------------------------------
[ -f "$config_path" ] && . "$config_path"

[ "$at_given" = 1 ] || at="${THINHCORNER_AT:-$at}"
repo_url="${THINHCORNER_REPO_URL:-https://github.com/${REPO_SLUG}.git}"
token="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
source_id="${CCUSAGE_SOURCE:-}"

# --- platform --------------------------------------------------------------
kernel=$(uname -s 2>/dev/null || printf unknown)
case "$kernel" in
  MINGW* | MSYS* | CYGWIN*) platform=windows ;;
  Darwin) platform=macos ;;
  *) platform=linux ;;
esac
is_wsl=0
if [ -r /proc/version ] && grep -qi microsoft /proc/version 2>/dev/null; then
  is_wsl=1
fi

# Git Bash/MSYS rewrites single-slash flags such as /Create into paths, so the
# Windows scheduler is always called through this wrapper.
schtasks_bin=""
if [ "$platform" = windows ]; then
  schtasks_bin=/c/Windows/System32/schtasks.exe
  [ -x "$schtasks_bin" ] || schtasks_bin=$(command -v schtasks.exe 2>/dev/null || command -v schtasks 2>/dev/null || true)
fi
schtasks_run() {
  [ -n "$schtasks_bin" ] || die "schtasks.exe not found; schedule Task Scheduler manually"
  MSYS2_ARG_CONV_EXCL='*' MSYS_NO_PATHCONV=1 "$schtasks_bin" "$@"
}

# --- schedule helpers ------------------------------------------------------
# HH:MM -> printable + cron fields, rejecting junk before it reaches cron.
validate_at() {
  case "$at" in
    [0-9]:[0-9][0-9] | [0-9][0-9]:[0-9][0-9]) ;;
    *) die "--at expects HH:MM in 24h time, got '$at'" ;;
  esac
  t_hh=$(printf '%s' "${at%%:*}" | sed 's/^0*//')
  t_mm=$(printf '%s' "${at#*:}" | sed 's/^0*//')
  [ -n "$t_hh" ] || t_hh=0
  [ -n "$t_mm" ] || t_mm=0
  [ "$t_hh" -le 23 ] || die "hour out of range in '$at'"
  [ "$t_mm" -le 59 ] || die "minute out of range in '$at'"
  at_pretty=$(printf '%02d:%02d' "$t_hh" "$t_mm")
}

cache_script() {
  mkdir -p "$data_home" "$state_home"
  if command -v curl >/dev/null 2>&1; then
    tmp_cache="$cache_path.tmp.$$"
    if curl -fsSL "$SCRIPT_URL" -o "$tmp_cache" 2>/dev/null; then
      mv "$tmp_cache" "$cache_path"
      chmod +x "$cache_path" 2>/dev/null || true
      say "cached script: $cache_path"
      return 0
    fi
    rm -f "$tmp_cache"
    warn "could not download $SCRIPT_URL"
  fi
  [ -f "$cache_path" ] || die "no cached copy at $cache_path and curl could not fetch $SCRIPT_URL"
  say "using existing cached copy: $cache_path"
}

cron_runner() {
  printf "/bin/sh '%s' >> '%s' 2>&1" "$cache_path" "$log_path"
}

install_schedule() {
  validate_at
  cache_script
  mkdir -p "$state_home"
  if [ -z "$token" ]; then
    warn "scheduled runs are headless: if git has no stored credentials on this machine,"
    warn "pushes will fail. Put GH_TOKEN=... in $config_path to make them work."
  fi
  case "$platform" in
    linux)
      command -v crontab >/dev/null 2>&1 || die "crontab not found; install cron (Debian/Ubuntu: sudo apt-get install -y cron) or schedule this manually"
      tmp_cron="${TMPDIR:-/tmp}/thinhcorner-cron.$$"
      crontab -l 2>/dev/null | grep -v -e "$MARKER" -e "$cache_path" >"$tmp_cron" || true
      {
        printf '# %s (managed by scripts/sync-ccusage.sh)\n' "$MARKER"
        printf '%s %s * * * %s\n' "$t_mm" "$t_hh" "$(cron_runner)"
      } >>"$tmp_cron"
      crontab "$tmp_cron"
      rm -f "$tmp_cron"
      say "installed cron entry: daily at $at_pretty"
      if [ "$is_wsl" = 1 ] && ! command -v cron >/dev/null 2>&1 && ! command -v cronie >/dev/null 2>&1; then
        warn "this WSL distro has no cron daemon, so the entry will not fire until you install one:"
        warn "  sudo apt-get install -y cron && sudo service cron start"
      fi
      ;;
    macos)
      plist="$HOME/Library/LaunchAgents/com.thinhcorner.ccusage-sync.plist"
      mkdir -p "$HOME/Library/LaunchAgents"
      cat >"$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.thinhcorner.ccusage-sync</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>$cache_path</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>$t_hh</integer>
    <key>Minute</key>
    <integer>$t_mm</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>$log_path</string>
  <key>StandardErrorPath</key>
  <string>$log_path</string>
</dict>
</plist>
PLIST
      launchctl unload -w "$plist" >/dev/null 2>&1 || true
      launchctl load -w "$plist"
      say "installed launchd agent: daily at $at_pretty ($plist)"
      ;;
    windows)
      # Prefer a durable Git for Windows bash, then whatever bash is on PATH.
      bash_win=""
      for candidate in \
        "/c/Program Files/Git/bin/bash.exe" \
        "/c/Program Files/Git/usr/bin/bash.exe" \
        "/c/Program Files (x86)/Git/bin/bash.exe"; do
        if [ -x "$candidate" ]; then
          bash_win=$(cygpath -w "$candidate" 2>/dev/null || printf '%s' "$candidate")
          break
        fi
      done
      if [ -z "$bash_win" ]; then
        bash_local=$(command -v bash || true)
        [ -n "$bash_local" ] || die "bash not found; install Git for Windows (Git Bash) first"
        bash_win=$(cygpath -w "$bash_local" 2>/dev/null || printf '%s' "$bash_local")
        say "no Git for Windows found; scheduling with $bash_win"
      fi

      # run.cmd holds two plain quoted tokens: bash, then the runner script. Bash
      # executes a script path directly, so no nested quoting is needed.
      runner_arg="$state_home/run.sh"
      case "$bash_win$runner_arg" in
        *%* | *'"'*) die "unexpected character in '$bash_win' or '$runner_arg'; install the schedule manually" ;;
      esac
      printf '#!/bin/sh\nexec /bin/sh "%s" >> "%s" 2>&1\n' "$cache_path" "$log_path" >"$state_home/run.sh"
      chmod +x "$state_home/run.sh" 2>/dev/null || true
      printf '@echo off\n"%s" "%s"\n' "$bash_win" "$runner_arg" >"$state_home/run.cmd"
      schtasks_run /Create /F /TN "$TASK_NAME" /SC DAILY /ST "$at_pretty" /TR "$(cygpath -w "$state_home/run.cmd" 2>/dev/null || printf '%s' "$state_home/run.cmd")" >/dev/null
      say "installed Task Scheduler job '$TASK_NAME': daily at $at_pretty"
      say "  run it now with: schtasks /Run /TN $TASK_NAME"
      ;;
    *)
      die "unsupported platform '$kernel'"
      ;;
  esac
  say "log: $log_path"
}

uninstall_schedule() {
  case "$platform" in
    linux)
      command -v crontab >/dev/null 2>&1 || die "crontab not found"
      tmp_cron="${TMPDIR:-/tmp}/thinhcorner-cron.$$"
      crontab -l 2>/dev/null | grep -v -e "$MARKER" -e "$cache_path" >"$tmp_cron" || true
      crontab "$tmp_cron"
      rm -f "$tmp_cron"
      say "removed cron entry"
      ;;
    macos)
      plist="$HOME/Library/LaunchAgents/com.thinhcorner.ccusage-sync.plist"
      launchctl unload -w "$plist" >/dev/null 2>&1 || true
      rm -f "$plist"
      say "removed launchd agent"
      ;;
    windows)
      schtasks_run /Delete /F /TN "$TASK_NAME" >/dev/null 2>&1 || warn "no Task Scheduler job named '$TASK_NAME'"
      say "removed Task Scheduler job '$TASK_NAME'"
      ;;
  esac
  rm -f "$cache_path" "$state_home/run.sh" "$state_home/run.cmd" 2>/dev/null || true
}

print_status() {
  printf 'source id     : %s\n' "${source_id:-$(hostname 2>/dev/null || printf unknown) [hostname]}"
  printf 'config file   : %s%s\n' "$config_path" "$([ -f "$config_path" ] && printf ' (found)' || printf ' (absent)')"
  printf 'cached script : %s%s\n' "$cache_path" "$([ -f "$cache_path" ] && printf ' (present)' || printf ' (absent)')"
  printf 'log file      : %s\n' "$log_path"
  case "$platform" in
    linux)
      printf 'schedule      : '
      if command -v crontab >/dev/null 2>&1 && crontab -l 2>/dev/null | grep -q -e "$MARKER" -e "$cache_path"; then
        crontab -l 2>/dev/null | grep -e "$MARKER" -e "$cache_path" | sed 's/^/                /'
      else
        printf 'none (--install-cron to add one)\n'
      fi
      ;;
    macos)
      printf 'schedule      : %s\n' "$([ -f "$HOME/Library/LaunchAgents/com.thinhcorner.ccusage-sync.plist" ] && printf 'launchd agent installed' || printf 'none')"
      ;;
    windows)
      printf 'schedule      : %s\n' "$(schtasks_run /Query /TN "$TASK_NAME" >/dev/null 2>&1 && printf 'Task Scheduler job installed' || printf 'none')"
      ;;
  esac
  if [ -f "$log_path" ]; then
    printf -- '--- last log lines ---\n'
    tail -n 15 "$log_path" 2>/dev/null || true
  fi
}

# --- sync ------------------------------------------------------------------
resolve_bun() {
  if command -v bun >/dev/null 2>&1; then
    printf '%s' "$(command -v bun)"
    return 0
  fi
  for candidate in \
    "$BUN_INSTALL/bin/bun" \
    "$HOME/.bun/bin/bun" \
    /usr/local/bin/bun \
    /opt/homebrew/bin/bun \
    "$HOME/.local/bin/bun"; do
    [ -x "$candidate" ] && {
      printf '%s' "$candidate"
      return 0
    }
  done
  return 1
}

run_sync() {
  command -v git >/dev/null 2>&1 || die "git is required"
  bun_bin=$(resolve_bun) || die "bun is not installed. Install it with:
  curl -fsSL https://bun.sh/install | bash
then re-run this script."

  if [ -z "$source_id" ] && [ "$is_wsl" = 1 ]; then
    warn "CCUSAGE_SOURCE is unset in WSL, so the hostname '$(hostname)' will be used as the"
    warn "source id. If this machine already has a source id in data/ccusage.json (for"
    warn "example DESKTOP-3CH2JO3), pin it in $config_path:"
    warn "  CCUSAGE_SOURCE=DESKTOP-3CH2JO3"
  fi

  tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/thinhcorner-sync.XXXXXX") || die "mktemp failed"
  trap 'rm -rf "$tmp_dir"' EXIT INT TERM
  say "cloning ${REPO_SLUG}#${BRANCH} into a temp dir"
  git clone --quiet --depth 1 --branch "$BRANCH" "$repo_url" "$tmp_dir/repo"
  cd "$tmp_dir/repo"

  # A fresh clone has no identity; reuse whatever authored the last commit.
  git config user.name >/dev/null 2>&1 || git config user.name "$(git log -1 --format=%an)"
  git config user.email >/dev/null 2>&1 || git config user.email "$(git log -1 --format=%ae)"
  git config commit.gpgsign false

  if [ -n "$token" ]; then
    # Stored in the throwaway clone only; git never prints it in errors.
    git config --local credential.helper '!f() { echo username=x-access-token; echo "password=$GH_TOKEN"; }; f'
    GH_TOKEN="$token"
    export GH_TOKEN
    GIT_TERMINAL_PROMPT=0
    export GIT_TERMINAL_PROMPT
  fi

  say "collecting ccusage data with $bun_bin"
  head_before=$(git rev-parse HEAD)
  # shellcheck disable=SC2086
  "$bun_bin" scripts/update-ccusage.ts $extra_args --no-push

  if [ "$dry_run" = 1 ]; then
    say "dry run: nothing was committed or pushed"
    exit 0
  fi

  if [ "$(git rev-parse HEAD)" = "$head_before" ]; then
    say "no data changes on this machine; nothing to push"
    exit 0
  fi

  attempt=1
  while :; do
    if git push --quiet origin "HEAD:$BRANCH"; then
      say "pushed to ${BRANCH}"
      break
    fi
    [ "$attempt" -lt 3 ] || die "push to ${BRANCH} failed after 3 attempts"
    say "push rejected (another machine pushed first); re-merging onto latest ${BRANCH}"
    git fetch --quiet --depth 1 origin "$BRANCH"
    git reset --hard --quiet FETCH_HEAD
    # shellcheck disable=SC2086
    "$bun_bin" scripts/update-ccusage.ts $extra_args --no-push
    attempt=$((attempt + 1))
  done

  if [ -n "${CI:-}" ] || [ -n "${THINHCORNER_QUIET:-}" ]; then :; else
    say "done - Cloudflare Workers will rebuild the site from this commit"
  fi
}

# --- main ------------------------------------------------------------------
[ "$install_cron" = 0 ] || install_schedule
[ "$uninstall_cron" = 0 ] || uninstall_schedule
[ "$show_status" = 0 ] || print_status
[ "$do_sync" = 0 ] || run_sync
