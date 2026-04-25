// ─── Viktor Hub — router.js ───────────────────────────────────────
// Replaces build.py entirely. No Python, no build step.
// Fetches all view HTML files in parallel, injects them into #app-container,
// then calls window.initHub() (defined at the bottom of core.js) to boot.
//
// To add a new view:
//   1. Create views/yourview.html with <div class="view" id="view-yourview">...</div>
//   2. Add 'yourview': 'views/yourview.html' to VIEW_MAP below.
//   3. Done. No build required.
// ─────────────────────────────────────────────────────────────────

const VIEW_MAP = {
  // ── Main tabs ──────────────────────────────────────────────────
  'dashboard'    : 'views/home.html',
  'coverage'     : 'views/courses.html',
  'tools'        : 'views/tools.html',
  'viktor'       : 'views/self.html',
  'survival'     : 'views/survival.html',

  // ── Project detail (shared template) ──────────────────────────
  'project'      : 'views/project.html',

  // ── Tool sub-views ─────────────────────────────────────────────
  'chain'        : 'views/tools/chain.html',
  'studysystem'  : 'views/tools/studysystem.html',
  'timeblock'    : 'views/tools/timeblock.html',
  'lowenergy'    : 'views/tools/lowenergy.html',
  'resources'    : 'views/tools/resources.html',
  'returnDemo'   : 'views/tools/returnDemo.html',
  'weeklySynth'  : 'views/tools/weeklySynth.html',
};

(async function initRouter() {
  const container = document.getElementById('app-container');

  // Show a minimal loading state while views fetch
  container.innerHTML =
    '<div style="padding:60px 0;text-align:center;font-family:var(--font-mono);' +
    'font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-ghost)">' +
    '✦ loading…</div>';

  // Fetch all views in parallel — they're small HTML partials, this is fast
  const fetches = Object.entries(VIEW_MAP).map(async ([id, path]) => {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
      const html = await res.text();
      return { id, html };
    } catch (err) {
      console.warn(`[router] Could not load view "${id}" from "${path}":`, err);
      // Return a placeholder so the rest of the app still boots
      return {
        id,
        html: `<div class="view" id="view-${id}"><p style="padding:40px;color:var(--text-muted);font-family:var(--font-mono);font-size:12px">⚠ View "${id}" failed to load.</p></div>`
      };
    }
  });

  const results = await Promise.all(fetches);

  // Clear loading indicator, inject all views into the DOM
  container.innerHTML = '';
  results.forEach(({ html }) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    // View files wrap their content in a single root div (.view); append that directly
    const children = Array.from(tmp.children);
    children.forEach((el, i) => {
      if (i === 0) el.classList.remove('active');
      container.appendChild(el);
    });
  });

  // All views are in the DOM. Boot the hub.
  if (typeof window.initHub === 'function') {
    window.initHub();
  } else {
    console.error('[router] window.initHub not found — core.js may not have loaded correctly.');
  }
})();
