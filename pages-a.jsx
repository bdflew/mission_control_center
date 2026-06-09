// pages-a.jsx — Obsidian · Hermes Kanban · Paperclip
const { useState: useSa, useEffect: useEa, useRef: useRa } = React;

function agentById(id) {
  return window.MC.agents.find(a => a.id === id) || window.MC.personas.find(p => p.id === id) ||
    { name: id.charAt(0).toUpperCase() + id.slice(1), avatarGrad: 'linear-gradient(145deg,#334155,#64748B)', accent: '#64748B' };
}

// ===================== OBSIDIAN =====================
function ObsidianMiniGalaxy({ onNav }) {
  const ref = useRa(null);
  useEa(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const draw = () => {
      const w = cv.clientWidth, h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createRadialGradient(w * 0.45, h * 0.4, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
      g.addColorStop(0, '#0c1a30'); g.addColorStop(0.6, '#081120'); g.addColorStop(1, '#05080f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const clusters = window.MC.galaxyClusters;
      ctx.globalCompositeOperation = 'screen';
      clusters.forEach(c => {
        const x = c.cx * w, y = c.cy * h;
        const ng = ctx.createRadialGradient(x, y, 0, x, y, 90);
        ng.addColorStop(0, c.color + '33'); ng.addColorStop(1, c.color + '00');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(x, y, 90, 0, 6.2832); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      // bg stars
      for (let i = 0; i < 160; i++) { ctx.globalAlpha = Math.random() * 0.7 + 0.1; ctx.fillStyle = '#cfeaff'; ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.1 + 0.2, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = 1;
      // note stars
      window.MC.galaxyNotes.forEach(n => {
        const c = clusters.find(x => x.id === n.cluster);
        const x = c.cx * w + (Math.cos(n.id.length * 2) * 34); const y = c.cy * h + (Math.sin(n.id.length * 3) * 30);
        const r = 1.5 + n.recency * 3.5;
        const hg = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        hg.addColorStop(0, c.color + 'cc'); hg.addColorStop(1, c.color + '00');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r * 5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      });
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);
  return React.createElement('div', { className: 'mc-obs__galaxy', onClick: () => onNav('galaxy'), role: 'button', tabIndex: 0, onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onNav('galaxy') },
    React.createElement('canvas', { ref }),
    React.createElement('div', { className: 'mc-obs__galaxy-cta' },
      React.createElement('h3', null, 'Enter the Memory Galaxy'),
      React.createElement('p', null, 'Fly through your vault — every note a star, every link a constellation, your most recent thoughts burning brightest.'),
      React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'orbit' }, 'Open Full Galaxy')));
}

function ObsidianPage({ onNav }) {
  const O = window.MC.obsidian;
  const tagTone = { synthesis: 'cyan', qa: 'crimson', brand: 'gold', build: 'emerald', ops: 'cyan' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-integ__bar', style: { marginBottom: 16 } },
      React.createElement('div', { className: 'mc-integ__id' },
        React.createElement('div', { className: 'mc-integ__logo', style: { background: 'linear-gradient(145deg,#6B4FBB,#9F7AEA)' } }, React.createElement(Icon, { name: 'box', size: 22, style: { color: '#fff' } })),
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-integ__name' }, 'Obsidian Vault'),
          React.createElement('div', { className: 'mc-integ__acct' }, O.vault + ' · Layer 2 Memory'))),
      React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), O.status)),
    React.createElement('div', { className: 'mc-obs__stats' },
      React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, O.stats.notes.toLocaleString()), React.createElement('div', { className: 'l' }, 'Notes')),
      React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, O.stats.links.toLocaleString()), React.createElement('div', { className: 'l' }, 'Links')),
      React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, O.stats.clusters), React.createElement('div', { className: 'l' }, 'Clusters')),
      React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, '+' + O.stats.written7d), React.createElement('div', { className: 'l' }, 'Written · 7d'))),
    React.createElement('div', { className: 'mc-obs' },
      React.createElement(ObsidianMiniGalaxy, { onNav }),
      React.createElement('div', { className: 'mc-panel', style: { padding: 16 } },
        React.createElement('div', { className: 'mc-phead' },
          React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'zap', size: 15 })), 'Recently Written'),
          React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, 'by your agents')),
        React.createElement('div', { className: 'mc-obs__recent' },
          ...O.recent.map(n => React.createElement('button', { key: n.id, className: 'mc-obsnote', onClick: () => onNav('galaxy') },
            React.createElement('span', { className: 'mc-obsnote__star', style: { background: `rgba(35,214,245,${0.3 + n.glow * 0.7})`, boxShadow: `0 0 ${4 + n.glow * 9}px rgba(35,214,245,${n.glow})` } }),
            React.createElement('div', { className: 'mc-obsnote__b' },
              React.createElement('div', { className: 'mc-obsnote__t' }, n.title),
              React.createElement('div', { className: 'mc-obsnote__m' }, '#' + n.tag + ' · ' + n.by)),
            React.createElement('span', { className: 'mc-obsnote__m' }, n.ago))))),
    ),
    React.createElement('div', { className: 'mc-page-head', style: { margin: '22px 0 12px' } },
      React.createElement('h2', { style: { fontSize: 18 } }, 'The Five Layers'),
      React.createElement('p', null, 'How a folder of forgotten notes becomes a living universe your agents navigate and feed from.')),
    React.createElement('div', { className: 'mc-obs__layers' },
      ...O.layers.map(l => React.createElement('div', { key: l.n, className: 'mc-obslayer' },
        React.createElement('div', { className: 'mc-obslayer__n' }, l.n),
        React.createElement('div', { className: 'mc-obslayer__ico' }, React.createElement(Icon, { name: l.glyph, size: 15 })),
        React.createElement('div', { className: 'mc-obslayer__name' }, l.name),
        React.createElement('div', { className: 'mc-obslayer__txt' }, l.text)))),
  );
}

// ===================== HERMES KANBAN (self-driving board) =====================
const KPREVIEW = {
  cost: { grad: 'radial-gradient(120% 120% at 30% 0%, rgba(35,214,245,0.25), rgba(20,25,34,0.9))', glyph: 'wallet', color: '#23D6F5' },
  thumb: { grad: 'radial-gradient(120% 120% at 30% 0%, rgba(216,167,74,0.25), rgba(20,25,34,0.9))', glyph: 'image', color: '#E8C766' },
  form: { grad: 'radial-gradient(120% 120% at 30% 0%, rgba(52,211,153,0.25), rgba(20,25,34,0.9))', glyph: 'file-text', color: '#34D399' },
};
function KanbanPage({ onAction }) {
  const [cards, setCards] = useSa(window.MC.kanban.cards);
  const [idea, setIdea] = useSa('');
  const cols = window.MC.kanban.columns;
  const move = (id, to) => setCards(cs => cs.map(c => c.id === id ? { ...c, col: to, progress: to === 'building' ? 8 : to === 'shipped' ? 100 : c.progress } : c));
  const capture = () => {
    if (!idea.trim()) return;
    const id = 'k' + Date.now();
    setCards(cs => [{ id, col: 'classify', title: idea.trim(), kind: 'idea', plan: ['Sage is classifying…', 'Shaping a plan', 'Assigning agents'], agents: ['sage'], progress: 0, classify: 'Classifying…' }, ...cs]);
    setIdea('');
    onAction && onAction('toast', 'Idea captured — Sage is shaping a plan.');
    // simulate classification completing
    setTimeout(() => setCards(cs => cs.map(c => c.id === id ? { ...c, plan: ['Research the idea', 'Design it', 'Build on a modern stack', 'Self-check + ship'], agents: ['mercury', 'faye'], classify: 'Shaped · ready to approve' } : c)), 1600);
  };
  const tone = { capture: 'cyan', classify: 'cyan', approval: 'gold', building: 'emerald', shipped: 'emerald' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-page-head' },
      React.createElement('h2', null, 'Hermes Kanban'),
      React.createElement('p', null, 'The self-driving board. Drop one idea — a team of agents classifies it, you approve it once, and a project manager plus sub-agents build and ship it. It all logs back to your vault.')),
    React.createElement('div', { className: 'mc-kflow' },
      'Capture', React.createElement('span', { className: 'arr' }, '→'), 'Classify', React.createElement('span', { className: 'arr' }, '→'),
      'Approve', React.createElement('span', { className: 'arr' }, '→'), 'Build', React.createElement('span', { className: 'arr' }, '→'), 'Ship & File'),
    React.createElement('div', { className: 'mc-kanban' },
      ...cols.map(col => {
        const colCards = cards.filter(c => c.col === col.id);
        return React.createElement('div', { key: col.id, className: 'mc-kcol' },
          React.createElement('div', { className: 'mc-kcol__head' },
            React.createElement('div', { className: 'mc-kcol__ico tone-' + tone[col.id] }, React.createElement(Icon, { name: col.glyph, size: 14 })),
            React.createElement('div', { className: 'mc-kcol__t' }, col.name),
            React.createElement('span', { className: 'mc-kcol__cnt' }, colCards.length)),
          React.createElement('div', { className: 'mc-kcol__desc' }, col.desc),
          col.id === 'capture' && React.createElement('div', { className: 'mc-kcapture' },
            React.createElement('textarea', { value: idea, onChange: e => setIdea(e.target.value), placeholder: 'Drop one idea… e.g. "Create a beautiful SEO blog for OpenClaw"', onKeyDown: e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) capture(); } }),
            React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'zap', onClick: capture }, 'Let agents shape it')),
          ...colCards.map(c => React.createElement(KCard, { key: c.id, c, onMove: move, preview: KPREVIEW[c.preview] })));
      })),
  );
}
function KCard({ c, onMove, preview }) {
  return React.createElement('div', { className: 'mc-kcard' },
    preview && React.createElement('div', { className: 'mc-kpreview', style: { background: preview.grad } },
      React.createElement('span', { className: 'pv-ico', style: { color: preview.color } }, React.createElement(Icon, { name: preview.glyph, size: 22 }))),
    React.createElement('div', { className: 'mc-kcard__kind' }, c.classify || c.kind),
    React.createElement('div', { className: 'mc-kcard__t' }, c.title),
    c.col !== 'shipped' && React.createElement('div', { className: 'mc-kcard__plan' },
      ...c.plan.slice(0, 4).map((s, i) => React.createElement('div', { key: i, className: 'mc-kcard__step' }, React.createElement(Icon, { name: c.col === 'building' && i === 0 ? 'circle-dot' : 'corner-down-right', size: 10 }), s))),
    c.col === 'building' && React.createElement('div', { className: 'mc-kcard__meter' }, React.createElement('div', { className: 'mc-kcard__fill', style: { width: c.progress + '%' } })),
    React.createElement('div', { className: 'mc-kcard__foot' },
      React.createElement('div', { className: 'mc-kcard__avs' },
        ...c.agents.map(a => { const ag = agentById(a); return React.createElement('div', { key: a, className: 'a', style: { background: ag.avatarGrad }, title: ag.name }, ag.name[0]); })),
      c.col === 'classify' && React.createElement(Btn, { variant: 'gold', size: 'sm', onClick: () => onMove(c.id, 'approval') }, 'Review'),
      c.col === 'approval' && React.createElement('div', { style: { display: 'flex', gap: 5 } },
        React.createElement(Btn, { variant: 'gold', size: 'sm', icon: 'check', onClick: () => onMove(c.id, 'building') }, 'Approve'),
        React.createElement(Btn, { variant: 'quiet', size: 'sm', onClick: () => onMove(c.id, 'capture') }, 'Reject')),
      c.col === 'building' && React.createElement('span', { className: 'mono', style: { fontSize: 10, color: '#34D399' } }, c.progress + '%'),
      c.col === 'shipped' && React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'eye' }, 'Preview')),
  );
}

// ===================== PAPERCLIP =====================
function CommandChain() {
  const [pulse, setPulse] = useSa(0);
  useEa(() => { const id = setInterval(() => setPulse(p => (p + 1) % 4), 950); return () => clearInterval(id); }, []);
  const sage = agentById('sage');
  const leads = [{ ag: agentById('faye'), team: 'Goldie Labs' }, { ag: agentById('mercury'), team: 'Goldie Agency' }];
  const subs = { faye: ['kratos', 'athena'], mercury: ['chloe', 'vulcan'] };
  const rung = (av, name, role, level, key) => React.createElement('div', { key, className: 'mc-chain__rung' + (pulse === level ? ' pulse' : '') },
    React.createElement('div', { className: 'mc-chain__av', style: { background: av } }, name[0]),
    React.createElement('div', { className: 'mc-chain__nm' }, name),
    React.createElement('div', { className: 'mc-chain__rl' }, role));
  return React.createElement('div', { className: 'mc-chain' },
    React.createElement('div', { className: 'mc-chain__lvl' }, rung('linear-gradient(145deg,#A87B2E,#F3D27A)', 'Lew', 'Operator', 0, 'op')),
    React.createElement('div', { className: 'mc-chain__drop' }),
    React.createElement('div', { className: 'mc-chain__lvl' }, rung(sage.avatarGrad, 'Sage', 'Orchestrator', 1, 'sage')),
    React.createElement('div', { className: 'mc-chain__drop' }),
    React.createElement('div', { className: 'mc-chain__branch' },
      ...leads.map((l, i) => React.createElement('div', { key: l.ag.id, style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
        rung(l.ag.avatarGrad, l.ag.name, l.team + ' Lead', 2, 'lead' + i),
        React.createElement('div', { className: 'mc-chain__drop' }),
        React.createElement('div', { className: 'mc-chain__sub' },
          ...subs[l.ag.id].map(s => { const ag = agentById(s); return React.createElement('div', { key: s, className: 'mc-chain__minir' + (pulse === 3 ? ' pulse' : '') },
            React.createElement('div', { className: 'mc-chain__miniav', style: { background: ag.avatarGrad } }, ag.name[0]),
            React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600 } }, ag.name)); }))))),
    React.createElement('div', { className: 'mc-chain__order' },
      React.createElement(Icon, { name: 'command', size: 14, style: { color: 'var(--la-gold)' } }),
      'Orders flow down the chain — ', React.createElement('b', null, 'Lew → Sage → team leads → sub-agents'), ' — and results report back up.'),
  );
}

function SubagentBuilder() {
  const hosts = window.MC.subagentHosts;
  const [subs, setSubs] = useSa(window.MC.subagents);
  const [host, setHost] = useSa('claude');
  const [name, setName] = useSa(''); const [job, setJob] = useSa('');
  const h = hosts.find(x => x.id === host);
  const [model, setModel] = useSa(h.models[0]);
  const create = () => { if (!name.trim()) return; setSubs(p => [{ id: 'sa' + Date.now(), name: name.trim(), host, model, job: job.trim() || 'Custom subagent', parent: 'sage' }, ...p]); setName(''); setJob(''); };
  return React.createElement('div', { className: 'mc-panel' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 15 })), 'Subagent Personas'),
        React.createElement('div', { className: 'mc-psub' }, 'Spin up specialist subagents on Claude, Antigravity, or Hermes')),
      React.createElement('span', { className: 'mc-chip cyan' }, React.createElement('span', { className: 'dot' }), subs.length + ' ACTIVE')),
    React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'Host'),
    React.createElement('div', { className: 'mc-sa__hosts' },
      ...hosts.map(hh => React.createElement('button', { key: hh.id, className: 'mc-sa__host' + (host === hh.id ? ' is-sel' : ''), onClick: () => { setHost(hh.id); setModel(hh.models[0]); } },
        React.createElement('div', { className: 'mc-sa__hico', style: { background: window.hexA(hh.accent, 0.14), color: hh.accent, border: '1px solid ' + window.hexA(hh.accent, 0.3) } }, React.createElement(Icon, { name: hh.glyph, size: 16 })),
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 } }, hh.name),
          React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' } }, hh.models.length + ' models'))))),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 } },
      React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'circle-dot', size: 14 })), React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: 'Name (e.g. Scribe)', 'aria-label': 'Subagent name' })),
      React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'target', size: 14 })), React.createElement('input', { value: job, onChange: e => setJob(e.target.value), placeholder: 'Job (e.g. Drafting)', 'aria-label': 'Subagent job' }))),
    React.createElement('div', { className: 'mc-conn__methods wrap', style: { marginBottom: 12 } }, ...h.models.map(m => React.createElement('button', { key: m, className: 'mc-method' + (model === m ? ' is-active' : ''), onClick: () => setModel(m) }, m))),
    React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', onClick: create }, 'Create subagent'),
    React.createElement('div', { className: 'mc-field-label' }, 'Active subagents'),
    React.createElement('div', { className: 'mc-sa__existing' },
      ...subs.map(s => { const hh = hosts.find(x => x.id === s.host) || hosts[0]; const parent = agentById(s.parent);
        return React.createElement('div', { key: s.id, className: 'mc-sa__row' },
          React.createElement('div', { className: 'mc-sa__hico', style: { background: window.hexA(hh.accent, 0.14), color: hh.accent, border: '1px solid ' + window.hexA(hh.accent, 0.3), width: 28, height: 28 } }, React.createElement(Icon, { name: hh.glyph, size: 14 })),
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 } }, s.name, React.createElement('span', { style: { color: 'var(--fg-3)', fontWeight: 400 } }, ' · ' + s.job)),
            React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' } }, hh.name + ' · ' + s.model + ' · reports to ' + parent.name)),
          React.createElement('span', { className: 'mc-chip slate', style: { fontSize: 9 } }, hh.name)); })),
  );
}

function PaperclipPage({ onNav }) {
  const PC = window.MC.paperclip;
  const statusColor = { working: '#2BD8A0', idle: '#64748B' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-section__head' },
      React.createElement('div', { className: 'mc-page-head', style: { marginBottom: 0 } },
        React.createElement('h2', null, 'Paperclip — AI Employees'),
        React.createElement('p', null, 'Your agents organized into teams that work together. Orders flow down the command chain; a project manager delegates to sub-agents, and they can bring in more agents to get it done.')),
      React.createElement('a', { className: 'mc-btn mc-btn--cyan mc-btn--sm mc-openapp', href: 'https://paperclip.app', target: '_blank', rel: 'noopener noreferrer', title: 'Open the real Paperclip app' },
        React.createElement(Icon, { name: 'log-in', size: 13 }), 'Open Paperclip')),
    React.createElement('div', { className: 'mc-section' },
      React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'workflow', size: 15 })), 'Command Chain'),
      React.createElement(window.CommandChainAnim),
      React.createElement('div', { className: 'mc-chain__order', style: { marginTop: 12 } },
        React.createElement(Icon, { name: 'command', size: 14, style: { color: 'var(--la-gold)' } }),
        'Orders flow down the chain — ', React.createElement('b', null, 'Lew → Sage → team leads → sub-agents'), ' — and results report back up.')),
    React.createElement('div', { className: 'mc-section' },
      React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'users-round', size: 15 })), 'Teams'),
      React.createElement('div', { className: 'mc-pc__teams', style: { marginBottom: 0 } },
        ...PC.teams.map(team => {
          const lead = agentById(team.lead);
          const members = team.id === 'labs' ? ['kratos', 'faye', 'athena'] : ['mercury', 'chloe', 'vulcan'];
          return React.createElement('div', { key: team.id, className: 'mc-pcteam t-' + team.tone },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
              React.createElement('div', null,
                React.createElement('div', { className: 'mc-pcteam__name' }, team.name),
                React.createElement('div', { className: 'mc-pcteam__focus' }, team.focus)),
              React.createElement('span', { className: 'mc-chip ' + team.tone }, React.createElement('span', { className: 'dot' }), (members.length + 1) + ' agents')),
            React.createElement('div', { className: 'mc-pcorg' },
              React.createElement('div', { className: 'mc-pcorg__lead' },
                React.createElement('div', { style: { width: 28, height: 28, borderRadius: 8, background: lead.avatarGrad, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#06121A' } }, lead.name[0]),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 600 } }, lead.name + ' · Lead'),
                  React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' } }, 'project manager'))),
              React.createElement('div', { className: 'mc-pcorg__connector' }),
              React.createElement('div', { className: 'mc-pcorg__row' },
                ...members.map(m => { const ag = agentById(m); return React.createElement('div', { key: m, className: 'mc-pcnode', onClick: () => window.MC.agents.find(a => a.id === m) && onNav('agent:' + m) },
                  React.createElement('div', { style: { width: 30, height: 30, borderRadius: 9, background: ag.avatarGrad, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#06121A' } }, ag.name[0]),
                  React.createElement('div', { className: 'mc-pcnode__role' }, ag.name),
                  React.createElement('div', { className: 'mc-pcnode__model' }, (ag.model || 'claude').split('-')[0])); }))),
            React.createElement('div', { style: { marginTop: 14, display: 'flex', gap: 8 } },
              React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'plus' }, 'Add agent'),
              React.createElement(Btn, { variant: 'quiet', size: 'sm', icon: 'target' }, 'New goal')));
        }))),
    React.createElement('div', { className: 'mc-section' },
      React.createElement('div', { className: 'mc-panel' },
        React.createElement('div', { className: 'mc-phead' },
          React.createElement('div', null,
            React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'search', size: 15 })), 'SEO Ranking Swarm'),
            React.createElement('div', { className: 'mc-psub' }, '7 agents · keyword → content → links → rank')),
          React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), '4 working')),
        React.createElement('div', { className: 'mc-swarm' },
          ...PC.seoSwarm.map(s => React.createElement('div', { key: s.id, className: 'mc-swarmnode' },
            React.createElement('span', { className: 'mc-swarmnode__dot', style: { background: statusColor[s.status], boxShadow: '0 0 6px ' + statusColor[s.status] } }),
            React.createElement('div', { className: 'mc-swarmnode__ico' }, React.createElement(Icon, { name: s.glyph, size: 17 })),
            React.createElement('div', { className: 'mc-swarmnode__role' }, s.role),
            React.createElement('div', { className: 'mc-swarmnode__task' }, s.task)))))),
    React.createElement('div', { className: 'mc-section' }, React.createElement(SubagentBuilder)),
    React.createElement('div', { className: 'mc-section' },
      React.createElement('div', { className: 'mc-panel' },
        React.createElement('div', { className: 'mc-phead' },
          React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'sparkles', size: 15 })), 'Recently Built'),
          React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, 'by your teams')),
        React.createElement('div', { className: 'mc-pcbuilt' },
          ...PC.built.map(b => { const team = PC.teams.find(t => t.id === b.by); return React.createElement('div', { key: b.id, className: 'mc-pcbuiltrow' },
            React.createElement('span', { className: 'mc-chip ' + team.tone, style: { fontSize: 9 } }, team.name),
            React.createElement('span', { className: 't' }, b.title),
            React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--la-cyan)' } }, b.metric),
            React.createElement('span', { className: 'mono', style: { fontSize: 9.5, color: 'var(--fg-3)' } }, b.time)); })))),
  );
}

Object.assign(window, { ObsidianPage, KanbanPage, PaperclipPage });
