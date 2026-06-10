#!/bin/bash
# start-agent-bridge.sh — bring ANY employee online in Mission Control.
#
#   bash bridges/start-agent-bridge.sh <agent-id>
#   e.g. bash bridges/start-agent-bridge.sh sage
#
# Idempotent, survives closing the terminal window. Ensures the backend is up,
# excludes the agent from the canned template loop (so the REAL bridge owns the
# channel — no double replies), then starts that agent's bridge.
# Logs: /tmp/mc-8754.log · /tmp/mc-agent-loops.log · /tmp/<id>-bridge.log
set -u
cd "$(dirname "$0")/.." || exit 1
MC_API="${MC_API:-http://127.0.0.1:8754}"

ID="${1:-}"
case "$ID" in
  sage|kratos|faye|chloe|legacylew) : ;;
  *) echo "usage: bash bridges/start-agent-bridge.sh <sage|kratos|faye|chloe|legacylew>"; exit 1 ;;
esac

# 1) backend
if ! curl -s -o /dev/null --max-time 3 "$MC_API/api/health"; then
  echo "▸ backend not running — starting it"
  nohup node server/server.js > /tmp/mc-8754.log 2>&1 < /dev/null & disown || true
  sleep 2
fi
curl -s -o /dev/null --max-time 3 "$MC_API/api/health" && echo "✓ backend live at $MC_API" || { echo "✗ backend failed — see /tmp/mc-8754.log"; exit 1; }

# 2) rebuild the template-loop exclude set = every agent that has a real bridge running
RUNNING_BRIDGES=$(pgrep -af 'node bridges/agent-bridge.js|node bridges/kratos-bridge.js' 2>/dev/null)
EXCLUDE="$ID"
for a in sage kratos faye chloe legacylew; do
  [ "$a" = "$ID" ] && continue
  echo "$RUNNING_BRIDGES" | grep -qE "(AGENT_ID=$a|/$a-bridge|kratos-bridge)" && EXCLUDE="$EXCLUDE,$a"
  { [ "$a" = "kratos" ] && echo "$RUNNING_BRIDGES" | grep -q 'kratos-bridge.js'; } && case ",$EXCLUDE," in *",kratos,"*) :;; *) EXCLUDE="$EXCLUDE,kratos";; esac
done
pkill -f 'node server/live-agent-loops.js' 2>/dev/null && sleep 1
MC_LIVE_LOOP_EXCLUDE="$EXCLUDE" nohup node server/live-agent-loops.js > /tmp/mc-agent-loops.log 2>&1 < /dev/null & disown || true
sleep 2
tail -1 /tmp/mc-agent-loops.log

# 3) the agent's real bridge (idempotent)
pkill -f "AGENT_ID=$ID node bridges/agent-bridge.js" 2>/dev/null
pkill -f "bridges/agent-bridge.js $ID" 2>/dev/null
sleep 1
AGENT_ID="$ID" nohup node bridges/agent-bridge.js > "/tmp/$ID-bridge.log" 2>&1 < /dev/null & disown || true
sleep 3
tail -3 "/tmp/$ID-bridge.log"
echo "✓ $ID bridge launched — Lew can chat $ID on their line or @$ID in the War Room"
echo "  (watch for 'self-test: PASS' — if it says login needed, run: claude /login)"
