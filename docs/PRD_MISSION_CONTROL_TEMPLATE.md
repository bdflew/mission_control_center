# PRD — Mission Control as a Reusable Client Template
### Legacy Automations · "AI Operating System in a box"

**Owner:** Lew (Legacy Automations) · **Status:** Draft v1 · **Companion doc:** `UPGRADE_BLUEPRINT.md` (the v2 design/feature spec this template productizes)

---

## 1 · Product statement

A white-label, locally-running **AI agent operating system dashboard** that Legacy Automations deploys for clients: their brand, their agents, their connectors — on top of one maintained codebase. The client gets a command center where their AI employees are *visible* (live statuses, a game-like living office, real chat), *controllable* (approval gate, voice orders), and *accountable* (every number traceable to a real source or honestly labeled not-connected).

**Why it sells:** every competitor demo shows chat in a box. This shows *an organization at work* — with the client's own mascot avatars walking the floor — and it never lies about data. The honesty doctrine is a feature, not a constraint: operators trust what they can audit.

## 2 · Users

- **The Operator** (client owner/exec): checks the brief, clears approvals, gives orders by chat/voice. Non-technical.
- **AI employees** (client's agents, any harness): connect via MCP / REST / CLI; report status, chat, write to the knowledge vault, request approvals.
- **Legacy Automations (deployer/maintainer):** brands, configures, deploys, updates. Needs every client difference in *config, not code*.

## 3 · The one architectural requirement that makes it a template

**All client-specific state lives in `client.config.json` + `.env` + `assets/`. Zero client edits inside `server/` or page code.**

```jsonc
// client.config.json (committed per client; no secrets)
{
  "brand": { "name": "Acme Ops", "logo": "assets/brand/logo.png",
             "colors": { "accent": "#23D6F5", "accent2": "#E8C766" },
             "displayFont": "Orbitron" },
  "operator": { "name": "Jane", "id": "jane" },
  "agents": [
    { "id": "sage", "name": "Sage", "role": "COO / router",
      "sprite": "assets/avatars/sage.png", "model3d": null,
      "voice": { "tier1": { "rate": 1.0, "pitch": 1.1 } }, "deskSlot": 1 }
  ],
  "twin": { "enabled": true, "agentId": "lew", "persona": "prompts/twin.md",
            "model": "claude-sonnet-4-6" },
  "features": { "livingOffice": true, "voice": true, "companion": true,
                "integrations": ["gmail", "calendar", "drive", "notion"] },
  "vault": { "label": "Second Brain" }
}
```

Build task this implies (Template Phase 0): refactor today's hardcoded seeds (`data.jsx` agents, brand colors in CSS vars, logo paths) to read from this config; a `--validate` boot check that fails loudly on a malformed config.

## 4 · Feature requirements by tier (productized packaging)

### Tier 1 — CORE ("Command Center") — every deployment
| # | Requirement | Acceptance |
|---|---|---|
| C1 | Config-driven branding (logo, colors, fonts, names) | New client brand in <1h, zero code edits |
| C2 | Live backend: vault galaxy/pulse, chat+SSE, agent status, approvals | All v1 verified checks pass (see `DEBUG_REPORT.md`) |
| C3 | Agent control surface: MCP (10 tools) + REST + CLI | Client agents check in from any harness |
| C4 | Approval gate: agents request, only operator resolves | Enforced server-side, demonstrated in onboarding |
| C5 | Honest-data doctrine: surface live only when implemented+authorized | Fake data = ship-blocking bug |
| C6 | Integrations: Gmail/Calendar/Drive/Notion via client's own credentials | Each flips live with creds; honest 502 on failure |
| C7 | Command Deck design system (Blueprint §1) | Operator "wow" on reveal; info density preserved |

### Tier 2 — PRO ("Living Office") — premium
| # | Requirement | Acceptance |
|---|---|---|
| P1 | Game-scene team page: client's avatars, event-driven motion (Blueprint §2) | A War Room post visibly moves avatars within 1s |
| P2 | Avatar pipeline: client art → cutout sprites → atlas (SOP documented) | New client cast in <1 day from delivered art |
| P3 | Voice Tier 1: push-to-talk orders + per-agent TTS | Spoken order lands in chat; agents' replies speak |
| P4 | Living Office degrades gracefully when backend offline | DEMO mode: static office, honest badge |

### Tier 3 — PREMIUM ("Digital Twin") — flagship
| # | Requirement | Acceptance |
|---|---|---|
| T1 | Model-backed twin persona w/ live ship context (Blueprint §3) | Twin answers "what needs me today?" from real state |
| T2 | Companion widget W1 (pop-out brief + notifications) | Notification fires on new approval, outside dashboard |
| T3 | Menu-bar app W2 (Tauri wrap) | Tray icon, global hotkey, same brief |
| T4 | Premium voice (ElevenLabs) for the twin | Custom brand voice; falls back to Tier 1 honestly |
| T5 | Optional 3D hero avatar (GLB pipeline, Blueprint §2-B) | Only ships if it beats the sprite on look — taste gate |

## 5 · Non-functional requirements

**Security:** localhost-only bind; no auth layer = no remote exposure, ever, without adding auth (documented hard rule). All secrets in env / gitignored state files; a `predeploy` secret-scan script blocks accidental commits. Twin/TTS keys never reach the browser. **Performance:** first paint <2s local; Living Office 60fps on an M-series Mac, 30fps floor on older hardware (sprite count cap). **Reliability:** chat/status/approvals persist across restarts (file-backed; already verified). **Privacy:** all client data stays on the client machine; the only egress is the APIs the client themselves authorized (Google, Notion, Anthropic, ElevenLabs). **Maintainability:** template repo → per-client private fork; `git pull template main` upgrade path; client diffs limited to config/assets/prompts by C1.

## 6 · Deployment runbook (per client, target: 2 working days)

Day 1: clone template → fill `client.config.json` + drop brand/avatar assets → client creates their own Google OAuth client + Notion integration (guided, 15 min, their accounts — we never hold their credentials) → `npm run google-auth` on their machine → verify all surfaces live. Day 2: connect their agent harnesses via MCP config → onboarding session (approval doctrine + voice demo) → handover doc auto-generated from config. Optional: Tier 3 twin setup with their Anthropic key + spend cap.

## 7 · Success metrics

Deploy time ≤2 days; operator opens dashboard ≥4 days/week after week 2 (brief/notifications drive return); ≥80% of approvals resolved in-dashboard; zero fabricated-data incidents (audited); Tier 2/3 attach rate on new deals ≥50%; template→client upgrade pulls take <1h.

## 8 · Out of scope (v2)

Multi-tenant SaaS hosting (this is local-first by design); user accounts/roles beyond the single operator; mobile app (companion widget covers ambient need); always-on wake word (push-to-talk + hotkey instead — see Blueprint §5); agents resolving their own approvals (never).

## 9 · Open questions

1. Codex (scientist) character: part of the standard cast? Need her art exported to `assets/` like the others.
2. Twin spend ceiling default ($/day) before it pauses and asks the operator?
3. License model for client forks: subscription (template updates) vs one-time + support?
4. Does the Living Office replace the Paperclip/Teams page or live beside it during transition?

## 10 · Build sequence

Template Phase 0 (config extraction) → Blueprint Phases 1–5 built *config-aware from the start* → first client = Legacy Automations itself (dogfood) → template repo cut from that, second deploy is the validation.
