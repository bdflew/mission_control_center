# Mission Control Center — Legacy Automations

The operator command center for the Legacy AI Operating System (Layer 5). A fully
interactive, on-brand React prototype. Single entry point: **`Mission Control.html`**.

## Run it — LIVE (recommended)
There is now a **zero-dependency Node backend** that makes the dashboard live: it reads your
real Obsidian vault, runs the team chat, and exposes an MCP server + REST API + CLI for your
AI agents. No `npm install` needed.

```bash
npm start            # or: node server/server.js
# → http://127.0.0.1:8754/
```

Open that URL. A green **LIVE** badge (bottom-right) confirms the backend is connected and shows
your real vault note count. Point your vault elsewhere with `VAULT_DIR=/path/to/vault npm start`.

**What's genuinely live:** the Memory Galaxy, Memory Pulse and Obsidian page (your real vault —
local files, no OAuth), the **War Room + per-agent chat** (persistent + real-time), agent status,
and the approvals queue. All fake numbers/messages have been removed.

**Still sample data (needs your credentials, clearly labeled in the UI):** Gmail, Calendar,
Drive, Notion, AI-spend — see *Wiring the live connections* below.

### Connect your AI team
Your agents drive the dashboard via **MCP (best), REST, or CLI** — full guide in
[`docs/HANDOFF_GO_LIVE.md`](docs/HANDOFF_GO_LIVE.md). Quick CLI test:
```bash
./bin/mc status
./bin/mc say "Reporting in." --as kratos
```
Register the MCP server with any MCP client using [`mcp.config.example.json`](mcp.config.example.json).

## Run it — DEMO (no backend)
Open `Mission Control.html` / `index.html` directly, or `npx serve .`. You'll get a grey **DEMO**
badge and honest empty states (no live data). React + Babel load from CDN; `.jsx` transpiles
in-browser. For production, precompile the JSX and self-host the libraries.

## Structure
| File | What it is |
|---|---|
| `Mission Control.html` | Entry point — loads styles, fonts, data, and all component scripts |
| `data.jsx` / `data-pages.jsx` | All mock data (agents, emails, calendar, kanban, paperclip, studio, hermes…) |
| `icons.jsx` | Inline Lucide-style icon registry |
| `components.jsx` | Sidebar, Command Bar, shared primitives (Btn, Sparkline, Ring) |
| `home.jsx` | Mission Control bento home |
| `galaxy.jsx` | Memory Galaxy (animated canvas starfield) |
| `views.jsx` | Agent pages, War Room, Connectors, Pantheon |
| `integrations.jsx` | Gmail, Calendar, Drive, Notion |
| `pages-a.jsx` | Obsidian, Hermes Kanban, Paperclip |
| `pages-b.jsx` | Studio (Hyperframes), Hermes page, Dreaming |
| `palette.jsx` | Command Palette (⌘K) |
| `app.jsx` | Root: routing (hash-based), tweaks, palette, toast |
| `styles/*.css` | shell · home · views · pages + the Legacy design tokens |
| `assets/*` | Brand mark, avatar, circuit textures (from the Legacy design system) |

Routing is hash-based (`#gmail`, `#kanban`, `#agent:kratos`, …) so every view is deep-linkable.

## Wiring the live connections (currently realistic mock data)
The Gmail / Calendar / Drive / Notion / Obsidian surfaces are built to production fidelity but
render **mock data**. To make them live you need a small backend (the HTML can't hold OAuth secrets):

- **Gmail / Calendar / Drive** — Google OAuth 2.0; swap `MC.gmail`, `MC.calendar`, `MC.drive`
  in `data-pages.jsx` for fetches to the Gmail/Calendar/Drive REST APIs.
- **Notion** — Notion API integration token; replace `MC.notion`.
- **Obsidian / Memory Galaxy** — point at your vault via the MCP server; feed `MC.galaxyNotes`
  and `MC.obsidian.recent` from the vault's note + link graph.
- **Hermes / Kanban / Paperclip / Studio** — wire to the Hermes agent harness; each page already
  has the shape the API should return.

Every data object is a single source of truth in `data.jsx` / `data-pages.jsx`, so swapping mock
for live is a localized change per surface.

## Design system
Built strictly on the **Legacy Automations Design System** — navy/charcoal base, metallic-gold
authority, electric-cyan intelligence; Orbitron / Manrope / Space Grotesk; tokens in
`styles/colors_and_type.css`.
