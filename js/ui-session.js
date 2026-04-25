// ═══════════════════════════════════════════════════════════════════
// VIKTORIA — ui-session.js  (Account 1 — full build)
// Session flow: Declaration → Disciple Select → Strike → End
// Depends on: economy.js, session.js, metronome.js
// ═══════════════════════════════════════════════════════════════════

(function () {

  // ─── DISCIPLE MANIFEST ──────────────────────────────────────────────────────
  // unlock: null = always open
  // unlock: {year, semester} = available from that position onward
  // Rule: 1 semester before curriculum delivery. Deutsch always open.

  const DISCIPLES = [
    { id: 'ap',      name: 'The Wellspring', course: 'A&P',          tarot: 'The Magician',     glyph: '✦', color: '#2A7A5A', unlock: null },
    { id: 'biochem', name: 'The Alchemist',  course: 'Biochemistry', tarot: 'Wheel of Fortune', glyph: '⬡', color: '#8C5E14', unlock: null },
    { id: 'theo',    name: 'The Lantern',    course: 'Theory',       tarot: 'The Star',         glyph: '☆', color: '#4A7A8A', unlock: null },
    { id: 'de',      name: 'The Herald',     course: 'Deutsch',      tarot: 'The Sun',          glyph: '☀', color: '#B8882A', unlock: null },
    { id: 'ha',      name: 'The Mirror',     course: 'Health Assess.',tarot: 'Justice',          glyph: '⚖', color: '#2A5A7A', unlock: null },
    { id: 'fund',    name: 'The Wayfarer',   course: 'Fundamentals', tarot: 'The Fool',         glyph: '◈', color: '#5A3A8A', unlock: null },
    { id: 'micro',   name: 'The Rot',        course: 'MicroPara',    tarot: 'The Devil',        glyph: '⸸', color: '#6A3A10', unlock: null },
    { id: 'nut',     name: 'The Garden',     course: 'Nutrition',    tarot: 'Temperance',       glyph: '⚘', color: '#4A7A4A', unlock: { year: 1, semester: 2 } },
    { id: 'pharm',   name: 'The Canon',      course: 'Pharmacology', tarot: 'The Emperor',      glyph: '⚕', color: '#8A2020', unlock: { year: 1, semester: 2 } },
    { id: 'matob',   name: 'The Cradle',     course: 'Maternal',     tarot: 'The Empress',      glyph: '♡', color: '#8A2060', unlock: { year: 1, semester: 2 } },
    { id: 'medsurg', name: 'The Warhorse',   course: 'Med-Surg',     tarot: 'Strength',         glyph: '⚔', color: '#2A3A7A', unlock: { year: 2, semester: 2 } },
    { id: 'psych',   name: 'The Veil',       course: 'Psych',        tarot: 'High Priestess',   glyph: '◐', color: '#2A4A6A', unlock: { year: 3, semester: 1 } },
  ];

  // ─── FLOW STATE ────────────────────────────────────────────────────────────

  let _currentStep  = 0;
  let _primaryId    = null;
  let _secondaryIds = [];
  let _riteMode     = 'normal';
  let _recMode      = 'normal';
  let _lightDay     = false;

  // ─── OVERLAY OPEN / CLOSE ──────────────────────────────────────────────────

  function openSessionOverlay() {
    const ov = document.getElementById('session-overlay');
    if (!ov) return;
    if (isSessionActive()) return; // already in session
    _resetFlow();
    ov.classList.add('open');
    document.body.classList.add('session-overlay-open');
    _showStep(0);
  }

  function closeSessionOverlay() {
    const ov = document.getElementById('session-overlay');
    if (ov) ov.classList.remove('open');
    document.body.classList.remove('session-overlay-open');
  }

  function _resetFlow() {
    _currentStep  = 0;
    _primaryId    = null;
    _secondaryIds = [];
    _riteMode     = 'normal';
    _recMode      = 'normal';
    _lightDay     = false;
  }

  // ─── STEP MANAGEMENT ──────────────────────────────────────────────────────

  function _showStep(n) {
    _currentStep = n;
    ['sess-step-decl', 'sess-step-disciples', 'sess-step-strike'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.style.display = i === n ? 'flex' : 'none';
    });
    if (n === 0) _initDeclStep();
    if (n === 1) _initDiscipleStep();
    if (n === 2) _initStrikeStep();
  }

  window.sessStepNext = function () { _showStep(_currentStep + 1); };

  // ─── STEP 0: DECLARATION ──────────────────────────────────────────────────

  function _initDeclStep() {
    const write   = document.getElementById('sess-decl-write');
    const confirm = document.getElementById('sess-decl-confirm');
    const echo    = document.getElementById('sess-decl-echo');

    if (hasDeclarationToday()) {
      if (write)   write.style.display   = 'none';
      if (confirm) confirm.style.display = 'flex';
      if (echo)    echo.textContent      = getDeclarationToday();
    } else {
      if (write)   write.style.display   = 'flex';
      if (confirm) confirm.style.display = 'none';
      const inp = document.getElementById('sess-decl-input');
      if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 120); }
    }
  }

  window.sessDeclarationSave = function () {
    const inp  = document.getElementById('sess-decl-input');
    const text = inp ? inp.value.trim() : '';
    if (!text) { _shake(inp); return; }
    saveDeclarationToday(text); // economy.js — earns 10 vt on first save today
    _showVtFlash('+10 vt');
    _showStep(1);
  };

  window.sessDeclarationSkip = function () {
    spendVt(10); // economy.js — floor-safe, won't go below 0
    _showVtFlash('−10 vt');
    _showStep(1);
  };

  // ─── STEP 1: DISCIPLE SELECTOR ────────────────────────────────────────────

  function _initDiscipleStep() {
    _primaryId    = null;
    _secondaryIds = [];
    _renderDiscipleGrid();
    _updateDiscipleConfirm();
  }

  function _renderDiscipleGrid() {
    const grid = document.getElementById('sess-disciple-grid');
    if (!grid) return;

    grid.innerHTML = DISCIPLES.map(d => {
      const unlocked    = isDiscUnlocked(d.unlock);
      const lockedClass = unlocked ? '' : ' disciple-locked';
      const clickAttr   = unlocked ? `onclick="sessSelectDisciple('${d.id}')"` : '';
      return `
        <div class="sess-disciple-card${lockedClass}" id="sdc-${d.id}"
             data-id="${d.id}" style="--disc-color:${d.color}" ${clickAttr}>
          <div class="sdc-glyph" style="color:${d.color}">${d.glyph}</div>
          <div class="sdc-name">${d.name}</div>
          <div class="sdc-course">${d.course}</div>
          <div class="sdc-tarot">${d.tarot}</div>
          ${!unlocked ? '<div class="sdc-lock">locked</div>' : ''}
        </div>`;
    }).join('');
  }

  window.sessSelectDisciple = function (id) {
    if (id === _primaryId) {
      _primaryId = null;                                              // deselect primary
    } else if (_secondaryIds.includes(id)) {
      _secondaryIds = _secondaryIds.filter(x => x !== id);           // deselect secondary
    } else if (!_primaryId) {
      _primaryId = id;                                                // first tap = primary
    } else {
      if (_secondaryIds.length < 3) _secondaryIds.push(id);          // subsequent = secondary
    }
    _updateDiscipleCards();
    _updateDiscipleConfirm();
  };

  function _updateDiscipleCards() {
    DISCIPLES.forEach(d => {
      const card = document.getElementById('sdc-' + d.id);
      if (!card) return;
      card.classList.remove('disc-primary', 'disc-secondary');
      if      (d.id === _primaryId)             card.classList.add('disc-primary');
      else if (_secondaryIds.includes(d.id))    card.classList.add('disc-secondary');
    });
  }

  function _updateDiscipleConfirm() {
    const btn = document.getElementById('sess-disciple-confirm');
    if (btn) btn.disabled = !_primaryId;

    // update the selection summary line
    const summary = document.getElementById('sess-disciple-summary');
    if (!summary) return;
    if (!_primaryId) {
      summary.textContent = 'No Primary selected';
      summary.style.opacity = '0.4';
    } else {
      const primary = DISCIPLES.find(d => d.id === _primaryId);
      const secNames = _secondaryIds.map(id => DISCIPLES.find(d => d.id === id)?.name || id);
      summary.style.opacity = '1';
      summary.textContent = primary.name
        + (_secondaryIds.length ? ' + ' + secNames.join(', ') : '');
    }
  }

  // ─── STEP 2: STRIKE ───────────────────────────────────────────────────────

  function _initStrikeStep() {
    // reflect primary disciple color on the strike glyph
    const glyph = document.getElementById('sess-strike-glyph');
    if (glyph && _primaryId) {
      const d = DISCIPLES.find(x => x.id === _primaryId);
      if (d) {
        glyph.style.color = d.color;
        glyph.textContent = d.glyph;
      }
    }

    // show selected disciple name
    const nameEl = document.getElementById('sess-strike-disciple');
    if (nameEl && _primaryId) {
      const d = DISCIPLES.find(x => x.id === _primaryId);
      if (d) nameEl.textContent = d.name + (_secondaryIds.length
        ? ' + ' + _secondaryIds.length + ' secondary'
        : '');
    }

    // reset UI state
    const cb = document.getElementById('sess-lightday-cb');
    if (cb) cb.checked = false;
    _lightDay = false;
    _setDurBtn('sess-rite-btns', _riteMode);
    _setDurBtn('sess-rec-btns', _recMode);
  }

  window.sessSetRite = function (val) {
    _riteMode = val;
    _setDurBtn('sess-rite-btns', val);
  };

  window.sessSetRec = function (val) {
    _recMode = val;
    _setDurBtn('sess-rec-btns', val);
  };

  window.sessToggleLightDay = function (cb) {
    _lightDay = cb.checked;
    const longBtn = document.querySelector('#sess-rite-btns [data-val="long"]');
    if (longBtn) {
      longBtn.disabled    = _lightDay;
      longBtn.style.opacity = _lightDay ? '0.3' : '1';
    }
    if (_lightDay && _riteMode === 'long') {
      _riteMode = 'normal';
      _setDurBtn('sess-rite-btns', 'normal');
    }
  };

  function _setDurBtn(containerId, activeVal) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    cont.querySelectorAll('.sess-dur-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.val === activeVal));
  }

  window.sessStrike = function () {
    if (!_primaryId) return;
    const btn = document.getElementById('sess-strike-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Entering…'; }

    const ok = startSession(_primaryId, _secondaryIds, _lightDay); // session.js
    if (!ok) {
      if (btn) { btn.disabled = false; btn.innerHTML = '<span class="sess-strike-rune">✦</span> Strike'; }
      return;
    }
    metronomeStrike(_riteMode, _recMode); // metronome.js
    closeSessionOverlay();
  };

  // ─── SESSION END ──────────────────────────────────────────────────────────

  function openSessionEndOverlay(reason) {
    const ov      = document.getElementById('session-end-overlay');
    const titleEl = document.getElementById('sess-end-title');
    const vtEl    = document.getElementById('sess-end-vt');
    const msgEl   = document.getElementById('sess-end-msg');

    const earned = getSessionTotal(); // economy.js

    if (titleEl) titleEl.textContent = reason === 'early'
      ? 'Session Ended Early'
      : 'The Metronome Falls Silent';

    if (vtEl) {
      vtEl.textContent  = (earned > 0 ? '+' : '') + earned + ' vt';
      vtEl.style.color  = earned > 0 ? 'var(--teal, #2A7A5A)' : 'var(--text-muted)';
    }

    if (msgEl) msgEl.textContent = reason === 'early'
      ? 'Unclaimed rites earn nothing. Claim before you leave next time.'
      : 'Well done. The Sanctum awaits.';

    if (ov) { ov.style.display = 'flex'; ov.classList.add('open'); }
  }

  window.sessEndClose = function () {
    const ov = document.getElementById('session-end-overlay');
    if (ov) { ov.style.display = 'none'; ov.classList.remove('open'); }
    endSession('natural');  // session.js
    metronomeReset();       // metronome.js
    resetSessionTotal();    // economy.js
    applySessionUI(false);
  };

  window.endSessionEarly = function () {
    openSessionEndOverlay('early');
  };

  // ─── BODY CLASS ───────────────────────────────────────────────────────────

  function applySessionUI(active) {
    document.body.classList.toggle('session-active', active);

    // show/hide the end-early button in header if it exists
    const earlyBtn = document.getElementById('sess-end-early-btn');
    if (earlyBtn) earlyBtn.style.display = active ? 'inline-flex' : 'none';

    // show/hide the begin button in header if it exists
    const beginBtn = document.getElementById('sess-begin-btn');
    if (beginBtn) beginBtn.style.display = active ? 'none' : 'inline-flex';
  }

  // apply correct state immediately on page load (handles refresh mid-session)
  applySessionUI(isSessionActive());

  window.addEventListener('session-start', () => applySessionUI(true));
  window.addEventListener('session-end', e => {
    const reason = e.detail && e.detail.reason;
    if (reason !== 'dev' && reason !== 'external') {
      applySessionUI(false);
      openSessionEndOverlay(reason || 'natural');
    }
  });

  // ─── VT FLASH ─────────────────────────────────────────────────────────────

  function _showVtFlash(text) {
    let flash = document.getElementById('sess-vt-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.id        = 'sess-vt-flash';
      flash.className = 'sess-vt-flash';
      document.body.appendChild(flash);
    }
    flash.textContent = text;
    flash.classList.remove('vf-fade');
    flash.classList.add('vf-visible');
    clearTimeout(flash._t);
    flash._t = setTimeout(() => {
      flash.classList.add('vf-fade');
      setTimeout(() => flash.classList.remove('vf-visible', 'vf-fade'), 400);
    }, 1400);
  }

  // ─── SHAKE ────────────────────────────────────────────────────────────────

  function _shake(el) {
    if (!el) return;
    el.classList.add('sess-shake');
    setTimeout(() => el.classList.remove('sess-shake'), 400);
  }

  // ─── EXPOSE ───────────────────────────────────────────────────────────────

  window.openSessionOverlay  = openSessionOverlay;
  window.closeSessionOverlay = closeSessionOverlay;

  console.log('[Viktoria] ui-session.js loaded');

})();
