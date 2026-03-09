

// ═══ STATE ═══
const state = {
  step:1, date:null, time:null, guests:2,
  occasion:'None', area:'main', areaLabel:'Main Dining',
};

const TIME_SLOTS = [
  {t:"12:00 PM",full:false},{t:"12:30 PM",full:false},{t:"1:00 PM",full:false},
  {t:"1:30 PM",full:false}, {t:"2:00 PM",full:false}, {t:"2:30 PM",full:false},
  {t:"4:00 PM",full:false}, {t:"4:30 PM",full:false}, {t:"5:00 PM",full:false},
  {t:"6:00 PM",full:false}, {t:"6:30 PM",full:true},  {t:"7:00 PM",full:false},
  {t:"7:30 PM",full:true},  {t:"8:00 PM",full:false}, {t:"8:30 PM",full:false},
  {t:"9:00 PM",full:false}, {t:"9:30 PM",full:true},  {t:"10:00 PM",full:false},
];
let calOffset = 0;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ═══ CALENDAR ═══
function renderCalendar() {
  const strip = document.getElementById('calStrip');
  const today = new Date();
  const base  = new Date(today); base.setDate(today.getDate() + calOffset * 7);
  const days  = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i); days.push(d);
  }
  const firstM = days[0], lastM = days[6];
  document.getElementById('calMonth').textContent =
    firstM.getMonth() === lastM.getMonth()
      ? `${MONTHS[firstM.getMonth()]} ${firstM.getFullYear()}`
      : `${MONTHS[firstM.getMonth()].slice(0,3)} – ${MONTHS[lastM.getMonth()].slice(0,3)} ${lastM.getFullYear()}`;

  strip.innerHTML = days.map(d => {
    const isToday  = d.toDateString() === today.toDateString();
    const isPast   = d < today && !isToday;
    const isActive = state.date && d.toDateString() === state.date.toDateString();
    let cls = 'cal-day';
    if (isPast) cls += ' disabled';
    else if (isActive) cls += ' active';
    else if (isToday) cls += ' today';
    const ds = d.toDateString();
    return `<div class="${cls}" onclick="selectDate('${ds}')">
      <span class="text-[9px] font-bold uppercase tracking-[.08em] ${isActive?'text-white/70':isToday?'text-gold/70':'text-textMid/40'}">${DAYS[d.getDay()]}</span>
      <span class="text-base font-black leading-none ${isActive?'text-white':isToday?'text-redPrimary':'text-textDark'}">${d.getDate()}</span>
      <span class="text-[9px] ${isActive?'text-white/50':'text-textMid/30'}">${MONTHS[d.getMonth()].slice(0,3)}</span>
    </div>`;
  }).join('');
}

function prevWeek() { if (calOffset > 0) { calOffset--; renderCalendar(); } }
function nextWeek() { calOffset++; renderCalendar(); }
function selectDate(ds) {
  state.date = new Date(ds); renderCalendar(); updateSummary();
  state.time = null; renderTimeSlots();
  document.getElementById('errDate').classList.remove('show');
}

// ═══ TIME SLOTS ═══
function renderTimeSlots() {
  document.getElementById('timeSlots').innerHTML = TIME_SLOTS.map(s => {
    let cls = 'time-slot';
    if (s.full) cls += ' full';
    else if (state.time === s.t) cls += ' active';
    return `<div class="${cls}" ${s.full?'title="Fully booked"':''} onclick="${s.full?'':` selectTime('${s.t}')`}">${s.t}${s.full?'<br><span style="font-size:9px;opacity:.6">Full</span>':''}</div>`;
  }).join('');
}
function selectTime(t) {
  state.time = t; renderTimeSlots(); updateSummary();
  document.getElementById('errTime').classList.remove('show');
}

// ═══ GUESTS ═══
function changeGuests(delta) {
  state.guests = Math.max(1, Math.min(9, state.guests + delta));
  document.getElementById('guestVal').textContent = state.guests;
  document.getElementById('guestMinus').disabled = state.guests <= 1;
  document.getElementById('guestPlus').disabled  = state.guests >= 9;
  updateSummary();
}

// ═══ OCCASION ═══
function selectOccasion(el, val) {
  document.querySelectorAll('.occ-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  state.occasion = val === 'none' ? 'None' : el.querySelector('span').textContent;
  updateSummary();
}

// ═══ AREA ═══
const AREA_LABELS = { main:'Main Dining', terrace:'Garden Terrace', bar:'Bar Lounge', private:'Private Room' };
function selectArea(el, key) {
  document.querySelectorAll('.area-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.area = key; state.areaLabel = AREA_LABELS[key];
  updateSummary();
}

// ═══ DIETARY ═══
function toggleDiet(el) { el.classList.toggle('active'); }

// ═══ SUMMARY ═══
function updateSummary() {
  const fmt = d => d ? `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}` : 'Not selected';
  // Desktop sidebar
  const sd = document.getElementById('sumDate');
  const st = document.getElementById('sumTime');
  const sg = document.getElementById('sumGuests');
  const sa = document.getElementById('sumArea');
  const so = document.getElementById('sumOccasion');
  if(sd) sd.textContent = fmt(state.date);
  if(st) st.textContent = state.time || 'Not selected';
  if(sg) sg.textContent = state.guests + (state.guests===1?' Guest':' Guests');
  if(sa) sa.textContent = state.areaLabel;
  if(so) so.textContent = state.occasion;
  // Mobile strip
  const md = document.getElementById('mobSumDate');
  const mt = document.getElementById('mobSumTime');
  const mg = document.getElementById('mobSumGuests');
  if(md) md.textContent = state.date ? fmt(state.date) : 'No date';
  if(mt) mt.textContent = state.time || 'No time';
  if(mg) mg.textContent = state.guests + ' Guest' + (state.guests!==1?'s':'');
}

// ═══ STEP NAV ═══
function goStep(n) {
  if (n > state.step) {
    if (state.step === 1) {
      let ok = true;
      if (!state.date) { document.getElementById('errDate').classList.add('show'); ok = false; }
      if (!state.time) { document.getElementById('errTime').classList.add('show'); ok = false; }
      if (!ok) return;
    }
    if (state.step === 4 && n === 5) return;
  }
  state.step = n;

  document.querySelectorAll('.step-panel').forEach((p,i) => p.classList.toggle('active', i+1===n));

  for (let i = 1; i <= 4; i++) {
    const c = document.getElementById('sc'+i);
    const l = document.getElementById('sl'+i);
    if (i < n)       { c.className='step-circle done';   l.className='step-label done'; }
    else if (i === n){ c.className='step-circle active'; l.className='step-label active'; }
    else             { c.className='step-circle';         l.className='step-label'; }
    if (i < 4) document.getElementById('con'+i).className = 'step-connector'+(i<n?' done':'');
  }

  const pcts = {1:25,2:50,3:75,4:100,5:100};
  document.getElementById('progressBar').style.width = pcts[n]+'%';
  document.getElementById('stepPct').textContent = n<=4?`Step ${n} of 4`:'Complete!';

  const sc = document.getElementById('summaryCol');
  const sb = document.getElementById('stepBar');
  const ms = document.getElementById('mobileSummaryStrip');
  if(sc) sc.style.display = n===5?'none':'';
  if(sb) sb.style.display = n===5?'none':'';
  if(ms) ms.style.display = n===5?'none':'';

  const target = document.getElementById('step'+n);
  if(target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior:'smooth' });
}

// ═══ FORM SUBMIT ═══
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function setE(fId, eId, show) {
  document.getElementById(fId)?.classList.toggle('err', show);
  document.getElementById(eId)?.classList.toggle('show', show);
}

function confirmReservation(e) {
  e.preventDefault();
  const first = document.getElementById('rfFirst').value.trim();
  const email = document.getElementById('rfEmail').value.trim();
  const phone = document.getElementById('rfPhone').value.trim();
  const terms = document.getElementById('rfTerms').checked;
  let ok = true;
  setE('rfFirst','errFirst',!first);          if(!first) ok=false;
  setE('rfEmail','errEmail',!isEmail(email)); if(!isEmail(email)) ok=false;
  setE('rfPhone','errPhone',!phone);          if(!phone) ok=false;
  if(!terms){ document.getElementById('errTerms').classList.add('show'); ok=false; }
  else { document.getElementById('errTerms').classList.remove('show'); }
  if(!ok) return;

  document.getElementById('confirmLabel').classList.add('hidden');
  document.getElementById('confirmSpinner').classList.remove('hidden');
  document.getElementById('confirmBtn').disabled = true;

  setTimeout(() => {
    const ref = 'SVR-'+Math.floor(10000+Math.random()*90000);
    const d   = state.date;
    const dateStr = d?`${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`:'—';
    const lastName = document.getElementById('rfLast').value.trim();
    document.getElementById('bookRef').textContent    = ref;
    document.getElementById('bookDate').textContent   = dateStr;
    document.getElementById('bookTime').textContent   = state.time;
    document.getElementById('bookGuests').textContent = state.guests+(state.guests===1?' Guest':' Guests');
    document.getElementById('bookArea').textContent   = state.areaLabel;
    document.getElementById('bookName').textContent   = first+(lastName?' '+lastName:'');
    document.getElementById('bookEmail').textContent  = email;
    goStep(5);
  }, 2000);
}

function newBooking() {
  state.step=1;state.date=null;state.time=null;state.guests=2;
  state.occasion='None';state.area='main';state.areaLabel='Main Dining';
  calOffset=0;
  document.getElementById('detailsForm').reset();
  document.getElementById('confirmLabel').classList.remove('hidden');
  document.getElementById('confirmSpinner').classList.add('hidden');
  document.getElementById('confirmBtn').disabled=false;
  document.querySelectorAll('.occ-pill').forEach(p=>p.classList.remove('active'));
  selectArea(document.getElementById('area-main'),'main');
  updateSummary(); renderCalendar(); renderTimeSlots(); goStep(1);
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar(); renderTimeSlots(); updateSummary();

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.style.boxShadow = window.scrollY > 60 ? '0 2px 20px rgba(0,0,0,.06)' : 'none';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold:0.05 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
});

function toggleMenu() {
  const m=document.getElementById('mobileMenu'), ov=document.getElementById('overlay');
  const open = m.style.transform==='translateX(0%)';
  m.classList.remove('hidden');
  m.style.display='flex';
  m.style.transform = open?'translateX(100%)':'translateX(0%)';
  ov.style.opacity  = open?'0':'1';
  ov.style.pointerEvents = open?'none':'auto';
}
function closeAll() {
  const m=document.getElementById('mobileMenu'), ov=document.getElementById('overlay');
  if(m) m.style.transform='translateX(100%)';
  if(ov){ ov.style.opacity='0'; ov.style.pointerEvents='none'; }
}
