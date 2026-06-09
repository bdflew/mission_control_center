// pages-c.jsx — Goals · Skills · Workflows · Reports · Daily Briefing
const { useState: useSc } = React;

function agByC(id) {
  return window.MC.agents.find(a => a.id === id) || window.MC.personas.find(p => p.id === id) ||
    { name: id[0].toUpperCase() + id.slice(1), avatarGrad: 'linear-gradient(145deg,#334155,#64748B)', accent: '#64748B', theme: 'slate' };
}

// ===================== BUSINESS GOALS =====================
function GoalsPage() {
  const G = window.MC.businessGoals;
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
    React.createElement('div', { style: { marginTop: 16 } }, React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus' }, 'Set a business goal')),
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
      ...shown.map(s => React.createElement('div', { key: s.id, className: 'mc-skill', onClick: () => setEditing(s), role: 'button', tabIndex: 0 },
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
function WorkflowsPage() {
  const [wfs, setWfs] = useSc(window.MC.workflows);
  const toggle = (id) => setWfs(p => p.map(w => w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w));
  const active = wfs.filter(w => w.status === 'active').length;
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-section__head' },
      React.createElement('div', { className: 'mc-page-head', style: { marginBottom: 0 } },
        React.createElement('h2', null, 'Workflows'),
        React.createElement('p', null, active + ' active automations running across the team. Each fires on a trigger and logs back to the vault.')),
      React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus' }, 'New workflow')),
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
function ReportsPage() {
  const R = window.MC.reports;
  const grad = { sage: 'linear-gradient(90deg,#0E8FA8,#23D6F5)', kratos: 'linear-gradient(90deg,#B0253C,#FF8095)', faye: 'linear-gradient(90deg,#0E8F66,#34D399)', chloe: 'linear-gradient(90deg,#A87B2E,#F3D27A)' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-page-head' },
      React.createElement('h2', null, 'Agent Reports'),
      React.createElement('p', null, 'What each of your agents produced — summarized weekly with the numbers that matter. Click an agent to go deeper.')),
    React.createElement('div', { className: 'mc-reportgrid' },
      ...R.map(r => { const ag = agByC(r.agent);
        return React.createElement('div', { key: r.id, className: 'mc-report', style: { '--rep-grad': grad[r.agent] } },
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
function DailyBriefingPage({ onNav }) {
  const B = window.MC.dailyBriefing;
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-brief__hero' },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 } },
        React.createElement(Icon, { name: 'sun', size: 20, style: { color: 'var(--la-gold)' } }),
        React.createElement('span', { style: { fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--fg-3)' } }, 'Daily Briefing')),
      React.createElement('div', { className: 'mc-brief__date' }, B.date),
      React.createElement('p', { className: 'mc-brief__sum' }, B.summary)),
    React.createElement('div', { className: 'mc-panel' },
      React.createElement('div', { className: 'mc-phead' },
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'users-round', size: 15 })), 'What the team is doing today'),
        React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), '4 ACTIVE')),
      ...B.rows.map(r => { const ag = agByC(r.agent);
        return React.createElement('div', { key: r.agent, className: 'mc-brief__row' },
          React.createElement('button', { className: 'mc-brief__who', onClick: () => onNav('agent:' + r.agent), style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 } },
            React.createElement('div', { className: 'mc-brief__av', style: { background: ag.avatarGrad } }, ag.name[0], React.createElement('span', { style: { position: 'absolute', right: -2, bottom: -2, width: 9, height: 9, borderRadius: '50%', border: '2px solid #161b22', background: '#2BD8A0' } })),
            React.createElement('div', null,
              React.createElement('div', { className: 'mc-brief__nm' }, ag.name),
              React.createElement('div', { className: 'mc-brief__role' }, ag.role ? ag.role.split(' · ')[0] : ''))),
          React.createElement('div', null,
            React.createElement('div', { className: 'mc-brief__doing' }, r.doing),
            React.createElement('div', { className: 'mc-brief__tags' },
              ...r.did.map((d, i) => React.createElement('span', { key: i, className: 'mc-brief__did' }, React.createElement(Icon, { name: 'check', size: 11 }), d)),
              React.createElement('span', { className: 'mc-brief__next' }, 'Next: ' + r.next)))); })),
  );
}

Object.assign(window, { GoalsPage, SkillsPage, WorkflowsPage, ReportsPage, DailyBriefingPage });
