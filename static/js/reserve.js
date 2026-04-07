/* ═══════════════════════════════════════════
   RESERVE.JS — Savoria Table Booking Wizard
   ═══════════════════════════════════════════ */

'use strict';

/* ── State ── */
const state = {
  step: 1,
  date: null,
  time: null,
  guests: 2,
  occasion: 'None',
  area: 'main',
  areaLabel: 'Main Dining',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TIME_SLOTS = [
  {t:'12:00 PM',full:false},{t:'12:30 PM',full:false},{t:'1:00 PM',full:false},
  {t:'1:30 PM', full:false},{t:'2:00 PM', full:false},{t:'2:30 PM', full:false},
  {t:'4:00 PM', full:false},{t:'4:30 PM', full:false},{t:'5:00 PM', full:false},
  {t:'6:00 PM', full:false},{t:'6:30 PM', full:true}, {t:'7:00 PM', full:false},
  {t:'7:30 PM', full:true}, {t:'8:00 PM', full:false},{t:'8:30 PM', full:false},
  {t:'9:00 PM', full:false},{t:'9:30 PM', full:true}, {t:'10:00 PM',full:false},
];

const AREA_LABELS = {
  main:    'Main Dining',
  terrace: 'Garden Terrace',
  bar:     'Bar Lounge',
  private: 'Private Room',
};

let calOffset = 0;

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  renderTimeSlots();
  updateSummary();
  initReveal();
});

/* ── Scroll reveal ── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   CALENDAR
══════════════════════════════════════ */
function renderCalendar() {
  const strip = document.getElementById('calStrip');
  const today = new Date();
  const base  = new Date(today);
  base.setDate(today.getDate() + calOffset * 7);

  // Start from Sunday of the week
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());

  // Month label
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const calMonth = document.getElementById('calMonth');
  if (calMonth) {
    calMonth.textContent = start.getMonth() === end.getMonth()
      ? `${MONTHS[start.getMonth()]} ${start.getFullYear()}`
      : `${MONTHS[start.getMonth()].slice(0,3)} – ${MONTHS[end.getMonth()].slice(0,3)} ${end.getFullYear()}`;
  }

  strip.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const isToday  = d.toDateString() === today.toDateString();
    const isPast   = d < today && !isToday;
    const isActive = state.date && d.toDateString() === state.date.toDateString();

    let cls = 'cal-day';
    if (isPast)     cls += ' disabled';
    else if (isActive) cls += ' active';
    else if (isToday)  cls += ' today';

    const ds = d.toDateString();

    const el = document.createElement('div');
    el.className = cls;
    el.innerHTML = `
      <span class="text-[9px] font-bold uppercase tracking-[.08em] ${isActive ? 'text-white/70' : isToday ? 'text-gold/70' : 'text-textMid/40'}">${DAYS[d.getDay()]}</span>
      <span class="text-base font-black leading-none ${isActive ? 'text-white' : isToday ? 'text-redPrimary' : 'text-textDark'}">${d.getDate()}</span>
      <span class="text-[9px] ${isActive ? 'text-white/50' : 'text-textMid/30'}">${MONTHS[d.getMonth()].slice(0,3)}</span>
    `;
    if (!isPast) el.onclick = () => selectDate(ds);
    strip.appendChild(el);
  }
}

function prevWeek() { if (calOffset > 0) { calOffset--; renderCalendar(); } }
function nextWeek() { calOffset++; renderCalendar(); }

function selectDate(ds) {
  state.date = new Date(ds);
  state.time = null;
  renderCalendar();
  renderTimeSlots();
  updateSummary();
  hideErr('errDate');
}

/* ══════════════════════════════════════
   TIME SLOTS
══════════════════════════════════════ */
function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  container.innerHTML = TIME_SLOTS.map(s => {
    let cls = 'time-slot';
    if (s.full)              cls += ' full';
    else if (state.time === s.t) cls += ' active';

    return `<div class="${cls}" onclick="${s.full ? '' : `selectTime('${s.t}')`}">
      ${s.t}${s.full ? '<br><span style="font-size:9px;opacity:.6">Full</span>' : ''}
    </div>`;
  }).join('');
}

function selectTime(t) {
  state.time = t;
  renderTimeSlots();
  updateSummary();
  hideErr('errTime');
}

/* ══════════════════════════════════════
   GUESTS
══════════════════════════════════════ */
function changeGuests(delta) {
  state.guests = Math.max(1, Math.min(9, state.guests + delta));
  const val   = document.getElementById('guestVal');
  const minus = document.getElementById('guestMinus');
  const plus  = document.getElementById('guestPlus');
  if (val)   val.textContent = state.guests;
  if (minus) minus.disabled  = state.guests <= 1;
  if (plus)  plus.disabled   = state.guests >= 9;
  updateSummary();
}

/* ══════════════════════════════════════
   OCCASION
══════════════════════════════════════ */
function selectOccasion(el, val) {
  document.querySelectorAll('.occ-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  state.occasion = val === 'none'
    ? 'None'
    : el.querySelector('span').textContent.trim();
  updateSummary();
}

/* ══════════════════════════════════════
   AREA
══════════════════════════════════════ */
function selectArea(el, key) {
  document.querySelectorAll('.area-card').forEach(c => {
    c.classList.remove('active');
    const chk = c.querySelector('.area-check');
    if (chk) { chk.classList.remove('bg-redPrimary', 'border-redPrimary'); }
  });
  el.classList.add('active');
  const chk = el.querySelector('.area-check');
  if (chk) { chk.classList.add('bg-redPrimary', 'border-redPrimary'); }
  state.area      = key;
  state.areaLabel = AREA_LABELS[key] || key;
  updateSummary();
}

/* ══════════════════════════════════════
   DIETARY
══════════════════════════════════════ */
function toggleDiet(el) { el.classList.toggle('active'); }

/* ══════════════════════════════════════
   SUMMARY
══════════════════════════════════════ */
function updateSummary() {
  const fmt = d => d
    ? `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}`
    : 'Not selected';

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('sumDate',     fmt(state.date));
  set('sumTime',     state.time || 'Not selected');
  set('sumGuests',   state.guests + (state.guests === 1 ? ' Guest' : ' Guests'));
  set('sumArea',     state.areaLabel);
  set('sumOccasion', state.occasion);

  // Mobile strip
  set('mobSumDate',   state.date ? fmt(state.date) : 'No date');
  set('mobSumTime',   state.time || 'No time');
  set('mobSumGuests', state.guests + ' Guest' + (state.guests !== 1 ? 's' : ''));
  set('mobSumArea',   state.areaLabel);
}

/* ══════════════════════════════════════
   STEP NAVIGATION
══════════════════════════════════════ */
function goStep(n) {
  // Validate step 1 before proceeding
  if (n > state.step && state.step === 1) {
    let ok = true;
    if (!state.date) { showErr('errDate'); ok = false; }
    if (!state.time) { showErr('errTime'); ok = false; }
    if (!ok) return;
  }

  state.step = n;

  // Show/hide panels
  document.querySelectorAll('.step-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === n);
  });

  // Update step circles
  for (let i = 1; i <= 4; i++) {
    const sc = document.getElementById('sc' + i);
    const sl = document.getElementById('sl' + i);
    if (!sc) continue;

    sc.className = 'step-circle';
    if (i < n)        sc.className += ' done';
    else if (i === n) sc.className += ' active';

    if (sl) {
      sl.className = 'step-label';
      if (i <= n) sl.className += ' active';
      if (i < n)  sl.className += ' done';
    }

    // Connector
    if (i < 4) {
      const con = document.getElementById('con' + i);
      if (con) { con.className = 'step-connector' + (i < n ? ' done' : ''); }
    }
  }

  // Progress
  const pcts = {1:25, 2:50, 3:75, 4:100, 5:100};
  const pb   = document.getElementById('progressBar');
  const sp   = document.getElementById('stepPct');
  if (pb) pb.style.width = (pcts[n] || 25) + '%';
  if (sp) sp.textContent = n <= 4 ? `Step ${n} of 4` : 'Complete!';

  // Hide sidebar & strip on step 5
  const sc5 = document.getElementById('summaryCol');
  const sb5 = document.getElementById('stepBar');
  const ms5 = document.getElementById('mobileSummaryStrip');
  if (sc5) sc5.style.display = n === 5 ? 'none' : '';
  if (sb5) sb5.style.display = n === 5 ? 'none' : '';
  if (ms5) ms5.style.display = n === 5 ? 'none' : '';

  // Animate tick on success
  if (n === 5) {
    setTimeout(() => {
      const tp = document.getElementById('tickPath');
      if (tp) tp.style.strokeDashoffset = '0';
    }, 200);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════
   CONFIRM RESERVATION
══════════════════════════════════════ */
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function confirmReservation(e) {
  e.preventDefault();

  const first  = document.getElementById('rfFirst')?.value.trim()  || '';
  const email  = document.getElementById('rfEmail')?.value.trim()  || '';
  const phone  = document.getElementById('rfPhone')?.value.trim()  || '';
  const terms  = document.getElementById('rfTerms')?.checked       || false;

  let ok = true;

  const setFE = (fId, eId, bad) => {
    document.getElementById(fId)?.classList.toggle('err', bad);
    bad ? showErr(eId) : hideErr(eId);
    if (bad) ok = false;
  };

  setFE('rfFirst', 'errFirst', !first);
  setFE('rfEmail', 'errEmail', !isEmail(email));
  setFE('rfPhone', 'errPhone', !phone);
  terms ? hideErr('errTerms') : (showErr('errTerms'), ok = false);

  if (!ok) return;

  const btn     = document.getElementById('confirmBtn');
  const label   = document.getElementById('confirmLabel');
  const spinner = document.getElementById('confirmSpinner');

  if (btn)     btn.disabled = true;
  if (label)   label.classList.add('hidden');
  if (spinner) { spinner.classList.remove('hidden'); spinner.classList.add('flex'); }

  setTimeout(() => {
    const ref = 'SVR-' + Math.floor(10000 + Math.random() * 90000);
    const d   = state.date;
    const dateStr = d
      ? `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
      : '—';

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('bookRef',    ref);
    set('bookDate',   dateStr);
    set('bookTime',   state.time || '—');
    set('bookGuests', state.guests + (state.guests === 1 ? ' Guest' : ' Guests'));
    set('bookArea',   state.areaLabel);
    set('bookName',   first + (document.getElementById('rfLast')?.value.trim() ? ' ' + document.getElementById('rfLast').value.trim() : ''));
    set('bookEmail',  email);

    if (btn)     btn.disabled = false;
    if (label)   label.classList.remove('hidden');
    if (spinner) { spinner.classList.add('hidden'); spinner.classList.remove('flex'); }

    goStep(5);
  }, 1800);
}

/* ══════════════════════════════════════
   NEW BOOKING
══════════════════════════════════════ */
function newBooking() {
  state.step     = 1;
  state.date     = null;
  state.time     = null;
  state.guests   = 2;
  state.occasion = 'None';
  state.area     = 'main';
  state.areaLabel = 'Main Dining';
  calOffset = 0;

  // Reset form
  const form = document.getElementById('detailsForm');
  if (form) form.reset();

  // Reset dietary pills
  document.querySelectorAll('.topic-pill').forEach(p => p.classList.remove('active'));

  // Reset occasion pills
  document.querySelectorAll('.occ-pill').forEach(p => p.classList.remove('active'));

  // Reset area cards
  document.querySelectorAll('.area-card').forEach(c => {
    c.classList.remove('active');
    const chk = c.querySelector('.area-check');
    if (chk) chk.classList.remove('bg-redPrimary', 'border-redPrimary');
  });
  const mainCard = document.getElementById('area-main');
  if (mainCard) selectArea(mainCard, 'main');

  // Guest counter
  const gv = document.getElementById('guestVal');
  const gm = document.getElementById('guestMinus');
  if (gv) gv.textContent = '2';
  if (gm) gm.disabled = true;

  // Rebuild
  renderCalendar();
  renderTimeSlots();
  updateSummary();
  goStep(1);
}

/* ══════════════════════════════════════
   ERROR HELPERS
══════════════════════════════════════ */
function showErr(id) { const el = document.getElementById(id); if (el) el.classList.add('show'); }
function hideErr(id) { const el = document.getElementById(id); if (el) el.classList.remove('show'); }