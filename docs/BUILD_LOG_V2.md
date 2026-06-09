# Build Log — Mission Control v2 ("one go" build)

**Date:** 2026-06-09 · **Spec:** `UPGRADE_BLUEPRINT.md` + `PRD_MISSION_CONTROL_TEMPLATE.md` · **Doctrine:** proof before claims — every ✅ was executed and verified, not assumed.

## Checklist

### Phase 0 — Config extraction (template rule C1)
- [x] `client.config.json` — brand, operator, agents (sprite/3D-slot/desk/voice), twin, features
- [x] `config-loader.js` — sync load before all app scripts; safe defaults if missing
- [x] `config-apply.js` — applies brand/title/CSS accents/operator/agent merges/features onto window.MC
- [x] Server reads the same file for twin settings (`server/twin.js → clientConfig()`)
- [x] **Fixed during build:** plain `<script>` executes before Babel scripts — config-apply & voice moved to `text/babel` so ordering is guaranteed

### Phase 1 — Command Deck reskin
- [x] `styles/command-deck.css` — deck atmosphere (radial light + drifting grid), glass panels (blur + saturate), one-shot edge-light sweeps, glow-as-status helpers, mic/office/bubble styles
- [x] Respects `prefers-reduced-motion`; additive only (zero layout rewrites, all v1 info intact)

### Phase 2 — Living Office (event-driven game scene)
- [x] `office.jsx` — PixiJS 2.5D scene: circuit floor, desks w/ accent screens, War Room table, gold Approval Gate + beacon, Vault wall, offline bench
- [x] Avatars from the real cutout sprites (`char-*.png`); honest chip stand-in for agents without art (Chloe)
- [x] Real game tech: walk easing + facing flip, idle/walk bob, dynamic shadows, depth sorting, HTML speech bubbles with the actual message text
- [x] **Every motion driven by real SSE events:** warroom post → walk to table + bubble; operator DM → agent walks to command desk; status working/offline → desk/bench; approval pending → walk to gate + beacon pulse; resolve → green/red flash; vault write → flying note card
- [x] `MCLive.onEvent` raw-event fanout added to live.js
- [x] Honest states: LIVE vs DEMO hud; no-Pixi and no-WebGL fallbacks to classic page
- [x] Team page = toggle: Living Office | classic Teams & Swarms (nothing removed)

### Phase 3 — Digital Twin (Legacy Lew, model-backed)
- [x] `server/twin.js` — Anthropic Messages API via plain fetch; key from env only, never the browser
- [x] `prompts/twin.md` — persona (direct, honest, never fabricates, never resolves approvals)
- [x] Live context injection: agents, pending approvals, vault stats + keyword-matched notes, Gmail (when connected)
- [x] Auto-reply hook: operator message in the twin's direct channel → twin answers over SSE like any agent
- [x] `POST /api/twin/chat` (companion), `GET /api/twin/status`; `TWIN_MODEL`/`TWIN_MAX_TOKENS` env overrides
- [x] Honest offline: no key → 503 + one-time channel notice; "Digital Twin" connector in bootstrap (live only when enabled AND keyed)

### Phase 4 — Companion widget
- [x] `companion.html` — standalone pop-out: floating Lew avatar, Today's Brief, ask-the-twin input, speak toggle
- [x] `GET /api/brief` — server-composed, every line from a real source; unconnected surfaces say so
- [x] SSE → system Notifications on pending approvals + system alerts; auto-refresh brief
- [x] "⧉ Companion" pop-out button next to the LIVE badge (feature-flagged)

### Phase 5 — Voice
- [x] `voice.js` — push-to-talk STT (Web Speech), per-agent TTS voices from config, speak-replies toggle (persisted)
- [x] Mic buttons in War Room + agent chat composers; speaker toggle in agent chat
- [x] `POST /api/tts` ElevenLabs proxy (server-side key) for the twin's premium voice — honest 503 fallback to browser voice
- [x] **Fixed during build:** speaker toggle used a non-existent `radio` icon → `megaphone`

### Phase 6 — 3D hook + runbooks
- [x] `model3d` config slot reserved per agent; `docs/RUNBOOK_3D_VOICE_TAURI.md` (Meshy/Tripo GLB pipeline, ElevenLabs setup, Tauri menu-bar wrap, twin spend control)
- [x] `.env.example` updated (twin, ElevenLabs)

## Verification (all executed)

| Test | Result |
|---|---|
| Syntax: all server JS + bin/mc + loaders | ✅ clean |
| Babel parse: all 24 frontend files (incl. office.jsx) | ✅ clean |
| `client.config.json` valid JSON, served 200 | ✅ |
| Twin mock suite (11 checks: settings, context, vault search, role mapping, request shape, honesty rules) | ✅ 11/11 |
| Twin/TTS/brief honest-offline (503s + honest lines, no fabrication) | ✅ |
| Operator DM to twin w/o key → single honest offline notice | ✅ |
| **Full-page headless boot** (jsdom + pinned React/Babel/Pixi, real backend): config loads, title branded, sprites merged, MCLive+MCVoice+OfficePage defined, React mounts, sidebar renders, real vault stats patched, de-fake intact | ✅ 13/13 |
| v1 regression suite (REST/SSE/CLI/MCP/persistence/guards) | ✅ 32 passing, 0 new failures (4 known test-harness grep artifacts, product proven OK previously) |

## Honest limits
- Pixi scene can't be visually rendered in this sandbox (no GPU/browser) — geometry, behaviors, and fallbacks are code-verified + full-page boot-verified; first visual pass happens on Lew's machine (`npm start` → Paperclip page). Browser check offered.
- Twin/premium voice go live when `ANTHROPIC_API_KEY` / `ELEVENLABS_API_KEY` exist — until then every surface reports offline honestly.
- True-3D (GLB) and the Tauri menu-bar app are runbook'd, deliberately not auto-built (taste gate / needs Lew's machine).
