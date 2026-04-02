/* ================================================
   EXPENSE REPORT VIEW  (views/expensereport.js)

   Tracks all restaurant expenses.
   Can add new expenses, delete, and filter them.
================================================ */

const ExpenseReportView = {

  /* ────────────────────────────────────────────
     render() — page HTML
  ──────────────────────────────────────────── */
  render() {
    const total  = DB.expenses.reduce((s, e) => s + e.amount, 0);
    const byCat  = this._groupByCategory();
    const topCat = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a])[0];

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Expense Report</h1>
          <p class="page-subtitle">Track and manage all restaurant expenses</p>
        </div>
        <button class="btn btn-primary" onclick="ExpenseReportView.openAddForm()">
          <i class="fa-solid fa-plus"></i> Add Expense
        </button>
      </div>

      <!-- KPI cards -->
      <div class="grid-4" style="margin-bottom:16px">
        <div class="stat-card" style="border-left:3px solid var(--red)">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value">${Utils.money(total)}</div>
          <div class="stat-sub">This month</div>
        </div>
        <div class="stat-card" style="border-left:3px solid var(--orange)">
          <div class="stat-label">Top Category</div>
          <div class="stat-value" style="font-size:16px">${topCat}</div>
          <div class="stat-sub">${Utils.money(byCat[topCat])}</div>
        </div>
        <div class="stat-card" style="border-left:3px solid var(--blue)">
          <div class="stat-label">Transactions</div>
          <div class="stat-value">${DB.expenses.length}</div>
          <div class="stat-sub">This month</div>
        </div>
        <div class="stat-card" style="border-left:3px solid var(--green)">
          <div class="stat-label">Daily Average</div>
          <div class="stat-value">${Utils.money(total / 16)}</div>
          <div class="stat-sub">Per day avg</div>
        </div>
      </div>

      <!-- Category breakdown + chart -->
      <div class="grid-2" style="margin-bottom:16px">

        <!-- Category bars -->
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px">
            Category Breakdown
          </div>
          <div id="categoryBars"></div>
        </div>

        <!-- Pie chart -->
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px">
            Expense Distribution
          </div>
          <div class="chart-container"><canvas id="expenseChart"></canvas></div>
        </div>
      </div>

      <!-- Expense table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <span style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px">All Expenses</span>
          <input class="form-control" style="width:220px;height:32px;font-size:11px"
            placeholder="Search expenses…"
            oninput="ExpenseReportView.searchExpenses(this.value)"/>
        </div>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr><th>Date</th><th>Category</th><th>Vendor</th><th>Note</th><th>Amount</th><th>Delete</th></tr>
            </thead>
            <tbody id="expenseBody"></tbody>
          </table>
        </div>
      </div>`;
  },

  /* ────────────────────────────────────────────
     init() — fill dynamic parts
  ──────────────────────────────────────────── */
  init() {
    this.renderCategoryBars();
    this.renderChart();
    this.renderTable();
  },

  /* ── Group expenses by category ── */
  _groupByCategory() {
    const map = {};
    DB.expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  },

  /* ── Horizontal bars per category ── */
  renderCategoryBars() {
    const el = document.getElementById('categoryBars');
    if (!el) return;
    const byCat = this._groupByCategory();
    const total = DB.expenses.reduce((s, e) => s + e.amount, 0);

    el.innerHTML = Object.keys(byCat)
      .sort((a, b) => byCat[b] - byCat[a])
      .map(cat => {
        const pct = (byCat[cat] / total * 100).toFixed(0);
        const clr = DB.expenses.find(e => e.category === cat)?.color || '#9b8c86';
        return `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span style="font-size:11px;font-weight:600;min-width:90px;color:var(--text)">${cat}</span>
            <div class="expense-bar-track">
              <div class="expense-bar-fill" style="width:${pct}%;background:${clr}"></div>
            </div>
            <span style="font-size:11px;font-weight:700;min-width:60px;text-align:right;color:var(--text)">${Utils.money(byCat[cat])}</span>
            <span style="font-size:10px;color:var(--text-3);min-width:28px;text-align:right">${pct}%</span>
          </div>`;
      }).join('');
  },

  /* ── Pie chart ── */
  renderChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;
    const byCat = this._groupByCategory();
    const colors = [
      'rgba(45,122,71,.8)', 'rgba(26,82,118,.8)',  'rgba(196,122,26,.8)',
      'rgba(109,59,142,.8)','rgba(192,57,43,.8)',   'rgba(155,140,134,.8)', 'rgba(150,40,27,.8)',
    ];
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(byCat),
        datasets: [{
          data: Object.values(byCat),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: 'var(--bg-surface)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } },
      },
    });
  },

  /* ── Expense table rows ── */
  renderTable(filter = '') {
    const tbody = document.getElementById('expenseBody');
    if (!tbody) return;

    const list = filter
      ? DB.expenses.filter(e =>
          e.category.toLowerCase().includes(filter) ||
          e.vendor.toLowerCase().includes(filter)   ||
          e.note.toLowerCase().includes(filter))
      : DB.expenses;

    tbody.innerHTML = list.map(e => `
      <tr>
        <td>${e.date}</td>
        <td>
          <span style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600">
            <i class="fa-solid ${e.icon}" style="color:${e.color}"></i>
            ${e.category}
          </span>
        </td>
        <td style="font-weight:500">${e.vendor}</td>
        <td style="color:var(--text-3)">${e.note || '—'}</td>
        <td style="font-weight:700;color:var(--red)">${Utils.money(e.amount)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="ExpenseReportView.deleteExpense('${e.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`).join('');

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-3)">No expenses found</td></tr>`;
    }
  },

  searchExpenses(val) {
    this.renderTable(val.toLowerCase());
  },

  /* ── Delete one expense ── */
  deleteExpense(id) {
    DB.expenses = DB.expenses.filter(e => e.id !== id);
    Toast.show('Expense deleted', 'warning');
    this.renderCategoryBars();
    this.renderTable();
  },

  /* ── Open add expense modal ── */
  openAddForm() {
    document.getElementById('expenseModalContent').innerHTML = `
      <div class="modal-title"><i class="fa-solid fa-plus-circle" style="color:var(--red)"></i> Add New Expense</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" id="expCat">
            <option>Ingredients</option><option>Staff</option><option>Utilities</option>
            <option>Equipment</option><option>Marketing</option><option>Cleaning</option>
            <option>Beverages</option><option>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Amount ($)</label>
          <input class="form-control" id="expAmt" type="number" min="0" step="0.01" placeholder="0.00"/>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Vendor / Supplier</label>
        <input class="form-control" id="expVendor" placeholder="e.g. Fresh Market Co."/>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Note</label>
        <input class="form-control" id="expNote" placeholder="Brief description…"/>
      </div>
      <div class="form-group" style="margin-bottom:16px">
        <label class="form-label">Date</label>
        <input class="form-control" id="expDate" type="date" value="${new Date().toISOString().split('T')[0]}"/>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="ExpenseReportView.saveExpense()">
        <i class="fa-solid fa-save"></i> Save Expense
      </button>`;
    Modal.open('expenseModal');
  },

  /* ── Save new expense from modal form ── */
  saveExpense() {
    const cat    = document.getElementById('expCat').value;
    const amt    = parseFloat(document.getElementById('expAmt').value);
    const vendor = document.getElementById('expVendor').value.trim();
    const note   = document.getElementById('expNote').value;
    const date   = document.getElementById('expDate').value;

    if (!amt || isNaN(amt) || amt <= 0) { Toast.show('Enter a valid amount', 'warning'); return; }
    if (!vendor)                         { Toast.show('Enter a vendor name', 'warning');  return; }

    // Icon & color map per category
    const iconMap  = { Ingredients:'fa-carrot', Staff:'fa-users', Utilities:'fa-bolt', Equipment:'fa-wrench', Marketing:'fa-bullhorn', Cleaning:'fa-broom', Beverages:'fa-wine-bottle', Other:'fa-tag' };
    const colorMap = { Ingredients:'#2d7a47',   Staff:'#1a5276',  Utilities:'#c47a1a', Equipment:'#6d3b8e',  Marketing:'#c0392b',    Cleaning:'#9b8c86',   Beverages:'#96281b',         Other:'#888'   };

    DB.expenses.unshift({
      id:       'e' + Date.now(),
      category: cat,
      vendor,
      amount:   amt,
      date,
      note,
      icon:  iconMap[cat]  || 'fa-tag',
      color: colorMap[cat] || '#888',
    });

    Modal.close('expenseModal');
    Toast.show('Expense added!', 'success');
    Router.go('expensereport'); // Re-render page with new data
  },
};
