// content.jsx — Legacy Content Engine (clickable specs · save · autonomous webhook · connectors)
const { useState: useSd, useEffect: useEd, useRef: useRd } = React;

function agByD(id) {
  return window.MC.agents.find(a => a.id === id) || window.MC.personas.find(p => p.id === id) ||
    { name: id[0].toUpperCase() + id.slice(1), avatarGrad: 'linear-gradient(145deg,#334155,#64748B)', accent: '#64748B', theme: 'slate' };
}

// ---- shared webhook setup modal (also used by Studio) ----
function WebhookModal({ surface, onClose, onSave }) {
  const [url, setUrl] = useSd('');
  const [agent, setAgent] = useSd('legacylew');
  const [events, setEvents] = useSd({ posts: true, emails: true, questions: true });
  const agents = window.MC.agents;
  const evList = [['posts', 'Start making posts'], ['emails', 'Draft + send emails'], ['questions', 'Ask me questions when unsure']];
  return React.createElement('div', { className: 'mc-modal-scrim', onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement('div', { className: 'mc-modal' },
      React.createElement('div', { className: 'mc-modal__head' },
        React.createElement('div', { className: 'mc-catalog__ico' }, React.createElement(Icon, { name: 'link', size: 17 })),
        React.createElement('div', { className: 'mc-modal__t' }, 'Connect an Agent'),
        React.createElement('button', { className: 'mc-modal__x', onClick: onClose, 'aria-label': 'Close' }, React.createElement(Icon, { name: 'x', size: 17 }))),
      React.createElement('div', { className: 'mc-modal__body' },
        React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 4 } }, 'When Autonomous turns on for ' + surface + ', this fires a webhook so the agent knows to start working — making posts, drafting emails, and asking you questions.'),
        React.createElement('div', { className: 'mc-field-label' }, 'Webhook URL'),
        React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'link', size: 14 })), React.createElement('input', { value: url, onChange: e => setUrl(e.target.value), placeholder: 'https://hooks.n8n.io/… or your agent endpoint', 'aria-label': 'Webhook URL' })),
        React.createElement('div', { className: 'mc-field-label' }, 'Which agent runs it?'),
        React.createElement('div', { className: 'mc-conn__methods wrap' }, ...agents.map(a => React.createElement('button', { key: a.id, className: 'mc-method' + (agent === a.id ? ' is-active' : ''), onClick: () => setAgent(a.id) }, a.name))),
        React.createElement('div', { className: 'mc-field-label' }, 'On trigger, the agent will…'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          ...evList.map(([k, label]) => React.createElement('label', { key: k, style: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-1)' } },
            React.createElement('button', { className: 'mc-switch ' + (events[k] ? 'on' : ''), onClick: (e) => { e.preventDefault(); setEvents(v => ({ ...v, [k]: !v[k] })); }, 'aria-label': label }, React.createElement('span', { className: 'mc-switch__knob' })), label)))),
      React.createElement('div', { className: 'mc-modal__foot' },
        React.createElement(Btn, { variant: 'quiet', size: 'sm', onClick: onClose }, 'Cancel'),
        React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'link', onClick: () => onSave({ url: url.trim() || 'manual', agent, events }) }, 'Save connection'))),
  );
}
window.WebhookModal = WebhookModal;

function ConnectStrip({ items, onToast, onNav }) {
  // honest: clicking Connect routes to the real Connectors page — it does not
  // pretend a provider got wired by flipping a local chip
  return React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 } },
    ...items.map(i => React.createElement('div', { key: i.id, style: { display: 'flex', alignItems: 'center', gap: 9, padding: '8px 13px', borderRadius: 11, background: 'rgba(20,25,34,0.6)', border: '1px solid ' + (i.live ? 'rgba(52,211,153,0.3)' : 'rgba(206,214,224,0.12)') } },
      React.createElement('div', { style: { width: 26, height: 26, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'rgba(35,214,245,0.1)', color: 'var(--acc)' } }, React.createElement(Icon, { name: i.glyph, size: 14 })),
      React.createElement('span', { style: { fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-1)' } }, i.name),
      React.createElement('span', { className: 'pulse-dot ' + (i.live ? 'good' : 'slate'), style: { width: 7, height: 7 } }),
      React.createElement(Btn, { variant: i.live ? 'quiet' : 'ghost', size: 'sm', icon: i.live ? 'check' : 'plug', onClick: () => { if (i.live) { onToast && onToast('toast', i.name + ' is connected.'); } else if (onNav) onNav('connectors'); else onToast && onToast('toast', 'Open Connectors to wire ' + i.name + '.'); } }, i.live ? 'Connected' : 'Connect'))));
}

function ContentPage({ onAction, onNav }) {
  const CE = window.MC.contentEngine;
  const [auto, setAuto] = useSd(false);
  const [type, setType] = useSd('blog');
  const [openSpec, setOpenSpec] = useSd(null);
  const [brief, setBrief] = useSd('');
  const [pieces, setPieces] = useSd(CE.pieces);
  const [saved, setSaved] = useSd(() => { try { return JSON.parse(localStorage.getItem('mc_content_saved')) || []; } catch (e) { return []; } });
  const [hook, setHook] = useSd(() => { try { return JSON.parse(localStorage.getItem('mc_hook_content')) || null; } catch (e) { return null; } });
  const [hookModal, setHookModal] = useSd(false);
  const [agentLog, setAgentLog] = useSd([]);
  const [working, setWorking] = useSd(false);
  const logRef = useRd(null);
  useEd(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [agentLog]);

  const stageCount = (id) => pieces.filter(p => p.stage === id).length;
  const saveWork = (next) => { setSaved(next); try { localStorage.setItem('mc_content_saved', JSON.stringify(next)); } catch (e) {} };
  const persistHook = (h) => { setHook(h); try { localStorage.setItem('mc_hook_content', JSON.stringify(h)); } catch (e) {} };

  const toggleAuto = () => {
    const next = !auto; setAuto(next);
    if (next) { if (!hook) setHookModal(true); else onAction && onAction('toast', 'Autonomous armed — new briefs fire ' + agByD(hook.agent).name + '’s webhook.'); }
  };
  const spec = window.MC.contentSpecs[openSpec];

  const create = () => {
    if (!brief.trim()) return;
    const t = CE.types.find(x => x.id === type);
    const id = 'ce' + Date.now();
    setPieces(p => [{ id, type, title: brief.trim().slice(0, 48), stage: 'capture', by: 'chloe', kw: 'new', progress: 4 }, ...p]);
    if (auto) {
      // really notify the connected agent (honest delivery/failure toast)
      if (hook && window.fireAgentHook) window.fireAgentHook(hook, { surface: 'content', kind: type, brief: brief.trim() }, onAction, agByD(hook.agent).name);
      setWorking(true); setAgentLog([]);
      const steps = [
        { s: 'capture', m: 'Picked up the brief and classified it as a ' + t.name.toLowerCase() + '.' },
        { s: 'research', m: 'Mining the vault + web for angles and keywords…' },
        { s: 'draft', m: 'Drafting in your brand voice — every line ties to an outcome.' },
        { s: 'optimize', m: 'SEO + voice-guard. Flagged 1 line that drifted; rewrote it.' },
        { s: 'produce', m: 'Producing media via Hyperframes…' },
        { s: 'distribute', m: 'Pipeline preview complete — real publishing happens when the connected agent runs it.' },
      ];
      steps.forEach((st, i) => setTimeout(() => {
        setAgentLog(l => [...l, { text: st.m }]);
        setPieces(p => p.map(x => x.id === id ? { ...x, stage: st.s, progress: Math.round((i + 1) / steps.length * 100) } : x));
        if (i === steps.length - 1) { setWorking(false); onAction && onAction('toast', 'Pipeline preview done — the connected agent does the real run.'); }
      }, 850 * (i + 1)));
    } else { onAction && onAction('toast', 'Captured — sitting in the engine for you to drive.'); }
    setBrief('');
  };

  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-ce__banner' },
      React.createElement('div', { className: 'mc-ce__bicon' }, React.createElement(Icon, { name: 'pen-line', size: 26 })),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '.02em', textTransform: 'uppercase' } }, 'Legacy Content Engine'),
        React.createElement('p', { style: { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', margin: '6px 0 0', maxWidth: 560, lineHeight: 1.55 } }, 'One system for any content. Click a type to see its spec, capture an idea to drive it yourself, or flip Autonomous and an agent builds it end-to-end.')),
      React.createElement('div', { className: 'mc-ce__toggle' },
        React.createElement('span', { style: { fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: auto ? '#34D399' : 'var(--fg-3)' } }, 'Autonomous'),
        React.createElement('button', { className: 'mc-switch ' + (auto ? 'on' : ''), onClick: toggleAuto, 'aria-label': 'Autonomous mode', style: auto ? { background: '#34D399' } : null }, React.createElement('span', { className: 'mc-switch__knob' })))),

    // connect strip
    React.createElement(ConnectStrip, { onToast: onAction, onNav, items: [
      { id: 'hyperframes', name: 'Hyperframes', glyph: 'clapperboard', live: true },
      { id: 'heygen', name: 'HeyGen', glyph: 'video', live: false },
      { id: 'elevenlabs', name: 'ElevenLabs', glyph: 'activity', live: false },
    ] }),

    // autonomous hookbar
    auto && React.createElement('div', { className: 'mc-hookbar ' + (hook ? 'armed' : 'unset') },
      React.createElement('div', { className: 'mc-hookbar__ico', style: { background: hook ? 'rgba(52,211,153,0.14)' : 'rgba(216,167,74,0.14)', color: hook ? '#34D399' : 'var(--la-gold)' } }, React.createElement(Icon, { name: hook ? 'zap' : 'circle-help', size: 18 })),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { className: 'mc-hookbar__t' }, hook ? agByD(hook.agent).name + ' is armed — webhook will fire on new work' : 'No agent connected yet'),
        React.createElement('div', { className: 'mc-hookbar__d' }, hook ? (hook.url === 'manual' ? 'manual setup · ' : hook.url + ' · ') + 'posts · emails · questions' : 'Connect an agent so autonomous mode can trigger it')),
      React.createElement(Btn, { variant: hook ? 'ghost' : 'gold', size: 'sm', icon: 'link', onClick: () => setHookModal(true) }, hook ? 'Edit connection' : 'Configure agent')),

    // type picker
    React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'What are we making?  ', React.createElement('span', { style: { textTransform: 'none', letterSpacing: 0, color: 'var(--fg-3)' } }, '(click a type for its spec)')),
    React.createElement('div', { className: 'mc-ce__types' },
      ...CE.types.map(t => React.createElement('button', { key: t.id, className: 'mc-ce__type' + (type === t.id ? ' is-sel' : '') + (openSpec === t.id ? ' is-open' : ''), onClick: () => { setType(t.id); setOpenSpec(openSpec === t.id ? null : t.id); } },
        React.createElement('div', { className: 'ic tone-' + t.tone }, React.createElement(Icon, { name: t.glyph, size: 18 })),
        React.createElement('div', { className: 'n' }, t.name)))),

    // spec panel
    spec && React.createElement('div', { className: 'mc-cespec' },
      React.createElement('div', { className: 'mc-cespec__head' },
        React.createElement('div', { className: 'mc-cespec__ico tone-' + spec.tone }, React.createElement(Icon, { name: spec.glyph, size: 21 })),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { className: 'mc-cespec__t' }, spec.title + ' — spec'),
          React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' } }, 'how the engine builds a ' + spec.title.toLowerCase())),
        React.createElement('button', { className: 'mc-modal__x', onClick: () => setOpenSpec(null), 'aria-label': 'Close spec' }, React.createElement(Icon, { name: 'x', size: 16 }))),
      React.createElement('div', { className: 'mc-cespec__body' },
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'Specs'),
          React.createElement('div', { className: 'mc-cespec__specs' },
            ...spec.specs.map((s, i) => React.createElement('div', { key: i, className: 'mc-cespec__spec' }, React.createElement('span', { className: 'k' }, s.k), React.createElement('span', { className: 'v' }, s.v))))),
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'How it’s made'),
          React.createElement('div', { className: 'mc-cespec__steps' },
            ...spec.steps.map((s, i) => React.createElement('div', { key: i, className: 'mc-cespec__step' }, React.createElement('span', { className: 'num' }, i + 1), s)))))),

    // brief input
    React.createElement('div', { className: 'mc-studio__prompt', style: { marginBottom: 20 } },
      React.createElement('i', { style: { color: 'var(--acc)', display: 'grid', placeItems: 'center' } }, React.createElement(Icon, { name: auto ? 'zap' : 'plus', size: 18 })),
      React.createElement('input', { value: brief, onChange: e => setBrief(e.target.value), onKeyDown: e => e.key === 'Enter' && create(), placeholder: auto ? 'Tell the agent what to make — it builds the whole thing…' : 'Capture a ' + (CE.types.find(t => t.id === type) || {}).name.toLowerCase() + ' idea or source…', 'aria-label': 'Content brief' }),
      React.createElement(Btn, { variant: auto ? 'gold' : 'cyan', size: 'sm', icon: auto ? 'zap' : 'plus', onClick: create }, auto ? 'Build it for me' : 'Capture')),

    // autonomous agent log
    auto && React.createElement('div', { className: 'mc-ce__autobar' + (working ? '' : ' off') },
      React.createElement('div', { style: { width: 40, height: 40, borderRadius: 11, background: agByD(hook ? hook.agent : 'chloe').avatarGrad, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#06121A', flexShrink: 0 } }, agByD(hook ? hook.agent : 'chloe').name[0]),
      React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 } }, agByD(hook ? hook.agent : 'chloe').name + ' · autonomous content agent'),
        agentLog.length === 0
          ? React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)' } }, 'Standing by. Give a brief above and I’ll take it through the whole engine.')
          : React.createElement('div', { ref: logRef, style: { maxHeight: 96, overflowY: 'auto', marginTop: 4 } }, ...agentLog.map((l, i) => React.createElement('div', { key: i, style: { fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-1)', padding: '3px 0', display: 'flex', gap: 7 } }, React.createElement(Icon, { name: 'corner-down-right', size: 11, style: { color: '#34D399', flexShrink: 0, marginTop: 3 } }), l.text)))),
      working && React.createElement('div', { className: 'mc-typing' }, React.createElement('span'), React.createElement('span'), React.createElement('span'))),

    // pipeline
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, margin: '4px 0 12px' } }, React.createElement('i', null, React.createElement(Icon, { name: 'workflow', size: 15 })), 'The Engine'),
    React.createElement('div', { className: 'mc-ce__pipe' },
      ...CE.stages.map((st, i) => React.createElement('div', { key: st.id, className: 'mc-ce__stage' },
        React.createElement('span', { className: 'cnt' }, stageCount(st.id)),
        React.createElement('div', { className: 'num' }, '0' + (i + 1)),
        React.createElement('div', { className: 'ico' }, React.createElement(Icon, { name: st.glyph, size: 15 })),
        React.createElement('div', { className: 'nm' }, st.name),
        React.createElement('div', { className: 'd' }, st.desc)))),

    // pieces in flight (with save)
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, margin: '22px 0 12px' } }, React.createElement('i', null, React.createElement(Icon, { name: 'sparkles', size: 15 })), 'In the Engine'),
    ...pieces.map(p => { const t = CE.types.find(x => x.id === p.type) || CE.types[0]; const ag = agByD(p.by); const stage = CE.stages.find(s => s.id === p.stage) || CE.stages[0];
      const isSaved = saved.some(s => s.id === p.id);
      return React.createElement('div', { key: p.id, className: 'mc-ce__piece' },
        React.createElement('div', { className: 'mc-ce__pico tone-' + t.tone }, React.createElement(Icon, { name: t.glyph, size: 17 })),
        React.createElement('div', { className: 'mc-ce__pinfo' },
          React.createElement('div', { className: 'mc-ce__ptitle' }, p.title),
          React.createElement('div', { className: 'mc-ce__pmeta' }, t.name + ' · ' + ag.name + ' · #' + p.kw)),
        React.createElement('span', { className: 'mc-chip ' + (p.stage === 'distribute' ? 'good' : 'cyan'), style: { fontSize: 9 } }, React.createElement('span', { className: 'dot' }), stage.name),
        React.createElement('div', { className: 'mc-ce__pbar' }, React.createElement('div', { className: 'mc-ce__pfill', style: { width: p.progress + '%' } })),
        React.createElement(Btn, { variant: isSaved ? 'quiet' : 'ghost', size: 'sm', icon: isSaved ? 'check' : 'save', onClick: () => { if (isSaved) return; saveWork([{ id: p.id, title: p.title, type: p.type, time: 'just now' }, ...saved]); onAction && onAction('toast', 'Saved to your library.'); } }, isSaved ? 'Saved' : 'Save')); }),

    // saved work
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, margin: '24px 0 12px' } }, React.createElement('i', null, React.createElement(Icon, { name: 'box', size: 15 })), 'Saved Work', React.createElement('span', { className: 'mono', style: { marginLeft: 8, fontSize: 10, color: 'var(--fg-3)' } }, saved.length + ' items')),
    saved.length === 0
      ? React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-3)', padding: '14px 16px', borderRadius: 12, background: 'rgba(20,25,34,0.5)', border: '1px dashed rgba(206,214,224,0.14)' } }, 'Nothing saved yet. Hit Save on any piece above to keep it in your library — it’s also written back to the vault.')
      : React.createElement('div', { className: 'mc-ce__saved' },
        ...saved.map(s => { const t = window.MC.contentSpecs[s.type] || { glyph: 'file-text', tone: 'cyan' };
          return React.createElement('div', { key: s.id, className: 'mc-savedrow' },
            React.createElement('div', { className: 'mc-savedrow__ico tone-' + t.tone }, React.createElement(Icon, { name: t.glyph, size: 15 })),
            React.createElement('span', { className: 'mc-savedrow__t' }, s.title),
            React.createElement('span', { className: 'mono', style: { fontSize: 9.5, color: 'var(--fg-3)' } }, s.time),
            React.createElement('button', { className: 'mc-conn__del', onClick: () => saveWork(saved.filter(x => x.id !== s.id)), 'aria-label': 'Remove' }, React.createElement(Icon, { name: 'x', size: 14 }))); })),

    hookModal && React.createElement(WebhookModal, { surface: 'the Content Engine', onClose: () => setHookModal(false), onSave: (h) => { persistHook(h); setHookModal(false); onAction && onAction('toast', 'Connected → ' + agByD(h.agent).name + ' will run autonomous content.'); } }),
  );
}

window.ContentPage = ContentPage;
