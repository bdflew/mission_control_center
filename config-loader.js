// config-loader.js — loads client.config.json SYNCHRONOUSLY before any app
// script runs, so branding/agents/features are config-driven (template rule:
// client differences live in config + assets, never in code).
// Sync XHR is deliberate: scripts after this one need the config at parse time.
// On any failure we fall back to built-in defaults — the app must never break
// because a config is missing.
(function () {
  let cfg = null;
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'client.config.json', false); // sync, localhost, tiny file
    xhr.send(null);
    if (xhr.status === 200) cfg = JSON.parse(xhr.responseText);
  } catch (e) { /* fall through to defaults */ }
  window.CLIENT_CONFIG = cfg || {
    brand: { name: 'Legacy Automations', product: 'Mission Control', colors: {} },
    operator: { id: 'lew', name: 'Lew' },
    agents: [],
    twin: { enabled: false },
    features: { livingOffice: true, voice: true, companion: true },
  };
  window.CLIENT_CONFIG._loaded = !!cfg;
})();
