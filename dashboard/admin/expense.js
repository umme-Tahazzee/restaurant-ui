/* ================================================
   EXPENSE VIEW — General expense + expense list
================================================ */

const ExpenseView = {

  _tab: 'list',
  _chart: null,

  render() {
    const total = DB.expenses.reduce((s,e) => s+e.amount, 0);
    const catTotals = {};
    DB.expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + e.amount; });

    return `
      <div id="expenseRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">Operations</div>
            <h1 class="page-title">Ex<em style="color:var(--red);font-style:italic">pense</em></h1>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="ExpenseView.openAddModal()"><i class="fa-solid fa-plus"></i> Add Expense</button>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-download"></i> Export</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar anim-1">
          <button class="tab-btn active" onclick="ExpenseView.setTab('list',this)">Expense List</button>
          <button class="tab-btn" onclick="ExpenseView.setTab('general',this)">General Expense</button>
        </div>

        <!-- Summary -->
        <div class="grid-4 anim-1" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-label">Total Expenses</div><div class="stat-value" style="color:var(--red)">${Utils.money(total)}</div></div>
          <div class="stat-card"><div class="stat-label">This Month</div><div class="stat-value">${Utils.money(total)}</div></div>
          <div class="stat-card"><div class="stat-label">Categories</div><div class="stat-value">${Object.keys(catTotals).length}</div></div>
          <div class="stat-card"><div class="stat-label">Avg per Entry</div><div class="stat-value">${Utils.money(Math.round(total/DB.expenses.length))}</div></div>
        </div>

        <!-- Content -->
        <div id="expenseContent" class="anim-2"></div>
      </div>`;
  },

  // AJAX: JSONPlaceholder /photos থেকে expenses load করে
  async init() {
    const el = document.getElementById('expenseContent');
    if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-3)"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Loading expenses…</div>';
    await Api.getExpenses();
    this.renderContent();
    // Summary আপডেট
    const total = DB.expenses.reduce((s,e) => s+e.amount, 0);
    const catTotals = {};
    DB.expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + e.amount; });
    const root = document.getElementById('expenseRoot');
    if (root) {
      root.querySelectorAll('.stat-value')[0].textContent = Utils.money(total);
      root.querySelectorAll('.stat-value')[1].textContent = Utils.money(total);
      root.querySelectorAll('.stat-value')[2].textContent = Object.keys(catTotals).length;
      root.querySelectorAll('.stat-value')[3].textContent = Utils.money(Math.round(total/DB.expenses.length));
    }
  },

  setTab(tab, btn) {
    this._tab = tab;
    btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderContent();
  },

  renderContent() {
    const el = document.getElementById('expenseContent');
    if (!el) return;

    if (this._tab === 'general') {
      el.innerHTML = this._renderGeneral();
      setTimeout(() => this._renderCategoryChart(), 100);
    } else {
      el.innerHTML = this._renderList();
    }
  },

  _renderList() {
    return `
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">All Expenses</div>
          <div class="topbar-search" style="max-width:200px">
            <i class="fa-solid fa-magnifying-glass" style="color:var(--text-3);font-size:11px"></i>
            <input type="text" placeholder="Search expenses…"/>
          </div>
        </div>
        <table class="data-table">
          <thead><tr><th>Category</th><th>Vendor</th><th>Amount</th><th>Date</th><th>Note</th><th>Branch</th><th>Actions</th></tr></thead>
          <tbody>
            ${DB.expenses.map(e => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:32px;height:32px;border-radius:8px;background:${e.color}15;color:${e.color};display:flex;align-items:center;justify-content:center;font-size:13px">
                      <i class="fa-solid ${e.icon}"></i>
                    </div>
                    <span style="font-weight:600;color:var(--text)">${e.category}</span>
                  </div>
                </td>
                <td style="font-size:12px">${e.vendor}</td>
                <td style="font-weight:700;font-family:'Playfair Display',serif;color:var(--red)">${Utils.money(e.amount)}</td>
                <td style="font-size:11px;color:var(--text-3)">${Utils.formatDate(e.date)}</td>
                <td style="font-size:11px;color:var(--text-3);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.note}</td>
                <td style="font-size:11px">${e.branch}</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-outline btn-sm btn-icon"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-outline btn-sm btn-icon" onclick="Toast.show('Deleted','error')"><i class="fa-solid fa-trash" style="color:var(--red)"></i></button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },

  _renderGeneral() {
    const catTotals = {};
    DB.expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + e.amount; });
    const total = DB.expenses.reduce((s,e) => s+e.amount, 0);
    const cats = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
    const colors = ['#c0392b','#1a5276','#c47a1a','#6d3b8e','#2d7a47','#b8963e','#96281b','#9b8c86'];

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- Category Breakdown Chart -->
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:16px">Expense by Category</div>
          <div style="position:relative;height:240px"><canvas id="expCatChart"></canvas></div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
            ${cats.map((c,i) => `
              <span style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-2)">
                <span style="width:8px;height:8px;border-radius:2px;background:${colors[i % colors.length]};display:inline-block"></span>
                ${c[0]}
              </span>`).join('')}
          </div>
        </div>
        <!-- Category Details -->
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:16px">Category Details</div>
          ${cats.map((c,i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i<cats.length-1?'border-bottom:1px solid var(--border)':''}">
              <div style="width:36px;height:36px;border-radius:8px;background:${colors[i%colors.length]}15;color:${colors[i%colors.length]};display:flex;align-items:center;justify-content:center;font-size:14px">
                <i class="fa-solid fa-circle"></i>
              </div>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-weight:600;font-size:12px">${c[0]}</span>
                  <span style="font-weight:700;font-family:'Playfair Display',serif">${Utils.money(c[1])}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(c[1]/total*100)}%;background:${colors[i%colors.length]}"></div></div>
                <div style="font-size:10px;color:var(--text-3);margin-top:3px">${Math.round(c[1]/total*100)}% of total</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  },

  _renderCategoryChart() {
    const ctx = document.getElementById('expCatChart');
    if (!ctx) return;
    if (this._chart) this._chart.destroy();

    const catTotals = {};
    DB.expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + e.amount; });
    const cats = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
    const colors = ['#c0392b','#1a5276','#c47a1a','#6d3b8e','#2d7a47','#b8963e','#96281b','#9b8c86'];

    this._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c[0]),
        datasets: [{ data: cats.map(c => c[1]), backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '65%',
      }
    });
  },

  openAddModal() {
    document.getElementById('expenseModalContent').innerHTML = `
      <div class="modal-title">Add New Expense</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Category</label>
          <select class="form-control"><option>Ingredients</option><option>Staff</option><option>Utilities</option><option>Equipment</option><option>Marketing</option><option>Cleaning</option><option>Beverages</option><option>Rent</option><option>Other</option></select>
        </div>
        <div class="form-group"><label class="form-label">Amount</label><input class="form-control" type="number" placeholder="0.00"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Vendor</label><input class="form-control" placeholder="Vendor name…"/></div>
        <div class="form-group"><label class="form-label">Date</label><input class="form-control" type="date" value="2026-03-19"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Branch</label>
          <select class="form-control"><option>All</option>${DB.branches.map(b=>`<option>${b.name}</option>`).join('')}</select>
        </div>
        <div></div>
      </div>
      <div class="form-group" style="margin-bottom:16px"><label class="form-label">Note</label><textarea class="form-control" rows="2" placeholder="Description…"></textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-outline" onclick="Modal.close('expenseModal')">Cancel</button>
        <button class="btn btn-primary" onclick="Toast.show('Expense added!','success');Modal.close('expenseModal')">Add Expense</button>
      </div>`;
    Modal.open('expenseModal');
  },

};
