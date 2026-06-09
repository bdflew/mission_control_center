// notion.js — real Notion integration (read-only).
// Goes live the moment NOTION_TOKEN exists (internal integration token from
// notion.so/my-integrations — remember to share pages with the integration).
// Honest until then: with no token it reports connected:false; the dashboard
// keeps its labeled sample state. It never fabricates workspace content.
const NOTION_VERSION = '2022-06-28';

function token() { return (process.env.NOTION_TOKEN || '').trim(); }
function hasToken() { return !!token(); }

async function api(pathUrl, opts = {}) {
  const r = await fetch('https://api.notion.com/v1' + pathUrl, {
    method: opts.method || 'GET',
    headers: {
      Authorization: 'Bearer ' + token(),
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('notion ' + r.status + ': ' + (j.message || '').slice(0, 140));
  return j;
}

function titleOf(page) {
  const props = page.properties || {};
  for (const k of Object.keys(props)) {
    const p = props[k];
    if (p.type === 'title' && p.title && p.title.length) return p.title.map(t => t.plain_text).join('');
  }
  if (page.title && page.title.length) return page.title.map(t => t.plain_text).join(''); // databases
  return '(untitled)';
}
function rich(arr) { return (arr || []).map(t => t.plain_text).join(''); }

// Map Notion blocks → the MC.notion.page.blocks shape the UI already renders.
function mapBlock(b) {
  const t = b.type, d = b[t] || {};
  switch (t) {
    case 'heading_1': case 'heading_2': case 'heading_3':
      return { t: 'h', text: rich(d.rich_text) };
    case 'paragraph': {
      const text = rich(d.rich_text);
      return text ? { t: 'p', text } : null;
    }
    case 'to_do':
      return { t: 'todo', done: !!d.checked, text: rich(d.rich_text) };
    case 'quote':
      return { t: 'quote', text: rich(d.rich_text) };
    case 'callout':
      return { t: 'callout', icon: 'target', text: rich(d.rich_text) };
    case 'bulleted_list_item': case 'numbered_list_item':
      return { t: 'p', text: '• ' + rich(d.rich_text) };
    case 'toggle':
      return { t: 'p', text: rich(d.rich_text) };
    default:
      return null;
  }
}

// Returns { connected, workspace, sidebar, page } in the MC.notion shape.
async function notion() {
  if (!hasToken()) return { connected: false };
  const me = await api('/users/me');
  const workspace = (me.bot && me.bot.owner && me.bot.owner.workspace) ? (me.bot.workspace_name || 'Notion workspace') : (me.bot && me.bot.workspace_name) || 'Notion workspace';
  const search = await api('/search', { method: 'POST', body: { page_size: 30, sort: { direction: 'descending', timestamp: 'last_edited_time' } } });
  const results = search.results || [];
  const pages = results.filter(r => r.object === 'page');
  const dbs = results.filter(r => r.object === 'database');

  // Sidebar: databases as sections (top), then recent pages under a Pages section.
  const sidebar = [];
  if (dbs.length) sidebar.push({ id: 'sb-db', name: 'Databases', glyph: 'kanban', kids: dbs.slice(0, 6).map(titleOf) });
  sidebar.push({ id: 'sb-pages', name: 'Pages', glyph: 'file-text', kids: pages.slice(0, 10).map(titleOf) });

  // Page view: the most recently edited page, with real blocks.
  let page = null;
  if (pages.length) {
    const p = pages[0];
    let blocks = [];
    try {
      const kids = await api('/blocks/' + p.id + '/children?page_size=40');
      blocks = (kids.results || []).map(mapBlock).filter(Boolean).slice(0, 20);
    } catch { /* page view degrades to title-only */ }
    page = {
      crumb: workspace + ' / ' + titleOf(p),
      title: titleOf(p),
      cover: 'linear-gradient(120deg,#0E2038,#102544)',
      blocks: blocks.length ? blocks : [{ t: 'p', text: '(no readable blocks on this page — share more pages with the integration to see them here)' }],
    };
  }

  return {
    connected: true,
    workspace,
    pagesShared: pages.length + dbs.length,
    sidebar,
    page: page || {
      crumb: workspace, title: 'No pages shared yet',
      cover: 'linear-gradient(120deg,#0E2038,#102544)',
      blocks: [{ t: 'callout', icon: 'target', text: 'The integration is connected but no pages are shared with it yet. In Notion: open a page → ··· → Connections → add your integration.' }],
    },
  };
}

module.exports = { notion, hasToken };
