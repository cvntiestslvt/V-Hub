// ═══════════════════════════════════════════════════════════════════
// VIKTORIA — metronome.js
// Replaces Pomodoro. Timestamp-based so it survives tab switching.
// Depends on: economy.js, session.js
// Load after session.js, before core.js.
// ═══════════════════════════════════════════════════════════════════

const METRO_KEY        = 'viktoria-metro-v1';
const GARDEN_KEY       = 'viktoria-garden-v1';
const GARDEN_WINDOW_MS = 30 * 1000; // 30 seconds

// ─── DURATION OPTIONS (seconds) ───────────────────────────────────────────────

const RITE_DURATIONS = {
  short:  25 * 60,
  normal: 52 * 60,
  long:   90 * 60,
};

const RECKONING_DURATIONS = {
  short:  5  * 60,
  normal: 17 * 60,
  long:   20 * 60,
};

// light day mode uses shorter rite options only
const LIGHT_DAY_RITE_DURATIONS = {
  short:  15 * 60,
  normal: 25 * 60,
};

// ring SVG constants — inherited from existing CSS ring
const METRO_R = 54;
const METRO_C = 2 * Math.PI * METRO_R; // ~339.3

// ─── STATE ────────────────────────────────────────────────────────────────────

function _defaultMetroState() {
  return {
    running: false,
    phase: 'rite',               // 'rite' | 'reckoning'
    phaseStartedAt: null,        // timestamp ms
    phaseDuration: 25 * 60,      // seconds
    riteDuration: 25 * 60,       // stored so reckoning knows what to restore
    reckoningDuration: 5 * 60,
    cycleCount: 0,
    lightDay: false,
  };
}

function getMetroState() {
  try {
    const raw = localStorage.getItem(METRO_KEY);
    if (!raw) return _defaultMetroState();
    return { ..._defaultMetroState(), ...JSON.parse(raw) };
  } catch {
    return _defaultMetroState();
  }
}

function _saveMetroState(state) {
  localStorage.setItem(METRO_KEY, JSON.stringify(state));
}

// ─── GARDEN WINDOW ───────────────────────────────────────────────────────────
// opens for 30s at the moment Rite Phase ends
// adapter checks this before applying Garden mechanic on Nutrition rite claim

function _openGardenWindow() {
  localStorage.setItem(GARDEN_KEY, Date.now().toString());
  window.dispatchEvent(new CustomEvent('garden-window-open'));
  // auto-close after 30 seconds
  setTimeout(() => {
    _closeGardenWindow();
  }, GARDEN_WINDOW_MS);
}

function _closeGardenWindow() {
  localStorage.removeItem(GARDEN_KEY);
  window.dispatchEvent(new CustomEvent('garden-window-close'));
}

function isGardenWindowOpen() {
  const opened = localStorage.getItem(GARDEN_KEY);
  if (!opened) return false;
  const elapsed = Date.now() - parseInt(opened, 10);
  if (elapsed > GARDEN_WINDOW_MS) {
    localStorage.removeItem(GARDEN_KEY);
    return false;
  }
  return true;
}

// ─── TIMER TICK ───────────────────────────────────────────────────────────────

let _metroInterval = null;

function _getRemainingSeconds() {
  const s = getMetroState();
  if (!s.running || !s.phaseStartedAt) return s.phaseDuration;
  const elapsed = Math.floor((Date.now() - s.phaseStartedAt) / 1000);
  return Math.max(0, s.phaseDuration - elapsed);
}

function _onPhaseComplete(state) {
  if (state.phase === 'rite') {
    // open garden window before switching to reckoning
    _openGardenWindow();

    const cycleCount = state.cycleCount;
    const isExtended = cycleCount > 0 && cycleCount % 4 === 0;
    const recDuration = isExtended
      ? state.reckoningDuration * 2  // extended reckoning after 4 cycles
      : state.reckoningDuration;

    const next = {
      ...state,
      phase: 'reckoning',
      phaseStartedAt: Date.now(),
      phaseDuration: recDuration,
    };
    _saveMetroState(next);
    setPhase('reckoning');  // session.js
    window.dispatchEvent(new CustomEvent('metro-phase-change', { detail: { phase: 'reckoning', extended: isExtended } }));
    _dispatchAsklepios('phase-to-reckoning');

  } else {
    // reckoning complete — new cycle begins
    const newCycleCount = state.cycleCount + 1;
    incrementCycle();  // session.js

    const next = {
      ...state,
      phase: 'rite',
      phaseStartedAt: Date.now(),
      phaseDuration: state.riteDuration,
      cycleCount: newCycleCount,
    };
    _saveMetroState(next);
    setPhase('rite');  // session.js

    // after 4 cycles: apply session bonus vt
    if (newCycleCount % 4 === 0) {
      earnVt(50); // 4-cycle bonus
      window.dispatchEvent(new CustomEvent('metro-cycle-bonus', { detail: { cycleCount: newCycleCount, bonus: 50 } }));
    }

    window.dispatchEvent(new CustomEvent('metro-phase-change', { detail: { phase: 'rite', cycleCount: newCycleCount } }));
    _dispatchAsklepios('phase-to-rite');
  }

  _updateRingUI();
}

function _tick() {
  const remaining = _getRemainingSeconds();
  _updateRingUI();

  if (remaining <= 0) {
    const state = getMetroState();
    if (state.running) {
      _onPhaseComplete(state);
    }
  }
}

// ─── START / PAUSE / RESET ────────────────────────────────────────────────────

// riteMode: 'short' | 'normal' | 'long'
// recMode:  'short' | 'normal' | 'long'
function metronomeStrike(riteMode = 'normal', recMode = 'normal') {
  if (!isSessionActive()) return false;

  const session = getSessionState();
  const durations = session.lightDay ? LIGHT_DAY_RITE_DURATIONS : RITE_DURATIONS;
  const riteDur = durations[riteMode] || RITE_DURATIONS.normal;
  const recDur  = RECKONING_DURATIONS[recMode] || RECKONING_DURATIONS.normal;

  const state = {
    running: true,
    phase: 'rite',
    phaseStartedAt: Date.now(),
    phaseDuration: riteDur,
    riteDuration: riteDur,
    reckoningDuration: recDur,
    cycleCount: 0,
    lightDay: session.lightDay,
  };

  _saveMetroState(state);
  _startInterval();
  _updateRingUI();
  _dispatchAsklepios('session-start');
  window.dispatchEvent(new CustomEvent('metro-start', { detail: state }));
  return true;
}

function metronomePause() {
  const state = getMetroState();
  if (!state.running) return;

  // store remaining so we can resume correctly
  const remaining = _getRemainingSeconds();
  const paused = {
    ...state,
    running: false,
    phaseStartedAt: null,
    phaseDuration: remaining,
  };
  _saveMetroState(paused);
  _stopInterval();
  _updateRingUI();
  window.dispatchEvent(new CustomEvent('metro-pause'));
}

function metronomeResume() {
  const state = getMetroState();
  if (state.running || !state.phaseDuration) return;

  const resumed = {
    ...state,
    running: true,
    phaseStartedAt: Date.now(),
  };
  _saveMetroState(resumed);
  _startInterval();
  _updateRingUI();
  window.dispatchEvent(new CustomEvent('metro-resume'));
}

function metronomeReset() {
  _stopInterval();
  _closeGardenWindow();
  _saveMetroState(_defaultMetroState());
  _updateRingUI();
  window.dispatchEvent(new CustomEvent('metro-reset'));
}

// ─── INTERVAL MANAGEMENT ─────────────────────────────────────────────────────

function _startInterval() {
  _stopInterval();
  _metroInterval = setInterval(_tick, 1000);
}

function _stopInterval() {
  if (_metroInterval) {
    clearInterval(_metroInterval);
    _metroInterval = null;
  }
}

// ─── RING UI UPDATE ───────────────────────────────────────────────────────────
// updates the existing ring element from the old Pomodoro CSS

function _updateRingUI() {
  const fill = document.getElementById('pf-ring-fill');
  const timeEl = document.getElementById('pf-time');
  const modeEl = document.getElementById('pf-mode-lbl');

  if (!fill && !timeEl) return; // ring not in DOM yet

  const state = getMetroState();
  const remaining = _getRemainingSeconds();
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  if (timeEl) {
    timeEl.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  if (modeEl) {
    modeEl.textContent = state.phase === 'rite' ? 'Rite Phase' : 'Reckoning Phase';
  }

  if (fill) {
    const progress = state.phaseDuration > 0
      ? remaining / state.phaseDuration
      : 0;
    const offset = METRO_C * (1 - progress);
    fill.style.strokeDashoffset = offset;

    // pulse color matches active Disciple — fallback to default
    const discipleColor = _getDiscipleColor();
    fill.style.stroke = state.phase === 'rite'
      ? discipleColor
      : 'var(--text-muted, #888)';
  }

  // dispatch for any other UI listeners
  window.dispatchEvent(new CustomEvent('metro-tick', {
    detail: { remaining, phase: state.phase, running: state.running }
  }));
}

function _getDiscipleColor() {
  const disciple = getPrimaryDisciple();  // session.js
  const colors = {
    ap:      '#2A7A5A',
    biochem: '#7A5A1A',
    theo:    '#4A7A8A',
    de:      '#8A7A2A',
    ha:      '#5A6A8A',
    fund:    '#6A4A8A',
    micro:   '#7A2A2A',
    nut:     '#4A7A4A',
    pharm:   '#8A2A2A',
    matob:   '#7A4A6A',
    medsurg: '#2A3A7A',
    psych:   '#5A3A7A',
  };
  return disciple && colors[disciple] ? colors[disciple] : 'var(--accent, #6B5E4A)';
}

// ─── ASKLEPIOS DISPATCH ───────────────────────────────────────────────────────
// fires events that the Asklepios engine will listen for
// lines are defined in the Asklepios engine, not here

function _dispatchAsklepios(trigger) {
  window.dispatchEvent(new CustomEvent('asklepios', { detail: { trigger } }));
}

// ─── RECOVERY ON PAGE LOAD ────────────────────────────────────────────────────
// if session was active and page was refreshed, resume the interval

(function _recoverOnLoad() {
  const state = getMetroState();
  if (state.running && isSessionActive()) {
    _startInterval();
    _updateRingUI();
  }
})();

// ─── DEV CONSOLE HELPERS ─────────────────────────────────────────────────────

const METRO_DEV = {
  strike: (riteMode = 'short', recMode = 'short') => {
    // start a session first if not active
    if (!isSessionActive()) SESSION_DEV.start('ap');
    const ok = metronomeStrike(riteMode, recMode);
    console.log(ok ? 'metronome struck — ' + riteMode + ' rite / ' + recMode + ' reckoning' : 'no active session');
  },
  pause:  () => { metronomePause(); console.log('paused'); },
  resume: () => { metronomeResume(); console.log('resumed'); },
  reset:  () => { metronomeReset(); console.log('reset'); },
  status: () => {
    const s = getMetroState();
    console.log({ ...s, remaining: _getRemainingSeconds(), gardenOpen: isGardenWindowOpen() });
  },
  // skip to end of current phase instantly — for testing transitions
  skipPhase: () => {
    const state = getMetroState();
    if (!state.running) { console.log('not running'); return; }
    const hacked = { ...state, phaseStartedAt: Date.now() - (state.phaseDuration * 1000) };
    _saveMetroState(hacked);
    console.log('phase skipped — transition will fire within 1 second');
  },
  gardenStatus: () => console.log('garden window open:', isGardenWindowOpen()),
};

console.log('[Viktoria] metronome.js loaded. Dev tools available at METRO_DEV');

window.isGardenWindowOpen = isGardenWindowOpen;
