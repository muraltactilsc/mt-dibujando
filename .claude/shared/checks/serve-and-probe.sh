#!/usr/bin/env bash
# Deterministic "run the API in the background, wait until it answers, stop it" helper for the
# backend validation gate. Weaker executors botch this dance when made to invent it (pidfile
# ordering races, reading /proc, writing to /tmp — which sandboxes auto-reject). Give them this
# instead of shell to retype. Everything stays INSIDE the repo. No pidfile, no /proc, no /tmp.
#
#   bash .claude/shared/checks/serve-and-probe.sh start <project-path> <port>
#       starts the API detached, waits until it is listening, prints READY (or FAILED + log tail)
#   # ... then run the gate's task-specific curl checks against http://localhost:<port>/... ...
#   bash .claude/shared/checks/serve-and-probe.sh stop  <project-path>
#       stops it via pkill -f on the project path (no PID file needed)
set -euo pipefail

cmd="${1:-}"; target="${2:-}"; port="${3:-}"
RUN_DIR=".run"            # repo-local; add to .gitignore
mkdir -p "$RUN_DIR"
log="$RUN_DIR/serve-${port:-x}.log"

case "$cmd" in
  start)
    [ -n "$target" ] && [ -n "$port" ] || { echo "usage: start <project-path> <port>" >&2; exit 2; }
    # Detach fully; own command, log inside the repo. setsid+nohup so nothing inherits our stdio.
    setsid nohup dotnet run --project "$target" --launch-profile http >"$log" 2>&1 &
    # Readiness = the port actually answers OR Kestrel logs "Now listening". Never read /proc.
    for _ in $(seq 1 40); do
      if grep -q "Now listening" "$log" 2>/dev/null \
         || curl -fsS -m 2 -o /dev/null "http://localhost:$port/" 2>/dev/null; then
        echo "READY on http://localhost:$port  (log: $log)"; exit 0
      fi
      sleep 1
    done
    echo "FAILED to start on $port within 40s — log tail:" >&2
    tail -n 25 "$log" >&2 || true
    exit 1
    ;;
  stop)
    [ -n "$target" ] || { echo "usage: stop <project-path>" >&2; exit 2; }
    pkill -f "$target" 2>/dev/null || true
    echo "stopped: $target"
    ;;
  *)
    echo "usage: $0 start|stop <project-path> [port]" >&2; exit 2
    ;;
esac
