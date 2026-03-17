/* ================================================
   GET ORDER VIEW  (views/getorder.js)

   A simple POS (Point of Sale) screen.
   Staff pick items from the menu, add to cart,
   then place the order.
================================================ */

const GetOrderView = {

  /* ── STATE ── */
  cart:         [],   // Array of { id, name, price, emoji, qty }
  currentCat:   'all',
  tableNum:     '',
  customerName: '',

  /* ────────────────────────────────────────────
     render() — page HTML shell
  ──────────────────────────────────────────── */
  render() {
    const catTabs = DB.menu.map(c =>
      `<button class="tab-btn" onclick="GetOrderView.setCat('${c.cat}',this)">${c.emoji} ${c.cat}</button>`
    ).join('');

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Get Order</h1>
          <p class="page-subtitle">Take new orders from customers</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 340px;gap:16px;height:calc(100vh - 150px)">

        <!-- LEFT: Menu Panel -->
        <div style="display:flex;flex-direction:column;overflow:hidden">

          <!-- Table & Customer inputs -->
          <div class="form-row" style="flex-shrink:0">
            <div class="form-group">
              <label class="form-label"><i class="fa-solid fa-table-cells" style="color:var(--red)"></i> Table Number</label>
              <input class="form-control" id="posTable" type="number" min="1" max="20"
                placeholder="e.g. 5" value="${this.tableNum}"
                oninput="GetOrderView.tableNum=this.value"/>
            </div>
            <div class="form-group">
              <label class="form-label"><i class="fa-solid fa-user" style="color:var(--red)"></i> Customer Name</label>
              <input class="form-control" id="posCustomer" type="text"
                placeholder="e.g. John Smith" value="${this.customerName}"
                oninput="GetOrderView.customerName=this.value"/>
            </div>
          </div>

          <!-- Category filter tabs -->
          <div class="tab-bar" style="flex-shrink:0;margin-bottom:12px" id="catTabs">
            <button class="tab-btn active" onclick="GetOrderView.setCat('all',this)">All</button>
            ${catTabs}
          </div>

          <!-- Scrollable menu grid -->
          <div id="menuGrid" style="overflow-y:auto;flex:1"></div>
        </div>

        <!-- RIGHT: Cart Panel -->
        <div class="cart-panel">
          <div style="padding:16px;border-bottom:1px solid var(--border)">
            <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:2px">
              Order Summary
            </div>
            <div id="cartInfo" style="font-size:11px;color:var(--text-3)">No items yet</div>
          </div>

          <!-- Cart items list -->
          <div id="cartItems" style="flex:1;overflow-y:auto;padding:8px"></div>

          <!-- Totals + Place Order button -->
          <div style="padding:16px;border-top:1px solid var(--border)">
            ${this._totalRowHTML('Subtotal',    'cartSubtotal', '$0.00')}
            ${this._totalRowHTML('Tax (8.5%)',  'cartTax',      '$0.00')}
            ${this._totalRowHTML('Service (10%)','cartService', '$0.00')}
            <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:16px;border-top:1px solid var(--border);padding-top:10px;margin-top:6px">
              <span>Total</span>
              <span id="cartTotal" style="color:var(--green)">$0.00</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px">
              <button class="btn btn-outline" style="flex:1" onclick="GetOrderView.clearCart()">
                <i class="fa-solid fa-trash"></i> Clear
              </button>
              <button class="btn btn-primary" style="flex:2" onclick="GetOrderView.placeOrder()">
                <i class="fa-solid fa-check"></i> Place Order
              </button>
            </div>
          </div>
        </div>

      </div>`;
  },

  /* ── Small helper: one total row ── */
  _totalRowHTML(label, id, defaultVal) {
    return `
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span style="color:var(--text-3)">${label}</span>
        <span id="${id}">${defaultVal}</span>
      </div>`;
  },

  /* ── init() — runs after render ── */
  init() {
    this.renderMenu();
    this.renderCart();
  },

  /* ── Switch category tab ── */
  setCat(cat, btn) {
    this.currentCat = cat;
    document.querySelectorAll('#catTabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderMenu();
  },

  /* ── Draw the menu item cards ── */
  renderMenu() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    // Filter categories if one is selected
    const cats = this.currentCat === 'all'
      ? DB.menu
      : DB.menu.filter(c => c.cat === this.currentCat);

    grid.innerHTML = cats.map(cat => `
      <div style="margin-bottom:12px">
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);margin-bottom:8px">
          ${cat.emoji} ${cat.cat}
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">
          ${cat.items.map(item => `
            <div class="menu-item-card" onclick="GetOrderView.addItem('${item.id}')">
              <div style="font-size:24px;margin-bottom:6px">${item.emoji}</div>
              <div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:3px">${item.name}</div>
              <div style="font-size:13px;font-weight:700;color:var(--red)">${Utils.money(item.price)}</div>
            </div>`).join('')}
        </div>
      </div>`).join('');
  },

  /* ── Add item to cart (or increase qty) ── */
  addItem(itemId) {
    const item     = Utils.allMenuItems().find(i => i.id === itemId);
    if (!item) return;
    const existing = this.cart.find(c => c.id === itemId);

    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ ...item, qty: 1 });
    }
    this.renderCart();
  },

  /* ── Remove item from cart (or decrease qty) ── */
  removeItem(itemId) {
    const idx = this.cart.findIndex(c => c.id === itemId);
    if (idx === -1) return;
    if (this.cart[idx].qty > 1) {
      this.cart[idx].qty--;
    } else {
      this.cart.splice(idx, 1);
    }
    this.renderCart();
  },

  /* ── Re-draw the cart panel ── */
  renderCart() {
    const cartEl = document.getElementById('cartItems');
    const infoEl = document.getElementById('cartInfo');
    if (!cartEl) return;

    if (!this.cart.length) {
      cartEl.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-3)">
          <i class="fa-solid fa-cart-shopping" style="font-size:28px;opacity:.2;display:block;margin-bottom:8px"></i>
          <p style="font-size:12px">Add items from the menu</p>
        </div>`;
      if (infoEl) infoEl.textContent = 'No items yet';
      this._updateTotals(0);
      return;
    }

    // Draw each cart item
    cartEl.innerHTML = this.cart.map(c => `
      <div class="cart-item">
        <span style="font-size:16px">${c.emoji}</span>
        <span class="cart-item-name">${c.name}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="qty-btn" onclick="GetOrderView.removeItem('${c.id}')">−</button>
          <span style="font-size:12px;font-weight:700;min-width:16px;text-align:center">${c.qty}</span>
          <button class="qty-btn" onclick="GetOrderView.addItem('${c.id}')">+</button>
        </div>
        <span style="font-size:12px;font-weight:700;min-width:48px;text-align:right">${Utils.money(c.price * c.qty)}</span>
      </div>`).join('');

    const totalQty = this.cart.reduce((s, c) => s + c.qty, 0);
    if (infoEl) infoEl.textContent = `${totalQty} item(s)`;
    this._updateTotals(this.cart.reduce((s, c) => s + c.price * c.qty, 0));
  },

  /* ── Update total/tax/service figures ── */
  _updateTotals(subtotal) {
    const tax     = subtotal * 0.085;
    const service = subtotal * 0.10;
    const grand   = subtotal + tax + service;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = Utils.money(val); };
    set('cartSubtotal', subtotal);
    set('cartTax',      tax);
    set('cartService',  service);
    set('cartTotal',    grand);
  },

  clearCart() {
    this.cart = [];
    this.renderCart();
  },

  /* ── Submit order → goes to DB.orders ── */
  placeOrder() {
    if (!this.cart.length) { Toast.show('Add at least one item', 'warning'); return; }
    const table    = document.getElementById('posTable')?.value || this.tableNum;
    const customer = document.getElementById('posCustomer')?.value || this.customerName || 'Guest';
    if (!table)    { Toast.show('Please enter a table number', 'warning'); return; }

    const subtotal = this.cart.reduce((s, c) => s + c.price * c.qty, 0);
    const id       = `#${String(Math.floor(Math.random() * 900) + 100)}`;

    // Push new order to the shared data store
    DB.orders.unshift({
      id,
      table:    parseInt(table),
      customer,
      items:    this.cart.map(c => `${c.name}${c.qty > 1 ? ' x' + c.qty : ''}`),
      status:   'pending',
      total:    Math.round(subtotal * 1.185),
      created:  new Date(),
    });

    // Reset form
    this.cart         = [];
    this.tableNum     = '';
    this.customerName = '';

    Toast.show(`Order ${id} placed for Table ${table}!`, 'success');
    Router.go('orders');
  },
};
