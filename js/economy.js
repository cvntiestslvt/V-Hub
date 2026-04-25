// ═══════════════════════════════════════════════════════════════════
// VIKTORIA — economy.js
// The vt engine. Everything else reads from or writes to this.
// Load before core.js. No dependencies.
// ═══════════════════════════════════════════════════════════════════

const VT_KEY       = 'viktoria-vt-v1';
const RITES_KEY    = 'viktoria-rites-v1';
const SESSION_KEY  = 'viktoria-session-v1';
const SEMESTER_KEY = 'viktoria-semester-v1';

// ─── BALANCE ─────────────────────────────────────────────────────────────────

function getVtBalance() {
  return Math.max(0, parseInt(localStorage.getItem(VT_KEY) || '0', 10));
}

function _setVt(n) {
  const safe = Math.max(0, Math.floor(n));
  localStorage.setItem(VT_KEY, safe);
  // notify same-tab listeners (cross-tab handled by 'storage' event)
  window.dispatchEvent(new CustomEvent('vt-update', { detail: { balance: safe } }));
}

function earnVt(amount) {
  if (!amount || amount <= 0) return;
  _setVt(getVtBalance() + amount);
}

// returns true if spend succeeded, false if insufficient
function spendVt(amount) {
  const current = getVtBalance();
  if (current < amount) return false;
  _setVt(current - amount);
  return true;
}

function canAfford(amount) {
  return getVtBalance() >= amount;
}

// ─── RITE STATE ───────────────────────────────────────────────────────────────
// key format: courseId_sectionIndex_itemIndex  e.g. 'ap_0_3'

function riteKey(courseId, secIdx, itemIdx) {
  return `${courseId}_${secIdx}_${itemIdx}`;
}

function _getAllRites() {
  try { return JSON.parse(localStorage.getItem(RITES_KEY) || '{}'); }
  catch { return {}; }
}

function _saveAllRites(obj) {
  localStorage.setItem(RITES_KEY, JSON.stringify(obj));
}

function getRiteState(key) {
  const all = _getAllRites();
  return all[key] || { status: 'untouched', vtEarned: 0, mechanicUsed: false, timestamp: null };
}

function _setRiteState(key, state) {
  const all = _getAllRites();
  all[key] = state;
  _saveAllRites(all);
}

// mark a rite as studied — no vt yet
function completeRite(key) {
  const s = getRiteState(key);
  if (s.status !== 'untouched') return false; // already actioned
  _setRiteState(key, { ...s, status: 'complete', timestamp: Date.now() });
  window.dispatchEvent(new CustomEvent('rite-update', { detail: { key, status: 'complete' } }));
  return true;
}

// lock in the vt — only works if rite is complete, not yet claimed
// vtAmount is calculated by the adapter (includes mechanic bonuses) before being passed here
function claimRite(key, vtAmount) {
  const s = getRiteState(key);
  if (s.status !== 'complete') return false;
  const earned = Math.max(0, Math.floor(vtAmount));
  _setRiteState(key, { ...s, status: 'claimed', vtEarned: earned, timestamp: Date.now() });
  earnVt(earned);
  addToSessionTotal(earned);
  window.dispatchEvent(new CustomEvent('rite-update', { detail: { key, status: 'claimed', vtEarned: earned } }));
  return true;
}

// flag that a mechanic was used on this rite (prevents double-use)
function markMechanicUsed(key) {
  const s = getRiteState(key);
  _setRiteState(key, { ...s, mechanicUsed: true });
}

// ─── SESSION TOTAL ────────────────────────────────────────────────────────────
// tracks vt earned in the current session only — resets on session end

function getSessionTotal() {
  return parseInt(localStorage.getItem(SESSION_KEY) || '0', 10);
}

function addToSessionTotal(amount) {
  localStorage.setItem(SESSION_KEY, getSessionTotal() + amount);
}

function resetSessionTotal() {
  localStorage.setItem(SESSION_KEY, '0');
}

// ─── SEMESTER POSITION ────────────────────────────────────────────────────────
// manually set by user — the app cannot detect this automatically

function getSemester() {
  try { return JSON.parse(localStorage.getItem(SEMESTER_KEY) || '{"year":1,"semester":1}'); }
  catch { return { year: 1, semester: 1 }; }
}

function setSemester(year, semester) {
  localStorage.setItem(SEMESTER_KEY, JSON.stringify({ year, semester }));
  // trigger a lock recalculation so UI updates immediately
  window.dispatchEvent(new CustomEvent('semester-update', { detail: { year, semester } }));
}

// ─── LOCK CHECK ───────────────────────────────────────────────────────────────
// discipleUnlock format: { year: 3, semester: 1 }
// returns true if the player's current position meets or exceeds the requirement

function isDiscUnlocked(discipleUnlock) {
  if (!discipleUnlock) return true; // Deutsch — always open
  const pos = getSemester();
  if (pos.year > discipleUnlock.year) return true;
  if (pos.year === discipleUnlock.year && pos.semester >= discipleUnlock.semester) return true;
  return false;
}

// ─── CROSS-TAB SYNC ───────────────────────────────────────────────────────────
// when another tab writes to localStorage, 'storage' fires here
// re-dispatch as vt-update so any tab's UI can react

window.addEventListener('storage', e => {
  if (e.key === VT_KEY) {
    window.dispatchEvent(new CustomEvent('vt-update', { detail: { balance: getVtBalance() } }));
  }
  if (e.key === RITES_KEY) {
    window.dispatchEvent(new CustomEvent('rite-update', { detail: { external: true } }));
  }
});

// ─── DEV CONSOLE HELPERS ─────────────────────────────────────────────────────
// Use these in the browser console during testing.
// None of these are called by the app itself.

const VT_DEV = {
  setBalance: n => { _setVt(n); console.log('vt set to', getVtBalance()); },
  addBalance: n => { earnVt(n); console.log('vt now', getVtBalance()); },
  clearBalance: () => { _setVt(0); console.log('vt cleared'); },
  setSem: (y, s) => { setSemester(y, s); console.log('semester set to Y'+y+' S'+s); },
  unlockAll: () => { setSemester(4, 2); console.log('all Disciples unlocked'); },
  lockAll: () => { setSemester(1, 1); console.log('reset to Y1 S1'); },
  getRite: key => console.log(getRiteState(key)),
  clearRites: () => { localStorage.removeItem(RITES_KEY); console.log('all rite states cleared'); },
  clearSession: () => { resetSessionTotal(); console.log('session total cleared'); },
  status: () => console.log({ vt: getVtBalance(), session: getSessionTotal(), semester: getSemester() }),
};

console.log('[Viktoria] economy.js loaded. Dev tools available at VT_DEV');

// ─── DECLARATION ─────────────────────────────────────────────────────────────
const DECL_KEY = 'viktoria-declaration-v1';

function getDeclarationData() {
  try { return JSON.parse(localStorage.getItem(DECL_KEY) || '{}'); } catch { return {}; }
}

function hasDeclarationToday() {
  const data = getDeclarationData();
  const val = data[todayISO()];
  return !!(val && val.trim());
}

function getDeclarationToday() {
  return getDeclarationData()[todayISO()] || '';
}

function saveDeclarationToday(text) {
  const data = getDeclarationData();
  const isNew = !data[todayISO()]?.trim();
  data[todayISO()] = text.trim();
  localStorage.setItem(DECL_KEY, JSON.stringify(data));
  if (isNew && text.trim()) {
    earnVt(10);
  }
}

const saveDeclaration = saveDeclarationToday;

