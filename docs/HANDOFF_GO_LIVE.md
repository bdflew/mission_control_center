# HANDOFF — Mission Control is LIVE · How to connect

**From:** Kratos (CTO / QA)
**To:** Sage, Faye, Chloe, Legacy Lew — and the harnesses that run them (Claude Code, Antigravity, Hermes, Codex, Gemini)
**Re:** Plugging into the live Mission Control Center
**Status:** Backend shipped. Dashboard wired. Vault connected (real, local). Chat is live. Awaiting your check-ins.

---

## What changed

Mission Control is no longer a static mockup. There is now a **local backend** (zero-dependency Node) that:

- **Serves the dashboard** at `http://127.0.0.1:8754/`
- **Reads Lew's real Obsidian vault** from disk — the Memory Galaxy, Memory Pulse, and Obsidian page now show **real notes, real links, real recency** (no OAuth, no secrets, because the vault is local files)
- **Runs a live team chat** (War Room + per-agent direct lines) with a persistent store and Server-Sent Events, so anything you post **appears in Lew's dashboard instantly**
- **Tracks your live status** and the **approvals queue** (the human-in-the-loop gate)
- Exposes all of this over **three interfaces** so every one of you can connect, whatever harness you run on.

All fake numbers and scripted messages have been removed. The dashboard only shows what is real or honestly labeled "not connected."

---

## Which interface should I use? (the recommendation)

| You are… | Use | Why |
|---|---|---|
| An MCP-capable agent (Claude Code, Claude Desktop, Antigravity w/ MCP) | **MCP server** ← *most control* | Structured tools, typed args, the model calls them directly. First choice. |
| A harness without MCP, or an automation (Hermes, n8n, a webhook, a script) | **REST API** | Universal. Plain HTTP + JSON. Works from anything. |
| A human or a cron job at a terminal | **CLI (`bin/mc`)** | One-liners. Wraps the same API. |

They all read and write the **same live state**, so you can mix them. Posting via MCP shows up for a CLI reader and in Lew's browser, all at once.

> **Default to MCP.** It gives you the richest, safest control surface. Fall back to REST/CLI only where MCP isn't available.

---

## Option A — MCP (recommended)

The MCP server is `server/mcp.js`. It speaks MCP over stdio and is a thin client to the running backend.

**Register it** (e.g. Claude Code — add to `~/.claude.json` under `mcpServers`, or a project `.mcp.json`). A ready example is in [`mcp.config.example.json`](../mcp.config.example.json):

```json
{
  "mcpServers": {
    "mission-control": {
      "command": "node",
      "args": ["server/mcp.js"],
      "cwd": "/Users/aaronlewis/Desktop/legacy-mission-control",
      "env": { "MC_API": "http://127.0.0.1:8754" }
    }
  }
}
```

**The tools you get:**

| Tool | What it does |
|---|---|
| `mc_status` | Live snapshot: real vault stats, every agent's status, pending approvals, which integrations are connected. **Call this first.** |
| `chat_read` | Read recent messages from a channel (`warroom`, `announcements`, or `agent:<id>`). This is how you **receive orders from Lew/Sage**. |
| `chat_post` | Post a message as yourself. Appears live in the War Room. Reply to orders, report progress. |
| `agent_set_status` | Report your live status + current task so Lew sees what you're doing. Sets you "online." |
| `vault_search` | Search the shared Obsidian second brain by keyword. |
| `vault_read_note` | Read a note's full markdown. |
| `vault_recent` | What the team's been working on lately. |
| `approval_request` | Surface something for Lew to approve/hold. **The human gate — use before any high-impact action.** |
| `approval_list` | Check approval state before you ship. |

**Note:** you can *request* approvals but you **cannot** approve on Lew's behalf — resolving an approval is the operator's action in the dashboard. That's the doctrine: *approval before launch.*

---

## Option B — REST API

Base URL `http://127.0.0.1:8754`. JSON in, JSON out.

```
GET  /api/bootstrap                 full live snapshot (vault, agents, approvals, connections)
GET  /api/vault                     vault stats + galaxy notes + clusters
GET  /api/vault/note?path=<rel>     one note's content
GET  /api/chat?channel=warroom      messages in a channel
POST /api/chat                      { channel, from, role, text }      post a message
GET  /api/agents                    agent roster + live status
POST /api/agents/update             { id, status, statusLabel, task, model }   report status
GET  /api/approvals                 approvals + state
POST /api/approvals                 { subject, by, risk, detail }      request approval
POST /api/approvals/resolve         { id, decision }   (operator only: "approve" | "hold")
GET  /api/stream                    Server-Sent Events (live chat/agent/approval feed)
```

Example — Faye reports in and replies to an order:

```bash
curl -s localhost:8754/api/agents/update -H 'Content-Type: application/json' \
  -d '{"id":"faye","status":"working","statusLabel":"Building","task":"Wiring the live Studio pipeline","model":"claude-sonnet-4.6"}'

curl -s localhost:8754/api/chat -H 'Content-Type: application/json' \
  -d '{"channel":"warroom","from":"faye","role":"agent","text":"On it, Lew. Building now — Kratos reviews before staging."}'
```

---

## Option C — CLI

`bin/mc` wraps the API for terminals, scripts, and cron. Set `MC_API` if the backend isn't on the default port.

```bash
./bin/mc status                                  # live snapshot
./bin/mc read --channel warroom -n 20            # read the War Room
./bin/mc say "Reporting in — security sweep clean" --as kratos
./bin/mc set kratos working --task "P1 review" --model "claude-opus-4.8"
./bin/mc search "memory galaxy"                  # search the vault
./bin/mc note "path/to/note.md"                  # print a note
./bin/mc approvals                               # list approvals
./bin/mc ask "Deploy to staging" --by faye --risk med --detail "behind a flag"
```

---

## Your standing orders (all of you)

1. **Check in.** On start, `agent_set_status` (or `mc set`) so Lew sees you're online and what you're on.
2. **Watch the War Room.** Poll `chat_read` / subscribe via the dashboard. When Lew or Sage gives an order, acknowledge and act.
3. **Report progress** in the channel — real updates, not filler.
4. **Gate the risky stuff.** Before anything outward-facing or irreversible (deploy, send, spend, delete, key changes): `approval_request`, then wait for Lew. Never self-approve.
5. **Write to the vault.** Your real outputs become notes; the Memory Galaxy and Memory Pulse surface them automatically. That's Layer 7 — the loop compounds.
6. **Sage routes; Kratos proves.** Sage assigns and logs. Kratos reviews builds before they ship.

---

## Per-agent quick start

- **Sage (COO / router)** — connect via MCP. `mc_status` → read the War Room → route incoming orders by posting `@mentions`, request approvals on the team's behalf, keep statuses honest.
- **Faye (builder, Antigravity)** — MCP if available, else CLI. Report `working` + task while building; post the staging link; hand to Kratos.
- **Kratos (CTO / QA / security)** — MCP. Review Faye's builds, run the security pass, `approval_request` for anything risky, post the verdict.
- **Chloe (brand)** — MCP or CLI. Post drafts, request sign-off on outbound copy.
- **Legacy Lew (digital twin)** — MCP. Stands in for Lew on low-risk routing when he's at work; still routes high-risk to the real approval gate.
- **Hermes** — REST. It's the central harness; hit `/api/*` directly and fan out to the others.

---

## Run it / security

- Start the backend: `npm start` (or `node server/server.js`) from the repo root.
- It binds to **127.0.0.1 only**. Do not expose it to the network without adding auth — there is no auth layer yet (localhost trust model).
- **No secrets in the repo.** OAuth tokens / API keys come from environment variables only (see `.env.example`). If you ever see a secret committed, treat it as compromised and rotate it.
- Vault reads are **read-only** and path-guarded (can't escape the vault dir). Note *writing* from agents is intentionally not exposed yet — that's the next gate to design with Lew.

---

## What's live vs. still pending Lew's credentials

**Live now:** Obsidian vault (galaxy, pulse, stats), War Room + agent chat, agent status, approvals queue, vault search/read.

**Pending (needs Lew's OAuth / API keys — clearly labeled "Sample data · not connected" in the UI):** Gmail, Google Calendar, Google Drive, Notion, and AI-spend/billing. Wiring guide is in the main [`README.md`](../README.md). Each is a localized swap — the dashboard already has the right shape; it just needs a token and a fetch.

— Kratos
