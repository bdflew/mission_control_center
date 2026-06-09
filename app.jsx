// app.jsx — Mission Control root: routing, tweaks, command palette, toast
const { useState: useSt, useEffect: useEf, useCallback: useCb } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "cyan",
  "motion": "cinematic",
  "atmosphere": "rich",
  "density": "comfortable",
  "agentGrid": "cards",
  "railDefault": false
}/*EDITMODE-END*/;

const ACCENTS = {
  cyan:  { acc: '#23D6F5', acc2: '#6FE8FB', deep: '#0E8FA8', glow: 'rgba(35,214,245,0.30)', line: 'rgba(35,214,245,0.18)', soft: 'rgba(35,214,245,0.10)' },
  gold:  { acc: '#E8C766', acc2: '#F3D27A', deep: '#A87B2E', glow: 'rgba(216,167,74,0.30)', line: 'rgba(216,167,74,0.22)', soft: 'rgba(216,167,74,0.10)' },
};
const MOTION = { cinematic: 1, subtle: 0.55, lively: 1.7, off: 0 };
const ATMOS = { rich: { grain: 0.06, bloom: 1 }, soft: { grain: 0.03, bloom: 0.6 }, flat: { grain: 0, bloom: 0 } };
const DENSITY = { comfortable: { pad: '18px', gap: '16px' }, compact: { pad: '13px', gap: '11px' } };

function Toast({ msg, onDone }) {
  useEf(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return React.createElement('div', { style: {
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 80,
    background: 'linear-gradient(180deg, rgba(20,28,44,0.98), rgba(11,17,30,0.98))',
    border: '1px solid rgba(35,214,245,0.34)', borderRadius: 12, padding: '13px 18px',
    fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-1)', display: 'flex', alignItems: 'center', gap: 11,
    boxShadow: '0 18px 50px -18px rgba(0,0,0,.7), 0 0 30px -10px rgba(35,214,245,0.3)', animation: 'fadeUp .3s ease-out',
  } },
    React.createElement('span', { className: 'pulse-dot cyan' }),
    msg,
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useSt(() => {
    const h = location.hash.replace('#', ''); return h || 'home';
  });
  const [rail, setRail] = useSt(t.railDefault);
  const [palette, setPalette] = useSt(false);
  const [toast, setToast] = useSt(null);

  // apply tweaks → CSS vars on root
  useEf(() => {
    const root = document.documentElement;
    const ac = ACCENTS[t.accent] || ACCENTS.cyan;
    root.style.setProperty('--acc', ac.acc);
    root.style.setProperty('--acc2', ac.acc2);
    root.style.setProperty('--acc-deep', ac.deep);
    root.style.setProperty('--acc-glow', ac.glow);
    root.style.setProperty('--acc-line', ac.line);
    root.style.setProperty('--acc-soft', ac.soft);
    const ms = MOTION[t.motion] ?? 1;
    root.style.setProperty('--motion-scale', ms || 0.0001);
    root.setAttribute('data-motion', t.motion === 'off' ? 'off' : 'on');
    const at = ATMOS[t.atmosphere] || ATMOS.rich;
    root.style.setProperty('--grain-op', at.grain);
    root.style.setProperty('--bloom-op', at.bloom);
    const d = DENSITY[t.density] || DENSITY.comfortable;
    root.style.setProperty('--pad-card', d.pad);
    root.style.setProperty('--gap-grid', d.gap);
  }, [t]);

  useEf(() => { setRail(t.railDefault); }, [t.railDefault]);

  // ⌘K
  useEf(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // sync browser back/forward + external hash changes
  useEf(() => {
    const h = () => { const v = location.hash.replace('#', '') || 'home'; setView(v); };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const nav = useCb((v) => { setView(v); location.hash = v; const sc = document.querySelector('.mc-scroll'); if (sc) sc.scrollTop = 0; }, []);
  const doAction = useCb((kind, payload) => { if (kind === 'toast') setToast(payload); }, []);

  const motionScale = MOTION[t.motion] ?? 1;

  // route
  let body;
  if (view === 'home') body = React.createElement(HomeView, { onNav: nav, agentVariant: t.agentGrid, heroVariant: 'cards' });
  else if (view === 'warroom') body = React.createElement(WarRoom);
  else if (view === 'connectors') body = React.createElement(Connectors);
  else if (view === 'pantheon') body = React.createElement(Pantheon, { onNav: nav });
  else if (view === 'hermes') body = React.createElement(HermesPage, { onNav: nav });
  else if (view === 'dreaming') body = React.createElement(DreamingPage, { onNav: nav });
  else if (view === 'paperclip') body = React.createElement(PaperclipPage, { onNav: nav });
  else if (view === 'kanban') body = React.createElement(KanbanPage, { onAction: doAction });
  else if (view === 'studio') body = React.createElement(StudioPage, { onAction: doAction });
  else if (view === 'gmail') body = React.createElement(GmailPage, { onAction: doAction });
  else if (view === 'calendar') body = React.createElement(CalendarPage, { onAction: doAction });
  else if (view === 'drive') body = React.createElement(DrivePage);
  else if (view === 'notion') body = React.createElement(NotionPage);
  else if (view === 'obsidian') body = React.createElement(ObsidianPage, { onNav: nav });
  else if (view === 'security') body = React.createElement(SecurityPage, { onNav: nav });
  else if (view === 'announcements' || view === 'channel:announcements') body = React.createElement(AnnouncementsPage, { onNav: nav, onAction: doAction });
  else if (view === 'goals') body = React.createElement(GoalsPage, { onNav: nav });
  else if (view === 'skills') body = React.createElement(SkillsPage, { onNav: nav });
  else if (view === 'workflows') body = React.createElement(WorkflowsPage, { onNav: nav });
  else if (view === 'reports') body = React.createElement(ReportsPage, { onNav: nav });
  else if (view === 'briefing') body = React.createElement(DailyBriefingPage, { onNav: nav });
  else if (view === 'content') body = React.createElement(ContentPage, { onAction: doAction, onNav: nav });
  else if (view.startsWith('agent:')) body = React.createElement(AgentPage, { id: view.split(':')[1], onNav: nav });
  else if (view === 'ws:cost') body = React.createElement(CostPage);
  else if (view.startsWith('ws:')) {
    const w = window.MC.workspaces.find(x => 'ws:' + x.id === view) || {};
    body = React.createElement(Placeholder, { title: w.name || 'Workspace', glyph: w.glyph, desc: 'Auto-collected outputs and live status for ' + (w.name || 'this workspace') + ' route here — part of Layer 6 Production.' });
  }
  else if (view.startsWith('channel:')) {
    const c = window.MC.channels.find(x => 'channel:' + x.id === view) || {};
    body = React.createElement(Placeholder, { title: c.name || 'Channel', glyph: c.glyph, desc: 'Team channel. The War Room is the active hub — open it from the sidebar to talk to your AI team live.' });
  }
  else body = React.createElement(HomeView, { onNav: nav, agentVariant: t.agentGrid });

  const isGalaxy = view === 'galaxy';

  return React.createElement(React.Fragment, null,
    // atmosphere
    React.createElement('div', { className: 'mc-atmos' },
      React.createElement('div', { className: 'mc-atmos__base' }),
      React.createElement('div', { className: 'mc-bloom mc-bloom--gold' }),
      React.createElement('div', { className: 'mc-bloom mc-bloom--cyan' }),
      React.createElement('div', { className: 'mc-grain' })),
    // app
    React.createElement('div', { className: 'mc-app' + (rail ? ' is-rail' : '') },
      React.createElement(Sidebar, { view, onNav: nav, rail, onToggleRail: () => setRail(r => !r) }),
      React.createElement('div', { className: 'mc-main' },
        React.createElement(CommandBar, { view, onOpenPalette: () => setPalette(true), onNav: nav }),
        isGalaxy
          ? React.createElement('div', { style: { flex: 1, position: 'relative', minHeight: 0 } }, React.createElement(MemoryGalaxy, { motionScale }))
          : React.createElement('div', { className: 'mc-scroll', key: view }, body))),
    // palette
    React.createElement(CommandPalette, { open: palette, onClose: () => setPalette(false), onNav: nav, onAction: doAction }),
    // toast
    toast && React.createElement(Toast, { msg: toast, onDone: () => setToast(null) }),
    // tweaks
    React.createElement(TweaksPanel, { title: 'Tweaks' },
      React.createElement(TweakSection, { label: 'Aesthetic' }),
      React.createElement(TweakRadio, { label: 'Accent authority', value: t.accent, options: ['cyan', 'gold'], onChange: v => setTweak('accent', v) }),
      React.createElement(TweakRadio, { label: 'Agent grid', value: t.agentGrid, options: ['cards', 'roster'], onChange: v => setTweak('agentGrid', v) }),
      React.createElement(TweakSection, { label: 'Atmosphere & Motion' }),
      React.createElement(TweakSelect, { label: 'Ambient motion', value: t.motion, options: ['cinematic', 'subtle', 'lively', 'off'], onChange: v => setTweak('motion', v) }),
      React.createElement(TweakSelect, { label: 'Atmosphere', value: t.atmosphere, options: ['rich', 'soft', 'flat'], onChange: v => setTweak('atmosphere', v) }),
      React.createElement(TweakSection, { label: 'Layout' }),
      React.createElement(TweakRadio, { label: 'Density', value: t.density, options: ['comfortable', 'compact'], onChange: v => setTweak('density', v) }),
      React.createElement(TweakToggle, { label: 'Sidebar collapsed', value: t.railDefault, onChange: v => setTweak('railDefault', v) }),
    ),
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
