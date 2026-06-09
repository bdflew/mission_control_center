// office.jsx — THE LIVING OFFICE
// A real-time game scene of the AI team. Anti-gimmick rule: every movement is
// caused by a real backend event (the same SSE stream the chat uses). No
// scripted loops, no fake conversations. If the backend is offline the scene
// stands still and says so.
//
// Renderer: PixiJS (2.5D sprites — walk cycles, dynamic shadows, depth sort,
// speech bubbles with the actual message text). 3D upgrade path: a config
// `model3d` (GLB) slot per agent — see docs/RUNBOOK_3D_VOICE_TAURI.md.
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

  const TONE = { cyan: 0x23D6F5, gold: 0xE8C766, crimson: 0xF4516B, emerald: 0x34D399 };

  function agentMeta(id) { return (window.MC.agents || []).find(a => a.id === id); }
  function seatAround(c, id) {
    // deterministic seat per agent around a point
    let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 6;
    const ang = (h / 6) * Math.PI * 2;
    return { x: c.x + Math.cos(ang) * 86, y: c.y + Math.sin(ang) * 40 + 28 };
  }

  function LivingOffice() {
    const wrap = useRef(null);
    const overlay = useRef(null);
    const [ready, setReady] = useState('boot'); // boot | live | demo | nopixi

    useEffect(() => {
      if (!window.PIXI) { setReady('nopixi'); return; }
      const PIXI = window.PIXI;
      let app;
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

      // ---- avatars ----
      const avatars = {}; const tweens = [];
      function makeAvatar(a) {
        const c = new PIXI.Container();
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.4).drawEllipse(0, 0, 26, 8).endFill();
        c.addChild(shadow);
        let body;
        if (a.sprite) {
          body = PIXI.Sprite.from(a.sprite);
          body.anchor.set(0.5, 1); body.width = 92; body.height = 92;
        } else { // no art yet → branded chip stand-in (honest, not a fake person)
          body = new PIXI.Container();
          const disc = new PIXI.Graphics();
          disc.beginFill(TONE[a.theme] || 0x23D6F5, 0.9).lineStyle(2, 0xffffff, 0.25).drawCircle(0, -34, 26).endFill();
          const init = new PIXI.Text((a.name || '?')[0], { fontFamily: 'monospace', fontSize: 22, fontWeight: '700', fill: 0x06121A });
          init.anchor.set(0.5); init.position.set(0, -34);
          body.addChild(disc, init);
        }
        c.addChild(body);
        const ring = new PIXI.Graphics(); // status halo
        ring.lineStyle(2, 0x34D399, 0.9).drawCircle(0, 2, 16); ring.alpha = 0;
        c.addChild(ring);
        const desk = DESKS[a.deskSlot != null ? a.deskSlot : 0] || DESKS[0];
        const start = { x: desk.x + 0, y: desk.y + 36 };
        c.position.set(start.x, start.y);
        actorL.addChild(c);
        return { id: a.id, name: a.name, c, body, shadow, ring, desk: { x: desk.x, y: desk.y + 36 },
                 target: null, post: 'desk', bob: Math.random() * 6, dim: false, accent: TONE[a.theme] || 0x23D6F5 };
      }
      (window.MC.agents || []).forEach(a => {
        avatars[a.id] = makeAvatar(a);
        screens[a.id] = desk(DESKS[a.deskSlot != null ? a.deskSlot : 0] || DESKS[0], TONE[a.theme]);
        applyStatus(a.id, a.status);
      });

      // ---- speech bubbles (HTML overlay = crisp wrapped text) ----
      function bubble(id, text) {
        const av = avatars[id]; if (!av || !overlay.current) return;
        const meta = agentMeta(id) || { name: id };
        const el = document.createElement('div');
        el.className = 'mc-office__bubble';
        el.innerHTML = '<span class="who"></span>';
        el.querySelector('.who').textContent = meta.name || id;
        el.appendChild(document.createTextNode(String(text).slice(0, 140)));
        overlay.current.appendChild(el);
        const place = () => {
          const s = app.view.clientWidth / W;
          el.style.left = (av.c.x * s) + 'px';
          el.style.top  = ((av.c.y - 96) * s) + 'px';
        };
        place();
        const iv = setInterval(place, 80);
        setTimeout(() => { el.classList.add('fade'); }, 5200);
        setTimeout(() => { clearInterval(iv); el.remove(); }, 5800);
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

      // ---- ticker: movement, bob, shadows, depth, beacon pulse ----
      let t = 0;
      const tick = (dt) => {
        t += dt;
        for (const av of Object.values(avatars)) {
          av.bob += dt * (av.target ? 0.55 : 0.07);
          let bobY = Math.sin(av.bob) * (av.target ? 3.2 : 1.6);
          if (av.bobKick) { bobY -= av.bobKick; av.bobKick = Math.max(0, av.bobKick - dt * 1.5); }
          if (av.target) {
            const dx = av.target.x - av.c.x, dy = av.target.y - av.c.y;
            const d = Math.hypot(dx, dy);
            if (d < 3.5) { av.target = null; av.c.rotation = 0; }
            else {
              const sp = Math.min(d, 3.1 * dt);
              av.c.x += (dx / d) * sp; av.c.y += (dy / d) * sp;
              av.c.rotation = Math.sin(av.bob * 2) * 0.045;
            }
          }
          av.body.y = bobY;
          av.shadow.scale.x = 1 - Math.abs(bobY) * 0.04;
          av.shadow.alpha = av.dim ? 0.18 : 0.4;
          av.c.alpha = av.dim ? 0.45 : 1;
          av.ring.alpha = av.dim ? 0 : (0.25 + Math.sin(t * 0.06) * 0.12);
        }
        actorL.children.sort((a, b) => a.y - b.y); // depth: lower = in front
        beacon.alpha = pendingCount > 0 ? (0.6 + Math.sin(t * 0.18) * 0.4) : 0.25;
        beacon.scale.set(pendingCount > 0 ? 1 + Math.sin(t * 0.18) * 0.25 : 1);
        for (let i = tweens.length - 1; i >= 0; i--) {
          const tw = tweens[i]; tw.t += dt;
          const k = Math.min(1, tw.t / tw.dur); tw.step(k);
          if (k >= 1) { tw.done(); tweens.splice(i, 1); }
        }
      };
      app.ticker.add(tick);
      setReady(window.MCLive && MCLive.online ? 'live' : 'demo');
      const onLive = () => setReady(MCLive.online ? 'live' : 'demo');
      window.addEventListener('mc:live', onLive);

      return () => {
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
    return React.createElement('div', null,
      React.createElement('div', { className: 'mc-office' },
        React.createElement('div', { className: 'mc-office__hud' + (ready === 'live' ? '' : ' demo') },
          React.createElement('span', { className: 'dot' }),
          ready === 'live' ? 'LIVING OFFICE · driven by real events' : 'DEMO · backend offline — scene is static'),
        React.createElement('div', { ref: wrap }),
        React.createElement('div', { ref: overlay, style: { position: 'absolute', inset: 0, pointerEvents: 'none' } })),
      React.createElement('div', { className: 'mc-office__legend' },
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
