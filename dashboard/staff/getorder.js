/* ================================================
   GET ORDER VIEW  (views/getorder.js)

   A simple POS (Point of Sale) screen.
   Staff pick items from the menu, add to cart,
   then place the order via AJAX (API.createOrder).
================================================ */

const GetOrderView = {

  /* ── STATE ── */
  cart:         [],
  currentCat:   'all',
  tableNum:     '',
  customerName: '',
  _cartOpen:    false,   // mobile cart drawer state

  /* ────────────────────────────────────────────
     render() — page HTML shell
  ──────────────────────────────────────────── */
  render() {
    const catTabs = DB.menu.map(c =>
      `<button class="tab-btn" onclick="GetOrderView.setCat('${c.cat}',this)">${c.emoji} ${c.cat}</button>`
    ).join('');

    return `
      <style>
        /* ── POS layout ── */
        .pos-wrap {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 16px;
          height: calc(100vh - 150px);
        }

        /* ── Menu panel ── */
        .pos-menu {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        /* ── Cart panel ── */
        .pos-cart {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }

        /* ── Mobile floating cart button ── */
        .pos-cart-fab {
          display: none;
          position: fixed;
          bottom: 80px;
          right: 16px;
          z-index: 400;
          background: var(--red);
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          box-shadow: var(--shadow-lg);
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background .2s;
        }
        .pos-cart-fab:hover { background: var(--red-deep); }

        /* ── Mobile cart drawer overlay ── */
        .pos-cart-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.5);
          z-index: 450;
          backdrop-filter: blur(2px);
        }
        .pos-cart-overlay.show { display: block; }

        /* ── Mobile cart drawer ── */
        .pos-cart-drawer {
          position: fixed;
          bottom: -100%;
          left: 0; right: 0;
          z-index: 500;
          background: var(--bg-surface);
          border-radius: 20px 20px 0 0;
          box-shadow: var(--shadow-lg);
          max-height: 85dvh;
          display: flex;
          flex-direction: column;
          transition: bottom .3s cubic-bezier(.4,0,.2,1);
        }
        .pos-cart-drawer.show { bottom: 0; }

        /* Drag handle */
        .pos-drawer-handle {
          width: 40px; height: 4px;
          background: var(--border-2);
          border-radius: 2px;
          margin: 10px auto 0;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .pos-wrap {
            grid-template-columns: 1fr;
            height: auto;
          }
          .pos-menu {
            height: calc(100dvh - 200px);
          }
          .pos-cart { display: none; }           /* desktop cart hide */
          .pos-cart-fab { display: flex; }       /* FAB show */
        }
      </style>

      <div class="page-header anim-1">
        <div>
          <div class="page-subtitle">Operations</div>
          <h1 class="page-title">Get <em style="color:var(--red);font-style:italic">Order</em></h1>
        </div>
      </div>

      <!-- POS grid -->
      <div class="pos-wrap anim-2">

        <!-- LEFT: Menu Panel -->
        <div class="pos-menu">

          <!-- Table & Customer inputs -->
          <div class="form-row" style="flex-shrink:0">
            <div class="form-group">
              <label class="form-label">
                <i class="fa-solid fa-table-cells" style="color:var(--red)"></i> Table Number
              </label>
              <input class="form-control" id="posTable" type="number" min="1" max="20"
                placeholder="e.g. 5" value="${this.tableNum}"
                oninput="GetOrderView.tableNum=this.value"/>
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fa-solid fa-user" style="color:var(--red)"></i> Customer Name
              </label>
              <input class="form-control" id="posCustomer" type="text"
                placeholder="e.g. John Smith" value="${this.customerName}"
                oninput="GetOrderView.customerName=this.value"/>
            </div>
          </div>

          <!-- Category tabs -->
          <div class="tab-bar" style="flex-shrink:0;margin-bottom:12px" id="catTabs">
            <button class="tab-btn active" onclick="GetOrderView.setCat('all',this)">All</button>
            ${catTabs}
          </div>

          <!-- Scrollable menu grid -->
          <div id="menuGrid" style="overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch"></div>
        </div>

        <!-- RIGHT: Cart Panel (desktop only) -->
        <div class="pos-cart cart-panel">
          ${this._cartPanelHTML()}
        </div>

      </div>

      <!-- Mobile: Floating cart button -->
      <button class="pos-cart-fab" id="cartFab" onclick="GetOrderView.openCartDrawer()">
        <i class="fa-solid fa-cart-shopping"></i>
        <span id="fabLabel">Cart</span>
        <span id="fabBadge" style="
          background:rgba(255,255,255,.25);
          border-radius:20px;padding:2px 8px;font-size:11px
        ">0</span>
      </button>

      <!-- Mobile: Cart drawer overlay -->
      <div class="pos-cart-overlay" id="cartOverlay" onclick="GetOrderView.closeCartDrawer()"></div>

      <!-- Mobile: Cart drawer -->
      <div class="pos-cart-drawer" id="cartDrawer">
        <div class="pos-drawer-handle"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0">
          <span style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Order Summary</span>
          <button onclick="GetOrderView.closeCartDrawer()" style="
            background:var(--bg-input);border:none;border-radius:8px;
            width:28px;height:28px;font-size:13px;color:var(--text-3);cursor:pointer
          "><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="drawerCartInfo" style="padding:0 16px 6px;font-size:11px;color:var(--text-3)">No items yet</div>
        <div id="drawerCartItems" style="flex:1;overflow-y:auto;padding:0 8px;-webkit-overflow-scrolling:touch"></div>
        <div style="padding:16px;border-top:1px solid var(--border)">
          ${this._totalsHTML('drawer')}
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn btn-outline" style="flex:1" onclick="GetOrderView.clearCart()">
              <i class="fa-solid fa-trash"></i> Clear
            </button>
            <button class="btn btn-primary" style="flex:2" id="drawerPlaceBtn" onclick="GetOrderView.placeOrder()">
              <i class="fa-solid fa-check"></i> Place Order
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /* ── Cart panel HTML (desktop right column) ── */
  _cartPanelHTML() {
    return `
      <div style="padding:16px;border-bottom:1px solid var(--border);flex-shrink:0">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:2px">
          Order Summary
        </div>
        <div id="cartInfo" style="font-size:11px;color:var(--text-3)">No items yet</div>
      </div>
      <div id="cartItems" style="flex:1;overflow-y:auto;padding:8px"></div>
      <div style="padding:16px;border-top:1px solid var(--border);flex-shrink:0">
        ${this._totalsHTML('desktop')}
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-outline" style="flex:1" onclick="GetOrderView.clearCart()">
            <i class="fa-solid fa-trash"></i> Clear
          </button>
          <button class="btn btn-primary" style="flex:2" id="placeOrderBtn" onclick="GetOrderView.placeOrder()">
            <i class="fa-solid fa-check"></i> Place Order
          </button>
        </div>
      </div>
    `;
  },

  /* ── Totals rows HTML (prefix = 'desktop' | 'drawer') ── */
  _totalsHTML(prefix) {
    const row = (label, id, val) => `
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span style="color:var(--text-3)">${label}</span>
        <span id="${prefix}_${id}">${val}</span>
      </div>`;
    return `
      ${row('Subtotal',      'cartSubtotal', '$0.00')}
      ${row('Tax (8.5%)',    'cartTax',      '$0.00')}
      ${row('Service (10%)','cartService',  '$0.00')}
      <div style="display:flex;justify-content:space-between;align-items:center;
        font-weight:700;font-size:16px;
        border-top:1px solid var(--border);
        padding-top:10px;margin-top:6px">
        <span>Total</span>
        <span id="${prefix}_cartTotal" style="color:var(--green)">$0.00</span>
      </div>
    `;
  },

  /* ── init() ── */
  init() {
    this.renderMenu();
    this.renderCart();
  },

  /* ── Mobile cart drawer ── */
  openCartDrawer() {
    document.getElementById('cartDrawer')?.classList.add('show');
    document.getElementById('cartOverlay')?.classList.add('show');
    document.body.style.overflow = 'hidden';
  },
  closeCartDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('show');
    document.getElementById('cartOverlay')?.classList.remove('show');
    document.body.style.overflow = '';
  },

  /* ── Category tab switch ── */
  setCat(cat, btn) {
    this.currentCat = cat;
    document.querySelectorAll('#catTabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderMenu();
  },

  /* ── Menu grid ── */
  renderMenu() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    const cats = this.currentCat === 'all'
      ? DB.menu
      : DB.menu.filter(c => c.cat === this.currentCat);

    grid.innerHTML = cats.map(cat => `
      <div style="margin-bottom:12px">
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:.1em;color:var(--text-3);margin-bottom:8px">
          ${cat.emoji} ${cat.cat}
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">
          ${cat.items.map(item => `
            <div class="menu-item-card" onclick="GetOrderView.addItem('${item.id}')">
              <div style="font-size:24px;margin-bottom:6px">${item.emoji}</div>
              <div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:3px">${item.name}</div>
              <div style="font-size:13px;font-weight:700;color:var(--red)">${Utils.money(item.price)}</div>
            </div>`).join('')}
        </div>
      </div>`).join('');
  },

  /* ── Cart operations ── */
  addItem(itemId) {
    const item     = Utils.allMenuItems().find(i => i.id === itemId);
    if (!item) return;
    const existing = this.cart.find(c => c.id === itemId);
    if (existing) { existing.qty++; } else { this.cart.push({ ...item, qty: 1 }); }
    this.renderCart();
  },

  removeItem(itemId) {
    const idx = this.cart.findIndex(c => c.id === itemId);
    if (idx === -1) return;
    if (this.cart[idx].qty > 1) { this.cart[idx].qty--; } else { this.cart.splice(idx, 1); }
    this.renderCart();
  },

  renderCart() {
    const totalQty  = this.cart.reduce((s, c) => s + c.qty, 0);
    const subtotal  = this.cart.reduce((s, c) => s + c.price * c.qty, 0);
    const emptyHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-3)">
        <i class="fa-solid fa-cart-shopping" style="font-size:28px;opacity:.2;display:block;margin-bottom:8px"></i>
        <p style="font-size:12px">Add items from the menu</p>
      </div>`;

    const itemsHTML = this.cart.length
      ? this.cart.map(c => `
          <div class="cart-item">
            <span style="font-size:16px">${c.emoji}</span>
            <span class="cart-item-name">${c.name}</span>
            <div style="display:flex;align-items:center;gap:6px">
              <button class="qty-btn" onclick="GetOrderView.removeItem('${c.id}')">−</button>
              <span style="font-size:12px;font-weight:700;min-width:16px;text-align:center">${c.qty}</span>
              <button class="qty-btn" onclick="GetOrderView.addItem('${c.id}')">+</button>
            </div>
            <span style="font-size:12px;font-weight:700;min-width:48px;text-align:right">
              ${Utils.money(c.price * c.qty)}
            </span>
          </div>`).join('')
      : emptyHTML;

    const infoText = this.cart.length ? `${totalQty} item(s)` : 'No items yet';

    /* ── Desktop cart update ── */
    const cartEl = document.getElementById('cartItems');
    const infoEl = document.getElementById('cartInfo');
    if (cartEl) cartEl.innerHTML = itemsHTML;
    if (infoEl) infoEl.textContent = infoText;
    this._updateTotals('desktop', subtotal);

    /* ── Mobile drawer cart update ── */
    const drawerEl   = document.getElementById('drawerCartItems');
    const drawerInfo = document.getElementById('drawerCartInfo');
    if (drawerEl)   drawerEl.innerHTML    = itemsHTML;
    if (drawerInfo) drawerInfo.textContent = infoText;
    this._updateTotals('drawer', subtotal);

    /* ── FAB badge update ── */
    const fab     = document.getElementById('cartFab');
    const fabBadge = document.getElementById('fabBadge');
    const fabLabel = document.getElementById('fabLabel');
    if (fabBadge) fabBadge.textContent = totalQty;
    if (fabLabel) fabLabel.textContent = totalQty ? `Cart` : 'Cart';
    if (fab) fab.style.background = totalQty ? 'var(--red)' : 'var(--text-3)';
  },

  _updateTotals(prefix, subtotal) {
    const tax     = subtotal * 0.085;
    const service = subtotal * 0.10;
    const grand   = subtotal + tax + service;
    const set = (id, val) => {
      const el = document.getElementById(`${prefix}_${id}`);
      if (el) el.textContent = Utils.money(val);
    };
    set('cartSubtotal', subtotal);
    set('cartTax',      tax);
    set('cartService',  service);
    set('cartTotal',    grand);
  },

  clearCart() {
    this.cart = [];
    this.renderCart();
  },

  /* ────────────────────────────────────────────
     placeOrder() — AJAX দিয়ে order submit করে
  ──────────────────────────────────────────── */
  async placeOrder() {
    if (!this.cart.length) {
      Toast.show('Add at least one item', 'warning');
      return;
    }
    const table    = document.getElementById('posTable')?.value    || this.tableNum;
    const customer = document.getElementById('posCustomer')?.value || this.customerName || 'Guest';
    if (!table) {
      Toast.show('Please enter a table number', 'warning');
      return;
    }

    const subtotal = this.cart.reduce((s, c) => s + c.price * c.qty, 0);
    const newOrder = {
      id:       `#${String(Math.floor(Math.random() * 900) + 100)}`,
      table:    parseInt(table),
      customer,
      items:    this.cart.map(c => `${c.name}${c.qty > 1 ? ' x' + c.qty : ''}`),
      status:   'pending',
      total:    Math.round(subtotal * 1.185),
      created:  new Date(),
    };

    /* Button loading — both desktop + drawer */
    ['placeOrderBtn', 'drawerPlaceBtn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing…'; }
    });

    try {
      await API.createOrder(newOrder);

      this.cart         = [];
      this.tableNum     = '';
      this.customerName = '';

      this.closeCartDrawer();
      Toast.show(`Order ${newOrder.id} placed for Table ${table}!`, 'success');
      Router.go('orders');

    } catch (err) {
      console.error('Place order error:', err);
      Toast.show('Failed to place order. Try again.', 'error');

      ['placeOrderBtn', 'drawerPlaceBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i> Place Order'; }
      });
    }
  },
};