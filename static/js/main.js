/* ═══════════════════════════════════════════════════════════════
   SAVORIA — main.js
   Cart state, payment, rendering, UI helpers
   ═══════════════════════════════════════════════════════════════ */

/* ── CSS injected once for cart panel styles ── */
(function injectCartStyles() {
  if (document.getElementById('sv-cart-styles')) return;
  const style = document.createElement('style');
  style.id = 'sv-cart-styles';
  style.textContent = `
    /* ─── Cart Panel Shell ─── */
    #cartModal {
      position: fixed; inset: 0; z-index: 1200;
      pointer-events: none;
    }
    #cartModal.open { pointer-events: all; }

    #cartBackdrop {
      position: absolute; inset: 0;
      background: rgba(20, 12, 10, 0.5);
      backdrop-filter: blur(3px);
      opacity: 0; transition: opacity 0.35s ease;
    }
    #cartModal.open #cartBackdrop { opacity: 1; }

    #cartPanel {
      position: absolute;
      background: #fff;
      display: flex; flex-direction: column;
      overflow: hidden;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Mobile: full-width bottom sheet */
    @media (max-width: 767px) {
      #cartPanel {
        bottom: 0; left: 0; right: 0;
        border-radius: 24px 24px 0 0;
        max-height: 92vh;
        transform: translateY(100%);
        box-shadow: 0 -20px 60px rgba(20,12,10,0.18);
      }
      #cartModal.open #cartPanel { transform: translateY(0); }
    }

    /* Desktop: right sidebar */
    @media (min-width: 768px) {
      #cartPanel {
        top: 0; right: 0; bottom: 0;
        width: min(480px, 100vw);
        border-radius: 0;
        transform: translateX(100%);
        box-shadow: -16px 0 60px rgba(20,12,10,0.12);
      }
      #cartModal.open #cartPanel { transform: translateX(0); }
    }

    /* ─── Drag Handle ─── */
    .cart-drag-handle {
      width: 36px; height: 4px; border-radius: 2px;
      background: #e2dbd7; margin: 14px auto 0;
      flex-shrink: 0;
    }

    /* ─── Cart Header ─── */
    .cart-header {
      padding: 16px 20px 14px;
      border-bottom: 1px solid #f0eae6;
      flex-shrink: 0;
    }
    .cart-header-row {
      display: flex; align-items: center; justify-content: space-between;
    }
    .cart-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px; font-weight: 900; color: #1a1210;
      display: flex; align-items: center; gap: 10px;
    }
    .cart-count-pill {
      background: #c0392b; color: #fff;
      font-family: 'Jost', sans-serif;
      font-size: 10px; font-weight: 700;
      padding: 2px 8px; border-radius: 999px;
      min-width: 22px; text-align: center;
      transition: transform 0.2s;
    }
    .cart-close-btn {
      width: 34px; height: 34px; border-radius: 50%;
      border: 1.5px solid #e8ddd8; background: #fff;
      color: #9a8880; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .cart-close-btn:hover {
      border-color: #c0392b; color: #c0392b; background: #fdf0ee;
    }

    /* ─── Order Type Toggle ─── */
    .cart-order-toggle {
      display: flex; gap: 4px;
      background: #f5f0eb; border-radius: 12px; padding: 4px;
      margin-top: 12px;
    }
    .cart-ot-btn {
      flex: 1; padding: 8px 12px; border-radius: 9px;
      border: none; cursor: pointer; font-family: 'Jost', sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: all 0.25s; background: transparent; color: #9a8880;
    }
    .cart-ot-btn.active {
      background: #fff; color: #1a1210;
      box-shadow: 0 2px 10px rgba(26,18,16,0.1);
    }
    .cart-ot-btn i { font-size: 11px; }

    /* ─── Scrollable Body ─── */
    .cart-scroll-body {
      flex: 1; overflow-y: auto; overscroll-behavior: contain;
    }
    .cart-scroll-body::-webkit-scrollbar { width: 4px; }
    .cart-scroll-body::-webkit-scrollbar-track { background: transparent; }
    .cart-scroll-body::-webkit-scrollbar-thumb { background: #e8ddd8; border-radius: 2px; }

    /* ─── Empty State ─── */
    .cart-empty {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 56px 32px; text-align: center;
    }
    .cart-empty-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #fdf0ee, #f5f0eb);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
    }
    .cart-empty-icon i { font-size: 26px; color: #c0b4ae; }
    .cart-empty h3 {
      font-family: 'Playfair Display', serif;
      font-size: 20px; font-weight: 900; color: #1a1210; margin-bottom: 6px;
    }
    .cart-empty p {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic; font-size: 15px; color: #9a8880; margin-bottom: 24px;
    }
    .cart-empty-cta {
      background: linear-gradient(135deg, #c0392b, #96281b);
      color: #fff; padding: 11px 24px; border-radius: 12px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
      text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
      transition: opacity 0.2s, transform 0.15s;
    }
    .cart-empty-cta:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ─── Cart Item ─── */
    .sv-cart-item {
      display: flex; gap: 14px;
      padding: 16px 20px;
      border-bottom: 1px solid #f5f0eb;
      transition: background 0.15s;
    }
    .sv-cart-item:hover { background: #fefcfb; }
    .sv-cart-img {
      width: 64px; height: 64px; border-radius: 14px;
      object-fit: cover; flex-shrink: 0;
      border: 1px solid #e8ddd8; background: #f5f0eb;
    }
    .sv-cart-info { flex: 1; min-width: 0; }
    .sv-cart-name {
      font-family: 'Playfair Display', serif;
      font-size: 13px; font-weight: 700; color: #1a1210;
      line-height: 1.3; margin-bottom: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sv-cart-unit {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic; font-size: 12px; color: #9a8880;
    }
    .sv-cart-bottom {
      display: flex; align-items: center; justify-content: space-between; margin-top: 10px;
    }
    .sv-qty-ctrl {
      display: flex; align-items: center;
      background: #f8f5f2; border: 1.5px solid #e8ddd8; border-radius: 10px; overflow: hidden;
    }
    .sv-qty-btn {
      width: 32px; height: 32px; background: transparent; border: none;
      cursor: pointer; font-size: 16px; color: #9a8880; font-weight: 300;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .sv-qty-btn:hover { background: #fdf0ee; color: #c0392b; }
    .sv-qty-num {
      width: 30px; text-align: center;
      font-family: 'Playfair Display', serif; font-weight: 700; font-size: 13px; color: #1a1210;
    }
    .sv-item-price {
      font-family: 'Playfair Display', serif; font-weight: 900;
      font-size: 15px; color: #1a1210;
    }
    .sv-remove-btn {
      background: none; border: none; cursor: pointer;
      color: #c0b4ae; padding: 4px; border-radius: 6px;
      transition: color 0.15s, background 0.15s;
      margin-left: 8px;
    }
    .sv-remove-btn:hover { color: #c0392b; background: #fdf0ee; }

    /* ─── Section Divider Label ─── */
    .cart-sec-label {
      padding: 14px 20px 10px;
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.25em; color: #b8a49e;
      display: flex; align-items: center; gap: 8px;
    }
    .cart-sec-label::after {
      content: ''; flex: 1; height: 1px; background: #f0eae6;
    }

    /* ─── Special Note ─── */
    .cart-note-wrap {
      padding: 0 20px 16px;
    }
    .cart-note-textarea {
      width: 100%; background: #f8f5f2; border: 1.5px solid #e8ddd8;
      border-radius: 12px; padding: 11px 14px;
      font-family: 'Cormorant Garamond', serif; font-style: italic;
      font-size: 14px; color: #1a1210; outline: none; resize: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .cart-note-textarea:focus { border-color: #b8963e; background: #fff; }
    .cart-note-textarea::placeholder { color: #c0b4ae; }

    /* ─── Payment Section ─── */
    .cart-pay-section { padding: 4px 20px 16px; }

    .pay-tab-row {
      display: flex; gap: 3px;
      background: #f5f0eb; border-radius: 12px; padding: 3px;
      margin-bottom: 14px;
    }
    .sv-pay-tab {
      flex: 1; padding: 8px 10px; border-radius: 9px; border: none;
      cursor: pointer; font-family: 'Jost', sans-serif;
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      display: flex; align-items: center; justify-content: center; gap: 5px;
      background: transparent; color: #9a8880;
      transition: all 0.2s;
    }
    .sv-pay-tab.active {
      background: #fff; color: #1a1210;
      box-shadow: 0 2px 8px rgba(26,18,16,0.08);
    }
    .sv-pay-tab i { font-size: 9px; }

    .sv-pay-opts { display: flex; flex-direction: column; gap: 8px; }

    .sv-pay-opt {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border: 1.5px solid #e8ddd8; border-radius: 14px;
      cursor: pointer; background: #fff; transition: all 0.2s;
    }
    .sv-pay-opt:hover { border-color: rgba(192,57,43,0.25); background: #fefcfb; }
    .sv-pay-opt.selected { border-color: #c0392b; background: #fdf8f7; }

    .sv-pay-icon {
      width: 40px; height: 40px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sv-pay-label { font-size: 13px; font-weight: 700; color: #1a1210; line-height: 1.2; }
    .sv-pay-sub {
      font-size: 10px; color: #9a8880; margin-top: 2px;
      display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
    }
    .sv-pay-check {
      width: 20px; height: 20px; border-radius: 50%;
      border: 1.5px solid #e8ddd8; flex-shrink: 0; margin-left: auto;
      transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    }
    .sv-pay-opt.selected .sv-pay-check {
      background: #c0392b; border-color: #c0392b;
    }
    .sv-pay-opt.selected .sv-pay-check::after {
      content: '✓'; color: #fff; font-size: 11px; font-weight: 700;
    }

    /* Payment Input Fields */
    .pay-fields { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
    .pay-field-label {
      display: block; font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.18em; color: #9a8880; margin-bottom: 5px;
    }
    .pay-field-input {
      width: 100%; background: #f8f5f2; border: 1.5px solid #e8ddd8;
      border-radius: 11px; padding: 11px 14px;
      font-family: 'Jost', sans-serif; font-size: 13px; color: #1a1210;
      outline: none; transition: border-color 0.2s, background 0.2s;
    }
    .pay-field-input:focus { border-color: #c0392b; background: #fff; }
    .pay-field-input::placeholder { color: #c0b4ae; }
    .pay-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .pay-phone-wrap {
      display: flex; align-items: center; overflow: hidden;
      background: #f8f5f2; border: 1.5px solid #e8ddd8; border-radius: 11px;
      transition: border-color 0.2s, background 0.2s;
    }
    .pay-phone-wrap:focus-within { border-color: #c0392b; background: #fff; }
    .pay-phone-prefix {
      padding: 11px 12px; font-size: 12px; font-weight: 700;
      border-right: 1px solid #e8ddd8; flex-shrink: 0;
    }
    .pay-phone-input {
      flex: 1; background: transparent; border: none; outline: none;
      padding: 11px 13px; font-family: 'Jost', sans-serif; font-size: 13px; color: #1a1210;
    }
    .pay-phone-input::placeholder { color: #c0b4ae; }
    .pay-info-note {
      display: flex; align-items: center; gap: 6px;
      margin-top: 8px; padding: 8px 10px;
      background: #faf7f4; border: 1px solid #e8ddd8; border-radius: 9px;
      font-size: 10px; color: #9a8880; line-height: 1.4;
    }
    .pay-info-note i { color: #b8963e; font-size: 10px; flex-shrink: 0; }

    /* SSL note */
    .cart-ssl-note {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 14px; background: #f8f5f2;
      border: 1px solid #e8ddd8; border-radius: 10px; margin-top: 12px;
      font-size: 10px; color: #9a8880; line-height: 1.4;
    }
    .cart-ssl-note i { color: #b8963e; flex-shrink: 0; }

    /* ─── Cart Totals ─── */
    .cart-totals-section {
      padding: 16px 20px;
      border-top: 1px solid #f0eae6;
      background: #fdfbf9;
      flex-shrink: 0;
    }
    .cart-total-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12px; color: #9a8880; padding: 3px 0;
    }
    .cart-total-row.grand {
      font-family: 'Playfair Display', serif;
      font-size: 17px; font-weight: 900; color: #1a1210;
      padding-top: 10px; margin-top: 7px;
      border-top: 1px dashed #e8ddd8;
    }
    .cart-total-row.grand span:last-child { color: #c0392b; }

    /* ─── Confirm Button ─── */
    .cart-footer {
      padding: 12px 20px max(12px, env(safe-area-inset-bottom));
      background: #fff; border-top: 1px solid #f0eae6;
      flex-shrink: 0;
    }
    #cartConfirmBtn {
      width: 100%; padding: 15px;
      background: linear-gradient(135deg, #c0392b, #96281b);
      color: #fff; border: none; border-radius: 16px;
      font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    #cartConfirmBtn:hover:not(:disabled) {
      opacity: 0.9; transform: translateY(-1px);
      box-shadow: 0 10px 28px rgba(192,57,43,0.3);
    }
    #cartConfirmBtn:active:not(:disabled) { transform: scale(0.98); }
    #cartConfirmBtn:disabled {
      opacity: 0.4; cursor: not-allowed; background: #9a8880;
    }

    /* ─── Upsell Row ─── */
    .upsell-row {
      display: flex; gap: 10px;
      overflow-x: auto; padding: 4px 20px 16px;
      scrollbar-width: none;
    }
    .upsell-row::-webkit-scrollbar { display: none; }
    .upsell-card {
      background: #fff; border: 1px solid #e8ddd8;
      border-radius: 14px; overflow: hidden; flex-shrink: 0; width: 140px;
      cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    }
    .upsell-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26,18,16,0.08); }
    .upsell-card img { width: 100%; height: 80px; object-fit: cover; }
    .upsell-card-body { padding: 8px 10px 10px; }
    .upsell-card-name {
      font-family: 'Playfair Display', serif; font-size: 11px;
      font-weight: 700; color: #1a1210; line-height: 1.2; margin-bottom: 6px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .upsell-card-footer {
      display: flex; align-items: center; justify-content: space-between;
    }
    .upsell-price { font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 900; color: #1a1210; }
    .upsell-add {
      width: 24px; height: 24px; border-radius: 7px;
      background: #c0392b; color: #fff; border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 12px; transition: background 0.15s;
    }
    .upsell-add:hover { background: #96281b; }

    /* ─── Toast ─── */
    #sv-toast {
      position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%);
      background: #1a1210; color: #fff; padding: 11px 20px; border-radius: 999px;
      font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 600;
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 8px 32px rgba(26,18,16,0.25); white-space: nowrap;
      z-index: 2000; pointer-events: none;
      animation: sv-toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes sv-toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(16px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    #sv-toast .toast-dot { color: #b8963e; font-size: 10px; }
  `;
  document.head.appendChild(style);
})();


/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
let cart            = [];
let selectedPayment = null;
let orderType       = 'dine';
let activePayTab    = 'online'; // 'online' | 'offline'


/* ═══════════════════════════════════════════════════════════════
   CART ACTIONS
   ═══════════════════════════════════════════════════════════════ */
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
    // pop animation on badge
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.style.transform = 'scale(1.4)'; setTimeout(() => badge.style.transform = '', 200); }
  } else {
    cart.push({ name, price: parseFloat(price), qty: 1 });
  }
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
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
  // keep payment tab state
  if (activePayTab === 'offline') setTimeout(() => switchPayTab('offline'), 0);
}


/* ═══════════════════════════════════════════════════════════════
   RENDER CART PANEL
   ═══════════════════════════════════════════════════════════════ */
function renderCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);

  /* badges */
  ['cartBadge', 'mobileBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'flex' : 'none';
  });

  _buildCartPanel(totalItems, subtotal);
  updateConfirmBtn();
}

function _buildCartPanel(totalItems, subtotal) {
  const modal = document.getElementById('cartModal');
  if (!modal) return;

  /* ensure panel exists */
  let panel = document.getElementById('cartPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'cartPanel';
    modal.appendChild(panel);
  }

  /* ── HEADER ── */
  const isDine    = orderType === 'dine';
  const headerHTML = `
    <div class="cart-drag-handle" style="display:none;" id="cartDragHandle"></div>
    <div class="cart-header">
      <div class="cart-header-row">
        <div class="cart-title">
          Your Order
          ${totalItems > 0 ? `<span class="cart-count-pill" id="cartBadgePill">${totalItems}</span>` : ''}
        </div>
        <button class="cart-close-btn" onclick="toggleCart()" aria-label="Close cart">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="cart-order-toggle">
        <button id="cartDineBtn" class="cart-ot-btn ${isDine ? 'active' : ''}"
                onclick="setOrderType('dine')">
          <i class="fa-solid fa-wine-glass-empty"></i> Dine In
        </button>
        <button id="cartTakeBtn" class="cart-ot-btn ${!isDine ? 'active' : ''}"
                onclick="setOrderType('take')">
          <i class="fa-solid fa-bag-shopping"></i> Takeout
        </button>
      </div>
    </div>
  `;

  /* ── SCROLLABLE BODY ── */
  let bodyHTML = '';

  if (cart.length === 0) {
    bodyHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon"><i class="fa-solid fa-utensils"></i></div>
        <h3>Nothing here yet</h3>
        <p>Add dishes from our menu<br/>to start your order</p>
        <a href="menu.html" class="cart-empty-cta" onclick="toggleCart()">
          <i class="fa-solid fa-utensils" style="font-size:10px"></i> Browse Menu
        </a>
      </div>`;
  } else {
    /* items */
    const itemsHTML = cart.map((item, idx) => `
      <div class="sv-cart-item">
        <img src="./assests/thai.png" alt="${item.name}" class="sv-cart-img"/>
        <div class="sv-cart-info">
          <div class="sv-cart-name">${item.name}</div>
          <div class="sv-cart-unit">$${item.price.toFixed(2)} each</div>
          <div class="sv-cart-bottom">
            <div class="sv-qty-ctrl">
              <button class="sv-qty-btn" onclick="changeQtyCart(${idx},-1)">−</button>
              <span class="sv-qty-num">${item.qty}</span>
              <button class="sv-qty-btn" onclick="changeQtyCart(${idx},1)">+</button>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span class="sv-item-price">$${(item.price * item.qty).toFixed(2)}</span>
              <button class="sv-remove-btn" onclick="removeFromCart(${idx})" title="Remove">
                <i class="fa-solid fa-trash-can" style="font-size:11px"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    /* upsell */
    const UPSELL = [
      { name: 'Truffle Fries', price: 12 },
      { name: 'Burrata Salad', price: 18 },
      { name: 'Crème Brûlée', price: 13 },
      { name: 'Chianti Classico', price: 18 },
    ].filter(u => !cart.find(c => c.name === u.name)).slice(0, 4);

    const upsellHTML = UPSELL.length ? `
      <div class="cart-sec-label">
        <i class="fa-solid fa-wand-magic-sparkles" style="color:#b8963e;font-size:9px"></i>
        You May Also Like
      </div>
      <div class="upsell-row">
        ${UPSELL.map(u => `
          <div class="upsell-card" onclick="addToCart('${u.name}',${u.price})">
            <img src="./assests/thai.png" alt="${u.name}"/>
            <div class="upsell-card-body">
              <div class="upsell-card-name">${u.name}</div>
              <div class="upsell-card-footer">
                <span class="upsell-price">$${u.price}</span>
                <button class="upsell-add" onclick="event.stopPropagation();addToCart('${u.name}',${u.price})">+</button>
              </div>
            </div>
          </div>`).join('')}
      </div>` : '';

    /* special note */
    const noteHTML = `
      <div class="cart-sec-label">Special Instructions</div>
      <div class="cart-note-wrap">
        <textarea id="specialNote" rows="2" class="cart-note-textarea"
          placeholder="Allergies, preferences, notes for the kitchen…"></textarea>
      </div>`;

    /* payment */
    const payHTML = `
      <div class="cart-sec-label">
        <i class="fa-solid fa-lock" style="color:#b8963e;font-size:9px"></i>
        Payment Method
      </div>
      <div class="cart-pay-section">${_paymentHTML()}</div>`;

    bodyHTML = itemsHTML + upsellHTML + noteHTML + payHTML;
  }

  /* ── TOTALS + FOOTER ── */
  const service    = subtotal * 0.10;
  const tax        = subtotal * 0.08875;
  const grandTotal = subtotal + service + tax;

  const totalsHTML = cart.length > 0 ? `
    <div class="cart-totals-section">
      <div class="cart-total-row">
        <span>Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-total-row">
        <span>Service (10%)</span>
        <span>$${service.toFixed(2)}</span>
      </div>
      <div class="cart-total-row">
        <span>Tax (8.875%)</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="cart-total-row grand">
        <span>Total</span>
        <span>$${grandTotal.toFixed(2)}</span>
      </div>
    </div>` : '';

  const footerHTML = `
    <div class="cart-footer">
      <button id="cartConfirmBtn" onclick="placeOrder()" ${cart.length === 0 || !selectedPayment ? 'disabled' : ''}>
        <i class="fa-solid fa-lock" style="font-size:10px"></i>
        ${cart.length === 0 ? 'Add items to order'
          : !selectedPayment ? 'Select payment to continue'
          : `Place Order · $${grandTotal.toFixed(2)}`}
      </button>
    </div>`;

  panel.innerHTML = `
    ${headerHTML}
    <div class="cart-scroll-body" id="cartScrollBody">${bodyHTML}</div>
    ${totalsHTML}
    ${footerHTML}
  `;

  /* show drag handle on mobile */
  if (window.innerWidth < 768) {
    const handle = document.getElementById('cartDragHandle');
    if (handle) handle.style.display = 'block';
  }

  /* restore payment tab state */
  if (cart.length > 0 && activePayTab === 'offline') {
    setTimeout(() => _activateOfflineTab(), 0);
  }
}

/* ── Payment HTML builder ── */
function _paymentHTML() {
  const isDine = orderType === 'dine';
  const onlineStyle = activePayTab === 'online' ? '' : 'display:none';
  const offlineStyle = activePayTab === 'offline' ? '' : 'display:none';

  const methods = {
    bkash:  { label: 'bKash',              sub: 'Mobile Banking · Instant', bg: '#e2136e',  abbr: 'bK' },
    nagad:  { label: 'Nagad',              sub: 'Mobile Banking · Instant', bg: '#f6821f',  abbr: 'NG' },
    rocket: { label: 'Rocket',             sub: 'DBBL Mobile Banking',      bg: '#8c3494',  abbr: 'RK' },
  };

  const onlineMethods = Object.entries(methods).map(([key, m]) => `
    <div class="sv-pay-opt ${selectedPayment === key ? 'selected' : ''}" onclick="selectPayment('${key}')">
      <div class="sv-pay-icon" style="background:${m.bg};">
        <span style="font-size:11px;font-weight:900;color:white;letter-spacing:-0.5px;">${m.abbr}</span>
      </div>
      <div style="flex:1">
        <div class="sv-pay-label">${m.label}</div>
        <div class="sv-pay-sub">${m.sub}</div>
      </div>
      <div class="sv-pay-check"></div>
    </div>
    ${selectedPayment === key ? _mobilePayFields(key, m.label, m.bg) : ''}
  `).join('') + `
    <div class="sv-pay-opt ${selectedPayment === 'card' ? 'selected' : ''}" onclick="selectPayment('card')">
      <div class="sv-pay-icon" style="background:#1a3a6b;">
        <i class="fa-regular fa-credit-card" style="color:white;font-size:14px;"></i>
      </div>
      <div style="flex:1">
        <div class="sv-pay-label">Debit / Credit Card</div>
        <div class="sv-pay-sub">
          <span style="background:#1a3a6b;color:#fff;font-size:7px;font-weight:900;font-style:italic;padding:1px 5px;border-radius:3px;">VISA</span>
          <span style="background:linear-gradient(90deg,#eb001b,#f79e1b);color:#fff;font-size:7px;font-weight:900;padding:1px 5px;border-radius:3px;">MC</span>
          <span style="background:#007bca;color:#fff;font-size:7px;font-weight:900;padding:1px 5px;border-radius:3px;">AMEX</span>
          <span style="background:#00579f;color:#fff;font-size:7px;font-weight:900;padding:1px 5px;border-radius:3px;">NEXUS</span>
        </div>
      </div>
      <div class="sv-pay-check"></div>
    </div>
    ${selectedPayment === 'card' ? _cardFields() : ''}
  `;

  const offlineMethods = `
    ${isDine ? `
    <div class="sv-pay-opt ${selectedPayment === 'table' ? 'selected' : ''}" onclick="selectPayment('table')">
      <div class="sv-pay-icon" style="background:linear-gradient(135deg,#1a1210,#2d1a14);">
        <i class="fa-solid fa-receipt" style="color:#b8963e;font-size:14px;"></i>
      </div>
      <div style="flex:1">
        <div class="sv-pay-label">Pay at Table</div>
        <div class="sv-pay-sub">Cash or Card · After dining</div>
      </div>
      <div class="sv-pay-check"></div>
    </div>` : ''}
    <div class="sv-pay-opt ${selectedPayment === 'cash' ? 'selected' : ''}" onclick="selectPayment('cash')">
      <div class="sv-pay-icon" style="background:#2d7a47;">
        <i class="fa-solid fa-money-bill-wave" style="color:white;font-size:13px;"></i>
      </div>
      <div style="flex:1">
        <div class="sv-pay-label">${isDine ? 'Pay in Cash' : 'Cash on Pickup'}</div>
        <div class="sv-pay-sub">${isDine ? 'BDT Cash · At the counter' : 'Pay when you collect'}</div>
      </div>
      <div class="sv-pay-check"></div>
    </div>
  `;

  return `
    <div class="pay-tab-row">
      <button id="svPayTabOnline" class="sv-pay-tab ${activePayTab === 'online' ? 'active' : ''}"
              onclick="switchPayTab('online')">
        <i class="fa-solid fa-wifi"></i> Online
      </button>
      <button id="svPayTabOffline" class="sv-pay-tab ${activePayTab === 'offline' ? 'active' : ''}"
              onclick="switchPayTab('offline')">
        <i class="fa-solid fa-store"></i> Offline
      </button>
    </div>
    <div id="svPayOnline" class="sv-pay-opts" style="${onlineStyle}">${onlineMethods}</div>
    <div id="svPayOffline" class="sv-pay-opts" style="${offlineStyle}">${offlineMethods}</div>
    <div class="cart-ssl-note">
      <i class="fa-solid fa-shield-halved"></i>
      256-bit SSL encrypted. Your payment info is always secure.
    </div>
  `;
}

function _mobilePayFields(key, label, color) {
  return `
    <div class="pay-fields" style="padding:0 2px;">
      <div>
        <label class="pay-field-label">${label} Number</label>
        <div class="pay-phone-wrap">
          <span class="pay-phone-prefix" style="color:${color};">+880</span>
          <input type="tel" placeholder="01XXXXXXXXX" maxlength="11" class="pay-phone-input"/>
        </div>
      </div>
      <div class="pay-info-note">
        <i class="fa-solid fa-circle-info"></i>
        A payment request will be sent to your ${label} app
      </div>
    </div>`;
}

function _cardFields() {
  return `
    <div class="pay-fields" style="padding:0 2px;">
      <div>
        <label class="pay-field-label">Card Number</label>
        <input type="text" placeholder="1234  5678  9012  3456" maxlength="19"
          class="pay-field-input" oninput="fmtCard(this)"/>
      </div>
      <div class="pay-field-row">
        <div>
          <label class="pay-field-label">Expiry</label>
          <input type="text" placeholder="MM / YY" maxlength="7"
            class="pay-field-input" oninput="fmtExp(this)"/>
        </div>
        <div>
          <label class="pay-field-label">CVV</label>
          <input type="password" placeholder="•••" maxlength="4" class="pay-field-input"/>
        </div>
      </div>
      <div>
        <label class="pay-field-label">Cardholder Name</label>
        <input type="text" placeholder="JOHN DOE" class="pay-field-input"
          style="text-transform:uppercase;"/>
      </div>
    </div>`;
}


/* ═══════════════════════════════════════════════════════════════
   PAYMENT INTERACTIONS
   ═══════════════════════════════════════════════════════════════ */
function switchPayTab(tab) {
  activePayTab = tab;
  const online  = document.getElementById('svPayOnline');
  const offline = document.getElementById('svPayOffline');
  const tabOn   = document.getElementById('svPayTabOnline');
  const tabOff  = document.getElementById('svPayTabOffline');
  if (!online) return;

  if (tab === 'online') {
    online.style.display  = '';
    offline.style.display = 'none';
    tabOn?.classList.add('active');    tabOff?.classList.remove('active');
    if (['table','cash'].includes(selectedPayment)) { selectedPayment = null; updateConfirmBtn(); }
  } else {
    _activateOfflineTab();
    if (['bkash','nagad','rocket','card'].includes(selectedPayment)) { selectedPayment = null; updateConfirmBtn(); }
  }
}

function _activateOfflineTab() {
  const online  = document.getElementById('svPayOnline');
  const offline = document.getElementById('svPayOffline');
  const tabOn   = document.getElementById('svPayTabOnline');
  const tabOff  = document.getElementById('svPayTabOffline');
  if (offline) offline.style.display = '';
  if (online)  online.style.display  = 'none';
  tabOff?.classList.add('active');   tabOn?.classList.remove('active');
}

function selectPayment(method) {
  selectedPayment = method;
  activePayTab = ['table','cash'].includes(method) ? 'offline' : 'online';
  renderCart();
  updateConfirmBtn();
  // keep scroll position
  const body = document.getElementById('cartScrollBody');
  if (body) setTimeout(() => body.scrollTop = body.scrollHeight - body.clientHeight * 0.4, 50);
}

function updateConfirmBtn() {
  const btn = document.getElementById('cartConfirmBtn');
  if (!btn) return;
  const service    = cart.reduce((s,i) => s + i.price*i.qty, 0);
  const total      = service * 1.18875;
  const hasItems   = cart.length > 0;
  const hasPay     = !!selectedPayment;
  btn.disabled = !(hasItems && hasPay);
  btn.innerHTML = !hasItems
    ? `<i class="fa-solid fa-utensils" style="font-size:10px"></i> Add items to order`
    : !hasPay
    ? `<i class="fa-regular fa-credit-card" style="font-size:10px"></i> Select payment to continue`
    : `<i class="fa-solid fa-lock" style="font-size:10px"></i> Place Order · $${total.toFixed(2)}`;
}

/* Card + Expiry formatters */
function fmtCard(input) {
  let v = input.value.replace(/\D/g,'').substring(0,16);
  input.value = v.replace(/(.{4})/g,'$1  ').trim();
}
function fmtExp(input) {
  let v = input.value.replace(/\D/g,'').substring(0,4);
  if (v.length >= 3) v = v.substring(0,2) + ' / ' + v.substring(2);
  input.value = v;
}


/* ═══════════════════════════════════════════════════════════════
   PLACE ORDER
   ═══════════════════════════════════════════════════════════════ */
function placeOrder() {
  if (cart.length === 0 || !selectedPayment) return;
  const btn = document.getElementById('cartConfirmBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="font-size:12px"></i> Processing…`;
  }
  setTimeout(() => {
    cart = []; selectedPayment = null;
    toggleCart();
    renderCart();
    showToast('Order placed successfully!');
  }, 1800);
}


/* ═══════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════ */
function showToast(name) {
  const ex = document.getElementById('sv-toast');
  if (ex) ex.remove();
  const t = document.createElement('div');
  t.id = 'sv-toast';
  t.innerHTML = `<span class="toast-dot">✦</span>
                 <span><strong style="font-family:'Playfair Display',serif">${name}</strong></span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.3s, transform 0.3s';
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(12px)';
    setTimeout(() => t.remove(), 320);
  }, 2200);
}


/* ═══════════════════════════════════════════════════════════════
   CART TOGGLE
   ═══════════════════════════════════════════════════════════════ */
function toggleCart() {
  let modal = document.getElementById('cartModal');

  /* build modal shell if it doesn't exist */
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.dataset.open = 'false';
    modal.innerHTML = `
      <div id="cartBackdrop" onclick="toggleCart()"></div>
      <div id="cartPanel"></div>`;
    document.body.appendChild(modal);
    renderCart();
  }

  const isOpen = modal.dataset.open === 'true';
  if (isOpen) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modal.dataset.open = 'false';
  } else {
    renderCart();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.dataset.open = 'true';
  }
}

function closeAll() {
  const modal = document.getElementById('cartModal');
  if (modal?.dataset.open === 'true') toggleCart();
  const m = document.getElementById('mobileMenu');
  if (m && !m.classList.contains('hidden')) toggleMenu();
}


/* ═══════════════════════════════════════════════════════════════
   ORDER TYPE
   ═══════════════════════════════════════════════════════════════ */
function setOrderType(type) {
  orderType = type;
  selectedPayment = null;

  // update legacy dineBtn/takeBtn if they exist outside the panel
  ['dineBtn','takeBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const isActive = (id === 'dineBtn' && type === 'dine') || (id === 'takeBtn' && type === 'take');
    btn.classList.toggle('active', isActive);
  });

  renderCart();
}


/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU TOGGLE
   ═══════════════════════════════════════════════════════════════ */
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  if (!m) return;
  if (m.classList.contains('hidden')) {
    m.classList.remove('hidden');
    m.style.display = 'flex';
    requestAnimationFrame(() => m.style.transform = 'translateX(0)');
  } else {
    m.style.transform = 'translateX(100%)';
    setTimeout(() => { m.classList.add('hidden'); m.style.display = ''; }, 450);
  }
}


/* ═══════════════════════════════════════════════════════════════
   MOBILE NAV ACTIVE
   ═══════════════════════════════════════════════════════════════ */
function setActive(el) {
  document.querySelectorAll('.mobile-bottom-nav .nav-item')
    .forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}


/* ═══════════════════════════════════════════════════════════════
   MENU FILTER & SEARCH
   ═══════════════════════════════════════════════════════════════ */
function filterMenu(cat, btn) {
  document.querySelectorAll('.filter-tab, .m-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.menu-section').forEach(sec => {
    sec.style.display = (cat === 'all' || sec.dataset.category === cat) ? 'block' : 'none';
  });
}

let _searchTimer;
function handleSearch(val) {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    const q = val.toLowerCase().trim();
    if (!q) { clearSearch(); return; }
    let count = 0;
    document.querySelectorAll('.menu-card').forEach(card => {
      const match = ((card.dataset.search || '') + card.innerText).toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
      if (match) count++;
    });
    document.querySelectorAll('.menu-section').forEach(sec => {
      sec.style.display = sec.querySelectorAll('.menu-card:not([style*="display: none"])').length > 0 ? 'block' : 'none';
    });
    const noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = count === 0 ? 'flex' : 'none';
    const bar = document.getElementById('searchResultBar');
    if (bar) {
      bar.style.display = 'flex';
      const txt = document.getElementById('searchResultText');
      if (txt) txt.textContent = `${count} result${count !== 1 ? 's' : ''} for "${val}"`;
    }
    ['deskSearch','mobSearch'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value !== val) el.value = val;
    });
  }, 220);
}

function clearSearch() {
  ['deskSearch','mobSearch'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
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
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) setTimeout(() => document.getElementById('mobSearch')?.focus(), 200);
}


/* ═══════════════════════════════════════════════════════════════
   QUICK VIEW MODAL
   ═══════════════════════════════════════════════════════════════ */
function openQuick(card) {
  let modal = document.getElementById('quickModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:1100;display:none;align-items:center;justify-content:center;background:rgba(20,12,10,0.5);backdrop-filter:blur(4px);opacity:0;transition:opacity 0.25s;padding:16px;';
    modal.onclick = e => { if (e.target === modal) closeQuick(); };
    document.body.appendChild(modal);
  }

  const name   = card.querySelector('.font-playfair')?.textContent?.trim() || 'Dish';
  const desc   = card.querySelector('.font-cormorant')?.textContent?.trim() || '';
  const price  = card.dataset.price || '0';
  const rating = card.dataset.rating || '4.8';
  const img    = card.querySelector('img')?.src || '';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:22px;overflow:hidden;max-width:400px;width:100%;
                box-shadow:0 24px 60px rgba(20,12,10,0.2);">
      <div style="height:200px;overflow:hidden;position:relative;">
        <img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(20,12,10,0.5),transparent)"></div>
        <button onclick="closeQuick()" style="position:absolute;top:12px;right:12px;width:32px;height:32px;
          border-radius:50%;background:rgba(255,255,255,0.9);border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;font-size:13px;color:#4a3830;">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div style="position:absolute;bottom:12px;right:12px;background:rgba(255,255,255,0.12);
          backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);border-radius:8px;
          padding:4px 10px;font-size:11px;font-weight:700;color:#fff;display:flex;align-items:center;gap:4px;">
          <i class="fa-solid fa-star" style="color:#b8963e;font-size:9px;"></i> ${rating}
        </div>
      </div>
      <div style="padding:22px 22px 24px;">
        <h2 style="font-family:'Playfair Display',serif;font-size:21px;font-weight:900;color:#1a1210;
                   line-height:1.2;margin-bottom:6px;">${name}</h2>
        <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
                  color:#7a6a60;margin-bottom:20px;line-height:1.5;">${desc}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:#1a1210;">
            $${price}
          </span>
          <button onclick="addToCart('${name.replace(/'/g,"\\'")}',${price});closeQuick();"
            style="background:linear-gradient(135deg,#c0392b,#96281b);color:#fff;
                   padding:12px 22px;border-radius:12px;border:none;cursor:pointer;
                   font-family:'Jost',sans-serif;font-size:11px;font-weight:700;
                   letter-spacing:0.15em;text-transform:uppercase;
                   display:flex;align-items:center;gap:8px;
                   transition:opacity 0.2s,transform 0.15s;">
            <i class="fa-solid fa-plus" style="font-size:9px;"></i> Add to Order
          </button>
        </div>
      </div>
    </div>`;

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.style.opacity = '1');
}

function closeQuick() {
  const modal = document.getElementById('quickModal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 250);
  }
}


/* ═══════════════════════════════════════════════════════════════
   TOUCH MOMENTUM SCROLL
   ═══════════════════════════════════════════════════════════════ */
function initMomentumScroll(el) {
  if (!el) return;
  let isDown = false, startX = 0, scrollStart = 0, velX = 0, lastX = 0, raf;
  el.addEventListener('touchstart', e => {
    isDown = true; startX = e.touches[0].clientX;
    scrollStart = el.scrollLeft; velX = 0;
    cancelAnimationFrame(raf);
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    if (!isDown) return;
    const x = e.touches[0].clientX;
    velX = x - lastX; lastX = x;
    el.scrollLeft = scrollStart - (x - startX);
  }, { passive: true });
  el.addEventListener('touchend', () => {
    isDown = false;
    let v = -velX * 1.4;
    function glide() {
      if (Math.abs(v) < 0.5) return;
      el.scrollLeft += v; v *= 0.91;
      raf = requestAnimationFrame(glide);
    }
    glide();
  });
}


/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(r => obs.observe(r));
}


/* ═══════════════════════════════════════════════════════════════
   NAVBAR SCROLL
   ═══════════════════════════════════════════════════════════════ */
function initNavbarScroll() {
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
  }, { passive: true });
}


/* ═══════════════════════════════════════════════════════════════
   CATEGORY PILLS
   ═══════════════════════════════════════════════════════════════ */
function initCatPills() {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initScrollReveal();
  initNavbarScroll();
  initCatPills();
  initMomentumScroll(document.getElementById('dishScroll'));
});