// galaxy.jsx — Memory Galaxy: animated canvas starfield over the Obsidian vault
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG, useCallback: useCallbackG } = React;

function MemoryGalaxy({ motionScale = 1 }) {
  const canvasRef = useRefG(null);
  const wrapRef = useRefG(null);
  const stateRef = useRefG({
    cam: { x: 0, y: 0, zoom: 1, rot: 0 },
    target: { x: 0, y: 0, zoom: 1, rot: 0 },
    drag: null, t: 0, hover: null, raf: 0, bgStars: [], dust: [],
    nodes: [], W: 0, H: 0, dpr: 1,
  });
  const [openNote, setOpenNote] = useStateG(null);
  const [tip, setTip] = useStateG(null);
  const [activeCluster, setActiveCluster] = useStateG(null);
  const activeClusterRef = useRefG(null);
  useEffectG(() => { activeClusterRef.current = activeCluster; }, [activeCluster]);

  const clusters = window.MC.galaxyClusters;
  const notes = window.MC.galaxyNotes;
  const clusterCount = clusters.map(c => ({ ...c, n: notes.filter(x => x.cluster === c.id).length }));

  // ---- build node layout once ----
  const buildNodes = useCallbackG((W, H) => {
    const S = stateRef.current;
    const base = Math.min(W, H);
    const spread = base * 0.34;
    // place clusters around center using their cx/cy as direction
    const nodes = [];
    const byCluster = {};
    clusters.forEach(c => { byCluster[c.id] = []; });
    notes.forEach(nt => byCluster[nt.cluster].push(nt));
    clusters.forEach((c) => {
      const cxW = (c.cx - 0.5) * W * 0.62;
      const cyW = (c.cy - 0.5) * H * 0.62;
      const arr = byCluster[c.id];
      arr.forEach((nt, i) => {
        // spiral within cluster
        const ang = i * 2.399963 + c.cx * 6.28;
        const rad = (0.18 + Math.sqrt(i) * 0.34) * spread * (0.5 + (1 - nt.recency) * 0.6);
        nodes.push({
          id: nt.id, note: nt, cluster: c.id, color: c.color,
          bx: cxW + Math.cos(ang) * rad,
          by: cyW + Math.sin(ang) * rad,
          r: 2.4 + nt.recency * 5.2,
          recency: nt.recency,
          tw: Math.random() * 6.28,
          orbit: rad * 0.012,
          orbAng: ang,
          ox: cxW, oy: cyW,
        });
      });
    });
    S.nodes = nodes;
    // background star field (parallax depths)
    const bg = [];
    for (let i = 0; i < 520; i++) {
      bg.push({ x: (Math.random() - 0.5) * W * 2.4, y: (Math.random() - 0.5) * H * 2.4, z: 0.2 + Math.random() * 0.8, r: Math.random() * 1.3 + 0.2, tw: Math.random() * 6.28, c: Math.random() > 0.85 ? '#9fdcff' : Math.random() > 0.7 ? '#f3e0b0' : '#ffffff' });
    }
    S.bgStars = bg;
    // dust motes
    const dust = [];
    for (let i = 0; i < 70; i++) dust.push({ x: (Math.random() - 0.5) * W * 1.6, y: (Math.random() - 0.5) * H * 1.6, z: 0.3 + Math.random() * 0.6, r: Math.random() * 1.6 + 0.4, vx: (Math.random() - 0.5) * 0.04, vy: (Math.random() - 0.5) * 0.04 });
    S.dust = dust;
  }, []);

  // ---- resize ----
  useEffectG(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = wrap.clientWidth, H = wrap.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const S = stateRef.current; S.W = W; S.H = H; S.dpr = dpr;
      buildNodes(W, H);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [buildNodes]);

  // ---- render loop ----
  useEffectG(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const S = stateRef.current;
    let mounted = true;

    const project = (x, y, z, cam, cx, cy) => {
      // rotate around center
      const cos = Math.cos(cam.rot), sin = Math.sin(cam.rot);
      let rx = x * cos - y * sin;
      let ry = x * sin + y * cos;
      const par = z;
      return { sx: cx + (rx - cam.x * par) * cam.zoom, sy: cy + (ry - cam.y * par) * cam.zoom };
    };

    const frame = () => {
      if (!mounted) return;
      S.t += 0.016 * motionScale;
      // ease camera
      S.cam.x += (S.target.x - S.cam.x) * 0.08;
      S.cam.y += (S.target.y - S.cam.y) * 0.08;
      S.cam.zoom += (S.target.zoom - S.cam.zoom) * 0.1;
      S.cam.rot += (S.target.rot - S.cam.rot) * 0.06;
      // slow ambient drift
      if (!S.drag) S.target.rot += 0.00012 * motionScale;

      const { W, H, dpr } = S;
      const cx = W / 2, cy = H / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // base space gradient
      const g = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy, Math.max(W, H) * 0.9);
      g.addColorStop(0, '#0c1a30'); g.addColorStop(0.5, '#081120'); g.addColorStop(1, '#04070f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // nebula clouds per cluster
      ctx.globalCompositeOperation = 'screen';
      clusters.forEach(c => {
        const p = project((c.cx - 0.5) * W * 0.62, (c.cy - 0.5) * H * 0.62, 1, S.cam, cx, cy);
        const dim = activeClusterRef.current && activeClusterRef.current !== c.id;
        const pulse = 0.5 + 0.5 * Math.sin(S.t * 0.4 + c.cx * 4);
        const rad = (160 + pulse * 30) * S.cam.zoom;
        const ng = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rad);
        const a = (dim ? 0.05 : 0.16);
        ng.addColorStop(0, hexA(c.color, a));
        ng.addColorStop(0.5, hexA(c.color, a * 0.4));
        ng.addColorStop(1, hexA(c.color, 0));
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, rad, 0, 6.2832); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';

      // background stars (twinkle + parallax)
      S.bgStars.forEach(st => {
        const p = project(st.x, st.y, st.z * 0.5, S.cam, cx, cy);
        if (p.sx < -20 || p.sx > W + 20 || p.sy < -20 || p.sy > H + 20) return;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(S.t * 1.5 + st.tw));
        ctx.globalAlpha = tw * st.z;
        ctx.fillStyle = st.c;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, st.r * (0.6 + st.z * 0.6), 0, 6.2832); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // constellation links
      const nodeMap = {};
      S.nodes.forEach(n => { nodeMap[n.id] = n; });
      ctx.lineWidth = 1;
      S.nodes.forEach(n => {
        const wob = Math.sin(S.t * 0.5 + n.orbAng) * n.orbit * 30;
        const nx = n.bx + Math.cos(n.orbAng + S.t * 0.05) * (n.orbit * 8) + wob * 0;
        const ny = n.by + Math.sin(n.orbAng + S.t * 0.05) * (n.orbit * 8);
        n._wx = nx; n._wy = ny;
      });
      S.nodes.forEach(n => {
        const p1 = project(n._wx, n._wy, 1, S.cam, cx, cy);
        n.note.links.forEach(lid => {
          const m = nodeMap[lid]; if (!m) return;
          const p2 = project(m._wx, m._wy, 1, S.cam, cx, cy);
          const dim = activeClusterRef.current && activeClusterRef.current !== n.cluster && activeClusterRef.current !== m.cluster;
          const seen = S.hover && (S.hover.id === n.id || S.hover.id === lid);
          const baseA = dim ? 0.04 : 0.14;
          ctx.strokeStyle = seen ? hexA(n.color, 0.55) : hexA(n.color, baseA);
          ctx.lineWidth = seen ? 1.6 : 0.8;
          ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
        });
      });

      // nodes (stars) — brightest = most recent
      let newHover = null;
      S.nodes.forEach(n => {
        const p = project(n._wx, n._wy, 1, S.cam, cx, cy);
        const dim = activeClusterRef.current && activeClusterRef.current !== n.cluster;
        const tw = 0.7 + 0.3 * Math.sin(S.t * 2 + n.tw);
        const baseR = n.r * S.cam.zoom * (0.85 + 0.15 * tw);
        const glowR = baseR * (3 + n.recency * 5);
        const isHover = S.hover && S.hover.id === n.id;
        // glow halo
        const ga = (dim ? 0.12 : (0.3 + n.recency * 0.55)) * (isHover ? 1.5 : 1);
        const hg = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, glowR);
        hg.addColorStop(0, hexA(n.color, ga));
        hg.addColorStop(0.4, hexA(n.color, ga * 0.4));
        hg.addColorStop(1, hexA(n.color, 0));
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, glowR, 0, 6.2832); ctx.fill();
        // core
        ctx.globalAlpha = dim ? 0.4 : 1;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(p.sx, p.sy, baseR * (isHover ? 1.4 : 1), 0, 6.2832); ctx.fill();
        ctx.fillStyle = hexA(n.color, 0.85);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, baseR * (isHover ? 1.9 : 1.5), 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1;
        // ring on recent/hover
        if (n.recency > 0.8 || isHover) {
          ctx.strokeStyle = hexA(n.color, isHover ? 0.8 : 0.4);
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, baseR * 2.6 + (isHover ? 3 : 0), 0, 6.2832); ctx.stroke();
        }
        n._sx = p.sx; n._sy = p.sy; n._hitR = Math.max(baseR * 2.6, 12);
        if (S.mouse) {
          const dx = S.mouse.x - p.sx, dy = S.mouse.y - p.sy;
          if (dx * dx + dy * dy < n._hitR * n._hitR) {
            if (!newHover || (dx*dx+dy*dy) < newHover._d) newHover = Object.assign(n, { _d: dx*dx+dy*dy });
          }
        }
      });
      S.hover = newHover;

      S.raf = requestAnimationFrame(frame);
    };
    // Paint one frame synchronously so the galaxy is never blank even when
    // requestAnimationFrame is paused (hidden tab / screenshot / capture).
    frame();
    return () => { mounted = false; cancelAnimationFrame(S.raf); };
  }, [motionScale]);

  // ---- tooltip sync (throttled; only set state when content changed —
  // identical objects every 80ms caused constant re-renders while hovering) ----
  useEffectG(() => {
    let id, prevKey = '';
    const tick = () => {
      const S = stateRef.current;
      if (S.hover && S.mouse) {
        const key = Math.round(S.hover._sx) + ':' + Math.round(S.hover._sy) + ':' + S.hover.note.title;
        if (key !== prevKey) { prevKey = key; setTip({ x: S.hover._sx, y: S.hover._sy, title: S.hover.note.title, tag: '#' + S.hover.cluster }); }
      } else if (prevKey !== '') { prevKey = ''; setTip(null); }
      id = setTimeout(tick, 80);
    };
    tick();
    return () => clearTimeout(id);
  }, []);

  // ---- interaction ----
  const onDown = (e) => {
    const S = stateRef.current;
    S.drag = { x: e.clientX, y: e.clientY, camx: S.target.x, camy: S.target.y };
    canvasRef.current.classList.add('grabbing');
  };
  const onMove = (e) => {
    const S = stateRef.current;
    const r = canvasRef.current.getBoundingClientRect();
    S.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (S.drag) {
      const dx = (e.clientX - S.drag.x) / S.cam.zoom, dy = (e.clientY - S.drag.y) / S.cam.zoom;
      S.target.x = S.drag.camx - dx; S.target.y = S.drag.camy - dy;
    }
  };
  const onUp = () => { const S = stateRef.current; S.drag = null; canvasRef.current.classList.remove('grabbing'); };
  const onLeave = () => { const S = stateRef.current; S.mouse = null; S.drag = null; canvasRef.current.classList.remove('grabbing'); };
  const onClick = (e) => {
    const S = stateRef.current;
    if (S.hover) {
      setOpenNote(S.hover.note);
      // ease toward it
      S.target.x = S.hover._wx_logical ?? S.target.x;
    }
  };
  const onWheel = (e) => {
    e.preventDefault();
    const S = stateRef.current;
    const f = e.deltaY < 0 ? 1.12 : 0.89;
    S.target.zoom = Math.max(0.45, Math.min(3.2, S.target.zoom * f));
  };
  const zoomBtn = (f) => { const S = stateRef.current; S.target.zoom = Math.max(0.45, Math.min(3.2, S.target.zoom * f)); };
  const reset = () => { const S = stateRef.current; S.target = { x: 0, y: 0, zoom: 1, rot: 0 }; };

  useEffectG(() => {
    const cv = canvasRef.current;
    cv.addEventListener('wheel', onWheel, { passive: false });
    return () => cv.removeEventListener('wheel', onWheel);
  }, []);

  const linkedNotes = openNote ? openNote.links.map(id => notes.find(n => n.id === id)).filter(Boolean) : [];
  const clusterOf = (id) => clusters.find(c => c.id === id);

  return React.createElement('div', { className: 'mc-galaxy', ref: wrapRef },
    React.createElement('canvas', {
      ref: canvasRef, className: 'mc-galaxy__canvas',
      onMouseDown: onDown, onMouseMove: onMove, onMouseUp: onUp, onMouseLeave: onLeave, onClick,
    }),
    // HUD
    React.createElement('div', { className: 'mc-galaxy__hud' },
      React.createElement('div', { className: 'mc-galaxy__title' }, React.createElement(Icon, { name: 'orbit', size: 20, style: { color: 'var(--la-cyan)' } }), React.createElement('span', { className: 'text-cyan' }, 'MEMORY GALAXY')),
      React.createElement('div', { className: 'mc-galaxy__sub' }, 'Every star is a note in your Obsidian vault. Lines are links, clusters are focus areas — and the ', React.createElement('b', { style: { color: '#fff' } }, 'brightest stars are your most recent thoughts.')),
      React.createElement('div', { className: 'mc-galaxy__legend' },
        ...clusterCount.map(c => React.createElement('div', { key: c.id, className: 'mc-galaxy__leg' + (activeCluster && activeCluster !== c.id ? ' dim' : ''), onClick: () => setActiveCluster(activeCluster === c.id ? null : c.id) },
          React.createElement('span', { className: 'sw', style: { background: c.color, boxShadow: `0 0 8px ${c.color}` } }),
          c.name,
          React.createElement('span', { className: 'ct' }, c.n + ' notes'))))),
    // hints
    React.createElement('div', { className: 'mc-galaxy__hint' },
      React.createElement('span', null, React.createElement('kbd', null, 'Drag'), ' orbit'),
      React.createElement('span', null, React.createElement('kbd', null, 'Scroll'), ' zoom'),
      React.createElement('span', null, React.createElement('kbd', null, 'Click'), ' open note')),
    // zoom controls
    React.createElement('div', { className: 'mc-galaxy__zoom' },
      React.createElement('button', { className: 'mc-galaxy__zb', onClick: () => zoomBtn(1.2), 'aria-label': 'Zoom in' }, React.createElement(Icon, { name: 'plus', size: 16 })),
      React.createElement('button', { className: 'mc-galaxy__zb', onClick: () => zoomBtn(0.83), 'aria-label': 'Zoom out' }, React.createElement(Icon, { name: 'minus', size: 16 })),
      React.createElement('button', { className: 'mc-galaxy__zb', onClick: reset, 'aria-label': 'Reset view' }, React.createElement(Icon, { name: 'maximize', size: 15 }))),
    // tooltip
    tip && React.createElement('div', { className: 'mc-galaxy__tip', style: { left: tip.x, top: tip.y } }, tip.title, React.createElement('span', { className: 'tg' }, tip.tag)),
    // note panel
    React.createElement('div', { className: 'mc-note' + (openNote ? ' open' : '') },
      openNote && React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'mc-note__head' },
          React.createElement('button', { className: 'mc-note__x', onClick: () => setOpenNote(null), 'aria-label': 'Close' }, React.createElement(Icon, { name: 'x', size: 16 })),
          (() => { const c = clusterOf(openNote.cluster); return React.createElement('span', { className: 'mc-note__cluster', style: { background: hexA(c.color, 0.14), color: c.color, border: `1px solid ${hexA(c.color, 0.4)}` } }, React.createElement('span', { style: { width: 7, height: 7, borderRadius: '50%', background: c.color } }), c.name); })(),
          React.createElement('div', { className: 'mc-note__title' }, openNote.title),
          React.createElement('div', { className: 'mc-note__meta' },
            React.createElement('span', null, React.createElement('span', { style: { color: '#23D6F5' } }, '◆ '), 'glow ' + Math.round(openNote.recency * 100) + '%'),
            React.createElement('span', null, openNote.links.length + ' links'),
            React.createElement('span', null, '.md'))),
        React.createElement('div', { className: 'mc-note__body' },
          React.createElement('div', { className: 'mc-note__excerpt' }, openNote.excerpt),
          React.createElement('div', { className: 'mc-note__seclabel' }, 'Linked Notes'),
          React.createElement('div', { className: 'mc-note__links' },
            linkedNotes.length ? linkedNotes.map(ln => React.createElement('button', { key: ln.id, className: 'mc-note__link', onClick: () => setOpenNote(ln) },
              React.createElement('span', { className: 'ico' }, React.createElement(Icon, { name: 'link', size: 12 })),
              React.createElement('span', { className: 'nm' }, ln.title),
              React.createElement(Icon, { name: 'chevron-right', size: 14, style: { color: 'var(--fg-3)', marginLeft: 'auto' } }))) : React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)' } }, 'No outbound links.'))),
        React.createElement('div', { className: 'mc-note__foot' },
          // live vault notes carry a real path → deep-link straight into the
          // Obsidian app; sample notes (no path) say so honestly
          openNote.path
            ? React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'eye', onClick: () => { location.href = 'obsidian://open?path=' + encodeURIComponent(openNote.path); } }, 'Open in Obsidian')
            : React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'eye', title: 'Sample node — connect the backend to link real notes', onClick: () => { location.hash = 'obsidian'; } }, 'Open in Obsidian'),
          openNote.path && React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'pen-line', onClick: () => { location.href = 'obsidian://open?path=' + encodeURIComponent(openNote.path); } }, 'Edit')))),
  );
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

window.MemoryGalaxy = MemoryGalaxy;
