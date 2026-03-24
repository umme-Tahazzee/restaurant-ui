/* ================================================
   REPORT VIEW — Sales reports with calendar filter
================================================ */

const ReportView = {

  _tab: 'today',
  _charts: {},

  render() {
    return `
      <div id="reportRoot">
        <div class="page-header anim-1">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="width:20px;height:1px;background:var(--gold);display:inline-block"></span>Reports
            </div>
            <h1 class="page-title">Sales <em style="color:var(--red);font-style:italic">Reports</em></h1>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="date" class="date-input" id="reportDateFrom" value="2026-03-01"/>
            <span style="color:var(--text-3);font-size:12px">to</span>
            <input type="date" class="date-input" id="reportDateTo" value="2026-03-19"/>
            <button class="btn btn-primary btn-sm" onclick="ReportView.applyFilter()"><i class="fa-solid fa-filter"></i> Filter</button>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-download"></i> Export</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar anim-1">
          <button class="tab-btn active" onclick="ReportView.setTab('today',this)">Today's Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('weekly',this)">Weekly Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('monthly',this)">Monthly Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('yearly',this)">Yearly Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('ingredient',this)">Ingredient Report</button>
        </div>

        <!-- Summary Cards -->
        <div class="grid-4 anim-2" style="margin-bottom:20px" id="reportSummary"></div>

        <!-- Report Content -->
        <div class="card anim-2" id="reportContent"></div>
      </div>`;
  },

  init() {
    this.setTab('today');
  },

  setTab(tab, btn) {
    this._tab = tab;
    if (btn) {
      btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    this.renderSummary();
    this.renderContent();
  },

  applyFilter() { Toast.show('Filter applied', 'info'); },

  renderSummary() {
    const el = document.getElementById('reportSummary');
    if (!el) return;
    const d = this._tab === 'ingredient' ? null : DB.salesData[this._tab === 'today' ? 'today' : this._tab === 'weekly' ? 'week' : this._tab === 'monthly' ? 'month' : 'year'];

    if (!d) {
      el.innerHTML = `
        <div class="stat-card"><div class="stat-label">Total Items Used</div><div class="stat-value">2,480</div></div>
        <div class="stat-card"><div class="stat-label">Total Cost</div><div class="stat-value">${Utils.money(4460)}</div></div>
        <div class="stat-card"><div class="stat-label">Low Stock Items</div><div class="stat-value" style="color:var(--red)">2</div></div>
        <div class="stat-card"><div class="stat-label">Suppliers</div><div class="stat-value">6</div></div>`;
      return;
    }

    el.innerHTML = `
      <div class="stat-card"><div class="stat-label">Total Sales</div><div class="stat-value">${Utils.money(d.total)}</div></div>
      <div class="stat-card"><div class="stat-label">Total Orders</div><div class="stat-value">${d.orders.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Avg Ticket</div><div class="stat-value">${Utils.money(d.avgTicket)}</div></div>
      <div class="stat-card"><div class="stat-label">Branches</div><div class="stat-value">${DB.branches.length}</div></div>`;
  },

  renderContent() {
    const el = document.getElementById('reportContent');
    if (!el) return;

    if (this._tab === 'ingredient') {
      el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Ingredient Usage Report</div>
          <button class="btn btn-outline btn-sm"><i class="fa-solid fa-download"></i> Export CSV</button>
        </div>
        <table class="data-table">
          <thead><tr><th>Ingredient</th><th>Unit</th><th>Stock</th><th>Used</th><th>Cost</th><th>Supplier</th><th>Status</th></tr></thead>
          <tbody>
            ${DB.ingredients.map(i => `
              <tr>
                <td style="font-weight:600;color:var(--text)">${i.name}</td>
                <td>${i.unit}</td>
                <td style="font-weight:700;color:${i.status==='low'?'var(--red)':'var(--text)'}">${i.stock}</td>
                <td>${i.used}</td>
                <td style="font-weight:600">${Utils.money(i.cost)}</td>
                <td style="color:var(--text-3)">${i.supplier}</td>
                <td><span class="tag tag-${i.status==='low'?'cancelled':'delivered'}">${i.status}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
      return;
    }

    const key = this._tab === 'today' ? 'today' : this._tab === 'weekly' ? 'weekly' : this._tab === 'monthly' ? 'monthly' : 'yearly';
    const branchData = DB.branchSales[key];

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">${this._tab === 'today' ? "Today's" : this._tab.charAt(0).toUpperCase()+this._tab.slice(1)} Sales by Branch</div>
        <button class="btn btn-outline btn-sm"><i class="fa-solid fa-download"></i> Export CSV</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Branch</th><th>Sales</th><th>Orders</th><th>Avg / Order</th><th>Share</th></tr></thead>
        <tbody>
          ${branchData.map(b => {
            const total = branchData.reduce((s,x) => s+x.sales, 0);
            const pct = Math.round(b.sales / total * 100);
            return `
              <tr>
                <td style="font-weight:600;color:var(--text)"><i class="fa-solid fa-store" style="color:var(--gold);margin-right:6px;font-size:11px"></i>${b.branch}</td>
                <td style="font-weight:700;font-family:'Playfair Display',serif;font-size:14px">${Utils.money(b.sales)}</td>
                <td>${b.orders.toLocaleString()}</td>
                <td>${Utils.money(Math.round(b.sales / b.orders))}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:80px"><div class="progress-fill" style="width:${pct}%;background:var(--red)"></div></div>
                    <span style="font-size:11px;font-weight:700">${pct}%</span>
                  </div>
                </td>
              </tr>`;
          }).join('')}
          <tr style="background:var(--bg-surface2)">
            <td style="font-weight:700;color:var(--text)">Total</td>
            <td style="font-weight:900;font-family:'Playfair Display',serif;font-size:14px;color:var(--red)">${Utils.money(branchData.reduce((s,x)=>s+x.sales,0))}</td>
            <td style="font-weight:700">${branchData.reduce((s,x)=>s+x.orders,0).toLocaleString()}</td>
            <td></td><td></td>
          </tr>
        </tbody>
      </table>`;
  },

};
