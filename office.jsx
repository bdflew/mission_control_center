// office.jsx — THE LIVING OFFICE
// A real-time game scene of the AI team. Anti-gimmick rule: every movement is
// caused by a real backend event (the same SSE stream the chat uses). No
// scripted loops, no fake conversations. If the backend is offline the scene
// stands still and says so.
//
// Renderer: PixiJS (2.5D FULL-BODY ARTICULATED RIGS — hips/knees/shoulders/
// elbows, a real two-leg walk cycle with knee fold + arm counter-swing,
// dynamic shadows, depth sort, speech bubbles with the actual message text).
// 3D upgrade path: a config `model3d` (GLB) slot per agent — see
// docs/RUNBOOK_3D_VOICE_TAURI.md.
(function () {
  const { useState, useEffect, useRef } = React;

  // ---- scene geography (logical 1200×620 canvas) ----
  const W = 1200, H = 620;
  const DESKS = [
    { x: 200,  y: 268 }, { x: 430, y: 238 }, { x: 660, y: 238 }, { x: 890, y: 268 },
    { x: 545,  y: 540 }, // command desk (operator / twin)
  ];
  const WAR_TABLE = { x: 545, y: 372 };
  const GATE      = { x: 1085, y: 420 };  // Approval Gate (gold pedestal)
  const VAULT     = { x: 95,   y: 392 };  // Vault archive wall
  const BENCH     = { x: 1090, y: 575 };  // offline bench
  const DOOR      = { x: W - 40, y: H - 60 }; // entrance (walk-in on mount)

  const TONE = { cyan: 0x23D6F5, gold: 0xE8C766, crimson: 0xF4516B, emerald: 0x34D399, violet: 0xA78BFA };

  function agentMeta(id) { return (window.MC.agents || []).find(a => a.id === id); }
  function seatAround(c, id) {
    // deterministic seat per agent around a point
    let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 6;
    const ang = (h / 6) * Math.PI * 2;
    return { x: c.x + Math.cos(ang) * 86, y: c.y + Math.sin(ang) * 40 + 28 };
  }

  // live vitals straight from MC.agents (recomputed on 'mc:live')
  function calcVitals() {
    const ag = (window.MC && window.MC.agents) || [];
    const online = ag.filter(a => a.status && a.status !== 'offline').length;
    return {
      total: ag.length,
      online,
      working: ag.filter(a => a.status === 'working').length,
      gate: ag.filter(a => a.status === 'approval').length,
      offline: ag.length - online,
    };
  }

  function LivingOffice() {
    const wrap = useRef(null);
    const overlay = useRef(null);
    const [ready, setReady] = useState('boot'); // boot | live | demo | nopixi
    const [vitals, setVitals] = useState(calcVitals);

    useEffect(() => {
      if (!window.PIXI) { setReady('nopixi'); return; }
      const PIXI = window.PIXI;
      let app;
      let disposed = false;
      try {
        app = new PIXI.Application({ width: W, height: H, backgroundAlpha: 0, antialias: true });
        wrap.current.appendChild(app.view);
      } catch (e) { console.warn('Living Office: renderer unavailable', e); setReady('nopixi'); return; }
      app.view.style.width = '100%'; app.view.style.height = 'auto';

      const root = new PIXI.Container(); app.stage.addChild(root);
      const floorL = new PIXI.Container(), underL = new PIXI.Container(), actorL = new PIXI.Container(), fxL = new PIXI.Container();
      root.addChild(floorL, underL, actorL, fxL);

      // ---- floor: brand circuit texture, dimmed, plus perspective grid ----
      try {
        const tile = PIXI.TilingSprite.from('assets/circuit-floor.png', { width: W, height: H });
        tile.alpha = 0.16; floorL.addChild(tile);
      } catch (e) { /* texture optional */ }
      const grid = new PIXI.Graphics(); grid.lineStyle(1, 0x23D6F5, 0.05);
      for (let gx = 0; gx <= W; gx += 60) { grid.moveTo(gx, 150); grid.lineTo(gx, H); }
      for (let gy = 150; gy <= H; gy += 46) { grid.moveTo(0, gy); grid.lineTo(W, gy); }
      floorL.addChild(grid);

      // ---- furniture ----
      function desk(d, accent) {
        const g = new PIXI.Graphics();
        g.beginFill(0x0B1322, 0.95).lineStyle(1, 0x23D6F5, 0.22).drawRoundedRect(d.x - 52, d.y - 26, 104, 34, 8).endFill();
        const screen = new PIXI.Graphics();
        screen.beginFill(accent || 0x16324a, 0.28).lineStyle(1, accent || 0x23D6F5, 0.4).drawRoundedRect(d.x - 26, d.y - 58, 52, 30, 4).endFill();
        screen.alpha = 0.45;
        underL.addChild(g, screen);
        return screen;
      }
      const screens = {};
      // War Room table
      const table = new PIXI.Graphics();
      table.beginFill(0x0C1626, 0.95).lineStyle(1.4, 0xE8C766, 0.35).drawEllipse(WAR_TABLE.x, WAR_TABLE.y, 120, 48).endFill();
      table.beginFill(0x23D6F5, 0.06).drawEllipse(WAR_TABLE.x, WAR_TABLE.y, 90, 34).endFill();
      underL.addChild(table);
      // Approval Gate
      const gateG = new PIXI.Graphics();
      gateG.beginFill(0x1A1406, 0.9).lineStyle(1.4, 0xE8C766, 0.65).drawRoundedRect(GATE.x - 34, GATE.y - 30, 68, 40, 9).endFill();
      underL.addChild(gateG);
      const beacon = new PIXI.Graphics();
      beacon.beginFill(0xE8C766, 0.9).drawCircle(GATE.x, GATE.y - 48, 7).endFill();
      underL.addChild(beacon);
      // Vault wall
      const vaultG = new PIXI.Graphics();
      vaultG.beginFill(0x0A1B2E, 0.95).lineStyle(1.4, 0x23D6F5, 0.5).drawRoundedRect(VAULT.x - 36, VAULT.y - 84, 72, 96, 10).endFill();
      vaultG.lineStyle(1, 0x23D6F5, 0.3);
      for (let i = 1; i < 4; i++) vaultG.moveTo(VAULT.x - 26, VAULT.y - 84 + i * 24).lineTo(VAULT.x + 26, VAULT.y - 84 + i * 24);
      underL.addChild(vaultG);
      // labels
      function label(t, x, y, tint) {
        const tx = new PIXI.Text(t, { fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, fill: tint || 0x5b6b82 });
        tx.anchor.set(0.5); tx.position.set(x, y); underL.addChild(tx);
      }
      label('WAR ROOM', WAR_TABLE.x, WAR_TABLE.y + 4, 0x8fa3bd);
      label('APPROVAL GATE', GATE.x, GATE.y + 24, 0xE8C766);
      label('VAULT', VAULT.x, VAULT.y + 24, 0x23D6F5);

      // ---- avatars: full-body articulated rigs (feet at y=0, ~96px tall) ----
      const avatars = {}; const tweens = [];
      const NAVY = 0x1A2334, NAVY2 = 0x121C30, SUIT = 0x0E1626;
      const HIPS_Y = -34, TORSO_H = 30;

      // leg = thigh (pivot at hip) → shin (pivot at knee) → foot. Dark navy
      // uniform with accent knee cap + toe tip. Graphics built once — the walk
      // cycle only writes rotations (zero per-frame allocation).
      function makeLeg(accent) {
        const thigh = new PIXI.Container();
        const tg = new PIXI.Graphics();
        tg.beginFill(NAVY, 1).drawRoundedRect(-3.5, -3, 7, 16, 3).endFill();
        thigh.addChild(tg);
        const shin = new PIXI.Container(); shin.y = 12; // knee
        const sg = new PIXI.Graphics();
        sg.beginFill(NAVY, 1).drawRoundedRect(-3, -1, 6, 15, 2.5).endFill();
        sg.beginFill(accent, 0.5).drawCircle(0, 0.6, 2.4).endFill(); // knee cap
        shin.addChild(sg);
        const foot = new PIXI.Container(); foot.y = 13; // ankle
        const fg = new PIXI.Graphics();
        fg.beginFill(0x10182A, 1).drawRoundedRect(-3, -1.5, 11, 4.5, 2).endFill();
        fg.beginFill(accent, 0.75).drawRoundedRect(5.2, -1.5, 2.8, 4.5, 1.4).endFill(); // toe tip
        foot.addChild(fg);
        shin.addChild(foot);
        thigh.addChild(shin);
        return { thigh, shin, foot };
      }
      // arm = upper (pivot at shoulder) → forearm (pivot at elbow) with accent
      // cuff + glove.
      function makeArm(accent) {
        const upper = new PIXI.Container();
        const ug = new PIXI.Graphics();
        ug.beginFill(NAVY2, 1).drawRoundedRect(-2.5, -2, 5, 13, 2.5).endFill();
        upper.addChild(ug);
        const fore = new PIXI.Container(); fore.y = 10.5; // elbow
        const fg = new PIXI.Graphics();
        fg.beginFill(NAVY, 1).drawRoundedRect(-2, -1, 4, 12, 2).endFill();
        fg.beginFill(accent, 0.6).drawRoundedRect(-2, 8, 4, 2.6, 1.3).endFill(); // cuff
        fg.beginFill(accent, 0.85).drawCircle(0, 12.4, 2).endFill();             // glove
        fore.addChild(fg);
        upper.addChild(fore);
        return { upper, fore };
      }

      function makeAvatar(a, idx) {
        const accent = TONE[a.theme] || (a.accent ? parseInt(String(a.accent).replace('#', ''), 16) : 0x23D6F5);
        const c = new PIXI.Container();
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.4).drawEllipse(0, 0, 26, 8).endFill();
        c.addChild(shadow);

        // body = the whole figure; walkTo's scale.x flip mirrors lean, knees
        // and toes into the travel direction.
        const body = new PIXI.Container();
        const hips = new PIXI.Container(); hips.position.set(0, HIPS_Y);
        const legL = makeLeg(accent); legL.thigh.x = -5.5;
        const legR = makeLeg(accent); legR.thigh.x = 5.5;
        hips.addChild(legL.thigh, legR.thigh);

        // torso pivots at the pelvis so the travel lean reads from the hips up
        const torso = new PIXI.Container(); torso.position.set(0, HIPS_Y);
        const armL = makeArm(accent); armL.upper.position.set(-14.5, -26);
        const armR = makeArm(accent); armR.upper.position.set(14.5, -26);
        const torsoG = new PIXI.Graphics();
        torsoG.beginFill(SUIT, 1).lineStyle(2, accent, 0.8).drawRoundedRect(-15, -TORSO_H, 30, TORSO_H, 7).endFill();
        torsoG.lineStyle(0).beginFill(accent, 0.4).drawRoundedRect(-13, -4.5, 26, 2.4, 1.2).endFill(); // belt trim
        const chest = new PIXI.Graphics(); // comm light, alpha-pulses in the ticker
        chest.beginFill(accent, 1).drawCircle(5.5, -20.5, 2.6).endFill();
        chest.alpha = 0.7;

        // HEAD — chibi art when available. NOTE: the char-*.png assets are
        // circular bust portraits (verified: 256×256 RGBA discs), so the whole
        // disc IS the head at this scale; HEAD_FRAC crops from the top of the
        // texture (drop to ~0.48 if full-body sheets land later).
        const head = new PIXI.Container(); head.position.set(0, -TORSO_H);
        const fb = new PIXI.Container(); // fallback head (chloe always; others until art loads)
        const disc = new PIXI.Graphics();
        disc.beginFill(accent, 0.92).lineStyle(2, 0xffffff, 0.25).drawCircle(0, -13, 13).endFill();
        const init = new PIXI.Text((a.name || '?')[0], { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', fill: 0x06121A });
        init.anchor.set(0.5); init.position.set(0, -13);
        fb.addChild(disc, init);
        head.addChild(fb);
        if (a.sprite) {
          const HEAD_FRAC = 1;
          const tex = PIXI.Texture.from(a.sprite);
          const applyHead = () => {
            if (disposed) return;
            const base = tex.baseTexture;
            if (!base || !base.valid) return;
            try {
              const headTex = new PIXI.Texture(base, new PIXI.Rectangle(0, 0, base.width, Math.max(1, Math.round(base.height * HEAD_FRAC))));
              const spr = new PIXI.Sprite(headTex);
              spr.anchor.set(0.5, 1);
              spr.scale.set(34 / headTex.width); // width ≈ 34px, aspect kept
              spr.position.set(0, 1.5);          // chin tucks onto the collar
              head.removeChildren().forEach(ch => ch.destroy({ children: true }));
              head.addChild(spr);
            } catch (e) { /* keep the fallback head */ }
          };
          if (tex.baseTexture && tex.baseTexture.valid) applyHead();
          else if (tex.baseTexture) {
            tex.baseTexture.once('loaded', applyHead);
            tex.baseTexture.once('error', () => { /* fallback head stays */ });
          }
        }

        torso.addChild(armL.upper, torsoG, chest, head, armR.upper); // far arm behind, near arm in front
        body.addChild(hips, torso);
        c.addChild(body);
        const ring = new PIXI.Graphics(); // status halo — stays at the feet
        ring.lineStyle(2, 0x34D399, 0.9).drawCircle(0, 2, 16); ring.alpha = 0;
        c.addChild(ring);

        const desk = DESKS[a.deskSlot != null ? a.deskSlot : 0] || DESKS[0];
        // walk-in entrance: spawn in a short queue at the door; the ticker
        // holds each one a beat, then they WALK to their posts (once, on mount)
        c.position.set(DOOR.x - idx * 9, DOOR.y - idx * 5);
        actorL.addChild(c);
        return {
          id: a.id, name: a.name, c, body, shadow, ring,
          desk: { x: desk.x, y: desk.y + 36 },
          target: null, post: 'desk', bob: Math.random() * 6, dim: false,
          accent, status: a.status, holdT: idx * 24,
          rig: {
            hips, torso, head, chest, legL, legR, armL, armR,
            phase: Math.random() * 6.28, seed: idx * 1.73,
            torsoBaseY: HIPS_Y, headBaseY: -TORSO_H,
          },
        };
      }
      (window.MC.agents || []).forEach((a, i) => {
        avatars[a.id] = makeAvatar(a, i);
        screens[a.id] = desk(DESKS[a.deskSlot != null ? a.deskSlot : 0] || DESKS[0], TONE[a.theme]);
        applyStatus(a.id, a.status);
      });

      // ---- speech bubbles (HTML overlay = crisp wrapped text) ----
      // timers tracked + placer self-guards: leaving the page mid-bubble must
      // not keep ticking against a destroyed PIXI app (perf audit P1).
      // (`disposed` is the effect-wide flag declared above.)
      const bubbleTimers = new Set();
      function bubble(id, text) {
        const av = avatars[id]; if (!av || !overlay.current || disposed) return;
        const meta = agentMeta(id) || { name: id };
        const el = document.createElement('div');
        el.className = 'mc-office__bubble';
        el.innerHTML = '<span class="who"></span>';
        el.querySelector('.who').textContent = meta.name || id;
        el.appendChild(document.createTextNode(String(text).slice(0, 140)));
        overlay.current.appendChild(el);
        const place = () => {
          if (disposed || !app.view || !app.view.clientWidth) return;
          const s = app.view.clientWidth / W;
          el.style.left = (av.c.x * s) + 'px';
          el.style.top  = ((av.c.y - 96) * s) + 'px';
        };
        place();
        const iv = setInterval(place, 80);
        const t1 = setTimeout(() => { el.classList.add('fade'); }, 5200);
        const t2 = setTimeout(() => { clearInterval(iv); el.remove(); bubbleTimers.delete(iv); bubbleTimers.delete(t1); bubbleTimers.delete(t2); }, 5800);
        bubbleTimers.add(iv); bubbleTimers.add(t1); bubbleTimers.add(t2);
      }

      // ---- movement + behaviors ----
      function walkTo(av, p, post) {
        av.target = { x: p.x, y: p.y };
        if (post) av.post = post;
        const dx = p.x - av.c.x;
        if (Math.abs(dx) > 4 && av.body.scale) av.body.scale.x = Math.abs(av.body.scale.x) * (dx < 0 ? -1 : 1);
      }
      function applyStatus(id, status) {
        const av = avatars[id]; if (!av) return;
        av.status = status;
        if (status === 'working') { walkTo(av, av.desk, 'desk'); av.dim = false; av.ring.tint = 0x34D399; }
        else if (status === 'offline' || !status) { walkTo(av, { x: BENCH.x - (Object.keys(avatars).indexOf(id) * 46), y: BENCH.y }, 'bench'); av.dim = true; }
        else { walkTo(av, { x: av.desk.x + 30, y: av.desk.y + 8 }, 'near'); av.dim = false; av.ring.tint = 0x23D6F5; }
        if (screens[id]) screens[id].alpha = status === 'working' ? 1 : 0.4;
      }
      function flyCard(from, to) {
        const card = new PIXI.Graphics();
        card.beginFill(0x23D6F5, 0.85).lineStyle(1, 0xffffff, 0.4).drawRoundedRect(-7, -9, 14, 18, 3).endFill();
        card.position.set(from.x, from.y - 50); fxL.addChild(card);
        tweens.push({ t: 0, dur: 60, step(k) {
          card.x = from.x + (to.x - from.x) * k;
          card.y = (from.y - 50) + (to.y - 60 - (from.y - 50)) * k - Math.sin(k * Math.PI) * 60;
          card.alpha = 1 - k * 0.6;
        }, done() { card.destroy(); } });
      }
      let pendingCount = (window.MC.approvals || []).length;

      function onEvent(evt) {
        if (evt.type === 'chat' && evt.message) {
          const m = evt.message; const av = avatars[m.from];
          if (m.channel === 'warroom') {
            if (av) { walkTo(av, seatAround(WAR_TABLE, m.from), 'table'); bubble(m.from, m.text); }
            // others at their desks glance over: tiny hop
            Object.values(avatars).forEach(o => { if (o.id !== m.from && o.post === 'desk') o.bobKick = 6; });
          } else if (m.channel && m.channel.indexOf('agent:') === 0) {
            const who = m.channel.slice(6);
            if (m.role === 'operator') { const tv = avatars[who]; if (tv) walkTo(tv, { x: DESKS[4].x + 70, y: DESKS[4].y + 14 }, 'command'); }
            else if (av) bubble(m.from, m.text);
          }
        }
        if (evt.type === 'agent' && evt.agent) applyStatus(evt.agent.id, evt.agent.status);
        if (evt.type === 'approval' && evt.approval) {
          const ap = evt.approval; const av = avatars[ap.by];
          if (ap.state === 'pending') { pendingCount++; if (av) walkTo(av, { x: GATE.x - 52, y: GATE.y + 16 }, 'gate'); }
          else {
            pendingCount = Math.max(0, pendingCount - 1);
            beacon.tint = ap.state === 'approved' ? 0x34D399 : 0xF4516B;
            setTimeout(() => { beacon.tint = 0xFFFFFF; }, 2500);
            if (av) walkTo(av, av.desk, 'desk');
          }
        }
        if (evt.type === 'vault') {
          const by = evt.by && avatars[evt.by] ? evt.by : null;
          if (by) { const av = avatars[by]; flyCard({ x: av.c.x, y: av.c.y }, VAULT); }
          else flyCard({ x: DESKS[4].x, y: DESKS[4].y }, VAULT);
        }
      }
      const offEvt = window.MCLive && MCLive.onEvent ? MCLive.onEvent(onEvent) : null;

      // ---- ticker: gait + idle life, shadows, depth, beacon pulse ----
      // Gait numbers: thigh swing ±0.62 rad, knee fold up to 0.85 rad on the
      // trailing/lifting leg, arms counter-swing 0.4 rad, torso lean 0.06.
      // Stride is distance-synced (phase += px-moved × 0.095 ≈ 0.29/frame at
      // the kept 3.1·dt walk speed) so the feet never moonwalk — and slowing
      // into a stop shortens the steps naturally.
      let t = 0;
      const easeTo = (o, p, v, k) => { o[p] += (v - o[p]) * k; };
      const tick = (dt) => {
        t += dt;
        const motionOff = document.documentElement.getAttribute('data-motion') === 'off';
        for (const av of Object.values(avatars)) {
          const rig = av.rig;
          av.bob += dt * (av.target ? 0.55 : 0.07); // kept for interface compat
          let lift = 0; // whole-figure hop (desk glance)
          if (av.bobKick) { lift = av.bobKick; av.bobKick = Math.max(0, av.bobKick - dt * 1.5); }
          if (av.holdT > 0) av.holdT -= dt; // entrance queue: hold at the door a beat
          let moving = false, sp = 0;
          if (av.target && av.holdT <= 0) {
            const dx = av.target.x - av.c.x, dy = av.target.y - av.c.y;
            const d = Math.hypot(dx, dy);
            if (d < 3.5) { av.target = null; av.c.rotation = 0; }
            else {
              sp = Math.min(d, 3.1 * dt);
              av.c.x += (dx / d) * sp; av.c.y += (dy / d) * sp;
              moving = true;
            }
          }
          let crest = 0; // gait airborne-ness → shadow shrink
          const k = Math.min(1, dt * 0.18);
          if (motionOff) {
            // reduced motion: relocation allowed, limb swing skipped — neutral stance
            rig.legL.thigh.rotation = 0; rig.legR.thigh.rotation = 0;
            rig.legL.shin.rotation = -0.05; rig.legR.shin.rotation = -0.05;
            rig.legL.foot.rotation = 0; rig.legR.foot.rotation = 0;
            rig.armL.upper.rotation = 0.06; rig.armR.upper.rotation = -0.06;
            rig.armL.fore.rotation = -0.14; rig.armR.fore.rotation = -0.14;
            rig.torso.rotation = 0; rig.torso.x = 0; rig.torso.y = rig.torsoBaseY;
            rig.torso.scale.y = 1; rig.head.y = rig.headBaseY; rig.hips.x = 0;
            rig.chest.alpha = 0.7;
          } else if (moving) {
            rig.phase += sp * 0.095; // stride sync — see note above
            const ph = rig.phase, sL = Math.sin(ph), sR = -sL;
            // LEGS: thigh pendulum; knee folds as the leg lifts off behind and
            // swings through, straightening into the front heel-strike
            rig.legL.thigh.rotation = sL * 0.62;
            rig.legR.thigh.rotation = sR * 0.62;
            rig.legL.shin.rotation = Math.max(0, sL) * 0.85 - 0.1;
            rig.legR.shin.rotation = Math.max(0, sR) * 0.85 - 0.1;
            // feet: partial ground-compensation = small lift on the swing leg
            rig.legL.foot.rotation = -(rig.legL.thigh.rotation + rig.legL.shin.rotation) * 0.55;
            rig.legR.foot.rotation = -(rig.legR.thigh.rotation + rig.legR.shin.rotation) * 0.55;
            // ARMS: counter-swing vs same-side leg, elbows slightly bent
            rig.armL.upper.rotation = sR * 0.4;
            rig.armR.upper.rotation = sL * 0.4;
            rig.armL.fore.rotation = -0.26 - Math.max(0, sR) * 0.2;
            rig.armR.fore.rotation = -0.26 - Math.max(0, sL) * 0.2;
            // TORSO: lean into travel (body flip mirrors it) + step-synced bob
            // (pelvis dips at the leg-split, rises as the legs pass); HEAD
            // counter-bobs so the face stays calm
            const bob = Math.abs(sL) * 2.2;
            rig.torso.rotation = 0.06;
            rig.torso.x = 0; rig.torso.scale.y = 1;
            rig.torso.y = rig.torsoBaseY - 1.1 + bob;
            rig.head.y = rig.headBaseY - bob * 0.3;
            rig.hips.x = 0;
            rig.chest.alpha = 0.55 + Math.sin(t * 0.09 + rig.seed) * 0.2;
            crest = 2.2 - bob;
          } else {
            // IDLE: breathe + slow weight shift; typing at a working desk;
            // slumped on the bench. Eased so a stopped walk settles smoothly.
            const bench = av.post === 'bench';
            const typing = !bench && !av.target && av.status === 'working' && av.post === 'desk';
            easeTo(rig.legL.thigh, 'rotation', 0, k); easeTo(rig.legR.thigh, 'rotation', 0, k);
            easeTo(rig.legL.shin, 'rotation', -0.05, k); easeTo(rig.legR.shin, 'rotation', -0.05, k);
            easeTo(rig.legL.foot, 'rotation', 0, k); easeTo(rig.legR.foot, 'rotation', 0, k);
            if (typing) { // forearms up on the desk, quick small oscillation
              easeTo(rig.armL.upper, 'rotation', -0.5, k); easeTo(rig.armR.upper, 'rotation', -0.5, k);
              rig.armL.fore.rotation = -0.82 + Math.sin(t * 0.5 + rig.seed) * 0.11;
              rig.armR.fore.rotation = -0.82 + Math.sin(t * 0.5 + rig.seed + 1.7) * 0.11;
            } else if (bench) { // arms hang
              easeTo(rig.armL.upper, 'rotation', 0.12, k); easeTo(rig.armR.upper, 'rotation', 0.08, k);
              easeTo(rig.armL.fore, 'rotation', -0.04, k); easeTo(rig.armR.fore, 'rotation', -0.04, k);
            } else {
              easeTo(rig.armL.upper, 'rotation', 0.06, k); easeTo(rig.armR.upper, 'rotation', -0.06, k);
              easeTo(rig.armL.fore, 'rotation', -0.14, k); easeTo(rig.armR.fore, 'rotation', -0.14, k);
            }
            easeTo(rig.torso, 'rotation', bench ? 0.05 : 0, k); // bench slump
            easeTo(rig.torso, 'y', rig.torsoBaseY, k);
            easeTo(rig.head, 'y', rig.headBaseY, k);
            rig.torso.scale.y = 1 + Math.sin(t * 0.045 + rig.seed) * 0.012; // breathing
            const wx = bench ? 0 : Math.sin(t * 0.012 + rig.seed * 2.1) * 1.0; // weight shift
            easeTo(rig.hips, 'x', wx, k); easeTo(rig.torso, 'x', wx * 1.2, k);
            rig.chest.alpha = 0.55 + Math.sin(t * 0.09 + rig.seed) * 0.2;
          }
          av.body.y = -lift;
          av.shadow.scale.x = Math.max(0.5, 1 - (lift + crest) * 0.04);
          av.shadow.alpha = av.dim ? 0.18 : 0.4;
          av.c.alpha = av.dim ? 0.45 : 1;
          av.ring.alpha = av.dim ? 0 : (0.25 + Math.sin(t * 0.06) * 0.12);
        }
        actorL.children.sort((a, b) => a.y - b.y); // depth: lower = in front
        beacon.alpha = pendingCount > 0 ? (0.6 + Math.sin(t * 0.18) * 0.4) : 0.25;
        beacon.scale.set(pendingCount > 0 ? 1 + Math.sin(t * 0.18) * 0.25 : 1);
        for (let i = tweens.length - 1; i >= 0; i--) {
          const tw = tweens[i]; tw.t += dt;
          const k2 = Math.min(1, tw.t / tw.dur); tw.step(k2);
          if (k2 >= 1) { tw.done(); tweens.splice(i, 1); }
        }
      };
      app.ticker.add(tick);
      setReady(window.MCLive && MCLive.online ? 'live' : 'demo');
      const onLive = () => { setReady(MCLive.online ? 'live' : 'demo'); setVitals(calcVitals()); };
      window.addEventListener('mc:live', onLive);

      return () => {
        disposed = true;
        bubbleTimers.forEach(tm => { clearInterval(tm); clearTimeout(tm); });
        bubbleTimers.clear();
        window.removeEventListener('mc:live', onLive);
        if (offEvt) offEvt();
        app.ticker.remove(tick);
        app.destroy(true, { children: true, texture: false });
      };
    }, []);

    if (ready === 'nopixi') {
      return React.createElement('div', { className: 'mc-panel', style: { padding: 18 } },
        'Living Office needs the PixiJS library (CDN unreachable). The classic Teams view below still works.');
    }
    const vital = (mod, label, value) => React.createElement('span', { className: 'office-vital' },
      React.createElement('i', { className: 'v3o-dot v3o-dot--' + mod }),
      React.createElement('b', { className: 'v3o-num' }, String(value)), label);
    return React.createElement('div', null,
      React.createElement('div', { className: 'mc-office' },
        React.createElement('div', { className: 'mc-office__hud' + (ready === 'live' ? '' : ' demo') },
          React.createElement('span', { className: 'dot' }),
          ready === 'live' ? 'LIVING OFFICE · driven by real events' : 'DEMO · backend offline — scene is static'),
        React.createElement('div', { ref: wrap }),
        React.createElement('div', { ref: overlay, style: { position: 'absolute', inset: 0, pointerEvents: 'none' } })),
      React.createElement('div', { className: 'office-vitals v3o-vitals' },
        vital('on', 'online', vitals.online + ' / ' + vitals.total),
        vital('work', 'working', vitals.working),
        vital('gate', 'at the gate', vitals.gate),
        vital('off', 'offline', vitals.offline)),
      React.createElement('div', { className: 'mc-office__legend' },
        React.createElement('span', null, React.createElement('b', null, 'Two-leg walk'), ' = on the move'),
        React.createElement('span', null, React.createElement('b', null, 'Desk glow'), ' = agent working'),
        React.createElement('span', null, React.createElement('b', null, 'Walk to table'), ' = posted in War Room'),
        React.createElement('span', null, React.createElement('b', null, 'Gold beacon'), ' = approval waiting on you'),
        React.createElement('span', null, React.createElement('b', null, 'Flying card'), ' = note written to the vault'),
        React.createElement('span', null, React.createElement('b', null, 'Bench'), ' = agent offline')));
  }

  // Page wrapper: Living Office + the classic Teams content beneath a toggle.
  function OfficePage({ onNav }) {
    const [tab, setTab] = useState('office');
    const features = window.MC.features || {};
    if (!features.livingOffice) return React.createElement(window.PaperclipPage, { onNav });
    return React.createElement('div', { className: 'fade-up' },
      React.createElement('div', { className: 'mc-page-head' },
        React.createElement('h2', null, 'The Living Office'),
        React.createElement('p', null, 'Your AI team, on the floor. Every movement is a real event from the live backend — a message, a status change, an approval, a vault write. Nothing here is scripted.')),
      React.createElement('div', { className: 'mc-office__toggle' },
        React.createElement('button', { className: 'mc-art__filter' + (tab === 'office' ? ' is-active' : ''), onClick: () => setTab('office') }, 'Living Office'),
        React.createElement('button', { className: 'mc-art__filter' + (tab === 'teams' ? ' is-active' : ''), onClick: () => setTab('teams') }, 'Teams & Swarms')),
      tab === 'office' ? React.createElement(LivingOffice) : React.createElement(window.PaperclipPage, { onNav }));
  }

  Object.assign(window, { OfficePage, LivingOffice });
})();
