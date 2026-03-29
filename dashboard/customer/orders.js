/* ═══════════════════════════════════════════════════
   orders.js — Savoria Profile Dashboard
   Handles: order list, filter, invoice modal,
            star rating, reorder, load more
   Django: replace MOCK_ORDERS with fetch('/api/orders/')
═══════════════════════════════════════════════════ */

const ORDERS = (() => {

  /* ─────────────────────────────────────
     MOCK DATA
     Django: GET /api/orders/?page=1&status=all
  ───────────────────────────────────── */
  const MOCK_ORDERS = [
    {
      id:'#SV-2024-0312', date:'Mar 5, 2026', time:'7:30 PM',
      type:'Dine In', table:'Table 7',
      status:'delivered', payment:'Visa •••• 4242',
      items:[
        { name:'Bistecca Fiorentina', qty:1, price:48, note:'Medium rare' },
        { name:'Chianti Classico 2018', qty:1, price:18, note:'' },
        { name:'Panna Cotta', qty:2, price:14, note:'Extra berry coulis on one' },
      ],
      discount:10, tip:5, rating:0,
    },
    {
      id:'#SV-2024-0289', date:'Feb 18, 2026', time:'1:15 PM',
      type:'Takeout', table:'—',
      status:'delivered', payment:'Mastercard •••• 5591',
      items:[
        { name:'Tom Yum Goong', qty:1, price:24, note:'Extra spicy' },
        { name:'Green Curry', qty:1, price:26, note:'Chicken, no eggplant' },
        { name:'Mango Sticky Rice', qty:1, price:14, note:'' },
      ],
      discount:10, tip:0, rating:5,
    },
    {
      id:'#SV-2024-0264', date:'Feb 1, 2026', time:'8:00 PM',
      type:'Dine In', table:'Table 3',
      status:'delivered', payment:'Amex •••• 3001',
      items:[
        { name:'Tagliatelle al Ragù', qty:2, price:28, note:'' },
        { name:'Duck Confit', qty:1, price:42, note:'Extra crispy skin' },
      ],
      discount:10, tip:8, rating:0,
    },
    {
      id:'#SV-2024-0241', date:'Jan 20, 2026', time:'7:00 PM',
      type:'Dine In', table:'Table 12',
      status:'cancelled', payment:'Visa •••• 4242',
      items:[
        { name:'Omakase Sashimi', qty:1, price:55, note:'' },
        { name:'Wagyu Gyoza', qty:1, price:22, note:'' },
        { name:'Matcha Tiramisu', qty:2, price:16, note:'' },
      ],
      discount:0, tip:0, rating:0,
    },
  ];

  /* ─────────────────────────────────────
     STATE
  ───────────────────────────────────── */
  let allOrders     = [];
  let visibleCount  = 4;
  let activeFilter  = 'all';
  let activeInvIdx  = null;  // currently open invoice index

  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  function init() {
    // Expose data globally so base.js can compute stats
    window.ORDERS_DATA = MOCK_ORDERS;
    allOrders = MOCK_ORDERS;
    _render();
  }

  /* ─────────────────────────────────────
     FILTER
  ───────────────────────────────────── */
  function filter(status) {
    activeFilter = status;
    visibleCount = 4;

    // Update chip styles
    ['all','delivered','cancelled'].forEach(s => {
      const btn = document.getElementById('f-' + s);
      if (!btn) return;
      btn.className = 'chip' + (s === status ? ' chip-active' : '');
    });

    _render();
  }

  /* ─────────────────────────────────────
     LOAD MORE
     Django: fetch next page → append to allOrders
  ───────────────────────────────────── */
  function loadMore() {
    visibleCount += 4;
    _render();
  }

  /* ─────────────────────────────────────
     RENDER ORDER LIST
  ───────────────────────────────────── */
  function _render() {
    const list = document.getElementById('orderList');
    const btn  = document.getElementById('loadMoreBtn');
    if (!list) return;

    const filtered = activeFilter === 'all'
      ? allOrders
      : allOrders.filter(o => o.status === activeFilter);

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="text-center py-16">
          <i class="fa-solid fa-receipt text-5xl text-border mb-4 block"></i>
          <p class="font-playfair text-xl text-ink-mid/40">No orders found</p>
        </div>`;
      btn.classList.add('hidden');
      return;
    }

    const visible = filtered.slice(0, visibleCount);
    list.innerHTML = visible.map(o => _orderCard(o)).join('');
    btn.classList.toggle('hidden', visibleCount >= filtered.length);
  }

  /* ─────────────────────────────────────
     ORDER CARD TEMPLATE
  ───────────────────────────────────── */
  function _orderCard(o) {
    const idx         = allOrders.indexOf(o);
    const isDelivered = o.status === 'delivered';
    const isCancelled = o.status === 'cancelled';
    const rawTotal    = o.items.reduce((s, i) => s + i.price * i.qty, 0);

    const statusCls = isDelivered
      ? 'bg-green-50 text-green-700 border border-green-200'
      : isCancelled
        ? 'bg-red-pale text-red border border-red/20'
        : 'bg-yellow-50 text-yellow-700 border border-yellow-200';

    const stars = [1,2,3,4,5].map(i => `
      <button onclick="ORDERS.rateStar(${idx},${i})"
        class="star-btn text-[16px] transition-transform hover:scale-110 p-0.5"
        style="color:${i <= o.rating ? '#b8963e' : '#e8ddd8'}">
        <i class="fa-solid fa-star"></i>
      </button>`).join('');

    return `
      <div class="border border-border rounded-[16px] overflow-hidden hover:shadow-md transition-shadow bg-white">
        <div class="p-4 sm:p-5">
          <div class="flex items-start justify-between gap-3">

            <!-- Left: order info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <p class="font-bold text-ink text-sm font-mono">${o.id}</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[.1em] ${statusCls}">
                  ${o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                </span>
                <span class="text-[10px] text-ink-mid/40 font-semibold bg-cream px-2 py-0.5 rounded-full">${o.type}</span>
              </div>
              <p class="text-ink-mid/50 text-xs mb-2">
                <i class="fa-regular fa-calendar mr-1.5"></i>${o.date}
                <span class="mx-1.5 text-ink-mid/25">·</span>
                <i class="fa-regular fa-clock mr-1.5"></i>${o.time}
              </p>
              <p class="font-cormorant italic text-ink-mid/60 text-sm truncate">
                ${o.items.map(i => i.name).join(' · ')}
              </p>
            </div>

            <!-- Right: price + actions -->
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <p class="font-playfair text-lg font-black text-ink">$${rawTotal + o.tip}</p>
              <div class="flex gap-1.5">
                <button onclick="ORDERS.openInvoice(${idx})"
                  class="flex items-center gap-1.5 border border-border text-ink-mid/60 hover:border-gold hover:text-gold transition px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[.1em]">
                  <i class="fa-regular fa-file-lines text-[11px]"></i>
                  <span class="hidden sm:inline">Invoice</span>
                </button>
                ${!isCancelled ? `
                <button onclick="ORDERS.reorder(${idx})"
                  class="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[.1em] transition hover:opacity-88"
                  style="background:linear-gradient(135deg,#c0392b,#96281b)">
                  <i class="fa-solid fa-rotate-right text-[10px]"></i>
                  <span class="hidden sm:inline">Reorder</span>
                </button>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Rating bar (delivered only) -->
        ${isDelivered ? `
        <div class="border-t border-border px-5 py-3 bg-cream/40 flex items-center justify-between gap-4">
          <p class="text-xs text-ink-mid/40 font-cormorant italic">
            ${o.rating > 0 ? 'Your rating:' : 'Rate your experience'}
          </p>
          <div class="flex gap-0.5" id="stars-${idx}">${stars}</div>
        </div>` : ''}
      </div>`;
  }

  /* ─────────────────────────────────────
     STAR RATING
     Django: POST /api/orders/{id}/rate/  { rating: N }
  ───────────────────────────────────── */
  function rateStar(orderIdx, rating) {
    allOrders[orderIdx].rating = rating;

    const container = document.getElementById('stars-' + orderIdx);
    if (container) {
      container.querySelectorAll('.star-btn').forEach((btn, i) => {
        btn.style.color = i < rating ? '#b8963e' : '#e8ddd8';
      });
    }
    BASE.showToast('Thanks for your rating! ⭐');
    // Django: fetch(`/api/orders/${allOrders[orderIdx].id}/rate/`, { method:'POST', body:JSON.stringify({rating}), headers:{...} });
  }

  /* ─────────────────────────────────────
     REORDER
     Django: POST /api/orders/reorder/  { order_id: id }
  ───────────────────────────────────── */
  function reorder(orderIdx) {
    BASE.showToast('Reorder placed! 🎉');
    // Django: fetch('/api/orders/reorder/', { method:'POST', body:JSON.stringify({ order_id: allOrders[orderIdx].id }), headers:{...} });
  }

  /* ─────────────────────────────────────
     INVOICE — OPEN
  ───────────────────────────────────── */
  function openInvoice(idx) {
    activeInvIdx = idx;
    const o = allOrders[idx];
    const u = BASE.getUser();

    // Calculations
    const subtotal  = o.items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax       = +(subtotal * 0.08).toFixed(2);
    const discAmt   = o.discount > 0 ? +(subtotal * o.discount / 100).toFixed(2) : 0;
    const total     = +(subtotal + tax - discAmt + o.tip).toFixed(2);
    const ptsEarned = Math.round(total * 2);
    const dotColor  = o.status === 'delivered' ? '#4ade80'
                    : o.status === 'cancelled' ? '#f87171' : '#fbbf24';

    // Header
    _inv('invOrderId',    o.id);
    _inv('invStatusText', o.status.charAt(0).toUpperCase() + o.status.slice(1));
    _inv('invType',       o.type);
    _inv('invTable',      o.table !== '—' ? o.table : 'Takeout');
    document.getElementById('invStatusDot').style.background = dotColor;

    // Customer
    _inv('invCustomer',  u?.name  || 'John Doe');
    _inv('invEmail',     u?.email || 'john@example.com');
    _inv('invPayment',   o.payment);
    _inv('invTime',      o.date + ' · ' + o.time);
    _inv('invServedBy',  o.type === 'Takeout' ? 'Takeout Order' : 'Served by Chef Marco');

    const payStatusEl = document.getElementById('invPayStatus');
    payStatusEl.textContent = o.status === 'cancelled' ? 'Refunded' : 'Paid ✓';
    payStatusEl.className   = 'text-xs font-bold ' + (o.status === 'cancelled' ? 'text-red' : 'text-green-600');

    // Line items
    document.getElementById('invItems').innerHTML = o.items.map(item => `
      <div class="flex items-start justify-between gap-4 py-3.5 border-b border-border last:border-0">
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-cream flex items-center justify-center flex-shrink-0 mt-0.5">
            <i class="fa-solid fa-utensils text-ink-mid/30 text-xs"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-ink text-sm">${item.name}</p>
            ${item.note ? `<p class="text-[11px] font-cormorant italic text-ink-mid/50 mt-0.5">Note: ${item.note}</p>` : ''}
            <p class="text-[11px] text-ink-mid/40 mt-0.5">$${item.price} × ${item.qty}</p>
          </div>
        </div>
        <p class="font-playfair font-black text-ink text-sm flex-shrink-0 pt-0.5">$${item.price * item.qty}</p>
      </div>
    `).join('');

    // Totals
    _inv('invSubtotal', '$' + subtotal.toFixed(2));
    _inv('invTax',      '$' + tax.toFixed(2));
    _inv('invTotal',    '$' + total.toFixed(2));
    _inv('invPtsEarned','+ ' + ptsEarned + ' Loyalty Points Earned');

    const discRow = document.getElementById('invDiscountRow');
    if (discAmt > 0) {
      discRow.classList.remove('hidden');
      _inv('invDiscount',      '−$' + discAmt.toFixed(2));
      _inv('invDiscountLabel', `${u?.member || 'Gold'} Discount (${o.discount}%)`);
    } else {
      discRow.classList.add('hidden');
    }

    const tipRow = document.getElementById('invTipRow');
    tipRow.classList.toggle('hidden', o.tip <= 0);
    if (o.tip > 0) _inv('invTip', '$' + o.tip.toFixed(2));

    // Open modal
    document.getElementById('invoiceModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* ─────────────────────────────────────
     INVOICE — CLOSE
  ───────────────────────────────────── */
  function closeInvoice() {
    document.getElementById('invoiceModal').classList.remove('open');
    document.body.style.overflow = '';
    activeInvIdx = null;
  }

  /* ─────────────────────────────────────
     INVOICE — DOWNLOAD PDF
     Django: window.open(`/api/invoices/${order.id}/pdf/`, '_blank')
  ───────────────────────────────────── */
  function downloadInvoice() {
    BASE.showToast('Invoice downloaded! 📄');
    // const o = allOrders[activeInvIdx];
    // window.open(`/api/invoices/${o.id}/pdf/`, '_blank');
  }

  /* ─────────────────────────────────────
     HELPER
  ───────────────────────────────────── */
  function _inv(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ─────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────── */
  return {
    init, filter, loadMore,
    rateStar, reorder,
    openInvoice, closeInvoice, downloadInvoice,
  };

})();
