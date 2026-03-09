/* ═══════════════════════════════════════════════════
   CART STATE
   ═══════════════════════════════════════════════════ */
let cart = [];
let selectedPayment = null;   // tracks chosen payment method
let orderType = 'dine';       // 'dine' or 'take'

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty++; }
  else { cart.push({ name, price, qty: 1 }); }
  renderCart();
  showToast(name);
}

function addToCartById(id) {
  if (id === 'special') addToCart('Wagyu Tenderloin with Truffle Jus', 165);
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  renderCart();
}

function changeQtyCart(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
}


/* ═══════════════════════════════════════════════════
   PAYMENT METHOD HTML
   ═══════════════════════════════════════════════════ */
function paymentSectionHTML() {
  const isDine = orderType === 'dine';

  // Online methods always shown
  // Offline: "Pay at Table" only for dine-in, "Cash on Pickup" only for takeout
  return `
    <!-- Payment Method Section -->
    <div class="px-6 py-4 border-b border-borderSoft/50">

      <p class="text-[10px] uppercase tracking-[0.25em] font-bold text-textMid/40 mb-3
                 flex items-center gap-2">
        <i class="fa-solid fa-lock text-gold text-[9px]"></i> Payment Method
      </p>

      <!-- ── Tab: Online / Offline ── -->
      <div class="flex gap-1.5 p-1 bg-cream rounded-xl mb-4">
        <button id="payTabOnline"
          onclick="switchPayTab('online')"
          class="flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.1em]
                 transition-all bg-white text-textDark shadow-sm">
          <i class="fa-solid fa-wifi mr-1 text-[9px]"></i> Online
        </button>
        <button id="payTabOffline"
          onclick="switchPayTab('offline')"
          class="flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.1em]
                 transition-all text-textMid/50">
          <i class="fa-solid fa-store mr-1 text-[9px]"></i> Offline
        </button>
      </div>

      <!-- ── ONLINE METHODS ── -->
      <div id="payOnlineOptions">

        <!-- bKash -->
        <div class="pay-option ${selectedPayment === 'bkash' ? 'selected' : ''}"
             onclick="selectPayment('bkash')">
          <div class="pay-icon" style="background:#e2136e;">
            <span style="font-size:11px;font-weight:900;color:white;letter-spacing:-0.5px;">bK</span>
          </div>
          <div class="flex-1">
            <p class="pay-label">bKash</p>
            <p class="pay-sub">Mobile Banking · Instant</p>
          </div>
          ${selectedPayment === 'bkash' ? '<i class="fa-solid fa-circle-check text-redPrimary text-base flex-shrink-0"></i>' : '<div class="pay-radio"></div>'}
        </div>

        <!-- Nagad -->
        <div class="pay-option ${selectedPayment === 'nagad' ? 'selected' : ''}"
             onclick="selectPayment('nagad')">
          <div class="pay-icon" style="background:#f6821f;">
            <span style="font-size:10px;font-weight:900;color:white;">NG</span>
          </div>
          <div class="flex-1">
            <p class="pay-label">Nagad</p>
            <p class="pay-sub">Mobile Banking · Instant</p>
          </div>
          ${selectedPayment === 'nagad' ? '<i class="fa-solid fa-circle-check text-redPrimary text-base flex-shrink-0"></i>' : '<div class="pay-radio"></div>'}
        </div>

        <!-- Rocket -->
        <div class="pay-option ${selectedPayment === 'rocket' ? 'selected' : ''}"
             onclick="selectPayment('rocket')">
          <div class="pay-icon" style="background:#8c3494;">
            <span style="font-size:10px;font-weight:900;color:white;">RK</span>
          </div>
          <div class="flex-1">
            <p class="pay-label">Rocket</p>
            <p class="pay-sub">DBBL Mobile Banking</p>
          </div>
          ${selectedPayment === 'rocket' ? '<i class="fa-solid fa-circle-check text-redPrimary text-base flex-shrink-0"></i>' : '<div class="pay-radio"></div>'}
        </div>

        <!-- Visa / Mastercard -->
        <div class="pay-option ${selectedPayment === 'card' ? 'selected' : ''}"
             onclick="selectPayment('card')">
          <div class="pay-icon" style="background:#1a3a6b;">
            <i class="fa-regular fa-credit-card" style="color:white;font-size:13px;"></i>
          </div>
          <div class="flex-1">
            <p class="pay-label">Debit / Credit Card</p>
            <p class="pay-sub" style="display:flex;align-items:center;gap:5px;">
              <span style="background:#1a3a6b;color:white;font-size:7px;font-weight:900;font-style:italic;padding:1px 4px;border-radius:3px;">VISA</span>
              <span style="background:linear-gradient(90deg,#eb001b,#f79e1b);color:white;font-size:7px;font-weight:900;padding:1px 4px;border-radius:3px;">MC</span>
              <span style="background:#007bca;color:white;font-size:7px;font-weight:900;padding:1px 4px;border-radius:3px;">AMEX</span>
              <span style="background:#00579f;color:white;font-size:7px;font-weight:900;padding:1px 4px;border-radius:3px;">NEXUS</span>
            </p>
          </div>
          ${selectedPayment === 'card' ? '<i class="fa-solid fa-circle-check text-redPrimary text-base flex-shrink-0"></i>' : '<div class="pay-radio"></div>'}
        </div>

        <!-- Card input (shows when card selected) -->
        ${selectedPayment === 'card' ? `
        <div class="mt-3 space-y-2.5 animate-fade">
          <div>
            <label class="pay-form-label">Card Number</label>
            <input type="text" placeholder="1234  5678  9012  3456" maxlength="19"
              class="pay-form-input" oninput="fmtCard(this)"/>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>
              <label class="pay-form-label">Expiry</label>
              <input type="text" placeholder="MM / YY" maxlength="7"
                class="pay-form-input" oninput="fmtExp(this)"/>
            </div>
            <div>
              <label class="pay-form-label">CVV</label>
              <input type="password" placeholder="•••" maxlength="4"
                class="pay-form-input"/>
            </div>
          </div>
          <input type="text" placeholder="Cardholder Name"
            class="pay-form-input" style="text-transform:uppercase;"/>
        </div>` : ''}

        <!-- bKash number input -->
        ${selectedPayment === 'bkash' ? `
        <div class="mt-3 animate-fade">
          <label class="pay-form-label">bKash Number</label>
          <div style="display:flex;align-items:center;gap:0;background:#faf7f4;border:1.5px solid #e8ddd8;border-radius:12px;overflow:hidden;">
            <span style="padding:12px 12px;font-size:12px;font-weight:700;color:#e2136e;border-right:1px solid #e8ddd8;background:rgba(226,19,110,0.06);">+880</span>
            <input type="tel" placeholder="01XXXXXXXXX" maxlength="11"
              style="flex:1;background:transparent;border:none;outline:none;padding:12px 14px;font-family:'Jost',sans-serif;font-size:14px;color:#1a1210;"/>
          </div>
          <p style="font-size:10px;color:#9b8c86;margin-top:6px;display:flex;align-items:center;gap:5px;">
            <i class="fa-solid fa-circle-info" style="color:#b8963e;font-size:9px;"></i>
            A payment request will be sent to your bKash app
          </p>
        </div>` : ''}

        <!-- Nagad number input -->
        ${selectedPayment === 'nagad' ? `
        <div class="mt-3 animate-fade">
          <label class="pay-form-label">Nagad Number</label>
          <div style="display:flex;align-items:center;gap:0;background:#faf7f4;border:1.5px solid #e8ddd8;border-radius:12px;overflow:hidden;">
            <span style="padding:12px 12px;font-size:12px;font-weight:700;color:#f6821f;border-right:1px solid #e8ddd8;background:rgba(246,130,31,0.06);">+880</span>
            <input type="tel" placeholder="01XXXXXXXXX" maxlength="11"
              style="flex:1;background:transparent;border:none;outline:none;padding:12px 14px;font-family:'Jost',sans-serif;font-size:14px;color:#1a1210;"/>
          </div>
          <p style="font-size:10px;color:#9b8c86;margin-top:6px;display:flex;align-items:center;gap:5px;">
            <i class="fa-solid fa-circle-info" style="color:#b8963e;font-size:9px;"></i>
            A payment request will be sent to your Nagad app
          </p>
        </div>` : ''}

        <!-- Rocket number input -->
        ${selectedPayment === 'rocket' ? `
        <div class="mt-3 animate-fade">
          <label class="pay-form-label">Rocket Number</label>
          <div style="display:flex;align-items:center;gap:0;background:#faf7f4;border:1.5px solid #e8ddd8;border-radius:12px;overflow:hidden;">
            <span style="padding:12px 12px;font-size:12px;font-weight:700;color:#8c3494;border-right:1px solid #e8ddd8;background:rgba(140,52,148,0.06);">+880</span>
            <input type="tel" placeholder="01XXXXXXXXX" maxlength="11"
              style="flex:1;background:transparent;border:none;outline:none;padding:12px 14px;font-family:'Jost',sans-serif;font-size:14px;color:#1a1210;"/>
          </div>
        </div>` : ''}

      </div>

      <!-- ── OFFLINE METHODS ── -->
      <div id="payOfflineOptions" style="display:none;">

        ${isDine ? `
        <!-- Pay at Table -->
        <div class="pay-option ${selectedPayment === 'table' ? 'selected' : ''}"
             onclick="selectPayment('table')">
          <div class="pay-icon" style="background:linear-gradient(135deg,#1a1210,#2d1a14);">
            <i class="fa-solid fa-receipt" style="color:#b8963e;font-size:13px;"></i>
          </div>
          <div class="flex-1">
            <p class="pay-label">Pay at Table</p>
            <p class="pay-sub">Cash or Card · After dining</p>
          </div>
          ${selectedPayment === 'table' ? '<i class="fa-solid fa-circle-check text-redPrimary text-base flex-shrink-0"></i>' : '<div class="pay-radio"></div>'}
        </div>
        ` : ''}

        <!-- Cash on Pickup (takeout) -->
        <div class="pay-option ${selectedPayment === 'cash' ? 'selected' : ''}"
             onclick="selectPayment('cash')">
          <div class="pay-icon" style="background:#2d7a47;">
            <i class="fa-solid fa-money-bill-wave" style="color:white;font-size:12px;"></i>
          </div>
          <div class="flex-1">
            <p class="pay-label">${isDine ? 'Pay in Cash' : 'Cash on Pickup'}</p>
            <p class="pay-sub">${isDine ? 'BDT Cash · At the counter' : 'Pay when you collect'}</p>
          </div>
          ${selectedPayment === 'cash' ? '<i class="fa-solid fa-circle-check text-redPrimary text-base flex-shrink-0"></i>' : '<div class="pay-radio"></div>'}
        </div>

      </div>

      <!-- Security note -->
      <div style="display:flex;align-items:center;gap:7px;margin-top:12px;padding:9px 11px;
                  background:#faf7f4;border:1px solid #e8ddd8;border-radius:10px;">
        <i class="fa-solid fa-shield-halved" style="color:#b8963e;font-size:11px;flex-shrink:0;"></i>
        <p style="font-size:10px;color:#9b8c86;line-height:1.4;">
          256-bit SSL encrypted. Your payment details are safe.
        </p>
      </div>

    </div>
  `;
}

/* Tab switch: Online ↔ Offline */
function switchPayTab(tab) {
  const onlineOpts  = document.getElementById('payOnlineOptions');
  const offlineOpts = document.getElementById('payOfflineOptions');
  const tabOnline   = document.getElementById('payTabOnline');
  const tabOffline  = document.getElementById('payTabOffline');
  if (!onlineOpts) return;

  if (tab === 'online') {
    onlineOpts.style.display  = 'block';
    offlineOpts.style.display = 'none';
    tabOnline.classList.add('bg-white','text-textDark','shadow-sm');
    tabOnline.classList.remove('text-textMid/50');
    tabOffline.classList.remove('bg-white','text-textDark','shadow-sm');
    tabOffline.classList.add('text-textMid/50');
    // clear offline selections
    if (['table','cash'].includes(selectedPayment)) { selectedPayment = null; updateConfirmBtn(); }
  } else {
    onlineOpts.style.display  = 'none';
    offlineOpts.style.display = 'block';
    tabOffline.classList.add('bg-white','text-textDark','shadow-sm');
    tabOffline.classList.remove('text-textMid/50');
    tabOnline.classList.remove('bg-white','text-textDark','shadow-sm');
    tabOnline.classList.add('text-textMid/50');
    // clear online selections
    if (['bkash','nagad','rocket','card'].includes(selectedPayment)) { selectedPayment = null; updateConfirmBtn(); }
  }
}

/* Select a payment method */
function selectPayment(method) {
  selectedPayment = method;
  renderCart();          // re-render to show input fields & checkmarks
  updateConfirmBtn();
  // restore tab state after re-render
  if (['table','cash'].includes(method)) {
    setTimeout(() => switchPayTab('offline'), 0);
  } else {
    setTimeout(() => switchPayTab('online'), 0);
  }
}

/* Enable/disable confirm button */
function updateConfirmBtn() {
  const btn = document.getElementById('cartConfirmBtn');
  if (!btn) return;
  const hasItems = cart.length > 0;
  const hasPay   = !!selectedPayment;
  if (hasItems && hasPay) {
    btn.disabled = false;
    btn.classList.remove('opacity-50','cursor-not-allowed');
    btn.innerHTML = `<i class="fa-solid fa-lock text-[10px]"></i> Confirm & Place Order`;
  } else if (hasItems && !hasPay) {
    btn.disabled = true;
    btn.classList.add('opacity-50','cursor-not-allowed');
    btn.innerHTML = `<i class="fa-solid fa-credit-card text-[10px]"></i> Select Payment to Continue`;
  } else {
    btn.disabled = true;
    btn.classList.add('opacity-50','cursor-not-allowed');
    btn.innerHTML = `<i class="fa-solid fa-lock text-[10px]"></i> Confirm & Place Order`;
  }
}

/* Card number formatter */
function fmtCard(input) {
  let v = input.value.replace(/\D/g,'').substring(0,16);
  input.value = v.replace(/(.{4})/g,'$1  ').trim();
}

/* Expiry formatter */
function fmtExp(input) {
  let v = input.value.replace(/\D/g,'').substring(0,4);
  if (v.length >= 3) v = v.substring(0,2) + ' / ' + v.substring(2);
  input.value = v;
}


/* ═══════════════════════════════════════════════════
   RENDER CART
   ═══════════════════════════════════════════════════ */
function renderCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);

  /* ── Badges ── */
  const badge  = document.getElementById('cartBadge');
  const mbadge = document.getElementById('mobileBadge');
  if (badge)  { badge.textContent  = totalItems; badge.style.display  = totalItems > 0 ? 'flex' : 'none'; }
  if (mbadge) { mbadge.textContent = totalItems; mbadge.style.display = totalItems > 0 ? 'flex' : 'none'; }

  const itemCountBadge = document.getElementById('itemCountBadge');
  if (itemCountBadge) itemCountBadge.textContent = totalItems + ' item' + (totalItems !== 1 ? 's' : '');

  /* ── DOM refs ── */
  const empty       = document.getElementById('cartEmpty');
  const upsell      = document.getElementById('cartUpsell');
  const note        = document.getElementById('cartNote');
  const meta        = document.getElementById('cartMeta');
  const payment     = document.getElementById('cartPayment');
  const confirmBtn  = document.getElementById('cartConfirmBtn');
  const container   = document.getElementById('cartItemsContainer');
  const totalsBlock = document.getElementById('cartTotalsBlock');
  const cartBody    = document.getElementById('cartBody');
  const cartTotals  = document.getElementById('cartTotals');
  const cartFooter  = document.getElementById('cartFooter');

  /* ── Empty state ── */
  if (cart.length === 0) {
    if (empty)      empty.style.display = 'block';
    if (upsell)     upsell.classList.add('hidden');
    if (note)       note.classList.add('hidden');
    if (meta)       meta.classList.add('hidden');
    if (payment)    payment.classList.add('hidden');
    if (container)  container.innerHTML = '';
    if (totalsBlock) totalsBlock.innerHTML = '';
    if (cartBody)   cartBody.innerHTML = _emptyCartHTML();
    if (cartTotals) cartTotals.innerHTML = '';
    if (cartFooter) {
      // hide payment section from footer when empty
      const paySection = document.getElementById('cartPaymentSection');
      if (paySection) paySection.style.display = 'none';
    }
    updateConfirmBtn();
    return;
  }

  /* ── Has items ── */
  if (empty)   empty.style.display = 'none';
  if (upsell)  upsell.classList.remove('hidden');
  if (note)    note.classList.remove('hidden');
  if (meta)    meta.classList.remove('hidden');
  if (payment) { payment.style.display = 'flex'; payment.classList.remove('hidden'); }

  const itemsHTML = cart.map((item, idx) => `
    <div class="px-6 py-4 border-b border-borderSoft/50">
      <div class="flex gap-4">
        <div class="w-[68px] h-[68px] rounded-2xl flex-shrink-0 bg-cream overflow-hidden border border-borderSoft">
          <img src="./assests/thai.png" alt="${item.name}" class="w-full h-full object-cover"/>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-playfair font-bold text-textDark text-[14px] leading-tight">${item.name}</p>
              <p class="text-[10px] text-textMid/50 mt-0.5 font-cormorant italic">$${item.price.toFixed(2)} each</p>
            </div>
            <button class="text-textMid/25 hover:text-redPrimary transition ml-2 flex-shrink-0"
                    onclick="removeFromCart(${idx})">
              <i class="fa-solid fa-trash-can text-[11px]"></i>
            </button>
          </div>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center border border-borderSoft rounded-xl overflow-hidden">
              <button class="w-8 h-8 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center"
                      onclick="changeQtyCart(${idx},-1)">−</button>
              <span class="w-8 text-center text-sm font-bold text-textDark">${item.qty}</span>
              <button class="w-8 h-8 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center"
                      onclick="changeQtyCart(${idx},1)">+</button>
            </div>
            <span class="font-playfair font-bold text-textDark text-base">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  /* Inject items */
  if (container) container.innerHTML = itemsHTML;
  if (cartBody)  cartBody.innerHTML  = itemsHTML;

  /* ── Inject payment section ──
     For menu.html the scrollable body is cartBody.
     We append payment HTML after items.                */
  if (cartBody) {
    cartBody.innerHTML += paymentSectionHTML();
  }
  /* For index.html, payment goes inside cartScrollBody after items */
  const scrollBody = document.getElementById('cartScrollBody');
  if (scrollBody) {
    let ps = document.getElementById('cartPaymentSection');
    if (!ps) {
      ps = document.createElement('div');
      ps.id = 'cartPaymentSection';
      scrollBody.appendChild(ps);
    }
    ps.innerHTML = paymentSectionHTML();
  }

  /* ── Totals ── */
  const service    = subtotal * 0.10;
  const tax        = subtotal * 0.08875;
  const grandTotal = subtotal + service + tax;

  const totalsHTML = `
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Service charge (10%)</span>
      <span>$${service.toFixed(2)}</span>
    </div>
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Tax (8.875%)</span>
      <span>$${tax.toFixed(2)}</span>
    </div>
    <div class="border-t border-borderSoft pt-2.5 mt-1 flex justify-between items-center">
      <span class="font-playfair text-base font-black text-textDark">Total</span>
      <span class="font-playfair text-xl font-black text-textDark">$${grandTotal.toFixed(2)}</span>
    </div>
  `;

  if (totalsBlock) totalsBlock.innerHTML = totalsHTML;
  if (cartTotals)  cartTotals.innerHTML  = totalsHTML;

  updateConfirmBtn();
}

function _emptyCartHTML() {
  return `
    <div class="text-center py-16">
      <div class="text-6xl mb-4">🛒</div>
      <p class="font-playfair text-xl font-bold text-textDark mb-2">Your cart is empty</p>
      <p class="font-cormorant italic text-textMid/60">Add dishes from the menu to get started</p>
    </div>`;
}


/* ═══════════════════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════════════════ */
function showToast(name) {
  const existing = document.getElementById('savoriaToast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'savoriaToast';
  t.style.cssText = [
    'position:fixed','bottom:96px','left:50%','transform:translateX(-50%)',
    'z-index:2000','background:#1a1210','color:white',
    'padding:11px 20px','border-radius:100px',
    'font-size:12px','font-weight:600',
    'display:flex','align-items:center','gap:8px',
    'box-shadow:0 8px 30px rgba(0,0,0,0.25)',
    'white-space:nowrap','font-family:Jost,sans-serif'
  ].join(';');
  t.innerHTML = `<i class="fa-solid fa-check" style="color:#b8963e;font-size:10px"></i>
                 <strong style="font-family:Playfair Display,serif">${name}</strong>&nbsp;added to order`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.3s';
    t.style.opacity    = '0';
    setTimeout(() => t.remove(), 300);
  }, 2200);
}


/* ═══════════════════════════════════════════════════
   CART PANEL TOGGLE
   ═══════════════════════════════════════════════════ */
function toggleCart() {
  const modal    = document.getElementById('cartModal');
  const panel    = document.getElementById('cartPanel');
  const backdrop = document.getElementById('cartBackdrop');
  const overlay  = document.getElementById('overlay');
  const isMobile = window.innerWidth < 768;
  const isOpen   = modal.dataset.open === 'true';

  if (isOpen) {
    panel.style.transform = isMobile ? 'translateY(100%)' : 'translateX(100%)';
    if (backdrop) backdrop.style.opacity = '0';
    if (overlay)  { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
    modal.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    modal.dataset.open = 'false';
  } else {
    modal.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';
    if (!isMobile) panel.style.transform = 'translateX(100%)';
    requestAnimationFrame(() => {
      panel.style.transform = isMobile ? 'translateY(0%)' : 'translateX(0%)';
    });
    if (backdrop) backdrop.style.opacity = '1';
    if (overlay)  { overlay.style.opacity = '1'; overlay.style.pointerEvents = 'all'; }
    modal.dataset.open = 'true';
  }
}

function closeAll() {
  if (document.getElementById('cartModal')?.dataset.open === 'true') toggleCart();
  const m = document.getElementById('mobileMenu');
  if (m && !m.classList.contains('hidden')) toggleMenu();
}


/* ═══════════════════════════════════════════════════
   ORDER TYPE (Dine In / Takeout)
   ═══════════════════════════════════════════════════ */
function setOrderType(type) {
  orderType = type;
  const dineBtn  = document.getElementById('dineBtn');
  const takeBtn  = document.getElementById('takeBtn');
  const subtitle = document.getElementById('cartSubtitle');
  if (!dineBtn || !takeBtn) return;

  if (type === 'dine') {
    dineBtn.classList.add('bg-white','text-textDark','shadow-sm');
    dineBtn.classList.remove('text-textMid/50');
    takeBtn.classList.remove('bg-white','text-textDark','shadow-sm');
    takeBtn.classList.add('text-textMid/50');
    if (subtitle) subtitle.textContent = 'Table 7 · Dine In';
  } else {
    takeBtn.classList.add('bg-white','text-textDark','shadow-sm');
    takeBtn.classList.remove('text-textMid/50');
    dineBtn.classList.remove('bg-white','text-textDark','shadow-sm');
    dineBtn.classList.add('text-textMid/50');
    if (subtitle) subtitle.textContent = 'Takeout · Pickup';
  }

  // reset payment when switching order type
  selectedPayment = null;
  renderCart();
}


/* ═══════════════════════════════════════════════════
   MOBILE MENU TOGGLE
   ═══════════════════════════════════════════════════ */
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  if (!m) return;
  if (m.classList.contains('hidden')) {
    m.classList.remove('hidden');
    m.style.display = 'flex';
    requestAnimationFrame(() => m.style.transform = 'translateX(0)');
  } else {
    m.style.transform = 'translateX(100%)';
    setTimeout(() => { m.classList.add('hidden'); m.style.display = ''; }, 500);
  }
}


/* ═══════════════════════════════════════════════════
   MOBILE NAV — SET ACTIVE
   ═══════════════════════════════════════════════════ */
function setActive(el) {
  document.querySelectorAll('.mobile-bottom-nav .nav-item')
    .forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}


/* ═══════════════════════════════════════════════════
   CATEGORY PILLS
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
});


/* ═══════════════════════════════════════════════════
   NAVBAR SCROLL
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(255,255,255,0.98)';
      navbar.style.boxShadow  = '0 2px 20px rgba(0,0,0,0.06)';
    } else {
      navbar.style.background = 'rgba(255,255,255,0)';
      navbar.style.boxShadow  = 'none';
    }
  });
});


/* ═══════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  reveals.forEach(r => observer.observe(r));
});


/* ═══════════════════════════════════════════════════
   MENU FILTER & SEARCH  (menu.html specific)
   ═══════════════════════════════════════════════════ */
function filterMenu(cat, btn) {
  // update active tab
  document.querySelectorAll('.filter-tab, .m-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.menu-section').forEach(sec => {
    if (cat === 'all' || sec.dataset.category === cat) {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });
}

let searchTimeout;
function handleSearch(val) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = val.toLowerCase().trim();
    const bar = document.getElementById('searchResultBar');
    const clear = document.getElementById('s-clear') || document.querySelector('.s-clear');

    if (!q) { clearSearch(); return; }

    let count = 0;
    document.querySelectorAll('.menu-card').forEach(card => {
      const text = (card.dataset.search || '') + ' ' + card.innerText;
      const match = text.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
      if (match) count++;
    });

    // show/hide sections based on visible cards
    document.querySelectorAll('.menu-section').forEach(sec => {
      const visibleCards = sec.querySelectorAll('.menu-card:not([style*="display: none"])');
      sec.style.display = visibleCards.length > 0 ? 'block' : 'none';
    });

    const noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = count === 0 ? 'flex' : 'none';

    if (bar) {
      bar.style.display = 'flex';
      const txt = document.getElementById('searchResultText');
      if (txt) txt.textContent = `${count} result${count !== 1 ? 's' : ''} for "${val}"`;
    }

    // sync both search inputs
    const deskSearch = document.getElementById('deskSearch');
    const mobSearch  = document.getElementById('mobSearch');
    if (deskSearch && deskSearch.value !== val) deskSearch.value = val;
    if (mobSearch  && mobSearch.value  !== val) mobSearch.value  = val;
  }, 220);
}

function clearSearch() {
  ['deskSearch','mobSearch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.menu-card').forEach(c => c.style.display = '');
  document.querySelectorAll('.menu-section').forEach(s => s.style.display = 'block');
  const noResults = document.getElementById('noResults');
  if (noResults) noResults.style.display = 'none';
  const bar = document.getElementById('searchResultBar');
  if (bar) bar.style.display = 'none';
}

function sortMenu(val) {
  document.querySelectorAll('.menu-section').forEach(sec => {
    const grid = sec.querySelector('.grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.menu-card')];
    cards.sort((a, b) => {
      if (val === 'price-asc')  return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
      if (val === 'price-desc') return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
      if (val === 'rating')     return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
      return 0;
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

function toggleMobSearch() {
  const bar = document.getElementById('mobSearchBar');
  if (!bar) return;
  const isOpen = bar.classList.contains('open');
  bar.classList.toggle('open', !isOpen);
  if (!isOpen) setTimeout(() => document.getElementById('mobSearch')?.focus(), 200);
}

/* Quick view modal */
function openQuick(card) {
  const modal = document.getElementById('quickModal');
  const panel = document.getElementById('quickPanel');
  if (!modal || !panel) return;
  const name  = card.querySelector('.font-playfair')?.textContent || 'Dish';
  const desc  = card.querySelector('.font-cormorant')?.textContent || '';
  const price = card.dataset.price || '0';
  const img   = card.querySelector('img')?.src || '';
  const rating= card.dataset.rating || '4.8';

  panel.innerHTML = `
    <button onclick="closeQuick()" style="position:absolute;top:16px;right:16px;z-index:10;
      width:32px;height:32px;border-radius:50%;background:white;border:1px solid #e8ddd8;
      display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:#4a3830;">✕</button>
    <div style="height:220px;overflow:hidden;background:#f5f0eb;">
      <img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:cover;"/>
    </div>
    <div style="padding:24px;">
      <div style="display:flex;align-items:start;justify-content:space-between;gap:12px;margin-bottom:8px;">
        <h2 style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#1a1210;line-height:1.2;">${name}</h2>
        <div style="background:rgba(184,150,62,.12);border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;color:#b8963e;display:flex;align-items:center;gap:4px;flex-shrink:0;">
          ★ ${rating}
        </div>
      </div>
      <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;color:#7a6a60;margin-bottom:20px;">${desc}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:#1a1210;">$${price}</span>
        <button onclick="addToCart('${name}', ${price}); closeQuick();"
          style="background:linear-gradient(135deg,#c0392b,#96281b);color:white;padding:12px 24px;
                 border-radius:10px;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;
                 border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-plus" style="font-size:9px;"></i> Add to Order
        </button>
      </div>
    </div>`;

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.style.opacity = '1');
}

function closeQuick() {
  const modal = document.getElementById('quickModal');
  if (modal) { modal.style.opacity = '0'; setTimeout(() => modal.style.display = 'none', 250); }
}


/* ═══════════════════════════════════════════════════
   TOUCH MOMENTUM SCROLL
   ═══════════════════════════════════════════════════ */
function initMomentumScroll(el) {
  if (!el) return;
  let isDown = false, startX = 0, scrollStart = 0, velX = 0, lastX = 0, momentum;
  el.addEventListener('touchstart', e => {
    isDown = true; startX = e.touches[0].clientX;
    scrollStart = el.scrollLeft; velX = 0;
    cancelAnimationFrame(momentum);
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    if (!isDown) return;
    const x = e.touches[0].clientX;
    velX = x - lastX; lastX = x;
    el.scrollLeft = scrollStart - (x - startX);
  }, { passive: true });
  el.addEventListener('touchend', () => {
    isDown = false;
    let v = -velX * 1.5;
    function glide() {
      if (Math.abs(v) < 0.5) return;
      el.scrollLeft += v; v *= 0.92;
      momentum = requestAnimationFrame(glide);
    }
    glide();
  });
}


/* ═══════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initMomentumScroll(document.getElementById('dishScroll'));
});