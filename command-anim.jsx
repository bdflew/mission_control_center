// command-anim.jsx — premium retro-90s command-chain animation
// Sage (orchestrator) walks between each employee's workspace and hands off paperwork.
const { useRef: useRanim, useEffect: useEanim } = React;

function CommandChainAnim() {
  const wrapRef = useRanim(null);
  const cvRef = useRanim(null);
  const S = useRanim({ raf: 0, t: 0, last: 0 }).current;

  useEanim(() => {
    const cv = cvRef.current, wrap = wrapRef.current;
    const LW = 1000, LH = 500; // logical canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const A = window.MC.agents;
    const pick = (id) => A.find(a => a.id === id) || { name: id, accent: '#64748B', accent2: '#9fb0c4' };
    // stations (the four employees Sage routes to)
    const stations = [
      { ag: pick('kratos'), x: 175, y: 175, gender: 'm', note: 'harden + prove the build' },
      { ag: pick('faye'), x: 395, y: 120, gender: 'f', note: 'ship the galaxy view' },
      { ag: pick('chloe'), x: 605, y: 120, gender: 'f', note: 'tighten the Q3 offer' },
      { ag: pick('legacylew'), x: 825, y: 175, gender: 'm', note: 'cover the inbox as Lew' },
    ];
    const sage = pick('sage');
    // character portraits (extracted, circular)
    const CHARSRC = { sage: 'assets/char-sage.png', kratos: 'assets/char-kratos.png', faye: 'assets/char-faye.png', legacylew: 'assets/char-lew.png' };
    const imgs = {};
    Object.keys(CHARSRC).forEach(k => { const im = new Image(); im.src = CHARSRC[k]; im.onload = () => { imgs[k] = im; }; });
    const HOME = { x: 500, y: 405 };
    // walk state machine
    const st = { phase: 'out', target: 0, pos: { x: HOME.x, y: HOME.y }, carry: true, pause: 0, trail: [], puffs: [], rings: [], step: 0, caption: '' };
    const speed = 300; // logical px / sec
    const particles = Array.from({ length: 34 }, () => ({ x: Math.random() * LW, y: Math.random() * LH, s: Math.random() * 1.4 + 0.3, v: Math.random() * 8 + 4, tw: Math.random() * 6.28 }));

    const setCaption = () => { const s = stations[st.target]; st.caption = st.carry ? 'Sage → ' + s.ag.name + ' · ' + s.note : s.ag.name + ' → Sage · reporting back'; };
    setCaption();

    const lerp = (a, b, f) => a + (b - a) * f;
    const moveToward = (tx, ty, dt) => {
      const dx = tx - st.pos.x, dy = ty - st.pos.y, d = Math.hypot(dx, dy);
      const step = speed * dt;
      if (d <= step) { st.pos.x = tx; st.pos.y = ty; return true; }
      st.pos.x += dx / d * step; st.pos.y += dy / d * step; return false;
    };

    const grad = (ctx, x, y, w, h, c1, c2) => { const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; };

    function drawGrid(ctx, t) {
      // synthwave perspective floor in lower portion
      ctx.save();
      const horizon = 250;
      ctx.strokeStyle = 'rgba(35,214,245,0.16)'; ctx.lineWidth = 1;
      // receding horizontals
      for (let i = 0; i <= 14; i++) {
        const f = i / 14; const y = horizon + Math.pow(f, 1.8) * (LH - horizon);
        ctx.globalAlpha = 0.08 + f * 0.22;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LW, y); ctx.stroke();
      }
      // verticals converging to center vanishing point
      const vx = LW / 2;
      for (let i = -10; i <= 10; i++) {
        ctx.globalAlpha = 0.12;
        ctx.beginPath(); ctx.moveTo(vx + i * 22, horizon); ctx.lineTo(vx + i * 150, LH); ctx.stroke();
      }
      ctx.restore();
    }

    function drawStation(ctx, s) {
      const recent = st.rings.find(r => r.sx === s.x);
      const c = s.ag.accent, c2 = s.ag.accent2 || '#fff';
      // bloom
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const bg = ctx.createRadialGradient(s.x, s.y - 6, 0, s.x, s.y - 6, 80);
      bg.addColorStop(0, hexa(c, 0.4)); bg.addColorStop(1, hexa(c, 0));
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(s.x, s.y - 6, 80, 0, 6.2832); ctx.fill(); ctx.restore();
      // desk base
      roundRect(ctx, s.x - 52, s.y + 14, 104, 20, 5); ctx.fillStyle = grad(ctx, s.x - 52, s.y + 14, 0, 20, '#1a2336', '#0e1626'); ctx.fill();
      ctx.strokeStyle = hexa(c, 0.5); ctx.lineWidth = 1.2; ctx.stroke();
      // monitor
      roundRect(ctx, s.x - 30, s.y - 30, 60, 40, 5);
      ctx.fillStyle = grad(ctx, s.x - 30, s.y - 30, 0, 40, hexa(c, 0.28), hexa(c, 0.06)); ctx.fill();
      ctx.strokeStyle = hexa(c, 0.7); ctx.lineWidth = 1.4; ctx.stroke();
      // monitor scanlines
      ctx.save(); ctx.beginPath(); roundRect(ctx, s.x - 30, s.y - 30, 60, 40, 5); ctx.clip();
      ctx.strokeStyle = hexa(c2, 0.18);
      for (let yy = s.y - 28; yy < s.y + 8; yy += 4) { ctx.beginPath(); ctx.moveTo(s.x - 30, yy); ctx.lineTo(s.x + 30, yy); ctx.stroke(); }
      ctx.restore();
      // avatar token (the seated employee)
      avatarToken(ctx, s.ag, s.x, s.y + 24, 27);
      // nameplate
      ctx.fillStyle = hexa(c2, 0.95); ctx.font = '700 12px Orbitron, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.ag.name.toUpperCase(), s.x, s.y + 56);
      // receive ring + check
      if (recent) {
        const p = 1 - recent.life / 1.1;
        ctx.strokeStyle = hexa('#E8C766', 0.8 * (1 - p)); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y - 6, 20 + p * 36, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = hexa('#E8C766', 1 - p); ctx.font = '700 13px Orbitron, sans-serif';
        ctx.fillText('✓ TASK', s.x, s.y - 44 - p * 10);
      }
    }

    function avatarToken(ctx, ag, x, y, r) {
      const im = imgs[ag.id];
      // outer glow ring
      ctx.save();
      ctx.shadowColor = hexa(ag.accent, 0.75); ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = '#0a1322'; ctx.fill();
      ctx.restore();
      if (im) {
        ctx.save();
        ctx.beginPath(); ctx.arc(x, y, r - 1.5, 0, 6.2832); ctx.closePath(); ctx.clip();
        ctx.drawImage(im, x - r, y - r, r * 2, r * 2);
        ctx.restore();
        // themed ring
        ctx.lineWidth = 2.4; ctx.strokeStyle = hexa(ag.accent, 0.9);
        ctx.beginPath(); ctx.arc(x, y, r - 1, 0, 6.2832); ctx.stroke();
      } else {
        // fallback gradient token while image loads / for Chloe
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
        ctx.fillStyle = grad(ctx, x - r, y - r, 0, r * 2, ag.accent2 || ag.accent, ag.accent); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = hexa(ag.accent, 0.8); ctx.stroke();
        ctx.fillStyle = '#06121A'; ctx.font = '800 ' + Math.round(r * 1.05) + 'px Orbitron, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(ag.name[0], x, y + 1); ctx.textBaseline = 'alphabetic';
      }
    }

    function drawSage(ctx, t) {
      const moving = st.phase !== 'deliver';
      const bob = moving ? Math.sin(st.step * 9) * 3 : 0;
      const x = st.pos.x, y = st.pos.y + bob;
      // trail
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < st.trail.length; i++) { const p = st.trail[i]; const a = (i / st.trail.length) * 0.4; ctx.fillStyle = hexa(sage.accent, a); ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.2832); ctx.fill(); }
      ctx.restore();
      // step puffs
      st.puffs.forEach(pf => { ctx.fillStyle = hexa('#cfeaff', pf.life / 0.5 * 0.4); ctx.beginPath(); ctx.arc(pf.x, pf.y, (0.5 - pf.life) * 10 + 2, 0, 6.2832); ctx.fill(); });
      // carried paperwork
      if (st.carry) {
        const px = x + 20, py = y - 6;
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        const g = ctx.createRadialGradient(px, py, 0, px, py, 18); g.addColorStop(0, 'rgba(232,199,102,0.6)'); g.addColorStop(1, 'rgba(232,199,102,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 18, 0, 6.2832); ctx.fill(); ctx.restore();
        roundRect(ctx, px - 7, py - 9, 14, 18, 2); ctx.fillStyle = '#F3D27A'; ctx.fill();
        ctx.fillStyle = 'rgba(6,18,26,0.5)'; ctx.fillRect(px - 4, py - 4, 8, 1.5); ctx.fillRect(px - 4, py - 1, 8, 1.5); ctx.fillRect(px - 4, py + 2, 6, 1.5);
      }
      // Sage avatar (the walker)
      avatarToken(ctx, sage, x, y, 23);
      // label
      ctx.fillStyle = hexa(sage.accent2 || '#fff', 0.9); ctx.font = '700 10px Orbitron, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('SAGE', x, y + 32);
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - (S.last || now)) / 1000); S.last = now; S.t += dt; st.step += dt;
      const ctx = cv.getContext('2d'); ctx.setTransform(cv.width / LW, 0, 0, cv.height / LH, 0, 0);
      // bg
      const bgg = ctx.createRadialGradient(LW / 2, 160, 0, LW / 2, 260, 700); bgg.addColorStop(0, '#0c1730'); bgg.addColorStop(0.6, '#070d1c'); bgg.addColorStop(1, '#04060e');
      ctx.fillStyle = bgg; ctx.fillRect(0, 0, LW, LH);
      drawGrid(ctx, S.t);
      // particles
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      particles.forEach(p => { p.y -= p.v * dt; if (p.y < 0) { p.y = LH; p.x = Math.random() * LW; } const a = 0.3 + 0.3 * Math.sin(S.t * 2 + p.tw); ctx.fillStyle = hexa('#6FE8FB', a * 0.5); ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.2832); ctx.fill(); });
      ctx.restore();
      // connector lines home->stations
      ctx.save(); ctx.setLineDash([4, 6]); ctx.lineDashOffset = -S.t * 20; ctx.strokeStyle = 'rgba(35,214,245,0.18)'; ctx.lineWidth = 1;
      stations.forEach(s => { ctx.beginPath(); ctx.moveTo(HOME.x, HOME.y - 10); ctx.lineTo(s.x, s.y + 20); ctx.stroke(); });
      ctx.restore();
      // stations
      stations.forEach(s => drawStation(ctx, s));
      // home pad
      ctx.strokeStyle = 'rgba(35,214,245,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(HOME.x, HOME.y + 26, 46, 12, 0, 0, 6.2832); ctx.stroke();

      // ---- walk logic ----
      if (st.phase === 'out') {
        const s = stations[st.target];
        if (Math.random() < dt * 5) st.puffs.push({ x: st.pos.x + (Math.random() - 0.5) * 10, y: st.pos.y + 22, life: 0.5 });
        if (moveToward(s.x, s.y + 30, dt)) { st.phase = 'deliver'; st.pause = 1.0; st.carry = false; st.rings.push({ sx: s.x, life: 1.1 }); }
      } else if (st.phase === 'deliver') {
        st.pause -= dt; if (st.pause <= 0) { st.phase = 'back'; }
      } else if (st.phase === 'back') {
        if (Math.random() < dt * 5) st.puffs.push({ x: st.pos.x + (Math.random() - 0.5) * 10, y: st.pos.y + 22, life: 0.5 });
        if (moveToward(HOME.x, HOME.y, dt)) { st.target = (st.target + 1) % stations.length; st.carry = true; st.phase = 'out'; setCaption(); }
      }
      // trail + puff upkeep
      st.trail.push({ x: st.pos.x, y: st.pos.y + 14 }); if (st.trail.length > 16) st.trail.shift();
      st.puffs.forEach(p => p.life -= dt); st.puffs = st.puffs.filter(p => p.life > 0);
      st.rings.forEach(r => r.life -= dt); st.rings = st.rings.filter(r => r.life > 0);

      drawSage(ctx, S.t);

      // caption (drawn on canvas)
      ctx.fillStyle = 'rgba(207,234,255,0.0)';
      const capEl = wrap.querySelector('.mc-anim__cap'); if (capEl && capEl.textContent !== st.caption) capEl.textContent = st.caption;

      // respect the motion tweak + prefers-reduced-motion: park on a static
      // frame and probe to resume (was the one loop ignoring both — audit P2)
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const msc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-scale')) || 1;
      if (reduced || msc <= 0.001) {
        const probe = setInterval(() => {
          const m2 = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-scale')) || 1;
          const r2 = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!r2 && m2 > 0.001) { clearInterval(probe); S.last = performance.now(); S.raf = requestAnimationFrame(frame); }
        }, 1500);
        S.probe = probe;
        return;
      }
      S.raf = requestAnimationFrame(frame);
    }

    const resize = () => { const w = wrap.clientWidth, h = wrap.clientHeight; cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; };
    resize(); window.addEventListener('resize', resize);
    // paint one sync frame, then animate
    S.last = performance.now(); frame(S.last);
    return () => { cancelAnimationFrame(S.raf); if (S.probe) clearInterval(S.probe); window.removeEventListener('resize', resize); };
  }, []);

  return React.createElement('div', { className: 'mc-anim', ref: wrapRef },
    React.createElement('canvas', { className: 'mc-anim__canvas', ref: cvRef }),
    React.createElement('div', { className: 'mc-anim__scan' }),
    React.createElement('div', { className: 'mc-anim__vig' }),
    React.createElement('div', { className: 'mc-anim__title' }, '◆ COMMAND CHAIN'),
    React.createElement('div', { className: 'mc-anim__badge' }, 'LIVE · ORCHESTRATING'),
    React.createElement('div', { className: 'mc-anim__cap' }, 'Sage is routing the team…'),
  );
}

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function hexa(hex, a) { const h = hex.replace('#', ''); const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return `rgba(${r},${g},${b},${a})`; }

window.CommandChainAnim = CommandChainAnim;
