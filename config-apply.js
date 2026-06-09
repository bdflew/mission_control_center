// config-apply.js — applies window.CLIENT_CONFIG onto window.MC and the DOM.
// Loaded AFTER the data seeds and BEFORE components render, so the first paint
// is already branded. Everything here is override-only: missing config keys
// leave the defaults untouched.
(function () {
  const CC = window.CLIENT_CONFIG || {};
  const MC = window.MC;
  if (!MC) return;

  // ---- brand: title + CSS accent variables ----
  const brand = CC.brand || {};
  if (brand.product || brand.name) {
    document.title = (brand.product || 'Mission Control') + ' · ' + (brand.name || '');
  }
  const c = brand.colors || {};
  const root = document.documentElement.style;
  if (c.accent)     { root.setProperty('--acc', c.accent); }
  if (c.accent2)    { root.setProperty('--acc2', c.accent2); }
  if (c.accentDeep) { root.setProperty('--acc-deep', c.accentDeep); }
  MC.brand = { name: brand.name, product: brand.product, tagline: brand.tagline, logo: brand.logo, symbol: brand.symbol };

  // ---- operator ----
  if (CC.operator) {
    MC.operator = Object.assign({}, MC.operator, {
      name: CC.operator.name || MC.operator.name,
      role: CC.operator.role || MC.operator.role,
      avatar: CC.operator.avatar || MC.operator.avatar,
      id: CC.operator.id || 'lew',
    });
  }

  // ---- agents: merge config fields onto the seeded roster by id ----
  (CC.agents || []).forEach(a => {
    const t = (MC.agents || []).find(x => x.id === a.id);
    if (t) { t.sprite = a.sprite; t.model3d = a.model3d; t.deskSlot = a.deskSlot; t.voice = a.voice; }
  });

  // ---- features + twin (read by office.jsx, voice.js, live.js) ----
  MC.features = Object.assign({ livingOffice: true, voice: true, companion: true }, CC.features || {});
  MC.twin = Object.assign({ enabled: false, agentId: 'lew', displayName: 'Legacy Lew' }, CC.twin || {});
})();
