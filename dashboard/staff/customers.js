/* ================================================
   CUSTOMERS VIEW  (views/customers.js)

   Shows customer profiles in a card grid.
   Can filter by status, search by name/email,
   add new customers, and start orders for them.
================================================ */

const CustomersView = {

  /* ── STATE ── */
  currentFilter: 'all',
  searchTerm:    '',

  /* ────────────────────────────────────────────
     render() — page HTML shell
  ──────────────────────────────────────────── */
  render() {
    const total = DB.customers.length;
    const vip   = DB.customers.filter(c => c.status === 'vip').length;
    const spent = DB.customers.reduce((s, c) => s + c.spent, 0);

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Customers</h1>
          <p class="page-subtitle">Manage customer profiles and history</p>
        </div>
        <button class="btn btn-primary" onclick="CustomersView.openAddForm()">
          <i class="fa-solid fa-user-plus"></i> Add Customer
        </button>
      </div>

      <!-- Summary stats -->
      <div class="grid-3" style="margin-bottom:16px">
        <div class="stat-card">
          <div class="stat-label">Total Customers</div>
          <div class="stat-value">${total}</div>
          <div class="stat-sub">All time</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">VIP Members</div>
          <div class="stat-value">${vip}</div>
          <div class="stat-sub">Top spenders</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">$${(spent / 1000).toFixed(1)}k</div>
          <div class="stat-sub">From all customers</div>
        </div>
      </div>

      <!-- Search + filter row -->
      <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
        <div class="topbar-search" style="max-width:260px">
          <i class="fa-solid fa-magnifying-glass" style="color:var(--text-3);font-size:12px;flex-shrink:0"></i>
          <input type="text" placeholder="Search by name or email…"
            oninput="CustomersView.search(this.value)"/>
        </div>
        <div class="tab-bar" style="margin-bottom:0" id="customerTabs">
          <button class="tab-btn active" onclick="CustomersView.setFilter('all',this)">All</button>
          <button class="tab-btn" onclick="CustomersView.setFilter('vip',this)">⭐ VIP</button>
          <button class="tab-btn" onclick="CustomersView.setFilter('regular',this)">Regular</button>
          <button class="tab-btn" onclick="CustomersView.setFilter('new',this)">New</button>
        </div>
      </div>

      <!-- Customer card grid -->
      <div id="customerGrid"></div>`;
  },

  /* ── init() ── */
  init() {
    this.renderGrid();
  },

  /* ── Filter by status ── */
  setFilter(status, btn) {
    this.currentFilter = status;
    document.querySelectorAll('#customerTabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderGrid();
  },

  /* ── Live search ── */
  search(val) {
    this.searchTerm = val.toLowerCase();
    this.renderGrid();
  },

  /* ── Draw customer cards ── */
  renderGrid() {
    const grid = document.getElementById('customerGrid');
    if (!grid) return;

    let list = DB.customers;
    if (this.currentFilter !== 'all') list = list.filter(c => c.status === this.currentFilter);
    if (this.searchTerm) list = list.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm) ||
      c.email.toLowerCase().includes(this.searchTerm));

    if (!list.length) {
      grid.innerHTML = `
        <div style="text-align:center;padding:60px;color:var(--text-3)">
          <i class="fa-solid fa-users" style="font-size:32px;opacity:.2;margin-bottom:10px;display:block"></i>
          No customers found
        </div>`;
      return;
    }

    grid.innerHTML = `<div class="grid-3">${list.map(c => this._cardHTML(c)).join('')}</div>`;
  },

  /* ── Single customer card ── */
  _cardHTML(c) {
    const tagMap  = { vip:'tag-vip', regular:'tag-regular', new:'tag-new' };
    const tagClass = tagMap[c.status] || 'tag-pending';

    return `
      <div class="card" style="transition:all .2s"
        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-md)'"
        onmouseout="this.style.transform='';this.style.boxShadow=''">

        <!-- Header row: avatar + name + status -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div class="customer-avatar" style="background:${c.color}">${c.name[0]}</div>
          <div style="flex:1;overflow:hidden">
            <p style="font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</p>
            <p style="font-size:10px;color:var(--text-3)">${c.phone}</p>
          </div>
          <span class="tag ${tagClass}">${c.status.toUpperCase()}</span>
        </div>

        <!-- Visits & Spent stats -->
        <div class="grid-2" style="gap:8px;margin-bottom:12px">
          <div style="background:var(--bg-surface2);border-radius:8px;padding:8px">
            <p style="font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">Visits</p>
            <p style="font-size:18px;font-weight:700;font-family:'Playfair Display',serif">${c.visits}</p>
          </div>
          <div style="background:var(--bg-surface2);border-radius:8px;padding:8px">
            <p style="font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">Total Spent</p>
            <p style="font-size:18px;font-weight:700;font-family:'Playfair Display',serif;color:var(--green)">$${c.spent}</p>
          </div>
        </div>

        <!-- Note (if any) -->
        ${c.note ? `
          <p style="font-size:10px;color:var(--text-3);background:var(--gold-pale);border-radius:6px;padding:5px 8px;margin-bottom:10px">
            <i class="fa-solid fa-note-sticky" style="color:var(--gold);margin-right:4px"></i>${c.note}
          </p>` : ''}

        <!-- Action buttons -->
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" style="flex:1" onclick="CustomersView.viewDetails('${c.id}')">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="btn btn-green btn-sm" style="flex:1" onclick="CustomersView.startOrderFor('${c.id}')">
            <i class="fa-solid fa-plus"></i> Order
          </button>
        </div>
      </div>`;
  },

  /* ── Customer detail modal ── */
  viewDetails(id) {
    const c = DB.customers.find(x => x.id === id);
    if (!c) return;

    document.getElementById('customerModalContent').innerHTML = `
      <div class="modal-title">${c.name}</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
        <div class="customer-avatar" style="background:${c.color};width:56px;height:56px;font-size:22px">${c.name[0]}</div>
        <div>
          <p style="font-size:14px;font-weight:700">${c.name}</p>
          <p style="font-size:12px;color:var(--text-3)">${c.email}</p>
          <p style="font-size:12px;color:var(--text-3)">${c.phone}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        ${[
          ['Visits',     c.visits],
          ['Total Spent', '$' + c.spent],
          ['Avg/Visit',   '$' + Math.round(c.spent / (c.visits || 1))],
        ].map(([label, val]) => `
          <div class="card" style="padding:12px;box-shadow:none;text-align:center">
            <p style="font-size:9px;color:var(--text-3);text-transform:uppercase">${label}</p>
            <p style="font-size:20px;font-weight:700;font-family:'Playfair Display',serif;color:var(--text)">${val}</p>
          </div>`).join('')}
      </div>
      ${c.note ? `
        <div style="background:var(--gold-pale);border-radius:8px;padding:12px;margin-bottom:14px">
          <p style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:4px">📝 Note</p>
          <p style="font-size:12px">${c.note}</p>
        </div>` : ''}
      <p style="font-size:11px;color:var(--text-3);margin-bottom:16px">Last visit: ${c.lastVisit}</p>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" style="flex:1" onclick="CustomersView.startOrderFor('${c.id}');Modal.close('customerModal')">
          <i class="fa-solid fa-plus"></i> New Order
        </button>
        <button class="btn btn-outline" onclick="Modal.close('customerModal')">Close</button>
      </div>`;

    Modal.open('customerModal');
  },

  /* ── Go to Get Order screen pre-filled with customer name ── */
  startOrderFor(id) {
    const c = DB.customers.find(x => x.id === id);
    if (!c) return;
    GetOrderView.customerName = c.name;
    GetOrderView.cart = [];
    Modal.close('customerModal');
    Router.go('getorder');
  },

  /* ── Add customer form modal ── */
  openAddForm() {
    document.getElementById('customerModalContent').innerHTML = `
      <div class="modal-title"><i class="fa-solid fa-user-plus" style="color:var(--red)"></i> Add New Customer</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input class="form-control" id="cnName" placeholder="e.g. John Smith"/>
        </div>
        <div class="form-group">
          <label class="form-label">Phone *</label>
          <input class="form-control" id="cnPhone" placeholder="+1-555-0100"/>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Email</label>
        <input class="form-control" id="cnEmail" placeholder="email@example.com"/>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Special Note (allergies, preferences)</label>
        <input class="form-control" id="cnNote" placeholder="e.g. Shellfish allergy"/>
      </div>
      <div class="form-group" style="margin-bottom:16px">
        <label class="form-label">Status</label>
        <select class="form-control" id="cnStatus">
          <option value="new">New</option>
          <option value="regular">Regular</option>
          <option value="vip">VIP</option>
        </select>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="CustomersView.saveCustomer()">
        <i class="fa-solid fa-save"></i> Save Customer
      </button>`;
    Modal.open('customerModal');
  },

  /* ── Save new customer ── */
  saveCustomer() {
    const name  = document.getElementById('cnName').value.trim();
    const phone = document.getElementById('cnPhone').value.trim();
    if (!name || !phone) { Toast.show('Name and phone are required', 'warning'); return; }

    const palette = ['#c0392b','#1a5276','#2d7a47','#b8963e','#6d3b8e','#c47a1a','#96281b'];

    DB.customers.push({
      id:        'c' + Date.now(),
      name,
      phone,
      email:     document.getElementById('cnEmail').value,
      note:      document.getElementById('cnNote').value,
      status:    document.getElementById('cnStatus').value,
      visits:    0,
      spent:     0,
      lastVisit: '—',
      color:     palette[Math.floor(Math.random() * palette.length)],
    });

    Modal.close('customerModal');
    Toast.show('Customer added!', 'success');
    this.renderGrid();
  },
};
