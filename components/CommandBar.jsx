// CommandBar.jsx — sticky glassy top bar
function CommandBar({ title, crumb, onOpenPalette, onOpenGalaxy, spend, ctxPct }) {
  const MC = window.MC;
  return (
    <header className="mc-bar">
      <div className="mc-bar__crumb">
        <div className="mc-bar__ey"><span className="cy">{crumb[0]}</span>{crumb[1] ? ' / ' + crumb[1] : ''}</div>
        <div className="mc-bar__title">{title}</div>
      </div>

      <button className="mc-kbar" onClick={onOpenPalette} aria-label="Open command palette">
        <i><Icon name="search" /></i>
        <span className="mc-kbar__ph">Command anything…</span>
        <span className="mc-kbar__kbd">⌘K</span>
      </button>

      <div className="mc-bar__right">
        <div className="mc-gauge-pill" title="Local operator profile">
          <Icon name="moon-star" size={14} style={{ color: 'var(--la-gold)' }} />
          <span className="val">{MC.operator.profile}</span>
        </div>
        <div className="mc-gauge-pill" title="Context window in use">
          <span className="lbl">CTX</span>
          <div className="mc-ctx"><div className="mc-ctx__track"><div className="mc-ctx__fill" style={{ width: ctxPct + '%' }}></div></div></div>
          <span className="val">{ctxPct}%</span>
        </div>
        <div className="mc-gauge-pill" title="Today's AI spend">
          <Icon name="wallet" size={13} style={{ color: 'var(--la-gold)' }} />
          <span className="val gold">{spend}</span>
        </div>
        <button className="mc-iconbtn" onClick={onOpenGalaxy} title="Memory Galaxy" aria-label="Open Memory Galaxy">
          <Icon name="orbit" />
        </button>
        <button className="mc-iconbtn" title="Dreaming brief — 3 new" aria-label="Notifications">
          <Icon name="bell" />
          <span className="mc-iconbtn__dot"></span>
        </button>
        <div className="mc-bar__av" title={MC.operator.name + ' · ' + MC.operator.role}></div>
      </div>
    </header>
  );
}

window.CommandBar = CommandBar;
