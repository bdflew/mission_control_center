// pages-c.jsx — Goals · Skills · Workflows · Reports · Daily Briefing
const { useState: useSc } = React;

function agByC(id) {
  return window.MC.agents.find(a => a.id === id) || window.MC.personas.find(p => p.id === id) ||
    { name: id[0].toUpperCase() + id.slice(1), avatarGrad: 'linear-gradient(145deg,#334155,#64748B)', accent: '#64748B', theme: 'slate' };
}

// ===================== BUSINESS GOALS =====================
function GoalsPage() {
  // "Set a business goal" is a real control: local add (persisted) until the
  // backend grows a goals API
  const [adding, setAdding] = useSc(false);
  const [draft, setDraft] = useSc('');
  const [extra, setExtra] = useSc(() => { try { return JSON.parse(localStorage.getItem('mc_custom_goals')) || []; } catch (e) { return []; } });
  const addGoal = () => {
    const t = draft.trim(); if (!t) return;
    const next = [{ id: 'bg' + Date.now(), title: t, owner: 'sage', tone: 'cyan', current: 0, target: 100, metric: '% complete', trend: [0, 0, 0, 0, 0], due: 'TBD' }, ...extra];
    setExtra(next); try { localStorage.setItem('mc_custom_goals', JSON.stringify(next)); } catch (e) {}
    setDraft(''); setAdding(false);
  };
  const G = [...extra, ...window.MC.businessGoals];
  const toneFill = { cyan: 'linear-gradient(90deg,#0E8FA8,#23D6F5)', gold: 'linear-gradient(90deg,#A87B2E,#F3D27A)', crimson: 'linear-gradient(90deg,#B0253C,#FF8095)', emerald: 'linear-gradient(90deg,#0E8F66,#34D399)' };
  const toneCol = { cyan: '#23D6F5', gold: '#E8C766', crimson: '#FF8095', emerald: '#34D399' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-page-head' },
      React.createElement('h2', null, 'Business Goals'),
      React.createElement('p', null, 'The outcomes that matter. Every goal has an owner agent driving it and the system reports progress automatically.')),
    React.createElement('div', { className: 'mc-goalgrid' },
      ...G.map(g => { const owner = agByC(g.owner); const pct = Math.round(g.current / g.target * 100);
        return React.createElement('div', { key: g.id, className: 'mc-bgoal' },
          React.createElement('div', { className: 'mc-bgoal__top' },
            React.createElement('div', { className: 'mc-bgoal__title' }, g.title),
            React.createElement('span', { className: 'mc-chip ' + (g.tone === 'crimson' ? 'crimson' : g.tone) }, React.createElement('span', { className: 'dot' }), pct + '%')),
          React.createElement('div', { className: 'mc-bgoal__nums' },
            React.createElement('span', { className: 'mc-bgoal__cur', style: { color: toneCol[g.tone] } }, g.current.toLocaleString()),
            React.createElement('span', { className: 'mc-bgoal__tgt' }, '/ ' + g.target.toLocaleString() + ' ' + g.metric)),
          React.createElement('div', { className: 'mc-bgoal__bar' }, React.createElement('div', { className: 'mc-bgoal__fill', style: { width: pct + '%', background: toneFill[g.tone] } })),
          React.createElement('div', { style: { marginBottom: 12 } }, React.createElement(Sparkline, { data: g.trend, color: toneCol[g.tone], w: 260, h: 36 })),
          React.createElement('div', { className: 'mc-bgoal__foot' },
            React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 7 } },
              React.createElement('span', { style: { width: 18, height: 18, borderRadius: 6, background: owner.avatarGrad, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 8, color: '#06121A' } }, owner.name[0]),
              owner.name + ' driving'),
            React.createElement('span', null, 'Due ' + g.due))); })),
    React.createElement('div', { style: { marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } },
      adding
        ? React.createElement(React.Fragment, null,
            React.createElement('input', {
              autoFocus: true, value: draft, onChange: e => setDraft(e.target.value),
              onKeyDown: e => { if (e.key === 'Enter') addGoal(); if (e.key === 'Escape') setAdding(false); },
              placeholder: 'Name the outcome — e.g. “Book 10 demos in June”…', 'aria-label': 'New business goal',
              style: { flex: 1, minWidth: 240, background: 'rgba(10,16,28,.9)', border: '1px solid rgba(35,214,245,.3)', borderRadius: 10, padding: '9px 12px', color: 'var(--fg-1)', font: '13px var(--font-body)', outline: 'none' },
            }),
            React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'check', onClick: addGoal }, 'Add goal'),
            React.createElement(Btn, { variant: 'quiet', size: 'sm', icon: 'x', onClick: () => setAdding(false) }, 'Cancel'))
        : React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', onClick: () => setAdding(true) }, 'Set a business goal')),
  );
}

// ===================== SKILLS =====================
function SkillsPage() {
  const [skills, setSkills] = useSc(window.MC.skills);
  const [filter, setFilter] = useSc('all');
  const [modal, setModal] = useSc(false);
  const [editing, setEditing] = useSc(null);
  const cats = ['all', ...window.MC.skillCategories];
  const lvlTone = { Expert: { c: '#34D399' }, Core: { c: '#23D6F5' }, Learning: { c: '#E8C766' } };
  const shown = skills.filter(s => filter === 'all' || s.cat === filter);
  const addSkill = (name, cat, desc) => { setSkills(p => [{ id: 'sk' + Date.now(), name, cat, desc, agents: ['sage'], runs: 0, level: 'Learning', custom: true, glyph: 'zap' }, ...p]); setModal(false); };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-section__head' },
      React.createElement('div', { className: 'mc-page-head', style: { marginBottom: 0 } },
        React.createElement('h2', null, 'Skills'),
        React.createElement('p', null, 'What your agents can do. Each skill plugs into the team — and you can teach them new ones.')),
      React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', onClick: () => setModal(true) }, 'Create custom skill')),
    React.createElement('div', { className: 'mc-art__filters', style: { marginBottom: 16 } },
      ...cats.map(c => React.createElement('button', { key: c, className: 'mc-art__filter' + (filter === c ? ' is-active' : ''), onClick: () => setFilter(c) }, c))),
    React.createElement('div', { className: 'mc-skillgrid' },
      ...shown.map(s => React.createElement('div', { key: s.id, className: 'mc-skill', onClick: () => setEditing(s), role: 'button', tabIndex: 0, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditing(s); } } },
        React.createElement('div', { className: 'mc-skill__top' },
          React.createElement('div', { className: 'mc-skill__ico' }, React.createElement(Icon, { name: s.glyph, size: 19 })),
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { className: 'mc-skill__n' }, s.name, s.custom && React.createElement('span', { style: { marginLeft: 7, fontSize: 9, color: 'var(--la-gold)', fontFamily: 'var(--font-mono)' } }, 'CUSTOM')),
            React.createElement('div', { className: 'mc-skill__lvl', style: { color: (lvlTone[s.level] || {}).c } }, s.level + ' · ' + s.cat)),
          React.createElement(Icon, { name: 'sliders', size: 14, style: { color: 'var(--fg-3)' } })),
        React.createElement('div', { className: 'mc-skill__desc' }, s.desc),
        React.createElement('div', { className: 'mc-skill__foot' },
          React.createElement('div', { className: 'mc-skill__agents' },
            ...s.agents.map(a => { const ag = agByC(a); return React.createElement('div', { key: a, className: 'a', style: { background: ag.avatarGrad }, title: ag.name }, ag.name[0]); }),
            React.createElement('div', { className: 'a add', title: 'Assign an employee' }, '+')),
          React.createElement('span', { className: 'mc-skill__runs' }, s.runs + ' runs')))),
    ),
    modal && React.createElement(SkillModal, { onClose: () => setModal(false), onCreate: addSkill }),
    editing && React.createElement(SkillEditModal, { skill: editing, onClose: () => setEditing(null), onSave: (patch) => { setSkills(p => p.map(x => x.id === editing.id ? { ...x, ...patch } : x)); setEditing(null); } }),
  );
}
function SkillEditModal({ skill, onClose, onSave }) {
  const [desc, setDesc] = useSc(skill.desc);
  const [ctx, setCtx] = useSc('');
  const [agents, setAgents] = useSc(skill.agents.slice());
  const all = window.MC.agents;
  const toggle = (id) => setAgents(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);
  return React.createElement('div', { className: 'mc-modal-scrim', onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement('div', { className: 'mc-modal' },
      React.createElement('div', { className: 'mc-modal__head' },
        React.createElement('div', { className: 'mc-catalog__ico' }, React.createElement(Icon, { name: skill.glyph, size: 17 })),
        React.createElement('div', { className: 'mc-modal__t' }, skill.name),
        React.createElement('button', { className: 'mc-modal__x', onClick: onClose, 'aria-label': 'Close' }, React.createElement(Icon, { name: 'x', size: 17 }))),
      React.createElement('div', { className: 'mc-modal__body' },
        React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'What it does'),
        React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'pen-line', size: 14 })), React.createElement('input', { value: desc, onChange: e => setDesc(e.target.value), 'aria-label': 'Description' })),
        React.createElement('div', { className: 'mc-field-label' }, 'Add context / instructions'),
        React.createElement('div', { className: 'mc-reviewbox' }, React.createElement('textarea', { value: ctx, onChange: e => setCtx(e.target.value), placeholder: 'Extra guidance for how agents run this skill (added to the skill prompt)…', 'aria-label': 'Context', style: { borderColor: 'rgba(35,214,245,0.26)' } })),
        React.createElement('div', { className: 'mc-field-label' }, 'Which AI employees have this skill'),
        React.createElement('div', { className: 'mc-conn__methods wrap' }, ...all.map(a => React.createElement('button', { key: a.id, className: 'mc-method' + (agents.includes(a.id) ? ' is-active' : ''), onClick: () => toggle(a.id) }, a.name)))),
      React.createElement('div', { className: 'mc-modal__foot' },
        React.createElement(Btn, { variant: 'quiet', size: 'sm', onClick: onClose }, 'Cancel'),
        React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'check', onClick: () => onSave({ desc: desc.trim() || skill.desc, agents }) }, 'Save skill'))),
  );
}
function SkillModal({ onClose, onCreate }) {
  const [name, setName] = useSc(''); const [cat, setCat] = useSc('Build'); const [desc, setDesc] = useSc('');
  return React.createElement('div', { className: 'mc-modal-scrim', onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement('div', { className: 'mc-modal' },
      React.createElement('div', { className: 'mc-modal__head' },
        React.createElement('div', { className: 'mc-catalog__ico' }, React.createElement(Icon, { name: 'zap', size: 17 })),
        React.createElement('div', { className: 'mc-modal__t' }, 'Create Custom Skill'),
        React.createElement('button', { className: 'mc-modal__x', onClick: onClose, 'aria-label': 'Close' }, React.createElement(Icon, { name: 'x', size: 17 }))),
      React.createElement('div', { className: 'mc-modal__body' },
        React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'Skill name'),
        React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'zap', size: 14 })), React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: 'e.g. Cold Email Sequencer', 'aria-label': 'Skill name' })),
        React.createElement('div', { className: 'mc-field-label' }, 'Category'),
        React.createElement('div', { className: 'mc-conn__methods wrap' }, ...window.MC.skillCategories.map(c => React.createElement('button', { key: c, className: 'mc-method' + (cat === c ? ' is-active' : ''), onClick: () => setCat(c) }, c))),
        React.createElement('div', { className: 'mc-field-label' }, 'What it does'),
        React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'pen-line', size: 14 })), React.createElement('input', { value: desc, onChange: e => setDesc(e.target.value), placeholder: 'Describe the skill so your agents know how to run it…', 'aria-label': 'Skill description' }))),
      React.createElement('div', { className: 'mc-modal__foot' },
        React.createElement(Btn, { variant: 'quiet', size: 'sm', onClick: onClose }, 'Cancel'),
        React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', onClick: () => (name.trim() ? onCreate(name.trim(), cat, desc.trim() || 'Custom skill.') : null) }, 'Teach the team'))),
  );
}

// ===================== WORKFLOWS =====================
function WorkflowsPage({ onNav }) {
  const [wfs, setWfs] = useSc(window.MC.workflows);
  const toggle = (id) => setWfs(p => p.map(w => w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w));
  const active = wfs.filter(w => w.status === 'active').length;
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-section__head' },
      React.createElement('div', { className: 'mc-page-head', style: { marginBottom: 0 } },
        React.createElement('h2', null, 'Workflows'),
        React.createElement('p', null, active + ' active automations running across the team. Each fires on a trigger and logs back to the vault.')),
      // honest: real automations are wired in n8n / agent harnesses — point there
      React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', title: 'Workflows are wired through your connectors (n8n, MCP agents)', onClick: () => onNav && onNav('connectors') }, 'New workflow')),
    ...wfs.map(w => { const ag = agByC(w.agent);
      return React.createElement('div', { key: w.id, className: 'mc-wf' },
        React.createElement('div', { className: 'mc-wf__top' },
          React.createElement('span', { className: 'pulse-dot ' + (w.status === 'active' ? 'good' : 'slate'), style: { width: 9, height: 9 } }),
          React.createElement('span', { className: 'mc-wf__name' }, w.name),
          React.createElement('span', { className: 'mc-wf__trigger' }, w.trigger),
          React.createElement('button', { className: 'mc-switch ' + (w.status === 'active' ? 'on' : ''), onClick: () => toggle(w.id), 'aria-label': 'Toggle workflow' }, React.createElement('span', { className: 'mc-switch__knob' }))),
        React.createElement('div', { className: 'mc-wf__steps' },
          ...w.steps.map((s, i) => React.createElement('div', { key: i, className: 'mc-wf__step' },
            React.createElement('span', { className: 'mc-wf__chip' }, s),
            i < w.steps.length - 1 && React.createElement('span', { className: 'mc-wf__flow' })))),
        React.createElement('div', { className: 'mc-wf__foot' },
          React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
            React.createElement('span', { style: { width: 16, height: 16, borderRadius: 5, background: ag.avatarGrad, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 7, color: '#06121A' } }, ag.name[0]), ag.name),
          React.createElement('span', null, w.runs + ' runs'),
          React.createElement('span', null, 'Last: ' + w.last))); }),
  );
}

// ===================== REPORTS =====================
function ReportsPage({ onNav }) {
  const R = window.MC.reports;
  const grad = { sage: 'linear-gradient(90deg,#0E8FA8,#23D6F5)', kratos: 'linear-gradient(90deg,#B0253C,#FF8095)', faye: 'linear-gradient(90deg,#0E8F66,#34D399)', chloe: 'linear-gradient(90deg,#A87B2E,#F3D27A)' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-page-head' },
      React.createElement('h2', null, 'Agent Reports'),
      React.createElement('p', null, 'What each of your agents produced — summarized weekly with the numbers that matter. Click an agent to go deeper.')),
    React.createElement('div', { className: 'mc-reportgrid' },
      ...R.map(r => { const ag = agByC(r.agent);
        // the page promises "Click an agent to go deeper" — make it true
        return React.createElement('div', { key: r.id, className: 'mc-report', style: { '--rep-grad': grad[r.agent], cursor: 'pointer' }, role: 'button', tabIndex: 0, title: 'Open ' + ag.name, onClick: () => onNav && onNav('agent:' + r.agent), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNav && onNav('agent:' + r.agent); } } },
          React.createElement('div', { className: 'mc-report__top' },
            React.createElement('div', { className: 'mc-report__av', style: { background: ag.avatarGrad } }, ag.name[0]),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { className: 'mc-report__title' }, r.title),
              React.createElement('div', { className: 'mc-report__period' }, ag.name + ' · ' + r.period + ' · ' + r.time)),
            React.createElement('span', { className: 'mc-chip ' + ag.theme }, React.createElement('span', { className: 'dot' }), 'Report')),
          React.createElement('div', { className: 'mc-report__summary' }, r.summary),
          React.createElement('div', { className: 'mc-report__metrics' },
            ...r.metrics.map((m, i) => React.createElement('div', { key: i, className: 'mc-report__m' },
              React.createElement('div', { className: 'v' }, m.v),
              React.createElement('div', { className: 'l' }, m.l))))); })),
  );
}

// ===================== DAILY BRIEFING =====================
// v3 — the operator's true morning command brief.
// Live mode: server-composed sections (every line from a real source) with
// one-click approve/hold, a spoken digest, and HUD readouts. Demo mode stays
// honest: plan-of-record sample, clearly labeled, no fabricated numbers.
const V3B_TONES = {
  gold: { c: '#E8C766', label: 'Needs you' },
  cyan: { c: '#23D6F5', label: 'Info' },
  ok:   { c: '#34D399', label: 'Clear' },
  mute: { c: '#64748B', label: 'Not connected' },
};
const V3B_ICONS = { approvals: 'shield-alert', agents: 'users-round', vault: 'box', gmail: 'message-square', calendar: 'list-checks' };
const V3B_RISK = { low: '#34D399', med: '#E8C766', high: '#F4516B' };

// Spoken digest — live sections when loaded, otherwise the plan-of-record summary.
function v3bDigest(brief) {
  if (brief && Array.isArray(brief.sections) && brief.sections.length) {
    return 'Good morning. Your command brief. ' +
      brief.sections.map(s => s.title + ': ' + s.lines.slice(0, 3).join('. ')).join('. ');
  }
  const B = window.MC.dailyBriefing;
  return 'Good morning. ' + B.date + '. ' + B.summary;
}

function DailyBriefingPage({ onNav }) {
  const h = React.createElement;
  const B = window.MC.dailyBriefing;
  const [brief, setBrief] = useSc(null);   // /api/brief payload (live only)
  const [busy, setBusy] = useSc(false);
  const [err, setErr] = useSc(null);
  const [flash, setFlash] = useSc(null);   // approval row mid-exit {id, ok}
  const [gone, setGone] = useSc({});       // approval ids resolved from this page
  const [, setTick] = useSc(0);            // bump on mc:live so MC.* re-reads
  const briefRef = React.useRef(null);

  const fetchBrief = () => {
    if (!(window.MCLive && window.MCLive.online)) return;
    setBusy(true);
    window.MCLive.get('/api/brief')
      .then(d => { briefRef.current = d; setBrief(d); setErr(null); })
      .catch(e => setErr(String((e && e.message) || e)))
      .finally(() => setBusy(false));
  };

  React.useEffect(() => {
    fetchBrief();
    const onLive = () => {
      setTick(t => t + 1);                                   // approvals/agents/vault patched live
      if (window.MCLive && window.MCLive.online && !briefRef.current) fetchBrief(); // backend came up after mount
    };
    window.addEventListener('mc:live', onLive);
    const off = window.MCLive && window.MCLive.onEvent
      ? window.MCLive.onEvent(evt => { if (evt && evt.type === 'approval') fetchBrief(); })
      : null;
    return () => { window.removeEventListener('mc:live', onLive); off && off(); };
  }, []);

  const resolve = (id, ok) => {
    if (!(window.MCLive && window.MCLive.online)) return;
    setFlash({ id, ok });
    window.MCLive.resolveApproval(id, ok ? 'approve' : 'hold').catch(() => {});
    setTimeout(() => { setGone(g => Object.assign({}, g, { [id]: true })); setFlash(null); }, 360);
  };

  // ---- readouts: every number from real window.MC state (live.js patches it) ----
  const live = !!(window.MCLive && window.MCLive.online);
  const agentsAll = window.MC.agents || [];
  const onlineN = agentsAll.filter(a => a.status && a.status !== 'offline').length;
  const pending = (window.MC.approvals || []).filter(a => a && !gone[a.id]);
  const notes7 = (window.MC.obsidian && window.MC.obsidian.stats && window.MC.obsidian.stats.written7d) || 0;
  const mode = window.MC.autonomy || 'manual';
  const tts = !!(window.MCVoice && window.MCVoice.ttsSupported);
  const speak = () => { if (tts) window.MCVoice.speak(v3bDigest(briefRef.current), 'legacylew'); };

  // ---- live brief cards (or one honest fallback card) ----
  let briefBody;
  if (live && brief) {
    briefBody = h('div', { className: 'v3b-grid' },
      ...(brief.sections || []).map(sec => {
        const tone = V3B_TONES[sec.tone] || V3B_TONES.cyan;
        const actionable = sec.id === 'approvals' && pending.length > 0;
        return h('div', { key: sec.id, className: 'holo v3b-card', style: { '--acc': tone.c } },
          h('div', { className: 'holo-sheen' }),
          h('div', { className: 'v3b-card__head' },
            h(Icon, { name: V3B_ICONS[sec.id] || 'circle-dot', size: 15, style: { color: tone.c } }),
            h('div', { className: 'v3b-card__title' }, sec.title),
            h('span', { className: 'hud-chip v3b-card__chip' }, tone.label)),
          actionable
            ? h('div', { className: 'v3b-apprs' }, ...pending.map(a => {
                const f = flash && flash.id === a.id;
                const by = a.by ? agByC(a.by).name : 'system';
                return h('div', { key: a.id, className: 'v3b-appr', style: f ? { opacity: 0, transform: 'translateX(' + (flash.ok ? '' : '-') + '14px)' } : null },
                  h('div', { className: 'v3b-appr__subj' }, a.subject),
                  h('div', { className: 'v3b-appr__meta' },
                    h('span', { style: { color: V3B_RISK[a.risk] || V3B_RISK.low } }, (a.risk || 'low') + ' risk'),
                    ' · ' + by + (a.age ? ' · ' + a.age + ' ago' : '')),
                  a.detail ? h('div', { className: 'v3b-appr__det' }, a.detail) : null,
                  h('div', { className: 'v3b-appr__act' },
                    h(Btn, { variant: 'gold', size: 'sm', icon: 'check', onClick: () => resolve(a.id, true) }, 'Approve'),
                    h(Btn, { variant: 'quiet', size: 'sm', icon: 'pause', onClick: () => resolve(a.id, false) }, 'Hold')));
              }))
            : h('div', { className: 'v3b-lines' }, ...sec.lines.map((ln, i) =>
                h('div', { key: i, className: 'v3b-line' },
                  h(Icon, { name: 'corner-down-right', size: 12 }),
                  h('span', null, ln)))));
      }));
  } else if (live && busy) {
    briefBody = h('div', { className: 'holo v3b-card v3b-note', style: { '--acc': '#23D6F5' } },
      h(Icon, { name: 'orbit', size: 17 }),
      h('div', null, 'Composing your live brief from real sources…'));
  } else if (live && err) {
    briefBody = h('div', { className: 'holo v3b-card v3b-note', style: { '--acc': '#F4516B' } },
      h(Icon, { name: 'shield-alert', size: 17 }),
      h('div', null, 'Live brief fetch failed — ' + err + '. Hit Refresh to retry.'));
  } else {
    briefBody = h('div', { className: 'holo v3b-card v3b-note', style: { '--acc': '#64748B' } },
      h(Icon, { name: 'plug', size: 17 }),
      h('div', null,
        h('div', { className: 'v3b-note__t' }, 'Backend offline — live brief unavailable.'),
        h('div', { className: 'v3b-note__s' }, 'Showing the plan-of-record sample below. Start the backend (npm start) to compose this brief from your real approvals, agents, vault, inbox and calendar.')));
  }

  return h('div', { className: 'sci-wrap v3b-wrap' },
    h(SciFiBackdrop, { variant: 'grid' }),
    h('div', { className: 'sci-fg fade-up' },

      // ---- 1 · sunrise hero ----
      h('div', { className: 'holo holo--gold v3b-hero', style: { '--acc': '#E8C766' } },
        h('div', { className: 'holo-sheen' }),
        h('div', { className: 'v3b-sunrise', 'aria-hidden': true }),
        h('div', { className: 'v3b-hero__main' },
          h('div', { className: 'hud-eyebrow' }, 'DAILY BRIEFING · COMMAND COPY'),
          h('div', { className: 'mc-brief__date glow-gold v3b-hero__date' }, B.date),
          h('p', { className: 'mc-brief__sum v3b-hero__sum' }, B.summary)),
        h('div', { className: 'v3b-actions' },
          h(Btn, {
            variant: 'gold', size: 'sm', disabled: !tts, onClick: speak,
            title: tts ? 'Spoken digest — twin voice when available, browser voice fallback' : 'Speech synthesis is not supported in this browser',
          }, '🔊 Read it to me'),
          h(Btn, {
            variant: 'ghost', size: 'sm', icon: 'folder-sync', disabled: busy || !live, onClick: fetchBrief,
            title: live ? 'Re-fetch the live brief' : 'Backend offline — nothing live to refresh',
          }, busy ? 'Refreshing…' : 'Refresh'))),

      // ---- 3 · top readouts (all real state) ----
      h('div', { className: 'holo v3b-readouts' },
        h(HoloStat, { label: 'Approvals waiting', value: String(pending.length), tone: pending.length > 0 ? 'gold' : 'cyan' }),
        h(HoloStat, { label: 'Agents online', value: String(onlineN), suffix: '/ ' + agentsAll.length, tone: 'cyan' }),
        h(HoloStat, { label: 'Notes this week', value: String(notes7), tone: 'cyan' }),
        h(HoloStat, { label: 'Autonomy', value: String(mode).toUpperCase(), tone: mode === 'full' ? 'emerald' : mode === 'semi' ? 'cyan' : 'gold' })),

      // ---- 2 · live brief ----
      h('div', { className: 'v3b-livehead' },
        h('span', { className: 'hud-eyebrow' }, 'LIVE BRIEF · EVERY LINE FROM A REAL SOURCE'),
        live && brief ? h('span', { className: 'v3b-gen' }, 'generated ' + window.MCLive.relTime(brief.generatedAt) + ' ago') : null,
        live && brief && brief.twin && brief.twin.online ? h('span', { className: 'hud-chip' }, 'twin online') : null,
        h('span', { className: 'v3b-livehead__sp' }),
        live ? h(Btn, { variant: 'quiet', size: 'sm', icon: 'folder-sync', disabled: busy, onClick: fetchBrief, title: 'Re-fetch the live brief' }, busy ? 'Refreshing…' : 'Refresh') : null),
      briefBody,

      // ---- 4 · the team plan (kept, restyled, honestly titled) ----
      h('div', { className: 'holo v3b-table' },
        h('div', { className: 'holo-sheen' }),
        h('div', { className: 'mc-phead' },
          h('div', { className: 'mc-ptitle' }, h('i', null, h(Icon, { name: 'users-round', size: 15 })),
            live ? 'What the team is doing today' : 'Plan of record · sample until agents report in'),
          live
            ? h('span', { className: 'mc-chip ' + (onlineN > 0 ? 'good' : 'slate') }, h('span', { className: 'dot' }), onlineN + ' ONLINE')
            : h('span', { className: 'mc-chip slate' }, h('span', { className: 'dot' }), 'SAMPLE')),
        ...B.rows.map(r => { const ag = agByC(r.agent);
          const on = ag.status && ag.status !== 'offline';
          return h('div', { key: r.agent, className: 'mc-brief__row v3b-row' },
            h('button', { className: 'mc-brief__who', onClick: () => onNav('agent:' + r.agent), style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 } },
              h('div', { className: 'mc-brief__av', style: { background: ag.avatarGrad } }, ag.name[0],
                h('span', { style: { position: 'absolute', right: -2, bottom: -2, width: 9, height: 9, borderRadius: '50%', border: '2px solid #161b22', background: on ? '#2BD8A0' : '#64748B' } })),
              h('div', null,
                h('div', { className: 'mc-brief__nm' }, ag.name),
                h('div', { className: 'mc-brief__role' }, ag.role ? ag.role.split(' · ')[0] : ''))),
            h('div', null,
              h('div', { className: 'mc-brief__doing' }, r.doing),
              h('div', { className: 'mc-brief__tags' },
                ...r.did.map((d, i) => h('span', { key: i, className: 'mc-brief__did' }, h(Icon, { name: 'check', size: 11 }), d)),
                h('span', { className: 'mc-brief__next' }, 'Next: ' + r.next)))); })),
    ));
}

Object.assign(window, { GoalsPage, SkillsPage, WorkflowsPage, ReportsPage, DailyBriefingPage });
