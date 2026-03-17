/* ================================================
   TRANSACTIONS VIEW  (views/transactions.js)
================================================ */

const TransactionsView = {

  filter: 'all',

  render() {
    const completed = DB.transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const pending   = DB.transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
    const cardCount = DB.transactions.filter(t => t.method === 'card').length;
    const cashCount = DB.transactions.filter(t => t.method === 'cash').length;

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Transactions</h1>
          <p class="page-subtitle">All payment records and history</p>
        </div>
        <button class="btn btn-outline btn-sm" onclick="TransactionsView.exportCSV()">
          <i class="fa-solid fa-file-export"></i> Export CSV
        </button>
      </div>

      <!-- Summary cards -->
      <div class="grid-4" style="margin-bottom:16px">
        <div class="stat-card">
          <div class="stat-label">Total Collected</div>
          <div class="stat-value">${Utils.money(completed)}</div>
          <div class="stat-sub" style="color:var(--green)">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pending</div>
          <div class="stat-value">${Utils.money(pending)}</div>
          <div class="stat-sub" style="color:var(--orange)">Awaiting payment</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Card Payments</div>
          <div class="stat-value">${cardCount}</div>
          <div class="stat-sub">Transactions</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cash Payments</div>
          <div class="stat-value">${cashCount}</div>
          <div class="stat-sub">Transactions</div>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="tab-bar" id="txnTabs">
        <button class="tab-btn active" onclick="TransactionsView.setFilter('all',this)">All</button>
        <button class="tab-btn" onclick="TransactionsView.setFilter('completed',this)">Completed</button>
        <button class="tab-btn" onclick="TransactionsView.setFilter('pending',this)">Pending</button>
        <button class="tab-btn" onclick="TransactionsView.setFilter('refunded',this)">Refunded</button>
        <button class="tab-btn" onclick="TransactionsView.setFilter('card',this)">💳 Card</button>
        <button class="tab-btn" onclick="TransactionsView.setFilter('cash',this)">💵 Cash</button>
      </div>

      <!-- Table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th><th>Order</th><th>Customer</th>
                <th>Method</th><th>Amount</th><th>Date & Time</th>
                <th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody id="txnBody"></tbody>
          </table>
        </div>
      </div>`;
  },

  init() {
    this.filter = 'all';
    this.renderTable();
  },

  setFilter(f, btn) {
    this.filter = f;
    document.querySelectorAll('#txnTabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderTable();
  },

  renderTable() {
    const tbody = document.getElementById('txnBody');
    if (!tbody) return;

    // Filter list by selected tab
    let list = DB.transactions;
    if (this.filter === 'card' || this.filter === 'cash') {
      list = list.filter(t => t.method === this.filter);
    } else if (this.filter !== 'all') {
      list = list.filter(t => t.status === this.filter);
    }

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-3)">No transactions found</td></tr>`;
      return;
    }

    const methodIcon = {
      card: '<i class="fa-solid fa-credit-card" style="color:var(--blue)"></i>',
      cash: '<i class="fa-solid fa-money-bill"  style="color:var(--green)"></i>',
    };
    const statusTagMap = { completed:'tag-delivered', pending:'tag-pending', refunded:'tag-cancelled' };

    tbody.innerHTML = list.map(t => `
      <tr>
        <td><b style="font-size:11px">${t.id}</b></td>
        <td><b style="font-family:'Playfair Display',serif">${t.orderId}</b></td>
        <td>${t.customer}</td>
        <td>${methodIcon[t.method] || ''} <span style="font-size:11px;font-weight:600;margin-left:4px">${t.method.toUpperCase()}</span></td>
        <td style="font-weight:700;color:${t.status === 'refunded' ? 'var(--red)' : t.status === 'pending' ? 'var(--orange)' : 'var(--green)'}">
          ${t.status === 'refunded' ? '-' : ''}${Utils.money(t.amount)}
        </td>
        <td style="font-size:11px;color:var(--text-3)">${t.date} ${t.time}</td>
        <td><span class="tag ${statusTagMap[t.status] || 'tag-pending'}">${t.status}</span></td>
        <td>
          ${t.status === 'pending'   ? `<button class="btn btn-green btn-sm" onclick="TransactionsView.markPaid('${t.id}')">Mark Paid</button>` : ''}
          ${t.status === 'completed' ? `<button class="btn btn-outline btn-sm" onclick="TransactionsView.printReceipt('${t.id}')"><i class="fa-solid fa-print"></i></button>` : ''}
        </td>
      </tr>`).join('');
  },

  markPaid(id) {
    const t = DB.transactions.find(x => x.id === id);
    if (!t) return;
    t.status = 'completed';
    Toast.show(`${id} marked as paid`, 'success');
    this.renderTable();
  },

  printReceipt(id) {
    Toast.show(`Receipt for ${id} sent to printer`, 'info');
  },

  exportCSV() {
    const header = 'ID,Order,Customer,Method,Amount,Date,Time,Status';
    const rows   = DB.transactions.map(t =>
      `${t.id},${t.orderId},${t.customer},${t.method},${t.amount},${t.date},${t.time},${t.status}`
    );
    const csv = [header, ...rows].join('\n');
    const a   = document.createElement('a');
    a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'savoria-transactions.csv';
    a.click();
    Toast.show('CSV exported!', 'success');
  },
};


/* ================================================
   SETTINGS VIEW  (views/settings.js)
================================================ */

const SettingsView = {

  render() {
    const s = DB.settings;

    // Helper: one toggle row
    const toggleRow = (key, label, desc) => `
      <div class="settings-row">
        <div>
          <div class="settings-row-label">${label}</div>
          <div class="settings-row-desc">${desc}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="s-${key}" ${s[key] ? 'checked' : ''}
            onchange="DB.settings['${key}']=this.checked"/>
          <span class="toggle-slider"></span>
        </label>
      </div>`;

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Configure your restaurant preferences</p>
        </div>
        <button class="btn btn-primary" onclick="SettingsView.saveAll()">
          <i class="fa-solid fa-save"></i> Save Changes
        </button>
      </div>

      <!-- ── Restaurant Info ── -->
      <div class="settings-section">
        <div class="settings-section-header">
          <i class="fa-solid fa-store" style="color:var(--red)"></i> Restaurant Information
        </div>
        <div style="padding:20px">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Restaurant Name</label>
              <input class="form-control" id="s-name" value="${s.restaurantName}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input class="form-control" id="s-phone" value="${s.phone}"/>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label">Address</label>
            <input class="form-control" id="s-address" value="${s.address}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" id="s-email" value="${s.email}"/>
          </div>
        </div>
      </div>

      <!-- ── Financial ── -->
      <div class="settings-section">
        <div class="settings-section-header">
          <i class="fa-solid fa-dollar-sign" style="color:var(--green)"></i> Financial Settings
        </div>
        <div style="padding:20px">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Currency</label>
              <select class="form-control" id="s-currency">
                <option ${s.currency === '$' ? 'selected' : ''}>$</option>
                <option ${s.currency === '€' ? 'selected' : ''}>€</option>
                <option ${s.currency === '£' ? 'selected' : ''}>£</option>
                <option ${s.currency === '৳' ? 'selected' : ''}>৳</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tax Rate (%)</label>
              <input class="form-control" id="s-tax" type="number" step="0.1" value="${s.taxRate}"/>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Service Charge (%)</label>
              <input class="form-control" id="s-service" type="number" step="0.5" value="${s.serviceCharge}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Language</label>
              <select class="form-control" id="s-lang">
                <option>English</option>
                <option>Bengali</option>
                <option>Italian</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Notifications ── -->
      <div class="settings-section">
        <div class="settings-section-header">
          <i class="fa-solid fa-bell" style="color:var(--orange)"></i> Notifications
        </div>
        ${toggleRow('autoAccept', 'Auto-accept Orders',   'Automatically accept new orders without confirmation')}
        ${toggleRow('soundAlerts', 'Sound Alerts',         'Play audio when new orders arrive')}
        ${toggleRow('emailNotif', 'Email Notifications',  'Send order summaries to email')}
        ${toggleRow('smsNotif',   'SMS Notifications',    'Send SMS alerts for new orders')}
      </div>

      <!-- ── Appearance ── -->
      <div class="settings-section">
        <div class="settings-section-header">
          <i class="fa-solid fa-palette" style="color:var(--purple)"></i> Appearance
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Dark Mode</div>
            <div class="settings-row-desc">Switch to dark theme for low-light environments</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="s-dark" ${Theme._dark ? 'checked' : ''}
              onchange="Theme.toggle(); this.checked = Theme._dark"/>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- ── Danger Zone ── -->
      <div class="settings-section" style="border-color:var(--red)">
        <div class="settings-section-header" style="color:var(--red)">
          <i class="fa-solid fa-triangle-exclamation"></i> Danger Zone
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Clear All Orders</div>
            <div class="settings-row-desc">Remove all order history permanently</div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="SettingsView.clearOrders()">
            <i class="fa-solid fa-trash"></i> Clear
          </button>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Reset to Defaults</div>
            <div class="settings-row-desc">Restore all settings to factory defaults</div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="SettingsView.resetDefaults()">
            <i class="fa-solid fa-rotate-left"></i> Reset
          </button>
        </div>
      </div>`;
  },

  init() { /* nothing needed on load */ },

  /* ── Read inputs and save to DB.settings ── */
  saveAll() {
    const get = id => document.getElementById(id)?.value;
    DB.settings.restaurantName = get('s-name')    || DB.settings.restaurantName;
    DB.settings.phone          = get('s-phone')   || DB.settings.phone;
    DB.settings.address        = get('s-address') || DB.settings.address;
    DB.settings.email          = get('s-email')   || DB.settings.email;
    DB.settings.currency       = get('s-currency')|| DB.settings.currency;
    DB.settings.taxRate        = parseFloat(get('s-tax'))     || DB.settings.taxRate;
    DB.settings.serviceCharge  = parseFloat(get('s-service')) || DB.settings.serviceCharge;
    Toast.show('Settings saved!', 'success');
  },

  clearOrders() {
    if (!confirm('Clear all orders? This cannot be undone.')) return;
    DB.orders = [];
    Toast.show('All orders cleared', 'warning');
  },

  resetDefaults() {
    if (!confirm('Reset all settings to defaults?')) return;
    Toast.show('Settings reset', 'info');
    Router.go('settings');
  },
};
