/* ================================================
   REPORT VIEW — Sales reports with calendar filter
================================================ */

const ReportView = {

  _tab: 'today',
  _charts: {},
  _filtered: false,
  _filteredSummary: null,
  _filteredBranch: null,

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
            <button class="btn btn-primary btn-sm" 
            onclick="ReportView.applyFilter()"><i class="fa-solid fa-filter"></i> Filter</button>
            <button class="btn btn-outline btn-sm" onclick="ReportView.exportReport()"><i class="fa-solid 
            fa-download"></i> Export Report</button>
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
    this._filtered = false;
    this._filteredSummary = null;
    this._filteredBranch = null;
    this.setTab('today');
  },

  setTab(tab, btn) {
    this._tab = tab;
    if (btn) {
      btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    // Reset filter when changing tabs
    this._filtered = false;
    this._filteredSummary = null;
    this._filteredBranch = null;
    this.renderSummary();
    this.renderContent();
  },

  applyFilter() {
    const from = document.getElementById('reportDateFrom').value;
    const to = document.getElementById('reportDateTo').value;
    if (!from || !to) { Toast.show('Please select both dates', 'warning'); return; }
    if (from > to) { Toast.show('Start date must be before end date', 'warning'); return; }

    // Filter transactions by date range
    const filtered = DB.transactions.filter(t => t.date >= from && t.date <= to);
    const totalSales = filtered.reduce((s, t) => s + t.amount, 0);
    const totalOrders = filtered.length;
    const avgTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    this._filtered = true;
    this._filteredSummary = { total: totalSales, orders: totalOrders, avgTicket };

    // Calculate branch-wise breakdown from filtered transactions
    const branchMap = {};
    filtered.forEach(t => {
      if (!branchMap[t.branch]) branchMap[t.branch] = { branch: t.branch, sales: 0, orders: 0 };
      branchMap[t.branch].sales += t.amount;
      branchMap[t.branch].orders += 1;
    });
    this._filteredBranch = Object.values(branchMap).sort((a, b) => b.sales - a.sales);
    // If no branches found, show empty
    if (this._filteredBranch.length === 0) {
      this._filteredBranch = [{ branch: 'No data', sales: 0, orders: 0 }];
    }

    this.renderSummary();
    this.renderContent();
    Toast.show(`Filter applied: ${Utils.formatDate(from)} — ${Utils.formatDate(to)} (${totalOrders} orders)`, 'success');
  },

  exportReport() {
    let csv = '';
    let filename = '';

    if (this._tab === 'ingredient') {
      csv = 'Ingredient,Unit,Stock,Used,Cost,Supplier,Status\n';
      DB.ingredients.forEach(i => {
        csv += `"${i.name}",${i.unit},${i.stock},${i.used},${i.cost},"${i.supplier}",${i.status}\n`;
      });
      filename = 'savoria_ingredient_report.csv';
    } else {
      const label = this._tab === 'today' ? "Today's" : this._tab.charAt(0).toUpperCase() + this._tab.slice(1);
      csv = `Branch,Sales,Orders,Avg Per Order\n`;
      const branchData = this._filtered && this._filteredBranch ? this._filteredBranch : DB.branchSales[this._tab === 'today' ? 'today' : this._tab === 'weekly' ? 'weekly' : this._tab === 'monthly' ? 'monthly' : 'yearly'];
      branchData.forEach(b => {
        const avg = b.orders > 0 ? Math.round(b.sales / b.orders) : 0;
        csv += `"${b.branch}",${b.sales},${b.orders},${avg}\n`;
      });
      const total = branchData.reduce((s, x) => s + x.sales, 0);
      const totalOrders = branchData.reduce((s, x) => s + x.orders, 0);
      csv += `"Total",${total},${totalOrders},\n`;
      filename = `savoria_${this._tab}_sales_report.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    Toast.show(`Exported ${filename}`, 'success');
  },

  renderSummary() {
    const el = document.getElementById('reportSummary');
    if (!el) return;

    if (this._tab === 'ingredient') {
      el.innerHTML = `
        <div class="stat-card"><div class="stat-label">Total Items Used</div><div class="stat-value">2,480</div></div>
        <div class="stat-card"><div class="stat-label">Total Cost</div><div class="stat-value">${Utils.money(4460)}</div></div>
        <div class="stat-card"><div class="stat-label">Low Stock Items</div><div class="stat-value" style="color:var(--red)">2</div></div>
        <div class="stat-card"><div class="stat-label">Suppliers</div><div class="stat-value">6</div></div>`;
      return;
    }

    // If filtered, use filtered summary
    if (this._filtered && this._filteredSummary) {
      const d = this._filteredSummary;
      el.innerHTML = `
        <div class="stat-card"><div class="stat-label">Filtered Sales</div><div class="stat-value">${Utils.money(d.total)}</div></div>
        <div class="stat-card"><div class="stat-label">Total Orders</div><div class="stat-value">${d.orders.toLocaleString()}</div></div>
        <div class="stat-card"><div class="stat-label">Avg Ticket</div><div class="stat-value">${Utils.money(d.avgTicket)}</div></div>
        <div class="stat-card"><div class="stat-label">Branches</div><div class="stat-value">${DB.branches.length}</div></div>`;
      return;
    }

    const d = DB.salesData[this._tab === 'today' ? 'today' : this._tab === 'weekly' ? 'week' : this._tab === 'monthly' ? 'month' : 'year'];
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
          <button class="btn btn-outline btn-sm" onclick="ReportView.exportReport()"><i class="fa-solid fa-download"></i> Export CSV</button>
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

    // Use filtered branch data if available
    const branchData = this._filtered && this._filteredBranch
      ? this._filteredBranch
      : DB.branchSales[this._tab === 'today' ? 'today' : this._tab === 'weekly' ? 'weekly' : this._tab === 'monthly' ? 'monthly' : 'yearly'];

    const title = this._filtered
      ? 'Filtered Sales by Branch'
      : `${this._tab === 'today' ? "Today's" : this._tab.charAt(0).toUpperCase()+this._tab.slice(1)} Sales by Branch`;

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">${title}</div>
        <button class="btn btn-outline btn-sm" onclick="ReportView.exportReport()"><i class="fa-solid fa-download"></i>
         Export CSV</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Branch</th><th>Sales</th><th>Orders</th><th>Avg / Order</th><th>Share</th></tr></thead>
        <tbody>
          ${branchData.map(b => {
            const total = branchData.reduce((s,x) => s+x.sales, 0);
            const pct = total > 0 ? Math.round(b.sales / total * 100) : 0;
            return `
              <tr>
                <td style="font-weight:600;color:var(--text)"><i class="fa-solid fa-store" style="color:var(--gold);margin-right:6px;font-size:11px"></i>${b.branch}</td>
                <td style="font-weight:700;font-family:'Playfair Display',serif;font-size:14px">${Utils.money(b.sales)}</td>
                <td>${b.orders.toLocaleString()}</td>
                <td>${b.orders > 0 ? Utils.money(Math.round(b.sales / b.orders)) : '$0'}</td>
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
