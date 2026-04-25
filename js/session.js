// ═══════════════════════════════════════════════════════════════════
// VIKTORIA — session.js
// Global session state. Load after economy.js, before core.js.
// Any tab can read this. Only the Metronome writes to it.
// ═══════════════════════════════════════════════════════════════════

const SESSION_STATE_KEY = 'viktoria-session-state-v1';

// ─── DEFAULT STATE ────────────────────────────────────────────────────────────

function _defaultSessionState() {
  return {
    active: false,
    primaryDisciple: null,   // courseId string e.g. 'ap'
    secondaryDisciplines: [], // array of courseIds
    startedAt: null,         // timestamp
    phase: null,             // 'rite' | 'reckoning' | null
    cycleCount: 0,           // how many full cycles completed
    lightDay: false,         // light day mode active
  };
}

// ─── READ / WRITE ─────────────────────────────────────────────────────────────

function getSessionState() {
  try {
    const raw = localStorage.getItem(SESSION_STATE_KEY);
    if (!raw) return _defaultSessionState();
    return { ..._defaultSessionState(), ...JSON.parse(raw) };
  } catch {
    return _defaultSessionState();
  }
}

function _saveSessionState(state) {
  localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
}

// ─── CONVENIENCE READS ────────────────────────────────────────────────────────

function isSessionActive() {
  return getSessionState().active === true;
}

function getPrimaryDisciple() {
  return getSessionState().primaryDisciple;
}

function getSessionPhase() {
  return getSessionState().phase;
}

// ─── SESSION LIFECYCLE ────────────────────────────────────────────────────────

// call this when the user Strikes the Metronome
function startSession(primaryDisciple, secondaryDisciplines = [], lightDay = false) {
  if (isSessionActive()) return false; // already in session

  const state = {
    ..._defaultSessionState(),
    active: true,
    primaryDisciple,
    secondaryDisciplines,
    startedAt: Date.now(),
    phase: 'rite',
    cycleCount: 0,
    lightDay,
  };

  _saveSessionState(state);
  resetSessionTotal(); // from economy.js — fresh session total
  _dispatchSessionEvent('session-start', state);
  return true;
}

// call this when session ends — natural or early
function endSession(reason = 'natural') {
  if (!isSessionActive()) return false;

  const prev = getSessionState();
  const state = { ..._defaultSessionState() }; // wipe back to defaults
  _saveSessionState(state);
  _dispatchSessionEvent('session-end', { reason, previous: prev });
  return true;
}

// ─── PHASE TRANSITIONS ────────────────────────────────────────────────────────
// called by the Metronome when timer completes

function setPhase(phase) {
  if (!isSessionActive()) return false;
  const state = { ...getSessionState(), phase };
  _saveSessionState(state);
  _dispatchSessionEvent('phase-change', { phase });
  return true;
}

function incrementCycle() {
  if (!isSessionActive()) return;
  const state = getSessionState();
  const updated = { ...state, cycleCount: state.cycleCount + 1 };
  _saveSessionState(updated);
  _dispatchSessionEvent('cycle-complete', { cycleCount: updated.cycleCount });
}

// ─── EVENT DISPATCH ───────────────────────────────────────────────────────────

function _dispatchSessionEvent(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// cross-tab: if another tab changes session state, re-dispatch here
window.addEventListener('storage', e => {
  if (e.key !== SESSION_STATE_KEY) return;
  const state = getSessionState();
  if (state.active) {
    _dispatchSessionEvent('session-start', state);
  } else {
    _dispatchSessionEvent('session-end', { reason: 'external', previous: null });
  }
});

// ─── DEV CONSOLE HELPERS ─────────────────────────────────────────────────────

const SESSION_DEV = {
  start: (disciple = 'ap') => {
    const ok = startSession(disciple);
    console.log(ok ? 'session started — primary: ' + disciple : 'already in session');
  },
  end: () => {
    const ok = endSession('dev');
    console.log(ok ? 'session ended' : 'no active session');
  },
  status: () => console.log(getSessionState()),
  setPhase: phase => { setPhase(phase); console.log('phase set to', phase); },
  cycle: () => { incrementCycle(); console.log('cycle count:', getSessionState().cycleCount); },
};

console.log('[Viktoria] session.js loaded. Dev tools available at SESSION_DEV');
