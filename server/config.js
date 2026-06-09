// config.js — single source of truth for the Mission Control backend.
// Everything is overridable by environment variable so nothing is hard-coded
// to one machine. No secrets live here — secrets come from the environment only.
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');

function envPath(name, fallback) {
  const v = process.env[name];
  return v && v.trim() ? path.resolve(v.trim()) : fallback;
}

const config = {
  // Where the dashboard static files live (repo root).
  webRoot: ROOT,

  // The Obsidian vault to read. Local files — no OAuth, no secrets.
  // Override with VAULT_DIR=/path/to/vault
  vaultDir: envPath('VAULT_DIR', path.join(os.homedir(), 'Desktop', 'ai_2nd_Brain')),

  // Persistent JSON state (chat, agents, approvals). Survives restarts.
  stateDir: envPath('MC_STATE_DIR', path.join(ROOT, 'server', 'state')),

  // Network — localhost only by default. NEVER bind to 0.0.0.0 without auth.
  host: process.env.MC_HOST || '127.0.0.1',
  port: parseInt(process.env.MC_PORT || '8754', 10),

  // Folders inside the vault we never scan into the galaxy.
  vaultIgnore: ['.git', '.obsidian', '.trash', 'node_modules', '.design_fetch', '.smart-env', '.DS_Store'],

  // Cap how many notes we ship to the galaxy canvas (true total still reported
  // in stats). Most-recently-modified win the slots.
  galaxyMaxNotes: parseInt(process.env.MC_GALAXY_MAX || '220', 10),

  // The five Memory-Galaxy cluster colors, reused for whatever real top folders exist.
  clusterPalette: ['#23D6F5', '#E8C766', '#F4516B', '#34D399', '#6FE8FB', '#A78BFA'],
};

module.exports = config;
