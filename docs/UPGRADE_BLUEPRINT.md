# Mission Control v2 — Upgrade Blueprint
### "AI Agent Operating System" · Legacy Automations

**North star:** when this loads, it should feel like the bridge of a working ship — not a website. Every glow, every moving avatar, every voice line is driven by a *real* event from the live backend. Futuristic comes from light + motion + coherence; trust comes from the fact that nothing on screen is fake. Both are non-negotiable.

---

## 1 · Design Language v2 ("Command Deck")

The current dark + cyan + gold base is right (it matches the brand art: black, gold `#E8C766`, signal cyan `#23D6F5`). v2 sharpens it into a system:

**Surfaces.** Three elevation tiers, all glass: deck (page bg: near-black `#070B14` with a faint animated circuit/starfield layer at ~4% opacity), panel (frosted glass: `rgba(13,20,36,.72)` + `backdrop-filter: blur(14px)` + 1px edge `rgba(35,214,245,.18)`), and focus (active panel gains an animated edge-light sweep — a thin gradient that travels the border once, then settles).

**Light = meaning.** Glow is a *status channel*, never decoration: cyan glow = live/online, gold glow = needs the operator (approvals), crimson = risk/error, no glow = idle. One rule: if it glows, the operator can act on it.

**Typography.** Keep the current body font for density; add a display face for the command layer (Orbitron or Rajdhani via CDN) used ONLY for page titles, hero metrics, and the LIVE badge. Mono stays for telemetry. Three sizes per page max.

**Motion rules.** 150–250ms ease-out for state changes; one ambient loop per page maximum (galaxy rotation OR scene idle — never competing); every animation must be traceable to data (a count changed, a message arrived, an agent moved). Respect `prefers-reduced-motion`.

**Information stays.** Approvals queue, agent statuses, hero metrics, War Room, and the Memory Galaxy keep their density — v2 reskins and re-lights them, it does not bury them. The home page becomes a bento grid: hero metrics strip → (Living Office | Approvals) → (War Room mini | Memory Pulse).

---

## 2 · The Living Office (Team page → game scene)

**The anti-gimmick principle:** avatars move *because the system did something*. Motion is a render of the SSE event stream — the same one the chat and approvals already use. That's what makes it feel real; a scripted loop would be noticed in a day.

**Behavior map (event → motion):**

| Real event (already emitted today) | Scene behavior |
|---|---|
| `agent` status → working | Avatar walks to its desk, sits, typing animation + screen glow |
| `chat` message agent→agent | Speaker walks toward recipient (or War Room table), speech bubble with real text |
| `chat` in `warroom` | Avatars gather at the center table |
| `approval` requested | Requester walks to the gold "Approval Gate" pedestal, stands waiting, gold beacon |
| `approval` resolved | Beacon flips green/red; requester returns to desk |
| `vault` write | Avatar walks to the "Vault" archive wall, files a glowing card; card flies into the Memory Galaxy nav icon |
| agent offline | Avatar dims at the bench near the door |
| Operator (Lew) speaks in chat | Lew avatar appears at the command desk, others turn to face him |

**Rendering approach — staged honestly:**
- **Stage A (ships first, looks great):** 2.5D sprite scene in **PixiJS** (CDN, ~150KB). The existing chibi PNGs become high-res sprites with: alpha-cutout, soft dynamic drop shadow, idle "breathing" bob, walk cycle (bob + tilt + shadow squash), depth sorting (lower on screen = in front), A* pathfinding on a tile grid, eased arrivals. Camera: subtle parallax on mouse. This is real game tech — the same techniques as Habbo/Among Us-class scenes — and chibi art is *native* to it.
- **Stage B (true 3D, optional):** the 3-angle Lew set (`avatar-front/three-quarter/headshot.png`) and each character card are exactly the input an image-to-3D service needs (Meshy, Tripo, Rodin — generate → download GLB). The scene gets a Three.js variant with a `GLBAvatar` loader; any character with a `assets/models/<id>.glb` present renders as a rigged 3D model with idle/walk clips, others stay sprites. Drop-in, no rewrite. *Honest note: stylized chibi → 3D via AI is hit-or-miss; Stage A is not a placeholder, it's a finished look. Only swap to a GLB when it genuinely looks better.*

**Asset prep (one-time):** background-removed cutouts of the 4 characters (+ Codex when her art is exported), packed into a sprite atlas; the office floor is drawn from the existing `circuit-floor.png` brand texture.

---

## 3 · Legacy Lew — the digital twin you can actually talk to

**What it is:** a server-side persona endpoint. The dashboard's Legacy Lew chat stops being a plain channel and becomes a *model-backed agent* with the operator's context.

**Architecture (keeps the zero-dependency doctrine):**
- `server/twin.js` — calls the Anthropic Messages API directly with `fetch` (no SDK). Key from `ANTHROPIC_API_KEY` env only; **never** touches the browser.
- `POST /api/twin/chat` — body `{messages}`; streams the reply over the existing SSE channel into `agent:legacy-lew`, so it appears in the normal chat UI and the Living Office (avatar walks over, bubble shows the reply).
- **Context injection:** system prompt = Legacy Lew persona + live `mc_status` snapshot (agents, approvals, vault pulse, unread Gmail count when connected) + top vault-search hits for the user's message. The twin *knows the state of the ship*.
- **Model routing:** `TWIN_MODEL` env var (default `claude-sonnet-4-6`, switchable to any Claude model). So "whatever model I'm using" is a config line.
- Honest state: no key → the chat says "twin offline — set ANTHROPIC_API_KEY", never canned fake replies.
- *Plain-truth note:* this connects Legacy Lew to **the Claude API** (your API key, usage-billed per token — separate from a claude.ai subscription). It will be the same intelligence family as me, with the persona and your live context. A Cowork/desktop session like this one can't be the permanent brain behind it; the API is the right wiring for always-on.

**Approval doctrine carries over:** the twin can *request* approvals via the existing `/api/approvals`; it can never resolve them.

---

## 4 · The Companion Widget (the twin outside the dashboard)

A small always-on-top Lew that briefs and alerts. Phased so each stage is real:

- **Phase W1 — Mini-window (days):** `companion.html` — a compact (~340×520) frameless-styled window opened from the dashboard ("Pop out Lew"). Contains: animated Lew avatar (the 3-angle set gives him front/three-quarter poses; blink + bob + "speaking" mouth-glow), **Today's Brief** (server-composed from real data: approvals waiting, agents working, unread mail, today's events, vault pulse), and a one-line ask-the-twin input. Subscribes to the same SSE feed; fires **Web Notifications** (with permission) on gold-tier events: new approval, agent error, twin alert. Works outside the dashboard window today — it's its own window.
- **Phase W2 — Menu-bar app (a weekend):** wrap `companion.html` in **Tauri** (small Rust-based wrapper, ~3MB) as a macOS menu-bar/tray app with a global hotkey. Same HTML, zero rework; now it's truly outside the browser. *(Electron works too; Tauri is lighter.)*
- **Phase W3 — Voice + brief on schedule:** the widget speaks the morning brief at a set time (TTS below) and chimes on approvals.

The brief endpoint (`GET /api/brief`) is server-composed and honest — each line cites its source surface; sections for unconnected surfaces say "not connected", never invent.

---

## 5 · Voice ("talk to the ship")

- **Tier 1 — ships now, no keys, free:** Web Speech API in Chrome. **Push-to-talk** mic button in War Room + twin chat (push-to-talk beats always-listening: no misfires, no privacy weirdness). `SpeechRecognition` → text → existing chat POST. Replies: `speechSynthesis` TTS with a per-agent voice/rate so Sage ≠ Kratos ≠ Lew. Hermes commands work immediately because chat already drives the agents.
- **Tier 2 — premium voice:** ElevenLabs TTS (server-side key, `/api/tts` proxy route, audio streamed back) for a real custom voice for Lew — including a cloned-style brand voice. STT upgrade path: OpenAI Whisper API. Both optional env vars, both honest-degrading to Tier 1.
- **Wake word ("Hey Hermes") is deliberately Phase-later:** always-on listening in a browser is battery/privacy-hostile and flaky; the global-hotkey push-to-talk in the W2 tray app covers the real use better.

---

## 6 · Build order (each phase ships something visible)

| Phase | Scope | Done means |
|---|---|---|
| **1. Command Deck reskin** | tokens, glass panels, glow-as-status, display font, bento home, edge-light sweeps | Dashboard *looks* like an AI OS; all v1 data intact; LIVE badge unchanged |
| **2. Living Office A** | PixiJS scene on Team page, sprite pipeline, event→behavior map wired to SSE | Posting in War Room visibly moves avatars; approval → gold pedestal walk |
| **3. Digital Twin** | `server/twin.js`, `/api/twin/chat`, context injection, model env | Chat with Legacy Lew answers from live ship state; no key → honest offline |
| **4. Companion W1** | `companion.html` pop-out, `/api/brief`, Web Notifications | Lew briefs + notifies outside the dashboard window |
| **5. Voice T1** | push-to-talk STT + per-agent TTS | Speak an order in War Room; hear the twin reply |
| **6. Polish & 3D option** | Tauri tray (W2), GLB loader + Meshy-generated Lew (Stage B), ElevenLabs (T2) | Menu-bar Lew; true-3D hero avatar if the generation passes the eye test |

Dependencies: 2 needs 1's tokens; 4 needs 3's twin; 5 rides on 3's chat; 6 is all optional toppings. Phases 1–5 keep the zero-dependency backend (twin/TTS are plain `fetch` calls).

## 7 · Risks & honesty ledger

Image→3D on chibi art may disappoint → Stage A is a finished look, not a fallback. API usage costs money per message → set `TWIN_MAX_TOKENS`, show per-day spend on the Usage page once the admin key exists. Web Speech is Chrome-centric → fine (operator console), Tier 2 fixes it properly. CDN dependence (React/Babel/Pixi) → pin versions + integrity hashes as today; vendor locally before any client ship. Approval gate must bind the twin and voice paths — anything outward-facing still queues for the human.
