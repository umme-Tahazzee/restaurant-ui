/* ═══════════════════════════════════════════════════════════════
   SAVORIA APP  —  Unified Application JavaScript
   Replaces: main.js  +  cart.js
   Features:  Cart (localStorage), Nav, Toast, Wishlist, Back-to-Top
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Tiny DOM helpers ─── */
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ─────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────── */
function formatPrice(n) {
  return '$' + parseFloat(n).toFixed(2);
}

/* ─────────────────────────────────────────────────
   WISHLIST  (localStorage persisted)
───────────────────────────────────────────────── */
let wishlist = JSON.parse(localStorage.getItem('savoria_wishlist') || '[]');

function saveWishlist() {
  localStorage.setItem('savoria_wishlist', JSON.stringify(wishlist));
}

function toggleWishlist(name, btn) {
  if (wishlist.includes(name)) {
    wishlist = wishlist.filter(w => w !== name);
    if (btn) { btn.classList.remove('liked'); btn.title = 'Add to wishlist'; }
    showToast(name + ' removed from wishlist', '♡');
  } else {
    wishlist.push(name);
    if (btn) { btn.classList.add('liked'); btn.title = 'Remove from wishlist'; }
    showToast(name + ' saved to wishlist', '♥');
  }
  saveWishlist();
  syncWishlistButtons();
}

function syncWishlistButtons() {
  $$('[data-wish]').forEach(btn => {
    const name = btn.dataset.wish;
    btn.classList.toggle('liked', wishlist.includes(name));
  });
}

/* ─────────────────────────────────────────────────
   CART STATE  (localStorage persisted)
───────────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('savoria_cart') || '[]');

function saveCart() {
  localStorage.setItem('savoria_cart', JSON.stringify(cart));
}

function addToCart(name, price, img) {
  price = parseFloat(price);
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1, img: img || 'assets/thai.png' });
  }
  saveCart();
  renderCart();
  showToast(name + ' added to order');
}

/* Convenience: add by a pre-defined item ID (e.g. Chef's Special) */
function addToCartById(id) {
  const ITEMS = {
    special: { name: 'Wagyu Tenderloin with Truffle Jus', price: 165, img: 'assets/thai.png' }
  };
  const item = ITEMS[id];
  if (item) addToCart(item.name, item.price, item.img);
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function changeQtyCart(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

/* ─────────────────────────────────────────────────
   ORDER TYPE  (Dine In / Takeout)
───────────────────────────────────────────────── */
function setOrderType(type) {
  const dineBtn  = $('dineBtn');
  const takeBtn  = $('takeBtn');
  const subtitle = $('cartSubtitle');
  if (!dineBtn || !takeBtn) return;

  const activeClass   = ['bg-white', 'text-textDark', 'shadow-sm'];
  const inactiveClass = ['text-textMid/50'];

  if (type === 'dine') {
    dineBtn.classList.add(...activeClass);
    dineBtn.classList.remove(...inactiveClass);
    takeBtn.classList.remove(...activeClass);
    takeBtn.classList.add(...inactiveClass);
    if (subtitle) subtitle.textContent = 'Table 7 · Dine In';
  } else {
    takeBtn.classList.add(...activeClass);
    takeBtn.classList.remove(...inactiveClass);
    dineBtn.classList.remove(...activeClass);
    dineBtn.classList.add(...inactiveClass);
    if (subtitle) subtitle.textContent = 'Takeout · Pickup';
  }
}

/* ─────────────────────────────────────────────────
   CART RENDER
───────────────────────────────────────────────── */
function renderCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);

  /* ── Cart badges ── */
  ['cartBadge', 'mobileBadge'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'flex' : 'none';
  });

  const itemCountBadge = $('itemCountBadge');
  if (itemCountBadge) {
    itemCountBadge.textContent = totalItems + ' item' + (totalItems !== 1 ? 's' : '');
  }

  /* ── Full cart elements (index.html / about.html style) ── */
  const empty      = $('cartEmpty');
  const upsell     = $('cartUpsell');
  const note       = $('cartNote');
  const meta       = $('cartMeta');
  const payment    = $('cartPayment');
  const confirmBtn = $('cartConfirmBtn');
  const container  = $('cartItemsContainer');
  const totalsBlock = $('cartTotalsBlock');

  /* ── Simple cart elements (menu.html style) ── */
  const cartBody   = $('cartBody');
  const cartTotals = $('cartTotals');

  if (cart.length === 0) {
    if (empty)       empty.style.display = 'block';
    if (upsell)      upsell.classList.add('hidden');
    if (note)        note.classList.add('hidden');
    if (meta)        meta.classList.add('hidden');
    if (payment)     payment.classList.add('hidden');
    if (confirmBtn)  { confirmBtn.disabled = true; confirmBtn.classList.add('opacity-50', 'cursor-not-allowed'); }
    if (container)   container.innerHTML = '';
    if (totalsBlock) totalsBlock.innerHTML = '';
    if (cartBody)    cartBody.innerHTML = _emptyCartHTML();
    if (cartTotals)  cartTotals.innerHTML = '';
    syncMenuCounters();
    return;
  }

  /* ── Has items ── */
  if (empty)     empty.style.display = 'none';
  if (upsell)    upsell.classList.remove('hidden');
  if (note)      note.classList.remove('hidden');
  if (meta)      meta.classList.remove('hidden');
  if (payment)   { payment.style.display = 'flex'; payment.classList.remove('hidden'); }
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  const itemsHTML = cart.map((item, idx) => `
    <div class="px-6 py-4 border-b border-borderSoft/50 sv-cart-item">
      <div class="flex gap-4">
        <div class="w-[68px] h-[68px] rounded-2xl flex-shrink-0 bg-cream overflow-hidden border border-borderSoft">
          <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy"/>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-playfair font-bold text-textDark text-[14px] leading-tight">${item.name}</p>
              <p class="text-[10px] text-textMid/50 mt-0.5 font-cormorant italic">${formatPrice(item.price)} each</p>
            </div>
            <button class="text-textMid/25 hover:text-redPrimary transition ml-2 flex-shrink-0 p-1"
                    onclick="removeFromCart(${idx})" aria-label="Remove ${item.name}">
              <i class="fa-solid fa-trash-can text-[11px]"></i>
            </button>
          </div>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center border border-borderSoft rounded-xl overflow-hidden">
              <button class="w-8 h-8 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center"
                      onclick="changeQtyCart(${idx},-1)" aria-label="Decrease">−</button>
              <span class="w-8 text-center text-sm font-bold text-textDark">${item.qty}</span>
              <button class="w-8 h-8 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center"
                      onclick="changeQtyCart(${idx},1)" aria-label="Increase">+</button>
            </div>
            <span class="font-playfair font-bold text-textDark text-base">${formatPrice(item.price * item.qty)}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if (container) container.innerHTML = itemsHTML;
  if (cartBody)  cartBody.innerHTML  = itemsHTML;

  /* ── Totals ── */
  const service    = subtotal * 0.10;
  const tax        = subtotal * 0.08875;
  const grandTotal = subtotal + service + tax;

  const totalsHTML = `
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})</span>
      <span>${formatPrice(subtotal)}</span>
    </div>
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Service charge (10%)</span>
      <span>${formatPrice(service)}</span>
    </div>
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Tax (8.875%)</span>
      <span>${formatPrice(tax)}</span>
    </div>
    <div class="border-t border-borderSoft pt-2.5 mt-1 flex justify-between items-center">
      <span class="font-playfair text-base font-black text-textDark">Total</span>
      <span class="font-playfair text-xl font-black text-textDark">${formatPrice(grandTotal)}</span>
    </div>
  `;

  if (totalsBlock) totalsBlock.innerHTML = totalsHTML;
  if (cartTotals)  cartTotals.innerHTML  = totalsHTML;

  syncMenuCounters();
}


function syncMenuCounters() {
 
  document.querySelectorAll('.cart-counter[data-item-name]').forEach(counter => {
    const itemName = counter.getAttribute('data-item-name');
    const cartItem = cart.find(i => i.name === itemName);

   
    const btnId = counter.id.replace('cart-', 'btn-');
    const btn   = document.getElementById(btnId);
    const qtyEl = counter.querySelector('.qty');

    if (cartItem) {
      
      counter.classList.remove('hidden');
      if (qtyEl) qtyEl.textContent = cartItem.qty;
      if (btn)   btn.classList.add('hidden');
    } else {
     
      counter.classList.add('hidden');
      if (btn) btn.classList.remove('hidden');
    }
  });
}

function _emptyCartHTML() {
  return `
    <div class="text-center py-16 px-6">
      <div class="text-6xl mb-4">🛒</div>
      <p class="font-playfair text-xl font-bold text-textDark mb-2">Your cart is empty</p>
      <p class="font-cormorant italic text-textMid/60">Add dishes from the menu to get started</p>
      <a href="menu.html" onclick="toggleCart()"
         class="mt-4 inline-block book-btn text-white px-6 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em]">
        Browse Menu
      </a>
    </div>`;
}

/* ─────────────────────────────────────────────────
   PAYMENT MODAL
───────────────────────────────────────────────── */

/* placeOrder → opens payment modal */
function placeOrder() {
  const cartModal = $('cartModal');
  if (!cartModal || cart.length === 0) return;

  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const service    = subtotal * 0.10;
  const tax        = subtotal * 0.08875;
  const grandTotal = subtotal + service + tax;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  /* Close cart panel first */
  if (cartModal.dataset.open === 'true') toggleCart();

  /* Remove any existing payment overlay */
  const existing = $('svPayOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'svPayOverlay';
  overlay.className = 'sv-pay-overlay';
  overlay.innerHTML = `
    <div class="sv-pay-card">
      <!-- Header -->
      <div class="sv-pay-header">
        <div class="sv-pay-header-left">
          <div class="sv-pay-header-icon"><i class="fa-solid fa-lock"></i></div>
          <div>
            <h3>Secure Payment</h3>
            <p>256-bit SSL encrypted checkout</p>
          </div>
        </div>
        <button class="sv-pay-close" onclick="closePayModal()" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <!-- Summary strip -->
      <div class="sv-pay-summary">
        <div>
          <div class="sv-pay-summary-label">Order Total</div>
          <div class="sv-pay-summary-items">${totalItems} item${totalItems !== 1 ? 's' : ''} · incl. tax &amp; service</div>
        </div>
        <div class="sv-pay-summary-total">${formatPrice(grandTotal)}</div>
      </div>

      <!-- Payment method tabs -->
      <div class="sv-pay-methods">
        <button class="sv-pay-method active" onclick="switchPayMethod('card', this)" id="pmCard">
          <i class="fa-regular fa-credit-card"></i>
          <span>Card</span>
        </button>
        <button class="sv-pay-method" onclick="switchPayMethod('upi', this)" id="pmUPI">
          <i class="fa-solid fa-mobile-screen-button"></i>
          <span>UPI</span>
        </button>
        <button class="sv-pay-method" onclick="switchPayMethod('cash', this)" id="pmCash">
          <i class="fa-solid fa-money-bill-wave"></i>
          <span>Cash</span>
        </button>
      </div>

      <!-- Card panel -->
      <div class="sv-pay-form" id="payPanelCard">
        <!-- Visual card preview -->
        <div class="sv-pay-card-preview">
          <div class="sv-pay-chip"></div>
          <div class="sv-pay-card-number" id="previewNumber">•••• •••• •••• ••••</div>
          <div class="sv-pay-card-meta">
            <div><span>Card Holder</span><strong id="previewName">YOUR NAME</strong></div>
            <div><span>Expires</span><strong id="previewExpiry">MM / YY</strong></div>
          </div>
        </div>

        <div class="sv-pay-field">
          <label>Card Number</label>
          <input type="text" id="cardNumber" placeholder="1234  5678  9012  3456"
                 maxlength="19" oninput="fmtCard(this)" autocomplete="cc-number"/>
        </div>
        <div class="sv-pay-field">
          <label>Cardholder Name</label>
          <input type="text" id="cardName" placeholder="Name as on card"
                 oninput="document.getElementById('previewName').textContent=(this.value.toUpperCase()||'YOUR NAME')"
                 autocomplete="cc-name"/>
        </div>
        <div class="sv-pay-field-row">
          <div class="sv-pay-field">
            <label>Expiry Date</label>
            <input type="text" id="cardExpiry" placeholder="MM / YY"
                   maxlength="7" oninput="fmtExpiry(this)" autocomplete="cc-exp"/>
          </div>
          <div class="sv-pay-field">
            <label>CVV</label>
            <input type="password" id="cardCVV" placeholder="•••"
                   maxlength="4" autocomplete="cc-csc"/>
          </div>
        </div>
      </div>

      <!-- UPI panel (hidden) -->
      <div class="sv-pay-form" id="payPanelUPI" style="display:none">
        <div class="sv-pay-alt-panel">
          <div class="sv-pay-alt-icon">📱</div>
          <div class="sv-pay-alt-title">Pay via UPI</div>
          <div class="sv-pay-alt-desc">Enter your UPI ID to pay instantly via any UPI-enabled app — Google Pay, PhonePe, Paytm and more.</div>
          <div class="sv-pay-upi-input">
            <input type="text" id="upiId" placeholder="yourname@upi" autocomplete="off"/>
            <button class="sv-pay-upi-verify" onclick="verifyUPI()">Verify</button>
          </div>
          <p id="upiStatus" style="font-size:11px;margin-top:10px;color:rgba(74,56,48,0.45);min-height:16px;"></p>
        </div>
      </div>

      <!-- Cash on Delivery panel (hidden) -->
      <div class="sv-pay-form" id="payPanelCash" style="display:none">
        <div class="sv-pay-alt-panel">
          <div class="sv-pay-alt-icon">💵</div>
          <div class="sv-pay-alt-title">Cash on Delivery</div>
          <div class="sv-pay-alt-desc">Pay in cash when your order arrives. Please have the exact amount ready — <strong>${formatPrice(grandTotal)}</strong>.</div>
        </div>
      </div>

      <!-- Footer / Pay button -->
      <div class="sv-pay-footer">
        <button class="sv-pay-btn" id="svPayBtn" onclick="processPayment()">
          <i class="fa-solid fa-lock" style="font-size:11px"></i>
          Pay ${formatPrice(grandTotal)}
        </button>
        <div class="sv-pay-security">
          <i class="fa-solid fa-shield-halved"></i>
          Secured by Stripe · Your data is never stored
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
}

/* Switch between Card / UPI / Cash tabs */
function switchPayMethod(method, btn) {
  /* Update tab buttons */
  document.querySelectorAll('.sv-pay-method').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  /* Show correct panel */
  ['payPanelCard','payPanelUPI','payPanelCash'].forEach(id => {
    const el = $(id);
    if (el) el.style.display = 'none';
  });
  const map = { card: 'payPanelCard', upi: 'payPanelUPI', cash: 'payPanelCash' };
  const panel = $(map[method]);
  if (panel) panel.style.display = 'block';
}

/* Format card number with spaces */
function fmtCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(\d{4})(?=\d)/g, '$1  ');
  const preview = $('previewNumber');
  if (preview) {
    const padded = (v + '????????????????').substring(0, 16);
    preview.textContent = padded.replace(/(\d{4})(?=.)/g, '$1 ');
  }
}

/* Format expiry MM / YY */
function fmtExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0,2) + ' / ' + v.substring(2);
  input.value = v;
  const preview = $('previewExpiry');
  if (preview) preview.textContent = input.value || 'MM / YY';
}

/* Fake UPI verification */
function verifyUPI() {
  const id  = ($('upiId') || {}).value || '';
  const status = $('upiStatus');
  if (!status) return;
  if (!id || !id.includes('@')) {
    status.style.color = '#e74c3c';
    status.textContent = '✗  Enter a valid UPI ID (e.g. name@okaxis)';
    return;
  }
  status.style.color = 'rgba(74,56,48,0.45)';
  status.textContent = 'Verifying…';
  setTimeout(() => {
    status.style.color = '#27ae60';
    status.textContent = '✓  UPI ID verified — ready to pay';
  }, 900);
}

/* Close payment overlay */
function closePayModal() {
  const el = $('svPayOverlay');
  if (!el) return;
  el.classList.remove('visible');
  document.body.style.overflow = '';
  setTimeout(() => el.remove(), 300);
}

/* Process payment → show order success */
function processPayment() {
  const btn = $('svPayBtn');

  /* Basic card validation */
  const activeTab = document.querySelector('.sv-pay-method.active');
  const method = activeTab ? activeTab.id : 'pmCard';

  if (method === 'pmCard') {
    const num  = ($('cardNumber')  || {}).value || '';
    const name = ($('cardName')    || {}).value || '';
    const exp  = ($('cardExpiry')  || {}).value || '';
    const cvv  = ($('cardCVV')     || {}).value || '';

    const numClean = num.replace(/\s/g, '');
    let errors = [];
    if (numClean.length < 16)              errors.push('cardNumber');
    if (name.trim().length < 2)            errors.push('cardName');
    if (!/^\d{2} \/ \d{2}$/.test(exp))   errors.push('cardExpiry');
    if (cvv.length < 3)                    errors.push('cardCVV');

    /* Highlight errors */
    ['cardNumber','cardName','cardExpiry','cardCVV'].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.classList.toggle('error', errors.includes(id));
    });

    if (errors.length) {
      showToast('Please fill in all card details correctly');
      return;
    }
  }

  if (method === 'pmUPI') {
    const upiStatus = ($('upiStatus') || {}).textContent || '';
    if (!upiStatus.startsWith('✓')) {
      verifyUPI();
      showToast('Please verify your UPI ID first');
      return;
    }
  }

  /* Simulate processing */
  if (btn) { btn.classList.add('loading'); btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size:13px"></i>  Processing…'; }

  setTimeout(() => {
    closePayModal();
    showOrderSuccess();
  }, 1400);
}

/* Show order success modal */
function showOrderSuccess() {
  const grandTotal = cart.reduce((s, i) => s + i.price * i.qty, 0) * 1.18875;
  const orderNum   = 'SV-' + Math.floor(1000 + Math.random() * 9000);

  const overlay = document.createElement('div');
  overlay.id = 'orderSuccessOverlay';
  overlay.className = 'sv-order-success-overlay';
  overlay.innerHTML = `
    <div class="sv-order-success-card">
      <div class="sv-order-success-icon">
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="26" r="25" stroke="#b8963e" stroke-width="2"/>
          <path d="M14 26l9 9 15-18" stroke="#b8963e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                stroke-dasharray="60" stroke-dashoffset="60" style="animation:tickDraw 0.6s 0.3s ease forwards"/>
        </svg>
      </div>
      <p class="sv-order-success-label">Payment Successful</p>
      <h2 class="sv-order-success-title">Thank you!</h2>
      <p class="sv-order-success-sub">Your order <strong>${orderNum}</strong> is being prepared.<br/>Estimated time: <strong>25–35 min</strong></p>
      <div class="sv-order-success-total">
        <span>Amount Paid</span>
        <strong>${formatPrice(grandTotal)}</strong>
      </div>
      <a href="order.html" class="sv-order-success-btn">Track Your Order</a>
      <button onclick="closeOrderSuccess()" class="sv-order-success-close">Back to menu</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  clearCart();
}

function closeOrderSuccess() {
  const el = $('orderSuccessOverlay');
  if (!el) return;
  el.classList.remove('visible');
  document.body.style.overflow = '';
  setTimeout(() => el.remove(), 300);
}

/* ─────────────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────────────── */
function showToast(msg, icon) {
  const existing = $('savoriaToast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.id = 'savoriaToast';
  t.className = 'sv-toast';
  t.innerHTML = `<i class="fa-solid fa-check sv-toast-icon"></i> ${msg}`;
  document.body.appendChild(t);

  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 300);
  }, 2400);
}

/* ─────────────────────────────────────────────────
   CART PANEL TOGGLE
───────────────────────────────────────────────── */
function toggleCart() {
  const modal    = $('cartModal');
  const panel    = $('cartPanel');
  const backdrop = $('cartBackdrop');
  const overlay  = $('overlay');
  if (!modal || !panel) return;

  const isMobile = window.innerWidth < 768;
  const isOpen   = modal.dataset.open === 'true';

  if (isOpen) {
    panel.style.transform = isMobile ? 'translateY(100%)' : 'translateX(100%)';
    if (backdrop) backdrop.style.opacity = '0';
    if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
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
    if (overlay) { overlay.style.opacity = '1'; overlay.style.pointerEvents = 'all'; }
    modal.dataset.open = 'true';
  }
}

/* ─────────────────────────────────────────────────
   MOBILE MENU TOGGLE
───────────────────────────────────────────────── */
function toggleMenu() {
  const m = $('mobileMenu');
  if (!m) return;
  if (m.classList.contains('hidden')) {
    m.classList.remove('hidden');
    m.style.display = 'flex';
    requestAnimationFrame(() => { m.style.transform = 'translateX(0)'; });
  } else {
    m.style.transform = 'translateX(100%)';
    setTimeout(() => { m.classList.add('hidden'); m.style.display = ''; }, 500);
  }
}

/* ─────────────────────────────────────────────────
   CLOSE ALL OVERLAYS
───────────────────────────────────────────────── */
function closeAll() {
  if ($('cartModal')?.dataset.open === 'true') toggleCart();
  const m = $('mobileMenu');
  if (m && !m.classList.contains('hidden')) toggleMenu();
}

/* ─────────────────────────────────────────────────
   MOBILE NAV ACTIVE STATE
───────────────────────────────────────────────── */
function setActive(el) {
  $$('.mobile-bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

/* ─────────────────────────────────────────────────
   ACTIVE NAV LINK  (auto-detect current page)
───────────────────────────────────────────────── */
function initActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/^\//, '');
    const isHome = (href === 'index.html' || href === '' || href === '/');
    const isCurrent = (href === page) || (isHome && (page === '' || page === 'index.html'));
    link.classList.toggle('active-link', isCurrent);
  });

  /* Mobile bottom nav */
  $$('.mobile-bottom-nav .nav-item a').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/^\//, '');
    if (href === page) {
      const navItem = link.closest('.nav-item');
      if (navItem) navItem.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────────────
   NAVBAR SCROLL EFFECT
───────────────────────────────────────────────── */
function initNavbarScroll() {
  const navbar = $('navbar');
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(255,255,255,0.98)';
      navbar.style.boxShadow  = '0 2px 20px rgba(0,0,0,0.06)';
    } else {
      navbar.style.background = 'rgba(255,255,255,0)';
      navbar.style.boxShadow  = 'none';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* run once immediately */
}

/* ─────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────── */
function initScrollReveal() {
  const reveals = $$('.reveal');
  if (!reveals.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => observer.observe(r));
}

/* ─────────────────────────────────────────────────
   BACK TO TOP BUTTON
───────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'svBackToTop';
  btn.className = 'sv-back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 450);
  }, { passive: true });
}

/* ─────────────────────────────────────────────────
   CATEGORY PILLS (index.html)
───────────────────────────────────────────────── */
function initCategoryPills() {
  $$('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
}

/* ─────────────────────────────────────────────────
   MOMENTUM SCROLL (mobile horizontal scroll)
───────────────────────────────────────────────── */
function initMomentumScroll(el) {
  if (!el) return;
  let isDown = false, startX = 0, scrollStart = 0, velX = 0, lastX = 0, momentum;

  el.addEventListener('touchstart', e => {
    isDown = true;
    startX = e.touches[0].clientX;
    scrollStart = el.scrollLeft;
    velX = 0;
    cancelAnimationFrame(momentum);
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (!isDown) return;
    const x = e.touches[0].clientX;
    velX = x - lastX;
    lastX = x;
    el.scrollLeft = scrollStart - (x - startX);
  }, { passive: true });

  el.addEventListener('touchend', () => {
    isDown = false;
    let v = -velX * 1.5;
    const glide = () => {
      if (Math.abs(v) < 0.5) return;
      el.scrollLeft += v;
      v *= 0.92;
      momentum = requestAnimationFrame(glide);
    };
    glide();
  });
}

/* ─────────────────────────────────────────────────
   FOOTER INJECTION
───────────────────────────────────────────────── */
function injectFooter() {
  if ($('sv-footer')) return; /* already present */

  const footer = document.createElement('footer');
  footer.id = 'sv-footer';
  footer.className = 'sv-footer';
  footer.innerHTML = `
    <div class="sv-footer-inner">
      <!-- Brand -->
      <div class="sv-footer-brand">
        <a href="index.html" class="sv-footer-logo">
          Sav<em>o</em>ria
          <span>Fine Dining</span>
        </a>
        <p class="sv-footer-tagline">Where every dish is a canvas — crafted with passion and 20 years of culinary mastery in New York City.</p>
        <div class="sv-footer-socials">
          <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
          <a href="#" aria-label="Google"><i class="fa-brands fa-google"></i></a>
        </div>
      </div>

      <!-- Links -->
      <div class="sv-footer-col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="menu.html">Our Menu</a></li>
          <li><a href="about.html">About Us</a></li>
          <li><a href="reserve.html">Reserve a Table</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>

      <div class="sv-footer-col">
        <h4>Experience</h4>
        <ul>
          <li><a href="category.html">Cuisines</a></li>
          <li><a href="dish.html">Chef's Specials</a></li>
          <li><a href="order.html">Track Order</a></li>
          <li><a href="book-table.html">Book a Table</a></li>
          <li><a href="dashboard/login.html">Dashboard</a></li>
        </ul>
      </div>

      <!-- Contact + Newsletter -->
      <div class="sv-footer-col sv-footer-contact">
        <h4>Get in Touch</h4>
        <ul>
          <li><i class="fa-solid fa-location-dot"></i> 48 E 61st St, New York, NY 10065</li>
          <li><i class="fa-solid fa-phone"></i> +1 (555) 920-4200</li>
          <li><i class="fa-regular fa-envelope"></i> hello@savoria.com</li>
          <li><i class="fa-regular fa-clock"></i> Mon–Sun · 12:00 PM – 11:00 PM</li>
        </ul>
        <div class="sv-footer-newsletter">
          <p>Join our inner circle for exclusive offers</p>
          <form class="sv-newsletter-form" onsubmit="handleNewsletter(event)">
            <input type="email" placeholder="Your email address" required aria-label="Email for newsletter"/>
            <button type="submit"><i class="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
    </div>

    <div class="sv-footer-bottom">
      <span>© 2025 Savoria Fine Dining. All rights reserved.</span>
      <div class="sv-footer-bottom-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Accessibility</a>
      </div>
    </div>
  `;

  /* Insert before the bottom mobile nav if it exists, else just append */
  const mobileNav = document.querySelector('.mobile-bottom-nav');
  if (mobileNav) {
    document.body.insertBefore(footer, mobileNav);
  } else {
    document.body.appendChild(footer);
  }
}

function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  showToast('Subscribed! Welcome to the Savoria circle ✨');
  input.value = '';
}

/* ═══════════════════════════════════════════════════
   SHARED COMPONENT INJECTORS
   Each function checks if the component already exists
   so pages that still have inline HTML won't duplicate.
════════════════════════════════════════════════════ */

/* ── Overlay backdrop ── */
function injectOverlay() {
  if ($('overlay')) return;
  const el = document.createElement('div');
  el.id = 'overlay';
  el.className = 'fixed inset-0 z-[1050] bg-black/50 opacity-0 pointer-events-none backdrop-blur-[2px] transition-opacity duration-300';
  el.setAttribute('onclick', 'closeAll()');
  document.body.insertBefore(el, document.body.firstChild);
}

/* ── Mobile slide-out menu ── */
function injectMobileMenu() {
  if ($('mobileMenu')) return;
  const el = document.createElement('div');
  el.id = 'mobileMenu';
  el.className = 'fixed inset-0 z-[1100] bg-[#1a1210] flex-col p-10 hidden';
  el.style.cssText = 'transform:translateX(100%);transition:transform 0.5s cubic-bezier(0.4,0,0.2,1);';
  el.innerHTML = `
    <div class="flex justify-between items-center mb-10">
      <div>
        <span class="font-playfair text-2xl font-black text-white">Sav<span class="italic font-light text-redPrimary">o</span>ria</span>
        <p class="font-cormorant italic text-gold/70 text-xs tracking-[0.3em] uppercase mt-0.5">Fine Dining</p>
      </div>
      <button onclick="toggleMenu()" class="w-9 h-9 rounded-full border border-white/20 text-white/50 hover:border-gold hover:text-gold transition text-lg flex items-center justify-center">✕</button>
    </div>
    <div class="h-px w-full mb-8" style="background:linear-gradient(90deg,#b8963e44,#b8963e,#b8963e44)"></div>
    <ul class="flex flex-col gap-1 flex-1">
      <li><a href="index.html"   onclick="toggleMenu()" class="block py-4 border-b border-white/10 text-2xl font-playfair font-bold text-white hover:text-gold transition">Home</a></li>
      <li><a href="menu.html"    onclick="toggleMenu()" class="block py-4 border-b border-white/10 text-2xl font-playfair font-bold text-white hover:text-gold transition">Menu</a></li>
      <li><a href="about.html"   onclick="toggleMenu()" class="block py-4 border-b border-white/10 text-2xl font-playfair font-bold text-white hover:text-gold transition">About</a></li>
      <li><a href="reserve.html" onclick="toggleMenu()" class="block py-4 border-b border-white/10 text-2xl font-playfair font-bold text-white hover:text-gold transition">Reserve</a></li>
      <li><a href="contact.html" onclick="toggleMenu()" class="block py-4 border-b border-white/10 text-2xl font-playfair font-bold text-white hover:text-gold transition">Contact</a></li>
    </ul>
    <div class="mt-auto space-y-3">
      <a href="reserve.html" onclick="toggleMenu()"
         class="book-btn flex items-center justify-center gap-2 text-white py-3.5 rounded text-xs font-bold uppercase tracking-[0.2em]">
        <i class="fa-regular fa-calendar-check"></i> Book a Table
      </a>
      <div class="flex gap-3 text-xs text-white/30 justify-center pt-2">
        <span>📞 +1 (555) 920-4200</span><span>·</span><span>Mon–Sun 12–11pm</span>
      </div>
    </div>
  `;
  document.body.insertBefore(el, document.body.firstChild);
}

/* ── Full-featured cart modal ── */
function injectCartModal() {
  if ($('cartModal')) return;
  const el = document.createElement('div');
  el.id = 'cartModal';
  el.className = 'fixed inset-0 z-[1200] pointer-events-none';
  el.innerHTML = `
    <div id="cartBackdrop"
      class="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 hidden md:block"
      onclick="toggleCart()"></div>
    <div id="cartPanel"
      class="absolute bg-white flex flex-col bottom-0 left-0 right-0 h-[95vh] rounded-t-[24px] md:top-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:w-[460px] md:rounded-none"
      style="transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);box-shadow:-8px 0 40px rgba(0,0,0,0.12);">
      <!-- Drag handle -->
      <div class="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
        <div class="w-10 h-[4px] rounded-full bg-borderSoft"></div>
      </div>
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-borderSoft">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-redPale flex items-center justify-center">
            <i class="fa-solid fa-bag-shopping text-redPrimary text-sm"></i>
          </div>
          <div>
            <h2 class="font-playfair text-lg font-bold text-textDark leading-tight">Your Order</h2>
            <p class="text-[11px] text-textMid/50 mt-0.5" id="cartSubtitle">Table 7 · Dine In</p>
          </div>
        </div>
        <button onclick="toggleCart()" class="w-9 h-9 rounded-full border border-borderSoft text-textMid/50 hover:border-redPrimary hover:text-redPrimary transition flex items-center justify-center text-sm">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <!-- Progress steps -->
      
      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto bg-white" id="cartScrollBody">
        <!-- Dine in / Takeout -->
        <div class="px-6 pt-5 pb-4">
          
        </div>
        <!-- Items label -->
        <div class="px-6 pb-3 flex items-center justify-between">
          <p class="text-[10px] uppercase tracking-[0.25em] font-bold text-textMid/40">Order Items</p>
          <span id="itemCountBadge" class="text-[10px] font-bold text-redPrimary bg-redPale px-2 py-0.5 rounded-full">0 items</span>
        </div>
        <!-- Items container -->
        <div id="cartItemsContainer"></div>
        <!-- Empty state -->
        <div id="cartEmpty" class="px-6 py-12 text-center">
          <div class="text-5xl mb-4">🛒</div>
          <p class="font-playfair text-lg font-bold text-textDark mb-1">Your cart is empty</p>
          <p class="font-cormorant italic text-textMid/50">Add dishes from the menu to get started</p>
          <a href="menu.html" onclick="toggleCart()" class="mt-4 inline-block book-btn text-white px-6 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em]">Browse Menu</a>
        </div>
        <!-- Upsell -->
        <div id="cartUpsell" class="px-6 py-4 border-b border-borderSoft/50 hidden">
          <p class="text-[10px] uppercase tracking-[0.25em] font-bold text-gold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-wand-magic-sparkles text-[9px]"></i> Pair it with
          </p>
          <div class="flex items-center justify-between gap-3 bg-cream/60 rounded-2xl p-3 border border-borderSoft">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-white border border-borderSoft flex items-center justify-center text-xl flex-shrink-0">🍷</div>
              <div>
                <p class="text-[13px] font-semibold text-textDark leading-tight">Chianti Classico</p>
                <p class="text-[10px] text-textMid/50 font-cormorant italic">2018 · Tuscany · 750ml</p>
              </div>
            </div>
            <button onclick="addToCart('Chianti Classico', 18, 'assets/thai.png')"
              class="flex-shrink-0 text-[10px] font-bold text-redPrimary border border-redPrimary/30 px-3 py-2 rounded-full hover:bg-redPrimary hover:text-white hover:border-transparent transition whitespace-nowrap">
              + $18
            </button>
          </div>
        </div>
      
        
        <!-- Est. time & table -->
        <div id="cartMeta" class="px-6 py-4 hidden">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1 bg-white border border-borderSoft rounded-xl p-3">
              <div class="w-8 h-8 rounded-lg bg-cream flex items-center justify-center flex-shrink-0"><i class="fa-regular fa-clock text-gold text-sm"></i></div>
              <div>
                <p class="text-[10px] uppercase tracking-[0.15em] font-bold text-textMid/40">Est. Time</p>
                <p class="text-sm font-bold text-textDark mt-0.5">25–35 min</p>
              </div>
            </div>
            <div class="flex items-center gap-3 flex-1 bg-white border border-borderSoft rounded-xl p-3">
              <div class="w-8 h-8 rounded-lg bg-cream flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-chair text-gold text-sm"></i></div>
              <div>
                <p class="text-[10px] uppercase tracking-[0.15em] font-bold text-textMid/40">Table</p>
                <p class="text-sm font-bold text-textDark mt-0.5">No. 7 · 4 Seats</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Footer / totals -->
      <div class="border-t border-borderSoft bg-white px-6 pt-4 pb-6 md:pb-5 flex-shrink-0" style="box-shadow:0 -4px 20px rgba(0,0,0,0.04)">
        <div class="space-y-2 mb-4" id="cartTotalsBlock"></div>
        <div id="cartPayment" class="hidden items-center gap-2 mb-4 p-3 bg-cream/60 rounded-xl border border-borderSoft">
          <i class="fa-regular fa-credit-card text-textMid/40 text-sm"></i>
          <span class="text-[12px] text-textMid/60 flex-1">Visa •••• 4242</span>
          <button class="text-[10px] font-bold text-gold uppercase tracking-wider">Change</button>
        </div>
        <button id="cartConfirmBtn" onclick="placeOrder()"
          class="book-btn w-full text-white py-4 rounded-xl text-[12px] font-bold tracking-[0.18em] uppercase flex items-center justify-center gap-2 mb-2 opacity-50 cursor-not-allowed" disabled>
          <i class="fa-solid fa-lock text-[10px]"></i> Confirm &amp; Place Order
        </button>
        <button onclick="toggleCart()" class="w-full text-center text-[11px] text-textMid/40 hover:text-textMid transition py-1">
          Continue Browsing
        </button>
      </div>
    </div>
  `;
  document.body.insertBefore(el, document.body.firstChild);
}

/* ── Top Navbar ── */
function injectNavbar() {
  if ($('navbar')) return;
  const nav = document.createElement('nav');
  nav.id = 'navbar';
  nav.className = 'fixed top-0 left-0 right-0 z-[1000] transition-all duration-300';
  nav.style.background = 'rgba(255,255,255,0)';
  nav.innerHTML = `
    <div id="navInner" class="h-[76px] flex items-center justify-between px-5 sm:px-8 lg:px-14 transition-all duration-300">
      <a href="index.html" class="flex flex-col leading-none group flex-shrink-0">
        <span class="font-playfair text-[26px] sm:text-[28px] font-black text-textDark tracking-tight group-hover:text-redPrimary transition duration-300">
          Sav<span class="italic font-light text-redPrimary">o</span>ria
        </span>
        <span class="font-cormorant italic text-[10px] text-gold/80 tracking-[0.35em] uppercase hidden sm:block" style="margin-top:-2px">Fine Dining</span>
      </a>
      <ul class="hidden md:flex items-center gap-7 lg:gap-9 text-[11.5px] font-medium uppercase tracking-[0.15em] text-textMid">
        <li><a href="index.html"   class="nav-link transition">Home</a></li>
        <li><a href="menu.html"    class="nav-link transition">Menu</a></li>
        <li><a href="about.html"   class="nav-link transition">About</a></li>
        <li><a href="gallery.html"   class="nav-link transition">Gallery</a></li>
        <li><a href="reserve.html" class="nav-link transition">Reserve</a></li>
        <li><a href="contact.html" class="nav-link transition">Contact</a></li>
      </ul>
      <div class="flex items-center gap-2 sm:gap-3">
        <button onclick="toggleCart()" class="relative w-9 h-9 flex items-center justify-center rounded-full text-textMid hover:text-redPrimary transition p-2">
          <i class="fa-solid fa-cart-shopping text-[20px]"></i>
          <span id="cartBadge" class="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-redPrimary text-white text-[9px] font-bold rounded-full items-center justify-center hidden">0</span>
        </button>
        <div class="hidden md:flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-textMid hover:text-gold transition pl-3 border-l border-borderSoft ml-1">
          <i class="fa-regular fa-circle-user"></i>
          <a href="login.html">Login</a>
        </div>
        <a href="reserve.html" class="hidden md:inline-flex book-btn items-center gap-2 text-white px-5 py-2.5 rounded text-[11px] font-semibold tracking-[0.18em] uppercase ml-1">
          <i class="fa-regular fa-calendar-check text-[11px]"></i> Book a Table
        </a>
        <button onclick="toggleMenu()" class="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-full hover:bg-redPale transition">
          <span class="w-[18px] h-[1.5px] bg-textDark block rounded-full"></span>
          <span class="w-[18px] h-[1.5px] bg-textDark block rounded-full"></span>
          <span class="w-[12px] h-[1.5px] bg-textDark block rounded-full self-start ml-[3px]"></span>
        </button>
      </div>
    </div>
    <div class="h-px bg-borderSoft/80"></div>
  `;

  /* Insert at very top of body, before any other element */
  document.body.insertBefore(nav, document.body.firstChild);
}

/* ── Mobile bottom navigation bar ── */
function injectMobileBottomNav() {
  if (document.querySelector('.mobile-bottom-nav')) return;

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const isActive = (href) => href === page || (href === 'index.html' && (page === '' || page === '/'));

  const nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav md:hidden';
  /* Determine login/profile state */
  const _svUser = (() => { try { return JSON.parse(localStorage.getItem('sv_user')); } catch(e) { return null; } })();
  const _loginActive = isActive('login.html') || isActive('profile.html');
  const _loginItem = _svUser
    ? `<div class="nav-item${_loginActive ? ' active' : ''}" onclick="location.href='profile.html'" style="position:relative">
        <span style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#b8963e,#e8c97a);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#1a1208;letter-spacing:0;line-height:1">${(_svUser.name||'U')[0].toUpperCase()}</span>
        <span>Account</span>
       </div>`
    : `<div class="nav-item${_loginActive ? ' active' : ''}" onclick="location.href='login.html'">
        <i class="fa-regular fa-circle-user"></i><span>Login</span>
       </div>`;

  nav.innerHTML = `
    <div class="nav-item${isActive('index.html')  ? ' active' : ''}" onclick="location.href='index.html'">
      <i class="fa-solid fa-house"></i><span>Home</span>
    </div>
    <div class="nav-item${isActive('menu.html')   ? ' active' : ''}" onclick="location.href='menu.html'">
      <i class="fa-solid fa-utensils"></i><span>Menu</span>
    </div>
    ${_loginItem}
    <div onclick="toggleCart()">
      <div class="cart-fab">
        <i class="fa-solid fa-bag-shopping text-lg"></i>
        <div class="badge" id="mobileBadge" style="display:none">0</div>
      </div>
    </div>
    <div class="nav-item${isActive('reserve.html') ? ' active' : ''}" 
    onclick="location.href='reserve.html'">
      <i class="fa-regular fa-calendar-check"></i><span>Reserve</span>
    </div>
    <div class="nav-item${isActive('contact.html') ? ' active' : ''}"
     onclick="location.href='contact.html'">
      <i class="fa-regular fa-heart"></i><span>Contact</span>
    </div>
  `;
  document.body.appendChild(nav);
}

/* ─────────────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAll();
});

/* ─────────────────────────────────────────────────
   GLOBAL INIT
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. Inject shared components first (safe — each checks if already present) */
  injectOverlay();
  injectMobileMenu();
  injectCartModal();
  injectNavbar();
  injectMobileBottomNav();
  injectFooter();

  /* 2. Init behaviours */
  renderCart();
  syncWishlistButtons();
  initNavbarScroll();
  initActiveNavLink();
  initScrollReveal();
  initBackToTop();
  initCategoryPills();
  initMomentumScroll($('dishScroll'));
  initMomentumScroll($('catScroll'));
  initMomentumScroll($('recScroll'));
});
