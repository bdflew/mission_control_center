# Runbook — 3D avatars, premium voice, menu-bar app

Optional upgrades on top of the shipped v2. Each is a drop-in: nothing in the core breaks if you skip them.

## 1 · True-3D avatars (GLB) from your character art

The Living Office runs on 2.5D sprites (finished look, not a placeholder). To trial a real 3D model:

1. Go to an image-to-3D service: **Meshy.ai** (meshy.ai) or **Tripo** (tripo3d.ai). Both have free trial credits.
2. Upload the character art — for Lew use all three angles (`assets/avatar-front.png`, `assets/avatar-three-quarter.png`, `assets/avatar-headshot.png`); multi-view input gives far better results than a single image.
3. Generate → choose **rigged/animated** output if offered → download **GLB**.
4. Save as `assets/models/lew.glb` and set `"model3d": "assets/models/lew.glb"` for that agent in `client.config.json`.
5. The config slot is reserved and read by the frontend today; the Three.js render path is the next build step — ask for "Stage B" when you have a GLB that looks right. **Taste gate:** only swap a character to 3D when the GLB genuinely beats the sprite.

## 2 · Premium voice (ElevenLabs)

1. Create an API key at elevenlabs.io → Profile → API keys.
2. Pick or clone a voice → copy its Voice ID.
3. In your environment (or `.env` you source before `npm start`):
   `export ELEVENLABS_API_KEY=...` and optionally `export ELEVEN_VOICE_ID=...`
4. Restart the backend. The twin (companion + dashboard) now speaks with that voice; everything else keeps the free browser voices. No key → automatic, honest fallback to the browser voice.

## 3 · Menu-bar companion (Tauri)

Turns `companion.html` into a real macOS tray app (~3MB).

1. Install Rust (`brew install rustup && rustup-init`) and `npm i -g @tauri-apps/cli`.
2. `npm run tauri init` in a new `companion-app/` folder; point its `devUrl`/window to `http://127.0.0.1:8754/companion.html`, size 380×620, `alwaysOnTop: true`, `skipTaskbar: true`.
3. Add a tray icon (use `assets/la-symbol.png`) and a global shortcut (e.g. ⌥L → show/hide).
4. `npm run tauri build` → drag the app to Applications. It's the same companion page — one codebase, now ambient.

Note: the backend must be running for the companion to have data (it is honest about being offline otherwise). Pair with a LaunchAgent so `npm start` runs at login.

## 4 · Twin model + spend control

`TWIN_MODEL` env overrides the model (default from `client.config.json`, currently `claude-sonnet-4-6`). `TWIN_MAX_TOKENS` caps each reply (default 1024). API usage is billed per token by Anthropic — for a heavily-used twin, start with Sonnet and only move up if you feel the ceiling.
