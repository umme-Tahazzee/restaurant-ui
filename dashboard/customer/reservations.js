/* ═══════════════════════════════════════════════════
   reservations.js — Savoria Profile Dashboard
   Handles: reservation list, cancel, modify
   Django: replace MOCK_RESERVATIONS with fetch('/api/reservations/')
═══════════════════════════════════════════════════ */

const RESERVATIONS = (() => {

  /* ─────────────────────────────────────
     MOCK DATA
     Django: GET /api/reservations/
  ───────────────────────────────────── */
  const MOCK_RESERVATIONS = [
    { id:1, date:'Mar 15, 2026', time:'7:30 PM', guests:2, table:'Table 7',        status:'upcoming',  occasion:'Anniversary'       },
    { id:2, date:'Feb 14, 2026', time:'8:00 PM', guests:4, table:'Private Dining', status:'completed', occasion:"Valentine's Dinner" },
    { id:3, date:'Jan 1, 2026',  time:'9:00 PM', guests:6, table:'Table 12',       status:'completed', occasion:'New Year'           },
  ];

  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  function init() {
    _render();
  }

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */
  function _render() {
    const list = document.getElementById('resvList');
    if (!list) return;

    if (MOCK_RESERVATIONS.length === 0) {
      list.innerHTML = `
        <div class="text-center py-16">
          <i class="fa-regular fa-calendar-xmark text-5xl text-border mb-4 block"></i>
          <p class="font-playfair text-xl text-ink-mid/40">No reservations yet</p>
        </div>`;
      return;
    }

    list.innerHTML = MOCK_RESERVATIONS.map(r => _resvCard(r)).join('');
  }

  /* ─────────────────────────────────────
     RESERVATION CARD TEMPLATE
  ───────────────────────────────────── */
  function _resvCard(r) {
    const isUp       = r.status === 'upcoming';
    const [month, day] = r.date.split(' ');

    const dateBadgeBg = isUp
      ? 'style="background:linear-gradient(135deg,#c0392b,#96281b)"'
      : 'class="bg-cream border border-border"';

    const statusBadge = isUp
      ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[.1em] bg-gold/12 text-gold border border-gold/25">Upcoming</span>`
      : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[.1em] bg-green-50 text-green-700 border border-green-200">Completed</span>`;

    const actions = isUp
      ? `<button onclick="RESERVATIONS.cancel(${r.id})"  class="text-[10px] font-bold text-red uppercase tracking-widest hover:underline">Cancel</button>
         <span class="text-ink-mid/30">·</span>
         <button onclick="RESERVATIONS.modify(${r.id})"  class="text-[10px] font-bold text-ink-mid/40 uppercase tracking-widest hover:underline">Modify</button>`
      : `<button onclick="location.href='index.html#reservation'" class="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline">Book Again</button>`;

    return `
      <div class="border border-border rounded-[16px] p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow bg-white">

        <!-- Date badge + info -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${!isUp ? 'bg-cream border border-border' : ''}"
            ${isUp ? dateBadgeBg : ''}>
            <span class="text-[9px] font-bold ${isUp ? 'text-white' : 'text-ink-mid/50'} uppercase leading-none">${month}</span>
            <span class="font-playfair text-lg font-black ${isUp ? 'text-white' : 'text-ink'} leading-none">${day.replace(',','')}</span>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <p class="font-bold text-ink text-sm">${r.occasion}</p>
              ${statusBadge}
            </div>
            <p class="text-ink-mid/50 text-xs">
              <i class="fa-regular fa-clock mr-1.5"></i>${r.time}
              <span class="mx-1.5 text-ink-mid/25">·</span>${r.guests} guests
              <span class="mx-1.5 text-ink-mid/25">·</span>${r.table}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0 flex flex-col gap-1.5 items-end">
          ${actions}
        </div>
      </div>`;
  }

  /* ─────────────────────────────────────
     CANCEL
     Django: POST /api/reservations/{id}/cancel/
  ───────────────────────────────────── */
  function cancel(id) {
    if (!confirm('Cancel this reservation?')) return;
    // Django:
    // await fetch(`/api/reservations/${id}/cancel/`, {
    //   method:'POST',
    //   headers:{ 'X-CSRFToken': getCookie('csrftoken') }
    // });
    // Then re-fetch list and re-render

    const resv = MOCK_RESERVATIONS.find(r => r.id === id);
    if (resv) resv.status = 'cancelled';
    _render();
    BASE.showToast('Reservation cancelled.');
  }

  /* ─────────────────────────────────────
     MODIFY
     Django: redirect to /reservations/{id}/modify/
  ───────────────────────────────────── */
  function modify(id) {
    BASE.showToast('Redirecting to modify booking…');
    // location.href = `/reservations/${id}/modify/`;
  }

  /* ─────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────── */
  return { init, cancel, modify };

})();
