# Go-Live Checklist — Mission Control

A running record of what's wired, what's verified, and what's left. Kratos doctrine:
*proof before claims.* Each ✅ below was actually run, not assumed.

## Backend (zero-dependency Node)
- [x] Static file server for the dashboard (path-traversal guarded, localhost-only)
- [x] Obsidian vault reader — real notes, links, recency, clusters (2-level for good spread)
- [x] `/api/bootstrap` — one snapshot of vault + agents + approvals + connections
- [x] Live chat store (file-backed, persists across restarts) + Server-Sent Events
- [x] Agent status store (offline until an agent reports in)
- [x] Approvals store (request / list / resolve) — human gate
- [x] Honest connection reporting (a surface is "live" only if its env var/token exists)

## Agent control surface
- [x] MCP server (stdio JSON-RPC) — 9 tools, verified `initialize` / `tools/list` / `tools/call`
- [x] REST API — verified post + read + status + approvals
- [x] CLI (`bin/mc`) — verified status / say / read / set / search
- [x] `mcp.config.example.json` for one-step client registration
- [x] Handoff doc to all AI employees (`docs/HANDOFF_GO_LIVE.md`)

## Dashboard wired live
- [x] `live.js` patches `window.MC` from the backend + re-renders on `mc:live`
- [x] LIVE / DEMO badge (graceful fallback when backend is offline)
- [x] War Room — live channel, SSE, no scripted replies
- [x] War Room mini (home) — live
- [x] Agent direct-line chat — live per-agent channel (`agent:<id>`)
- [x] Memory Galaxy / Memory Pulse / Obsidian page — real vault data
- [x] Hero metrics — recomputed from real agents/approvals/vault (no fake $4.27 / 7 tasks)
- [x] Agent grid status + "online" counts — live
- [x] Approvals queue — live, resolve writes to backend, syncs on SSE

## De-faked
- [x] Removed fabricated hero metrics, approvals, dreaming, memory pulse, artifacts, war-room seed
- [x] Agent telemetry neutralized (uptime/tokens/spend → "—") until real source
- [x] Gmail / Calendar / Drive / Notion / Studio / Hermes relabeled "Sample data · not connected"
- [x] Obsidian source defaults honest (0s) — overridden by real vault when live

## Verified
- [x] All backend files `node --check` clean
- [x] All edited frontend files syntax-clean (via temp .js check)
- [x] `bin/mc` + MCP round-trip confirmed against the running backend
- [x] Browser loads LIVE with real vault count (see verification run)

## Integrations — ALL FOUR code-complete, awaiting only Lew's credentials
- [x] `server/google.js` — Gmail + Calendar + Drive (all read-only), token refresh, exact UI shapes
- [x] `server/notion.js` — Notion workspace/sidebar/page-blocks (read-only), exact UI shape
- [x] `server/oauth-google.js` — one-time loopback OAuth (`npm run google-auth`), ONE consent covers all three Google scopes
- [x] Routes: `GET /api/gmail` `/api/calendar` `/api/drive` `/api/notion` (cached; honest `connected:false` until authorized)
- [x] Connection reporting: "live" = data path implemented AND authorized — never just "a key exists" (anthropic/billing report `keyPresent` honestly, not live)
- [x] `live.js` patches all four surfaces from the backend when each connector is live
- [x] UI honesty: Gmail/Calendar/Drive/Notion pages show real status chips; no hardcoded "Connected"; empty-state guards; Calendar real "today"/now-line
- [x] Verified (debug sweep): 32 REST/SSE/CLI/MCP/persistence checks + 14 mock-API shape tests + connector flip simulation — see docs/DEBUG_REPORT.md
- [ ] Lew: Google → enable Gmail+Calendar+Drive APIs, Desktop-app OAuth client, `npm run google-auth`
- [ ] Lew: Notion → integration token in env (`NOTION_TOKEN`), share pages with the integration

## Still pending (honest, labeled in UI)
- [ ] AI spend / billing — OpenRouter or Anthropic admin key (no fetch implemented yet — connector will NOT claim live)
- [ ] Auth layer if the backend is ever exposed beyond localhost

## Next gates (need Lew's approval / decision)
- [ ] Decide the vault-write policy for agents (currently read-only by design)
- [ ] Wire one OAuth surface end-to-end as the reference implementation
- [ ] Optional: a system service so the backend starts on login
