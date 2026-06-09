// WarRoom.jsx — full team channel with order routing
const { useEffect: useEffectW, useRef: useRefW } = React;

function renderText(text) {
  // highlight @mentions
  const parts = text.split(/(@\w+)/g);
  return parts.map((p, i) => p.startsWith('@')
    ? <span key={i} className="mention">{p}</span>
    : <span key={i}>{p}</span>);
}

function WarRoom({ channel, onChannel, messages, draft, setDraft, onSend }) {
  const MC = window.MC;
  const feedRef = useRefW(null);
  useEffectW(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages]);

  const chanMeta = MC.channels.find(c => c.id === channel) || MC.channels[0];
  const submit = (e) => { e.preventDefault(); if (!draft.trim()) return; onSend(draft.trim()); };

  return (
    <div className="war fade-up">
      <div>
        <div className="war__chans">
          {MC.channels.map(c => (
            <button key={c.id} className={`war__chan ${channel === c.id ? 'is-active' : ''}`} onClick={() => onChannel(c.id)}>
              <Icon name={c.glyph} />{c.name}
              {c.badge ? <span className="badge">{c.badge}</span> : null}
            </button>
          ))}
        </div>
        <div className="war__roster">
          <div className="war__roster-h">In the room</div>
          <div className="war__member">
            <span className="av" style={{ background: 'url(assets/avatar-headshot.png) center/118% #11192A', border: '1px solid rgba(216,167,74,.4)' }}></span>
            <div><div className="nm">Lew</div><div className="rl">Founder · you</div></div>
          </div>
          {MC.agents.map(a => (
            <div key={a.id} className="war__member">
              <span className="av" style={{ background: a.avatarGrad }}>{a.name[0]}<span className="live" style={{ background: a.status === 'working' ? '#2BD8A0' : a.status === 'approval' ? '#D8A74A' : '#64748B' }}></span></span>
              <div><div className="nm">{a.name}</div><div className="rl">{a.model}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="war__main">
        <div className="war__head">
          <Icon name={chanMeta.glyph} size={18} style={{ color: 'var(--la-cyan)' }} />
          <h3>{chanMeta.name}</h3>
          <span className="mc-chip good" style={{ marginLeft: 8 }}><span className="dot"></span>live</span>
          <span className="muted mono" style={{ marginLeft: 'auto', fontSize: 11 }}>{messages.length} messages</span>
        </div>
        <div className="war__feed" ref={feedRef}>
          {messages.map(m => {
            const me = m.from === 'lew' || m.from === 'me';
            const a = me ? null : agentById(m.from);
            return (
              <div key={m.id} className="war__msg">
                {me
                  ? <span className="war__av me"></span>
                  : <span className="war__av" style={{ background: a.avatarGrad }}>{a.name[0]}</span>}
                <div className="war__msgbody">
                  <div className="war__msghead">
                    <span className="war__msgname" style={{ color: me ? '#ecca78' : a.accent }}>{me ? 'Lew' : a.name}</span>
                    <span className="war__msgrole">{me ? 'Founder' : a.role}</span>
                    <span className="war__msgtime">{m.time}</span>
                  </div>
                  <div className="war__msgtxt">{renderText(m.text)}</div>
                  {m.order ? <div className="war__order"><Icon name="git-branch" />routed by Sage → {agentById(m.order).name}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
        <form className="mc-composer war__composer" onSubmit={submit}>
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Give an order or drop an update… (the team will respond)" />
          <button type="submit" className="mc-composer__send" aria-label="Send"><Icon name="arrow-up" /></button>
        </form>
      </div>
    </div>
  );
}

window.WarRoom = WarRoom;
window.renderText = renderText;
