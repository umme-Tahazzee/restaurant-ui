const ReportView = {

  _tab: 'today',
  _charts: {},
  _filtered: false,
  _filteredSummary: null,
  _filteredBranch: null,
  _filteredIngredients: null,

  render() {
    return `
      <div id="reportRoot">
        <div class="page-header anim-1">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
            color:var(--gold);display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="width:20px;height:1px;background:var(--gold);display:inline-block"></span>Reports
            </div>
            <h1 class="page-title">Sales <em style="color:var(--red);font-style:italic">Reports</em></h1>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="date" class="date-input" id="reportDateFrom" value="2026-03-01"/>
            <span style="color:var(--text-3);font-size:12px">to</span>
            <input type="date" class="date-input" id="reportDateTo" value="2026-03-19"/>
            <button class="btn btn-primary btn-sm"
              onclick="ReportView.applyFilter()">
              <i class="fa-solid fa-filter"></i> Filter
            </button>
            <button class="hidden md:flex btn btn-outline btn-sm" onclick="ReportView.exportReport()">
              <i class="fa-solid fa-download"></i> Export
            </button>
          </div>
        </div>

        <div class="tab-bar anim-1">
          <button class="tab-btn active" onclick="ReportView.setTab('today',this)">Today's Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('weekly',this)">Weekly Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('monthly',this)">Monthly Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('yearly',this)">Yearly Sales</button>
          <button class="tab-btn" onclick="ReportView.setTab('ingredient',this)">Ingredient Report</button>
        </div>

        <div class="grid-4 anim-2" style="margin-bottom:20px" id="reportSummary"></div>
        <div id="reportChart" style="margin-bottom:20px"></div>
        <div class="card anim-2" id="reportContent"></div>
      </div>`;
  },

  init() {
    this._filtered = false;
    this._filteredSummary = null;
    this._filteredBranch = null;
    this._filteredIngredients = null;
    this.setTab('today');
  },

  // ── সব চার্ট destroy করে memory leak ঠেকায়
  _destroyCharts() {
    Object.values(this._charts).forEach(c => { try { c.destroy(); } catch(_) {} });
    this._charts = {};
  },

  setTab(tab, btn) {
    this._tab = tab;
    if (btn) {
      btn.closest('.tab-bar').querySelectorAll('.tab-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    this._filtered = false;
    this._filteredSummary = null;
    this._filteredBranch = null;
    this._filteredIngredients = null;
    this._destroyCharts();
    this.renderSummary();
    this.renderChart();
    this.renderContent();
  },

  applyFilter() {
    const from = document.getElementById('reportDateFrom').value;
    const to   = document.getElementById('reportDateTo').value;
    if (!from || !to) { Toast.show('Please select both dates', 'warning'); return; }
    if (from > to)    { Toast.show('Start date must be before end date', 'warning'); return; }

    // ── Transaction filter
    const filtered = DB.transactions.filter(t => t.date >= from && t.date <= to);
    const totalSales  = filtered.reduce((s, t) => s + t.amount, 0);
    const totalOrders = filtered.length;
    const avgTicket   = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    this._filtered = true;
    this._filteredSummary = { total: totalSales, orders: totalOrders, avgTicket };

    // ── Branch breakdown
    const branchMap = {};
    filtered.forEach(t => {
      if (!branchMap[t.branch]) branchMap[t.branch] = { branch: t.branch, sales: 0, orders: 0 };
      branchMap[t.branch].sales  += t.amount;
      branchMap[t.branch].orders += 1;
    });
    this._filteredBranch = Object.values(branchMap).sort((a, b) => b.sales - a.sales);
    if (this._filteredBranch.length === 0)
      this._filteredBranch = [{ branch: 'No data', sales: 0, orders: 0 }];

    // ── Ingredient usage

    const totalTx   = DB.transactions.length || 1;
    const ratio     = filtered.length / totalTx;
    this._filteredIngredients = DB.ingredients.map(ing => ({
      ...ing,
      filteredUsed: Math.round(ing.used * ratio),
    }));

    this._destroyCharts();
    this.renderSummary();
    this.renderChart();
    this.renderContent();
    Toast.show(
      `Filter applied: ${Utils.formatDate(from)} — ${Utils.formatDate(to)} (${totalOrders} orders)`,
      'success'
    );
  },

  // ══════════════════════════════════════════
  //  SUMMARY CARDS
  // ══════════════════════════════════════════
  renderSummary() {
    const el = document.getElementById('reportSummary');
    if (!el) return;

    if (this._tab === 'ingredient') {
      const ings = this._filtered && this._filteredIngredients
        ? this._filteredIngredients
        : DB.ingredients;
      const totalUsed  = ings.reduce((s, i) => s + (this._filtered ? i.filteredUsed : i.used), 0);
      const totalCost  = ings.reduce((s, i) => s + i.cost, 0);
      const lowStock   = ings.filter(i => i.status === 'low').length;
      const suppliers  = [...new Set(ings.map(i => i.supplier))].length;
      el.innerHTML = `
        <div class="stat-card">
          <div class="stat-label">Total Consumed</div>
          <div class="stat-value">${totalUsed.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Cost</div>
          <div class="stat-value">${Utils.money(totalCost)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Low Stock Items</div>
          <div class="stat-value" style="color:var(--red)">${lowStock}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Suppliers</div>
          <div class="stat-value">${suppliers}</div>
        </div>`;
      return;
    }

    if (this._filtered && this._filteredSummary) {
      const d = this._filteredSummary;
      el.innerHTML = `
        <div class="stat-card">
          <div class="stat-label">Filtered Sales</div>
          <div class="stat-value">${Utils.money(d.total)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Orders</div>
          <div class="stat-value">${d.orders.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Ticket</div>
          <div class="stat-value">${Utils.money(d.avgTicket)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Branches</div>
          <div class="stat-value">${DB.branches.length}</div>
        </div>`;
      return;
    }

    const key = { today:'today', weekly:'week', monthly:'month', yearly:'year' }[this._tab];
    const d   = DB.salesData[key];
    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Sales</div>
        <div class="stat-value">${Utils.money(d.total)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Orders</div>
        <div class="stat-value">${d.orders.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Ticket</div>
        <div class="stat-value">${Utils.money(d.avgTicket)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Branches</div>
        <div class="stat-value">${DB.branches.length}</div>
      </div>`;
  },

  // ══════════════════════════════════════════
  //  CHARTS
  // ══════════════════════════════════════════
  renderChart() {
    const wrap = document.getElementById('reportChart');
    if (!wrap) return;
    this._destroyCharts();

    if (this._tab === 'ingredient') {
      this._renderIngredientChart(wrap);
    } else {
      this._renderSalesComboChart(wrap);
    }
  },

  _renderSalesComboChart(wrap) {
    const branchData = this._filtered && this._filteredBranch
      ? this._filteredBranch
      : DB.branchSales[{ today:'today', weekly:'weekly', monthly:'monthly', yearly:'yearly' }[this._tab]];

    if (!branchData || branchData.length === 0 || (branchData.length === 1 && branchData[0].branch === 'No data')) {
      wrap.innerHTML = this._noDataHTML();
      return;
    }

    const labels   = branchData.map(b => b.branch);
    const revenues = branchData.map(b => b.sales);
    const orders   = branchData.map(b => b.orders);

    wrap.innerHTML = `
      <div class="card" style="padding:16px 20px">
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">Revenue vs Orders — by Branch</div>
        <div style="display:flex;gap:16px;font-size:11px;color:var(--text-3);margin-bottom:14px">
          <span><span style="display:inline-block;width:10px;height:10px;background:#c0392b;border-radius:2px;margin-right:4px"></span>Revenue ($)</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:#1a5276;border-radius:50%;margin-right:4px"></span>Orders</span>
        </div>
        <div style="position:relative;width:100%;height:260px">
          <canvas id="salesComboChart"></canvas>
        </div>
      </div>`;

    const ctx = document.getElementById('salesComboChart').getContext('2d');
    this._charts.combo = new Chart(ctx, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Revenue',
            data: revenues,
            backgroundColor: 'rgba(192,57,43,0.75)',
            borderColor: '#c0392b',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'yRevenue',
            order: 2,
          },
          {
            type: 'line',
            label: 'Orders',
            data: orders,
            borderColor: '#1a5276',
            backgroundColor: 'rgba(26,82,118,0.12)',
            borderWidth: 2,
            pointBackgroundColor: '#1a5276',
            pointRadius: 5,
            fill: true,
            tension: 0.35,
            yAxisID: 'yOrders',
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                return ctx.dataset.label === 'Revenue'
                  ? ` $${ctx.parsed.y.toLocaleString()}`
                  : ` ${ctx.parsed.y} orders`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#888', font: { size: 11 } },
            grid:  { color: 'rgba(128,128,128,0.1)' },
          },
          yRevenue: {
            position: 'left',
            ticks: {
              color: '#c0392b',
              font: { size: 10 },
              callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
            },
            grid: { color: 'rgba(128,128,128,0.08)' },
          },
          yOrders: {
            position: 'right',
            ticks: { color: '#1a5276', font: { size: 10 } },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  },

  _renderIngredientChart(wrap) {
    const ings = this._filtered && this._filteredIngredients
      ? this._filteredIngredients
      : DB.ingredients;

    // Top 5 most used
    const top5 = [...ings]
      .sort((a, b) => (this._filtered ? b.filteredUsed - a.filteredUsed : b.used - a.used))
      .slice(0, 5);

    const labels   = top5.map(i => i.name);
    const usedVals = top5.map(i => this._filtered ? i.filteredUsed : i.used);
    const stockVals= top5.map(i => i.stock);
    const barH     = top5.length * 52 + 80;

    wrap.innerHTML = `
      <div class="card" style="padding:16px 20px">
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">Top 5 — Stock vs Consumed</div>
        <div style="display:flex;gap:16px;font-size:11px;color:var(--text-3);margin-bottom:14px">
          <span><span style="display:inline-block;width:10px;height:10px;background:#2d7a47;border-radius:2px;margin-right:4px"></span>Opening Stock</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:#c0392b;border-radius:2px;margin-right:4px"></span>Consumed</span>
        </div>
        <div style="position:relative;width:100%;height:${barH}px">
          <canvas id="ingredientBarChart"></canvas>
        </div>
      </div>`;

    const ctx = document.getElementById('ingredientBarChart').getContext('2d');
    this._charts.ingredient = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Opening Stock',
            data: stockVals,
            backgroundColor: 'rgba(45,122,71,0.7)',
            borderColor: '#2d7a47',
            borderWidth: 1,
            borderRadius: 3,
          },
          {
            label: 'Consumed',
            data: usedVals,
            backgroundColor: 'rgba(192,57,43,0.7)',
            borderColor: '#c0392b',
            borderWidth: 1,
            borderRadius: 3,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const ing = top5[ctx.dataIndex];
                return ` ${ctx.parsed.x.toLocaleString()} ${ing?.unit || ''}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#888', font: { size: 10 } },
            grid:  { color: 'rgba(128,128,128,0.1)' },
          },
          y: {
            ticks: { color: '#888', font: { size: 11 } },
            grid:  { display: false },
          },
        },
      },
    });
  },

  // ══════════════════════════════════════════
  //  TABLE CONTENT
  // ══════════════════════════════════════════
  renderContent() {
    const el = document.getElementById('reportContent');
    if (!el) return;

    if (this._tab === 'ingredient') {
      this._renderIngredientTable(el);
      return;
    }

    const branchData = this._filtered && this._filteredBranch
      ? this._filteredBranch
      : DB.branchSales[{ today:'today', weekly:'weekly', monthly:'monthly', yearly:'yearly' }[this._tab]];

    const title = this._filtered
      ? 'Filtered Sales by Branch'
      : `${this._tab === 'today' ? "Today's" : this._tab.charAt(0).toUpperCase() + this._tab.slice(1)} Sales by Branch`;

    // No data state
    if (!branchData || branchData.length === 0 ||
        (branchData.length === 1 && branchData[0].branch === 'No data' && branchData[0].sales === 0)) {
      el.innerHTML = this._noDataHTML();
      return;
    }

   el.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">${title}</div>
    <button class="btn btn-outline btn-sm" onclick="ReportView.exportReport()">
      <i class="fa-solid fa-download"></i> Export CSV
    </button>
  </div>
  <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
    <table class="data-table" style="min-width:500px">
      <thead>
        <tr><th>Branch</th><th>Sales</th><th>Orders</th><th>Avg / Order</th><th>Share</th></tr>
      </thead>
      <tbody>
        ${(() => {
          const total = branchData.reduce((s, x) => s + x.sales, 0);
          return branchData.map(b => {
            const pct = total > 0 ? Math.round(b.sales / total * 100) : 0;
            return `
              <tr>
                <td style="font-weight:600;color:var(--text)">
                  <i class="fa-solid fa-store" style="color:var(--gold);margin-right:6px;font-size:11px"></i>
                  ${b.branch}
                </td>
                <td style="font-weight:700;font-family:'Playfair Display',serif;font-size:14px">
                  ${Utils.money(b.sales)}
                </td>
                <td>${b.orders.toLocaleString()}</td>
                <td>${b.orders > 0 ? Utils.money(Math.round(b.sales / b.orders)) : '$0'}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:80px">
                      <div class="progress-fill" style="width:${pct}%;background:var(--red)"></div>
                    </div>
                    <span style="font-size:11px;font-weight:700">${pct}%</span>
                  </div>
                </td>
              </tr>`;
          }).join('');
        })()}
        <tr style="background:var(--bg-surface2)">
          <td style="font-weight:700;color:var(--text)">Total</td>
          <td style="font-weight:900;font-family:'Playfair Display',serif;font-size:14px;color:var(--red)">
            ${Utils.money(branchData.reduce((s, x) => s + x.sales, 0))}
          </td>
          <td style="font-weight:700">
            ${branchData.reduce((s, x) => s + x.orders, 0).toLocaleString()}
          </td>
          <td></td><td></td>
        </tr>
      </tbody>
    </table>
  </div>`;
  },

  _renderIngredientTable(el) {
    const ings = this._filtered && this._filteredIngredients
      ? this._filteredIngredients
      : DB.ingredients;

    if (!ings || ings.length === 0) { el.innerHTML = this._noDataHTML(); return; }

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">
          Ingredient Usage Report
          ${this._filtered ? '<span style="font-size:11px;font-weight:400;color:var(--text-3);margin-left:8px">(filtered period)</span>' : ''}
        </div>
        <button class="btn btn-outline btn-sm" onclick="ReportView.exportReport()">
          <i class="fa-solid fa-download"></i> Export CSV
        </button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Unit</th>
            <th>Opening Stock</th>
            <th>Consumed</th>
            <th>Closing Stock</th>
            <th>Cost</th>
            <th>Supplier</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${ings.map(i => {
            const consumed = this._filtered ? i.filteredUsed : i.used;
            const closing  = Math.max(0, i.stock - consumed);
            const pct      = i.stock > 0 ? Math.round(consumed / i.stock * 100) : 0;
            const isLow    = i.status === 'low';
            return `
              <tr>
                <td style="font-weight:600;color:var(--text)">${i.name}</td>
                <td style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.04em">${i.unit}</td>
                <td style="font-weight:600">${i.stock.toLocaleString()}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="font-weight:700;color:var(--red)">${consumed.toLocaleString()}</span>
                    <span style="font-size:10px;color:var(--text-3)">(${pct}%)</span>
                  </div>
                </td>
                <td style="font-weight:700;color:${isLow ? 'var(--red)' : 'var(--green)'}">
                  ${closing.toLocaleString()}
                </td>
                <td style="font-weight:600">${Utils.money(i.cost)}</td>
                <td style="color:var(--text-3)">${i.supplier}</td>
                <td>
                  <span class="tag tag-${isLow ? 'cancelled' : 'delivered'}">${i.status}</span>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  },

  // ══════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════
  _noDataHTML() {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  padding:60px 20px;gap:12px;color:var(--text-3)">
        <i class="fa-solid fa-chart-bar" style="font-size:40px;opacity:0.25"></i>
        <div style="font-size:15px;font-weight:600;color:var(--text-2)">No data found</div>
        <div style="font-size:12px;text-align:center;max-width:260px;line-height:1.6">
          There are no any transection data in selected range<br/>
         Try another date range
        </div>
      </div>`;
  },

  exportReport() {
    let csv = '', filename = '';

    if (this._tab === 'ingredient') {
      const ings = this._filtered && this._filteredIngredients
        ? this._filteredIngredients : DB.ingredients;
      csv = 'Ingredient,Unit,Opening Stock,Consumed,Closing Stock,Cost,Supplier,Status\n';
      ings.forEach(i => {
        const consumed = this._filtered ? i.filteredUsed : i.used;
        const closing  = Math.max(0, i.stock - consumed);
        csv += `"${i.name}",${i.unit},${i.stock},${consumed},${closing},${i.cost},"${i.supplier}",${i.status}\n`;
      });
      filename = 'savoria_ingredient_report.csv';
    } else {
      const branchData = this._filtered && this._filteredBranch
        ? this._filteredBranch
        : DB.branchSales[{ today:'today', weekly:'weekly', monthly:'monthly', yearly:'yearly' }[this._tab]];
      csv = 'Branch,Sales,Orders,Avg Per Order\n';
      branchData.forEach(b => {
        const avg = b.orders > 0 ? Math.round(b.sales / b.orders) : 0;
        csv += `"${b.branch}",${b.sales},${b.orders},${avg}\n`;
      });
      const total       = branchData.reduce((s, x) => s + x.sales, 0);
      const totalOrders = branchData.reduce((s, x) => s + x.orders, 0);
      csv += `"Total",${total},${totalOrders},\n`;
      filename = `savoria_${this._tab}_sales_report.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    Toast.show(`Exported ${filename}`, 'success');
  },
};