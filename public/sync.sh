#!/bin/sh
# thinhcorner.com/sync.sh — bootstrap for the token usage sync.
#
#   curl -fsSL https://thinhcorner.com/sync.sh | sh
#   curl -fsSL https://thinhcorner.com/sync.sh | sh -s -- --install-cron
#
# The real script lives in the repo so there is a single source of truth:
#   scripts/sync-ccusage.sh
set -eu

url="${THINHCORNER_SCRIPT_URL:-https://raw.githubusercontent.com/Th1nhNg0/thinhcorner.com/master/scripts/sync-ccusage.sh}"

command -v curl >/dev/null 2>&1 || {
  printf 'sync.sh: curl is required\n' >&2
  exit 1
}

tmp=$(mktemp "${TMPDIR:-/tmp}/thinhcorner-sync.XXXXXX")
trap 'rm -f "$tmp"' EXIT INT TERM

curl -fsSL "$url" -o "$tmp" || {
  printf 'sync.sh: could not download %s\n' "$url" >&2
  exit 1
}

THINHCORNER_SCRIPT_URL="$url" sh "$tmp" "$@"
