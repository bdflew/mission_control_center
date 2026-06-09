# Debug Report — Mission Control full system sweep

**Date:** 2026-06-09 · **Doctrine:** proof before claims — every check below was actually run in an isolated test environment (fresh vault + state, port 8799), not assumed.

## Verdict

The system is healthy. **When you enter your credentials, everything comes along** — all four integrations (Gmail, Calendar, Drive, Notion) are now wired end-to-end: token → backend fetch → live connector badge → real data replacing the sample data on the page. No restart-order tricks, no half states.

## What was tested and passed (46 checks)

**Syntax (23 files):** every backend file, `bin/mc`, `live.js`, and all 22 `.jsx` files parse clean (Babel-verified, including the one file using real JSX syntax).

**REST API (all endpoints):** health, bootstrap, vault stats/read, vault **write** (create / refuse-overwrite / append), chat post+read, agent status update, approvals request+resolve, gmail/calendar/drive/notion.

**Security guards:** read path-traversal blocked, write path-traversal blocked, non-`.md` writes rejected, static-file traversal blocked, oversized/invalid JSON rejected, localhost-only binding intact.

**SSE real-time:** one stream received all five event types (hello, chat, agent, approval, vault) as actions happened.

**Persistence:** chat, agent status, approvals, and written vault notes all survived a full backend restart.

**CLI (`bin/mc`):** status, say, read, set, search, note, write, approvals, ask — all round-trip against the live backend.

**MCP server:** initialize, tools/list (10 tools), mc_status, chat_post, chat_read, vault_write_note (file verified on disk), vault_search, approval_request — all verified over real stdio JSON-RPC.

**Connector go-live simulation (your exact scenario):**
- No credentials → every surface honestly reports `connected:false`, all connectors `live:false`.
- All credentials present → gmail/calendar/drive/notion flip `live:true`; anthropic/billing correctly stay `live:false` with `keyPresent:true` (no data surface exists for them yet, so claiming live would be a lie).
- Bad/unreachable credentials → graceful HTTP 502 with the error message; the UI keeps its honest state; nothing is ever fabricated.

**Mock-API shape tests (14):** stubbed the real Google/Gmail/Calendar/Drive and Notion API response formats and verified every mapper emits exactly the fields the dashboard renders — thread fields, sender parsing, HTML-entity decoding, unread counts; calendar day/hour math, cancelled-event filtering, all-day handling; drive quota %, file kinds, "You" owner detection; notion sidebar, page title, block mapping (headings/paragraphs/todos, unsupported blocks dropped).

## Bugs found and fixed during the sweep

1. **The big one:** Notion/Calendar/Drive connectors flipped "live" on a token's existence while **no data fetch existed** — pages would show sample data under a live badge. Fixed by implementing all three for real (`server/google.js` calendar+drive, new `server/notion.js`, routes, live.js patchers).
2. **OAuth scope trap:** the consent flow only requested Gmail scope — Calendar/Drive could never have worked without a painful re-auth. Fixed: one consent now covers all three read-only scopes. (Enable all three APIs in your Cloud project.)
3. **Hardcoded "Connected" chips** on Gmail/Calendar/Drive/Notion pages — now honest, driven by real status.
4. **Calendar page hardcoded "Wed 10"** as today and the now-line at 2:18pm — now real date / real time when live.
5. **GmailPage crash on an empty real inbox** (0 threads) — guarded.
6. **DrivePage showed the Gmail account** as its account — now uses the real Drive account.
7. **"Live" honesty rule formalized:** a connector reports live only when its data path is implemented AND authorized (anthropic/billing report `keyPresent` instead).

## Known limits (honest)

- Tested in an isolated Linux sandbox, which cannot reach Google/Notion servers — the final live-data hop runs first on your machine. Everything up to and around that hop is proven; if a real fetch fails you'll see the error in the server log and a graceful 502, never fake data.
- Gmail thread bodies render from snippets (full message read not wired yet). Calendar/Drive are read-only views; "Add event" stays local. Billing/Claude-API spend has no fetch yet and honestly won't claim live.
- The dashboard loads React/Babel from unpkg.com — first load needs internet.
- No auth layer: keep the backend on 127.0.0.1.

## Your go-live runbook

```bash
# Google (covers Gmail + Calendar + Drive — enable all 3 APIs in the Cloud project)
cd ~/Desktop/legacy-mission-control
export GOOGLE_CLIENT_ID=...   GOOGLE_CLIENT_SECRET=...
npm run google-auth        # one-time consent, token saved gitignored

# Notion (share pages with the integration in Notion!)
export NOTION_TOKEN=ntn_...

npm start                  # all four connectors flip LIVE
```
