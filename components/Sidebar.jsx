// Sidebar.jsx — Mission Control left rail
const { useState: useStateSB } = React;

function NavItem({ icon, label, active, badge, tag, onClick, avatar, accGold }) {
  return (
    <button className={`mc-item ${active ? 'is-active' : ''} ${accGold ? 'acc-gold' : ''}`} onClick={onClick} title={label}>
      {avatar
        ? <span className="mc-item__av" style={{ background: avatar.avatarGrad }}>{avatar.name[0]}<span className="live" style={{ background: avatar.status === 'working' ? '#2BD8A0' : avatar.status === 'approval' ? '#D8A74A' : '#64748B' }}></span></span>
        : <span className="mc-item__ico"><Icon name={icon} /></span>}
      <span className="mc-item__label">{label}</span>
      {tag ? <span className="mc-item__tag">{tag}</span> : null}
      {badge ? <span className="mc-item__badge">{badge}</span> : null}
    </button>
  );
}

function Sidebar({ view, rail, onNavigate, onToggleRail, onSummon }) {
  const MC = window.MC;
  return (
    <aside className="mc-side">
      <div className="mc-side__top">
        <img src="assets/la-symbol.png" className="mc-logo" alt="Legacy Automations" />
        <div className="mc-wm">
          <span className="g">LEGACY</span> <span className="c">AUTOMATIONS</span>
          <small>Mission Control</small>
        </div>
        <button className="mc-collapse" onClick={onToggleRail} title={rail ? 'Expand' : 'Collapse'} aria-label="Toggle sidebar">
          <Icon name={rail ? 'chevrons-right' : 'chevrons-left'} />
        </button>
      </div>

      <div className="mc-side__status">
        <span className="pulse-dot good"></span>
        <div>
          <div className="mc-side__status-txt">All systems nominal</div>
          <div className="mc-side__status-sub">7 layers · 4 agents online</div>
        </div>
      </div>

      <div className="mc-side__scroll">
        <div className="mc-sec">Workspace</div>
        <nav className="mc-nav">
          <NavItem icon="layout-dashboard" label="Mission Control" active={view.name === 'home'} onClick={() => onNavigate({ name: 'home' })} />
          <NavItem icon="orbit" label="Memory Galaxy" active={view.name === 'galaxy'} onClick={() => onNavigate({ name: 'galaxy' })} />
        </nav>

        <div className="mc-sec">Agents</div>
        <nav className="mc-nav">
          {MC.agents.map(a => (
            <NavItem key={a.id} avatar={a} label={a.name} tag={a.model.split('-')[0]}
              active={view.name === 'agent' && view.id === a.id}
              onClick={() => onNavigate({ name: 'agent', id: a.id })} />
          ))}
          <NavItem icon="sparkles" label="Summon Persona" onClick={onSummon} />
        </nav>

        <div className="mc-sec">Channels</div>
        <nav className="mc-nav">
          {MC.channels.map(c => (
            <NavItem key={c.id} icon={c.glyph} label={c.name} badge={c.badge}
              active={view.name === 'warroom' && view.chan === c.id}
              accGold={c.id === 'approval'}
              onClick={() => onNavigate({ name: 'warroom', chan: c.id })} />
          ))}
        </nav>

        <div className="mc-sec">Programs</div>
        <nav className="mc-nav">
          {MC.programs.slice(0, 6).map(p => (
            <NavItem key={p.id} icon={p.glyph} label={p.name} tag={p.method}
              active={view.name === 'connectors'}
              onClick={() => onNavigate({ name: 'connectors', focus: p.id })} />
          ))}
          <NavItem icon="plug" label="All Connectors" active={view.name === 'connectors'} onClick={() => onNavigate({ name: 'connectors' })} />
        </nav>

        <div className="mc-sec">Workspaces</div>
        <nav className="mc-nav">
          {MC.workspaces.map(w => (
            <NavItem key={w.id} icon={w.glyph} label={w.name}
              active={view.name === 'galaxy' && w.id === 'galaxy' ? true : false}
              onClick={() => w.id === 'galaxy' ? onNavigate({ name: 'galaxy' }) : onNavigate({ name: 'soon', label: w.name })} />
          ))}
        </nav>
      </div>

      <div className="mc-side__foot">
        <div className="mc-owner" onClick={() => onNavigate({ name: 'home' })}>
          <div className="mc-owner__av"></div>
          <div>
            <div className="mc-owner__name">{MC.operator.name}</div>
            <div className="mc-owner__role">{MC.operator.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
window.NavItem = NavItem;
