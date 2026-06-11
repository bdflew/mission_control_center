# Mission Control Live Agent Loops

Mission Control has two local runtime layers:

1. **Backend/dashboard API** — `server/server.js`, served at `http://127.0.0.1:8754/`.
2. **Live agent loops** — `server/live-agent-loops.js`, watches direct channels such as `agent:sage` and posts agent replies.

The supported one-command local runtime is:

```bash
npm run live:all
```

That command runs `server/start-live.js`, which:

- checks `MC_API` / `http://127.0.0.1:8754/api/health`;
- starts the backend if it is not already live;
- starts the live agent loops;
- keeps the supervisor process alive;
- stops child processes on SIGINT/SIGTERM.

## Commands

```bash
npm start         # backend only
npm run live      # backend only alias
npm run agents    # live agent loops only; requires backend already running
npm run live:all  # backend if needed + live agent loops
```

## Verification

```bash
curl http://127.0.0.1:8754/api/health
curl http://127.0.0.1:8754/api/agents
MC_LIVE_LOOP_ONCE=1 npm run agents
```

Expected status for each live employee:

- `status`: `online`
- `statusLabel`: `Live loop online`
- `connectedVia`: `api`

## Autostart option: macOS LaunchAgent

Create `~/Library/LaunchAgents/com.legacy.mission-control-live.plist` with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.legacy.mission-control-live</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string>
    <string>npm</string>
    <string>run</string>
    <string>live:all</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/aaronlewis/Desktop/legacy-mission-control</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/legacy-mission-control-live.out.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/legacy-mission-control-live.err.log</string>
</dict>
</plist>
```

Then load it:

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.legacy.mission-control-live.plist
launchctl enable gui/$(id -u)/com.legacy.mission-control-live
launchctl kickstart -k gui/$(id -u)/com.legacy.mission-control-live
```

Do **not** bind the backend to `0.0.0.0` without adding authentication first. This service is designed for trusted localhost use.

## Safety boundary

The live loop bridge keeps dashboard chat boxes responsive. It does not grant unapproved high-impact execution. External sends, deployments, credential changes, permission changes, spending, or destructive work still require approval and a proof trail.
