#!/bin/bash
# start-kratos-bridge.sh — bring the REAL Kratos online in Mission Control.
#
# One command, safe to re-run, survives closing the terminal window:
#   bash bridges/start-kratos-bridge.sh
#
# What it does, in order:
#   1. Ensures the backend is up (starts it if not).
#   2. Restarts the templated live-agent loops WITHOUT kratos
#      (MC_LIVE_LOOP_EXCLUDE=kratos) so there are no double replies.
#   3. Starts bridges/kratos-bridge.js — the daemon that answers Lew on
#      agent:kratos (always) and in the warroom (when mentioned) by running
#      the actual Claude Code CLI with Kratos's identity.
# Logs: /tmp/mc-8754.log · /tmp/mc-agent-loops.log · /tmp/kratos-bridge.log
set -u
cd "$(dirname "$0")/.." || exit 1
MC_API="${MC_API:-http://127.0.0.1:8754}"

# 1) backend
if ! curl -s -o /dev/null --max-time 3 "$MC_API/api/health"; then
  echo "▸ backend not running — starting it"
  nohup node server/server.js > /tmp/mc-8754.log 2>&1 < /dev/null &
  disown || true
  sleep 2
fi
curl -s -o /dev/null --max-time 3 "$MC_API/api/health" && echo "✓ backend live at $MC_API" || { echo "✗ backend failed — see /tmp/mc-8754.log"; exit 1; }

# 2) templated loops, kratos excluded (real bridge owns his channel)
pkill -f 'node server/live-agent-loops.js' 2>/dev/null && sleep 1
MC_LIVE_LOOP_EXCLUDE=kratos nohup node server/live-agent-loops.js > /tmp/mc-agent-loops.log 2>&1 < /dev/null &
disown || true
sleep 2
tail -1 /tmp/mc-agent-loops.log

# 3) the real Kratos bridge (idempotent: kill any previous instance first)
pkill -f 'node bridges/kratos-bridge.js' 2>/dev/null && sleep 1
nohup node bridges/kratos-bridge.js > /tmp/kratos-bridge.log 2>&1 < /dev/null &
disown || true
sleep 2
tail -3 /tmp/kratos-bridge.log
echo "✓ Kratos bridge launched — text him on his line or @kratos in the War Room"
