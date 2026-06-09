// vault.js — reads the real Obsidian vault from disk and turns it into the
// shapes the dashboard already expects (galaxy notes, clusters, memory pulse,
// stats). Local files only: no OAuth, no network, no secrets.
const fs = require('fs');
const path = require('path');
const config = require('./config');

const WIKILINK = /\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g;

let cache = null;
let cacheAt = 0;
const TTL_MS = 15000; // re-scan at most every 15s

function walk(dir, acc, depth) {
  if (depth > 8) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    if (config.vaultIgnore.includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc, depth + 1);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) acc.push(full);
  }
}

function titleOf(file, content) {
  const m = content.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim().slice(0, 120);
  return path.basename(file, '.md');
}

// Cluster by up to two path levels so a single dominant top folder (e.g. a
// command brain holding most notes) still spreads into meaningful clusters.
function clusterKey(rel) {
  const parts = rel.split(path.sep);
  if (parts.length <= 1) return '(root)';
  if (parts.length === 2) return parts[0];
  return parts[0] + path.sep + parts[1];
}

function prettyCluster(key) {
  const last = key.split(path.sep).pop() || key;
  return last
    .replace(/\.md$/i, '')
    .replace(/^\d+[_-]?/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || 'Vault';
}

function scan() {
  const root = config.vaultDir;
  const out = {
    ok: false, vaultDir: root, vault: path.basename(root),
    stats: { notes: 0, links: 0, clusters: 0, written7d: 0 },
    clusters: [], notes: [], pulse: [],
  };
  if (!fs.existsSync(root)) { out.error = 'vault not found: ' + root; return out; }

  const files = [];
  walk(root, files, 0);

  const now = Date.now();
  const weekAgo = now - 7 * 864e5;
  const raw = [];
  let totalLinks = 0;
  let written7d = 0;

  for (const f of files) {
    let stat, content;
    try { stat = fs.statSync(f); content = fs.readFileSync(f, 'utf8'); }
    catch { continue; }
    const rel = path.relative(root, f);
    const links = [];
    let m;
    WIKILINK.lastIndex = 0;
    while ((m = WIKILINK.exec(content)) !== null) links.push(m[1].trim());
    totalLinks += links.length;
    if (stat.mtimeMs >= weekAgo) written7d += 1;
    raw.push({
      rel,
      base: path.basename(f, '.md'),
      title: titleOf(f, content),
      folder: clusterKey(rel),
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      links,
      excerpt: content.replace(/^---[\s\S]*?---/, '').replace(/[#>*`\[\]]/g, '')
        .replace(/\s+/g, ' ').trim().slice(0, 160),
    });
  }

  // newest first
  raw.sort((a, b) => b.mtimeMs - a.mtimeMs);

  // clusters from the most common top folders
  const counts = {};
  for (const n of raw) counts[n.folder] = (counts[n.folder] || 0) + 1;
  const topFolders = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, config.clusterPalette.length);
  const clusterPos = [
    { cx: 0.30, cy: 0.40 }, { cx: 0.70, cy: 0.34 }, { cx: 0.66, cy: 0.70 },
    { cx: 0.34, cy: 0.72 }, { cx: 0.52, cy: 0.52 }, { cx: 0.48, cy: 0.24 },
  ];
  const clusterId = f => 'c' + Math.max(0, topFolders.indexOf(f));
  const clusters = topFolders.map((f, i) => ({
    id: clusterId(f), name: prettyCluster(f),
    color: config.clusterPalette[i % config.clusterPalette.length],
    cx: clusterPos[i].cx, cy: clusterPos[i].cy, count: counts[f],
  }));
  const fallbackCluster = clusters[clusters.length - 1] || { id: 'c0' };

  // galaxy nodes (cap to newest N); recency normalized over the shipped set
  const shipped = raw.slice(0, config.galaxyMaxNotes);
  const newest = shipped.length ? shipped[0].mtimeMs : now;
  const oldest = shipped.length ? shipped[shipped.length - 1].mtimeMs : now;
  const span = Math.max(1, newest - oldest);

  // map base-name -> node id so wikilinks resolve to real edges
  const byBase = new Map();
  shipped.forEach((n, i) => { n._id = 'v' + i; byBase.set(n.base.toLowerCase(), n._id); });

  const notes = shipped.map(n => {
    const cluster = topFolders.includes(n.folder) ? clusterId(n.folder) : fallbackCluster.id;
    const recency = 0.18 + 0.82 * ((n.mtimeMs - oldest) / span);
    const resolved = n.links
      .map(l => byBase.get(l.toLowerCase()))
      .filter(Boolean)
      .filter(t => t !== n._id)
      .slice(0, 8);
    return {
      id: n._id, cluster, title: n.title, path: n.rel,
      recency: Math.round(recency * 100) / 100,
      links: resolved, excerpt: n.excerpt,
    };
  });

  // memory pulse = 6 most recent notes, glow by recency
  const pulse = shipped.slice(0, 6).map((n, i) => ({
    id: 'mp' + i, title: n.title, path: n.rel,
    tag: prettyCluster(n.folder).split(' ')[0].toLowerCase(),
    glow: Math.round((1 - i * 0.12) * 100) / 100,
    ago: relTime(now - n.mtimeMs),
  }));

  out.ok = true;
  out.stats = { notes: raw.length, links: totalLinks, clusters: clusters.length, written7d };
  out.clusters = clusters;
  out.notes = notes;
  out.pulse = pulse;
  out.shippedCount = shipped.length;
  return out;
}

function relTime(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' min ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' hr ago';
  const d = Math.floor(h / 24);
  return d + ' day' + (d > 1 ? 's' : '') + ' ago';
}

function getVault(force) {
  const now = Date.now();
  if (!force && cache && now - cacheAt < TTL_MS) return cache;
  cache = scan();
  cacheAt = now;
  return cache;
}

// Resolve a vault-relative path, guarded against traversal outside the vault.
function resolveInVault(relPath) {
  const root = path.resolve(config.vaultDir);
  const target = path.resolve(root, relPath || '');
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error('path escapes vault');
  if (!target.toLowerCase().endsWith('.md')) throw new Error('not a markdown note (.md required)');
  return { root, target };
}

// Read one note's content.
function readNote(relPath) {
  const { target } = resolveInVault(relPath);
  const content = fs.readFileSync(target, 'utf8');
  return { path: relPath, content: content.slice(0, 200000) };
}

// Write a note. mode: 'create' (default, errors if exists) | 'overwrite' | 'append'.
// Path-confined to the vault. Direct writes are enabled (Lew's call) — the only
// guard is that 'create' refuses to silently clobber an existing note.
function writeNote(relPath, content, mode = 'create') {
  const { target } = resolveInVault(relPath);
  if (typeof content !== 'string') throw new Error('content (string) required');
  if (content.length > 500000) throw new Error('content too large');
  const exists = fs.existsSync(target);
  if (exists && mode === 'create') throw new Error('note already exists — use mode "overwrite" or "append"');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (mode === 'append' && exists) {
    fs.appendFileSync(target, (content.startsWith('\n') ? '' : '\n') + content);
  } else {
    fs.writeFileSync(target, content);
  }
  invalidate(); // so the galaxy / stats reflect the new note immediately
  return { path: relPath, bytes: Buffer.byteLength(content), mode: exists ? mode : 'create', existed: exists };
}

function invalidate() { cache = null; cacheAt = 0; }

module.exports = { getVault, readNote, writeNote, invalidate };
