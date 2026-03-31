/* ================================================
   TRANSACTIONS VIEW
================================================ */

const TransactionsView = {

  _filter: 'all',

  render() {
    const completed = DB.transactions.filter(t => t.status === 'completed');
    const totalAmt  = completed.reduce((s,t) => s+t.amount, 0);

    return `
      <div id="txnRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">Financial</div>
            <h1 class="page-title">Trans<em style="color:var(--red);font-style:italic">actions</em></h1>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="date" class="date-input" value="2026-03-14"/>
            <span style="color:var(--text-3);font-size:12px">to</span>
            <input type="date" class="date-input" value="2026-03-19"/>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-download"></i> Export</button>
          </div>
        </div>

        <!-- Summary -->
        <div class="grid-4 anim-1" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-label">Total Transactions</div><div class="stat-value">${DB.transactions.length}</div></div>
          <div class="stat-card"><div class="stat-label">Total Amount</div><div class="stat-value" style="color:var(--green)">${Utils.money(totalAmt)}</div></div>
          <div class="stat-card"><div class="stat-label">Pending</div><div class="stat-value" style="color:var(--orange)">${DB.transactions.filter(t=>t.status==='pending').length}</div></div>
          <div class="stat-card"><div class="stat-label">Refunded</div><div class="stat-value" style="color:var(--red)">${DB.transactions.filter(t=>t.status==='refunded').length}</div></div>
        </div>

        <!-- Filter tabs -->
        <div class="tab-bar anim-2">
          <button class="tab-btn active" onclick="TransactionsView.setFilter('all',this)">All</button>
          <button class="tab-btn" onclick="TransactionsView.setFilter('completed',this)">Completed</button>
          <button class="tab-btn" onclick="TransactionsView.setFilter('pending',this)">Pending</button>
          <button class="tab-btn" onclick="TransactionsView.setFilter('refunded',this)">Refunded</button>
        </div>

        <!-- Table -->
        <div class="card anim-2">
        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Order</th><th>Customer</th><th>Method</th><th>Amount</th><th>Date & Time</th><th>Branch</th><th>Status</th></tr>
            </thead>
            <tbody id="txnBody"></tbody>
          </table>
          </div>
        </div>
      </div>`;
  },

  // AJAX: JSONPlaceholder /todos থেকে transactions load করে
  async init() {
    const el = document.getElementById('txnBody');
    if (el) el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-3)"><i class="fa-solid fa-spinner fa-spin"></i> Loading transactions…</td></tr>';
    await Api.getTransactions();
    this.renderTable();
    // Summary আপডেট
    const completed = DB.transactions.filter(t => t.status === 'completed');
    const totalAmt  = completed.reduce((s,t) => s+t.amount, 0);
    const root = document.getElementById('txnRoot');
    if (root) {
      root.querySelectorAll('.stat-value')[0].textContent = DB.transactions.length;
      root.querySelectorAll('.stat-value')[1].textContent = Utils.money(totalAmt);
      root.querySelectorAll('.stat-value')[2].textContent = DB.transactions.filter(t=>t.status==='pending').length;
      root.querySelectorAll('.stat-value')[3].textContent = DB.transactions.filter(t=>t.status==='refunded').length;
    }
  },

  setFilter(f, btn) {
    this._filter = f;
    btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderTable();
  },

  renderTable() {
    const el = document.getElementById('txnBody');
    if (!el) return;
    const filtered = this._filter === 'all' ? DB.transactions : DB.transactions.filter(t => t.status === this._filter);

    const methodIcons = { card:'fa-credit-card', cash:'fa-money-bill', online:'fa-globe' };

    el.innerHTML = filtered.map(t => `
      <tr>
        <td style="font-weight:700;color:var(--text);font-family:'Playfair Display',serif">${t.id}</td>
        <td><span style="color:var(--blue);font-weight:600">${t.orderId}</span></td>
        <td style="font-weight:500">${t.customer}</td>
        <td>
          <span style="display:flex;align-items:center;gap:5px">
            <i class="fa-solid ${methodIcons[t.method] || 'fa-circle'}" style="color:var(--text-3);font-size:11px"></i>
            <span style="text-transform:capitalize;font-size:11px">${t.method}</span>
          </span>
        </td>
        <td style="font-weight:700;font-family:'Playfair Display',serif;font-size:14px;color:${t.status==='refunded'?'var(--red)':'var(--green)'}">
          ${t.status === 'refunded' ? '-' : ''}${Utils.money(t.amount)}
        </td>
        <td>
          <div style="font-size:11px">${Utils.formatDate(t.date)}</div>
          <div style="font-size:10px;color:var(--text-3)">${t.time}</div>
        </td>
        <td style="font-size:11px;color:var(--text-3)">${t.branch}</td>
        <td><span class="tag tag-${t.status}">${t.status}</span></td>
      </tr>`).join('');
  },

};
