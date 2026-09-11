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
#   curl -fsSL .../sync-ccusage.sh | sh -s -- --yes        # skip the menu, sync now
#
# What it does
#   1. sparse-clones only what it needs (data/ccusage.json + scripts/) into a temp
#      dir - the blog posts and images are never downloaded (nothing left behind)
#   2. runs `bun scripts/update-ccusage.ts`, which reads ccusage for every agent
#      home on this machine, merges it into data/ccusage.json, commits, pushes
#   3. Cloudflare Workers rebuilds the site from the pushed commit
#
# Options
#   (no arguments + a terminal)  interactive menu:
#       0) sync now          2) turn auto-sync on/off
#       1) dry run           3) exit
#   --yes               skip the menu and sync now (for scripts)
#   --dry-run           compute + write data in the temp clone, never commit/push
#   --install-cron      install a daily scheduler for this machine, then sync once
#   --no-sync           with --install-cron: install the schedule only
#   --uninstall-cron    remove the schedule installed by --install-cron
#   --at HH:MM          schedule time, 24h, default 23:55 (also THINHCORNER_AT)
#   --status            show config, cached copy, schedule and recent log
#   --help              this text
#   THINHCORNER_MENU_INPUT=<file>   force the menu, read answers from <file>
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
yes_flag=0
extra_args=""

usage() {
  awk 'NR == 1 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "$0" 2>/dev/null ||
    printf 'see the script header for usage\n'
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
    --yes | -y | --non-interactive)
      yes_flag=1
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

# --- interactive or scripted ------------------------------------------------
# Explicit flags mean the caller knows what it wants; only a bare invocation
# with a terminal gets the menu. Scheduled runs have no tty, so they sync.
explicit=1
if [ "$dry_run" = 0 ] && [ "$install_cron" = 0 ] && [ "$uninstall_cron" = 0 ] &&
  [ "$show_status" = 0 ] && [ "$do_sync" = 1 ] && [ "$yes_flag" = 0 ] &&
  [ -z "$extra_args" ]; then
  explicit=0
fi

menu_input=""
if [ -n "${THINHCORNER_MENU_INPUT:-}" ]; then
  menu_input="$THINHCORNER_MENU_INPUT"
elif [ "$explicit" = 0 ] && [ -t 1 ] && [ -r /dev/tty ]; then
  menu_input=/dev/tty
fi

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
schedule_at_file="$state_home/schedule_at"
plist="$HOME/Library/LaunchAgents/com.thinhcorner.ccusage-sync.plist"

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
schedule_installed() {
  case "$platform" in
    linux)
      command -v crontab >/dev/null 2>&1 &&
        crontab -l 2>/dev/null | grep -q -e "$MARKER" -e "$cache_path"
      ;;
    macos) [ -f "$plist" ] ;;
    windows) schtasks_run /Query /TN "$TASK_NAME" >/dev/null 2>&1 ;;
    *) return 1 ;;
  esac
}

scheduled_at() {
  if [ -f "$schedule_at_file" ]; then
    sed -n '1p' "$schedule_at_file"
  else
    printf '%s' "$DEFAULT_AT"
  fi
}
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
  printf '%s\n' "$at_pretty" >"$schedule_at_file"
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
      launchctl unload -w "$plist" >/dev/null 2>&1 || true
      rm -f "$plist"
      say "removed launchd agent"
      ;;
    windows)
      schtasks_run /Delete /F /TN "$TASK_NAME" >/dev/null 2>&1 || warn "no Task Scheduler job named '$TASK_NAME'"
      say "removed Task Scheduler job '$TASK_NAME'"
      ;;
  esac
  rm -f "$cache_path" "$schedule_at_file" "$state_home/run.sh" "$state_home/run.cmd" 2>/dev/null || true
}

print_status() {
  printf 'source id     : %s\n' "${source_id:-$(hostname 2>/dev/null || printf unknown) [hostname]}"
  printf 'config file   : %s%s\n' "$config_path" "$([ -f "$config_path" ] && printf ' (found)' || printf ' (absent)')"
  printf 'cached script : %s%s\n' "$cache_path" "$([ -f "$cache_path" ] && printf ' (present)' || printf ' (absent)')"
  printf 'log file      : %s\n' "$log_path"
  if schedule_installed; then
    printf 'schedule      : on (daily %s)\n' "$(scheduled_at)"
  else
    printf 'schedule      : off (menu option 2, or --install-cron)\n'
  fi
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

check_prereqs() {
  command -v git >/dev/null 2>&1 || die "git is required"
  bun_bin=$(resolve_bun) || die "bun is not installed. Install it with:
  curl -fsSL https://bun.sh/install | bash
then re-run this script."
}

# Only the files the sync touches are downloaded: a blobless partial clone plus a
# sparse checkout. Blog posts, images and pages never leave the server. Pushing
# still works because every other path is unchanged, so the remote already has it.
lean_clone() {
  git clone --quiet --depth 1 --branch "$BRANCH" --filter=blob:none --no-checkout \
    "$repo_url" "$tmp_dir/repo" >/dev/null 2>&1 || return 1
  cd "$tmp_dir/repo" || return 1
  if ! git sparse-checkout set --no-cone data/ccusage.json scripts/update-ccusage.ts package.json >/dev/null 2>&1; then
    cd "$tmp_dir"
    rm -rf "$tmp_dir/repo"
    return 1
  fi
  # Older git may need an explicit checkout after configuring the sparse paths.
  git checkout --quiet >/dev/null 2>&1 || true
  if [ -f data/ccusage.json ] && [ -f scripts/update-ccusage.ts ]; then
    return 0
  fi
  cd "$tmp_dir"
  rm -rf "$tmp_dir/repo"
  return 1
}

clone_repo() {
  if lean_clone; then
    say "cloned ${REPO_SLUG}#${BRANCH} (sparse: data/ccusage.json + scripts/)"
    return 0
  fi
  warn "sparse partial clone unavailable here; falling back to a full shallow clone"
  cd "$tmp_dir"
  rm -rf "$tmp_dir/repo"
  git clone --quiet --depth 1 --branch "$BRANCH" "$repo_url" "$tmp_dir/repo"
  cd "$tmp_dir/repo" || die "could not enter the temp clone"
  say "cloned ${REPO_SLUG}#${BRANCH}"
}

run_sync() {
  if [ "${1:-}" = "--dry-run" ]; then
    dry_run=1
    extra_args="$extra_args --dry-run"
  fi
  check_prereqs

  if [ -z "$source_id" ] && [ "$is_wsl" = 1 ]; then
    warn "CCUSAGE_SOURCE is unset in WSL, so the hostname '$(hostname)' will be used as the"
    warn "source id. If this machine already has a source id in data/ccusage.json (for"
    warn "example DESKTOP-3CH2JO3), pin it in $config_path:"
    warn "  CCUSAGE_SOURCE=DESKTOP-3CH2JO3"
  fi

  tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/thinhcorner-sync.XXXXXX") || die "mktemp failed"
  trap 'rm -rf "$tmp_dir"' EXIT INT TERM
  clone_repo

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
    return 0
  fi

  if [ "$(git rev-parse HEAD)" = "$head_before" ]; then
    say "no data changes on this machine; nothing to push"
    return 0
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

# --- menu -------------------------------------------------------------------
menu() {
  # Open the input once: a per-iteration redirect would re-read line 1 forever.
  exec 3<"$menu_input" || return 1
  while :; do
    printf '\nthinhcorner token usage sync\n'
    printf '  source id : %s\n' "${source_id:-$(hostname 2>/dev/null || printf unknown)}"
    if schedule_installed; then
      printf '  auto-sync : on (daily %s)\n' "$(scheduled_at)"
    else
      printf '  auto-sync : off\n'
    fi
    printf '\n  0) sync now\n'
    printf '  1) dry run (collect + merge, no commit or push)\n'
    if schedule_installed; then
      printf '  2) turn off auto-sync\n'
    else
      printf '  2) turn on auto-sync (daily %s)\n' "$(scheduled_at)"
    fi
    printf '  3) exit\n\n'
    printf 'choose [0-3]: '
    if ! read answer <&3; then
      printf '\n'
      break
    fi
    case "$answer" in
      0)
        printf '\n'
        ( run_sync ) || say "sync failed - see the message above"
        ;;
      1)
        printf '\n'
        ( run_sync --dry-run ) || say "dry run failed - see the message above"
        ;;
      2)
        if schedule_installed; then
          ( uninstall_schedule ) || say "could not remove the schedule"
        else
          ( install_schedule ) || say "could not install the schedule"
        fi
        ;;
      3 | '' | q | Q | quit | exit)
        break
        ;;
      *)
        say "not an option: '$answer' (choose 0-3)"
        ;;
    esac
  done
  exec 3<&-
}

# --- main ------------------------------------------------------------------
[ "$install_cron" = 0 ] || install_schedule
[ "$uninstall_cron" = 0 ] || uninstall_schedule
[ "$show_status" = 0 ] || print_status

if [ "$do_sync" = 1 ]; then
  if [ -n "$menu_input" ]; then
    check_prereqs
    menu
  else
    run_sync
  fi
fi
