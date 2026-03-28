/* ================================================
   CUSTOMERS VIEW
================================================ */

const CustomersView = {

  _search: '',

  render() {
    return `
      <div id="custRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">Management</div>
            <h1 class="page-title">Custo<em style="color:var(--red);font-style:italic">mers</em></h1>
          </div>
          <div style="display:flex;gap:8px">
            <div class="topbar-search" style="max-width:220px">
              <i class="fa-solid fa-magnifying-glass" style="color:var(--text-3);font-size:12px"></i>
              <input type="text" placeholder="Search customers…" oninput="CustomersView.search(this.value)"/>
            </div>
            <button class="btn btn-primary btn-sm" onclick="CustomersView.openAddModal()"><i class="fa-solid fa-plus"></i> Add Customer</button>
          </div>
        </div>

        <!-- Summary -->
        <div class="grid-4 anim-1" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-label">Total Customers</div><div class="stat-value">${DB.customers.length}</div></div>
          <div class="stat-card"><div class="stat-label">VIP Customers</div><div class="stat-value" style="color:var(--gold)">${DB.customers.filter(c=>c.status==='vip').length}</div></div>
          <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value">${Utils.money(DB.customers.reduce((s,c)=>s+c.spent,0))}</div></div>
          <div class="stat-card"><div class="stat-label">Avg Visits</div><div class="stat-value">${Math.round(DB.customers.reduce((s,c)=>s+c.visits,0)/DB.customers.length)}</div></div>
        </div>

        <!-- Customer Table -->
        <div class="card anim-2">
          <table class="data-table" id="customerTable">
            <thead>
              <tr><th>Customer</th><th>Contact</th><th>Visits</th><th>Total Spent</th><th>Last Visit</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody id="customerBody"></tbody>
          </table>
        </div>
      </div>`;
  },

  // AJAX: JSONPlaceholder /users থেকে data load করে তারপর table render করে
  async init() {
    const el = document.getElementById('customerBody');
    if (el) el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-3)"><i class="fa-solid fa-spinner fa-spin"></i> Loading customers…</td></tr>';
    await Api.getCustomers();
    this.renderTable();
    // Summary cards আপডেট করো নতুন data দিয়ে
    const root = document.getElementById('custRoot');
    if (root) {
      root.querySelectorAll('.stat-value')[0].textContent = DB.customers.length;
      root.querySelectorAll('.stat-value')[1].textContent = DB.customers.filter(c=>c.status==='vip').length;
      root.querySelectorAll('.stat-value')[2].textContent = Utils.money(DB.customers.reduce((s,c)=>s+c.spent,0));
      root.querySelectorAll('.stat-value')[3].textContent = Math.round(DB.customers.reduce((s,c)=>s+c.visits,0)/DB.customers.length);
    }
  },

  search(val) { this._search = val.toLowerCase(); this.renderTable(); },

  renderTable() {
    const el = document.getElementById('customerBody');
    if (!el) return;
    const filtered = this._search
      ? DB.customers.filter(c => c.name.toLowerCase().includes(this._search) || c.email.toLowerCase().includes(this._search))
      : DB.customers;

    el.innerHTML = filtered.map(c => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="customer-avatar" style="background:${c.color}">${c.name.charAt(0)}</div>
            <div>
              <div style="font-weight:600;color:var(--text)">${c.name}</div>
              ${c.note ? `<div style="font-size:10px;color:var(--text-3);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.note}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <div style="font-size:11px">${c.email}</div>
          <div style="font-size:10px;color:var(--text-3)">${c.phone}</div>
        </td>
        <td style="font-weight:700">${c.visits}</td>
        <td style="font-weight:700;font-family:'Playfair Display',serif">${Utils.money(c.spent)}</td>
        <td style="font-size:11px;color:var(--text-3)">${Utils.formatDate(c.lastVisit)}</td>
        <td><span class="tag tag-${c.status}">${c.status}</span></td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-outline btn-sm btn-icon" onclick="CustomersView.viewCustomer('${c.id}')"><i class="fa-solid fa-eye"></i></button>
            <button class="btn btn-outline btn-sm btn-icon" onclick="Toast.show('Edit customer','info')"><i class="fa-solid fa-pen"></i></button>
          </div>
        </td>
      </tr>`).join('');
  },

  viewCustomer(id) {
    const c = DB.customers.find(x => x.id === id);
    if (!c) return;
    document.getElementById('customerModalContent').innerHTML = `
      <div class="modal-title">Customer Details</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
        <div class="customer-avatar" style="width:56px;height:56px;font-size:22px;background:${c.color}">${c.name.charAt(0)}</div>
        <div>
          <div style="font-size:18px;font-weight:700;font-family:'Playfair Display',serif">${c.name}</div>
          <span class="tag tag-${c.status}">${c.status}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
        <div class="form-group"><div class="form-label">Email</div><div style="font-size:12px">${c.email}</div></div>
        <div class="form-group"><div class="form-label">Phone</div><div style="font-size:12px">${c.phone}</div></div>
        <div class="form-group"><div class="form-label">Total Visits</div><div style="font-size:16px;font-weight:700;font-family:'Playfair Display',serif">${c.visits}</div></div>
        <div class="form-group"><div class="form-label">Total Spent</div><div style="font-size:16px;font-weight:700;font-family:'Playfair Display',serif;color:var(--green)">${Utils.money(c.spent)}</div></div>
        <div class="form-group"><div class="form-label">Last Visit</div><div style="font-size:12px">${Utils.formatDate(c.lastVisit)}</div></div>
        <div class="form-group"><div class="form-label">Avg per Visit</div><div style="font-size:12px;font-weight:700">${Utils.money(Math.round(c.spent/c.visits))}</div></div>
      </div>
      ${c.note ? `<div style="background:var(--bg-surface2);border-radius:8px;padding:12px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-note-sticky" style="color:var(--gold);margin-right:6px"></i>${c.note}</div>` : ''}
    `;
    Modal.open('customerModal');
  },

  openAddModal() {
    document.getElementById('customerModalContent').innerHTML = `
      <div class="modal-title">Add New Customer</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name</label><input id="addCustName" class="form-control" placeholder="Enter name…"/></div>
        <div class="form-group"><label class="form-label">Phone</label><input id="addCustPhone" class="form-control" placeholder="+1-555-…"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input id="addCustEmail" class="form-control" placeholder="email@example.com"/></div>
        <div class="form-group"><label class="form-label">Status</label>
          <select id="addCustStatus" class="form-control"><option value="regular">Regular</option><option value="vip">VIP</option><option value="new">New</option></select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:16px"><label class="form-label">Notes</label><textarea id="addCustNote" class="form-control" rows="3" placeholder="Any special notes…"></textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-outline" onclick="Modal.close('customerModal')">Cancel</button>
        <button class="btn btn-primary" onclick="CustomersView.addCustomer()">Add Customer</button>
      </div>`;
    Modal.open('customerModal');
  },

  addCustomer() {
    const name   = document.getElementById('addCustName').value.trim();
    const phone  = document.getElementById('addCustPhone').value.trim();
    const email  = document.getElementById('addCustEmail').value.trim();
    const status = document.getElementById('addCustStatus').value;
    const note   = document.getElementById('addCustNote').value.trim();

    if (!name) { Toast.show('Please enter a name', 'warning'); return; }
    if (!email) { Toast.show('Please enter an email', 'warning'); return; }

    const COLORS = ['#c0392b','#1a5276','#c47a1a','#6d3b8e','#2d7a47','#96281b','#b8963e','#9b8c86'];
    const newCustomer = {
      id:        'c' + (Date.now()),
      name,
      phone:     phone || '+1-555-0000',
      email,
      visits:    0,
      spent:     0,
      lastVisit: new Date().toISOString().slice(0, 10),
      status,
      color:     COLORS[DB.customers.length % COLORS.length],
      note,
    };

    DB.customers.unshift(newCustomer);
    this.renderTable();
    this._updateSummary();
    Modal.close('customerModal');
    Toast.show(`Customer "${name}" added successfully!`, 'success');
  },

  _updateSummary() {
    const root = document.getElementById('custRoot');
    if (!root) return;
    const stats = root.querySelectorAll('.stat-value');
    stats[0].textContent = DB.customers.length;
    stats[1].textContent = DB.customers.filter(c => c.status === 'vip').length;
    stats[2].textContent = Utils.money(DB.customers.reduce((s, c) => s + c.spent, 0));
    stats[3].textContent = DB.customers.length ? Math.round(DB.customers.reduce((s, c) => s + c.visits, 0) / DB.customers.length) : 0;
  },

};
