/* ================================================
   SALES REPORT VIEW  (views/salesreport.js)

   Shows revenue charts for 4 time periods:
   Hourly  |  Daily  |  Weekly  |  Monthly
================================================ */

const SalesReportView = {

  /* ── STATE ── */
  period:    'hourly',
  chartInst: null,   // We keep a reference so we can destroy before re-creating

  /* ────────────────────────────────────────────
     render() — page HTML
  ──────────────────────────────────────────── */
  render() {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Sales Report</h1>
          <p class="page-subtitle">Revenue analytics and performance metrics</p>
        </div>
        <!-- Period switcher -->
        <div style="display:flex;gap:4px;background:var(--bg-input);border-radius:8px;padding:3px" id="periodBar">
          <button class="tab-btn active" onclick="SalesReportView.setPeriod('hourly',this)">Hourly</button>
          <button class="tab-btn" onclick="SalesReportView.setPeriod('daily',this)">Daily</button>
          <button class="tab-btn" onclick="SalesReportView.setPeriod('weekly',this)">Weekly</button>
          <button class="tab-btn" onclick="SalesReportView.setPeriod('monthly',this)">Monthly</button>
        </div>
      </div>

      <!-- KPI summary cards -->
      <div class="grid-4" style="margin-bottom:16px">
        <div class="stat-card">
          <div class="stat-row">
            <div><div class="stat-label">Total Revenue</div><div class="stat-value" id="kpiRevenue">—</div><div class="stat-sub" id="kpiRevSub"></div></div>
            <div class="stat-icon" style="background:var(--green-pale);color:var(--green)"><i class="fa-solid fa-dollar-sign"></i></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div><div class="stat-label">Total Orders</div><div class="stat-value" id="kpiOrders">—</div><div class="stat-sub" id="kpiOrdSub"></div></div>
            <div class="stat-icon" style="background:var(--blue-pale);color:var(--blue)"><i class="fa-solid fa-receipt"></i></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div><div class="stat-label">Avg Order Value</div><div class="stat-value" id="kpiAvg">—</div><div class="stat-sub">Per order</div></div>
            <div class="stat-icon" style="background:var(--gold-pale);color:var(--gold)"><i class="fa-solid fa-chart-simple"></i></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div><div class="stat-label">Peak Period</div><div class="stat-value" id="kpiPeak" style="font-size:15px">—</div><div class="stat-sub" id="kpiPeakSub"></div></div>
            <div class="stat-icon" style="background:var(--red-pale);color:var(--red)"><i class="fa-solid fa-trophy"></i></div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid-2" style="margin-bottom:16px">
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px" id="chartTitle">
            Hourly Revenue Today
          </div>
          <div class="chart-container"><canvas id="salesChart"></canvas></div>
        </div>
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px">
            Revenue Breakdown
          </div>
          <div class="chart-container"><canvas id="breakdownChart"></canvas></div>
        </div>
      </div>

      <!-- Top selling items -->
      <div class="card">
        <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px">
          Top Selling Items
        </div>
        <table class="data-table">
          <thead>
            <tr><th>#</th><th>Item</th><th>Orders</th><th>Revenue</th><th>% of Total</th></tr>
          </thead>
          <tbody id="topItemsBody"></tbody>
        </table>
      </div>`;
  },

  /* ────────────────────────────────────────────
     init() — draw charts and fill KPIs
  ──────────────────────────────────────────── */
  init() {
    this.period = 'hourly';
    this.updateKPIs();
    this.renderSalesChart();
    this.renderBreakdownChart();
    this.renderTopItems();
  },

  /* ── Switch period and refresh ── */
  setPeriod(p, btn) {
    this.period = p;
    document.querySelectorAll('#periodBar .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.updateKPIs();
    this.renderSalesChart();
  },

  /* ── Mock data per period ── */
  _getData() {
    return {
      hourly: {
        labels: ['10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm'],
        data:   [120,180,420,380,210,160,190,240,580,740,890,650],
        orders: [3,5,12,10,6,4,5,7,16,21,25,18],
      },
      daily: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        data:   [1240,980,1480,1320,1890,2340,1760],
        orders: [28,22,34,30,44,52,38],
      },
      weekly: {
        labels: ['Week 1','Week 2','Week 3','Week 4'],
        data:   [9200,10800,11400,12600],
        orders: [210,248,262,291],
      },
      monthly: {
        labels: ['Oct','Nov','Dec','Jan','Feb','Mar'],
        data:   [38000,42000,56000,41000,44000,48000],
        orders: [870,960,1280,940,1010,1100],
      },
    }[this.period];
  },

  /* ── Fill KPI cards ── */
  updateKPIs() {
    const d        = this._getData();
    const total    = d.data.reduce((a, b) => a + b, 0);
    const orders   = d.orders.reduce((a, b) => a + b, 0);
    const peakIdx  = d.data.indexOf(Math.max(...d.data));
    const subLabel = { hourly:'Today', daily:'This week', weekly:'This month', monthly:'This year' }[this.period];

    document.getElementById('kpiRevenue').textContent = `$${(total / 1000).toFixed(1)}k`;
    document.getElementById('kpiRevSub').textContent  = subLabel;
    document.getElementById('kpiOrders').textContent  = orders;
    document.getElementById('kpiOrdSub').textContent  = subLabel;
    document.getElementById('kpiAvg').textContent     = `$${Math.round(total / orders)}`;
    document.getElementById('kpiPeak').textContent    = d.labels[peakIdx];
    document.getElementById('kpiPeakSub').textContent = `$${Math.max(...d.data).toLocaleString()}`;

    const titleMap = {
      hourly:  'Hourly Revenue Today',
      daily:   'Daily Revenue This Week',
      weekly:  'Weekly Revenue This Month',
      monthly: 'Monthly Revenue 2025',
    };
    const t = document.getElementById('chartTitle');
    if (t) t.textContent = titleMap[this.period];
  },

  /* ── Bar + Line chart (revenue + orders) ── */
  renderSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Destroy old chart before making a new one (prevents memory leaks)
    if (this.chartInst) this.chartInst.destroy();

    const d      = this._getData();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridClr = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
    const tickClr = isDark ? 'rgba(255,255,255,.4)'  : 'rgba(0,0,0,.4)';

    this.chartInst = new Chart(ctx, {
      data: {
        labels: d.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Revenue ($)',
            data: d.data,
            backgroundColor: 'rgba(192,57,43,.7)',
            borderColor: 'rgba(192,57,43,1)',
            borderRadius: 6,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Orders',
            data: d.orders,
            borderColor: 'rgba(184,150,62,.9)',
            backgroundColor: 'rgba(184,150,62,.1)',
            borderWidth: 2,
            pointRadius: 3,
            tension: .4,
            fill: true,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: tickClr, font: { size: 11 } } } },
        scales: {
          x:  { grid: { color: gridClr }, ticks: { color: tickClr, font: { size: 10 } } },
          y:  { grid: { color: gridClr }, ticks: { color: tickClr, font: { size: 10 }, callback: v => '$' + v.toLocaleString() } },
          y2: { position: 'right', grid: { display: false }, ticks: { color: tickClr, font: { size: 10 } } },
        },
      },
    });
  },

  /* ── Doughnut chart (type breakdown) ── */
  renderBreakdownChart() {
    const ctx = document.getElementById('breakdownChart');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Dine-in', 'Takeaway', 'Delivery', 'Bar'],
        datasets: [{
          data: [58, 22, 15, 5],
          backgroundColor: [
            'rgba(192,57,43,.8)', 'rgba(184,150,62,.8)',
            'rgba(26,82,118,.8)', 'rgba(109,59,142,.8)',
          ],
          borderWidth: 2,
          borderColor: 'transparent',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } } },
      },
    });
  },

  /* ── Top items table ── */
  renderTopItems() {
    const items = [
      { name: 'Bistecca Fiorentina', orders: 14, revenue: 672 },
      { name: 'Tagliatelle al Ragù', orders: 12, revenue: 336 },
      { name: 'Panna Cotta',         orders: 10, revenue: 140 },
      { name: 'Truffle Risotto',     orders:  8, revenue: 256 },
      { name: 'Wagyu Tenderloin',    orders:  3, revenue: 495 },
    ];
    const totalRev = items.reduce((s, i) => s + i.revenue, 0);
    const tbody = document.getElementById('topItemsBody');
    if (!tbody) return;

    tbody.innerHTML = items.map((item, idx) => {
      const pct = (item.revenue / totalRev * 100).toFixed(0);
      return `
        <tr>
          <td><b style="color:var(--text-3)">${idx + 1}</b></td>
          <td style="font-weight:600">${item.name}</td>
          <td>${item.orders}</td>
          <td style="font-weight:700;color:var(--green)">${Utils.money(item.revenue)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:6px;background:var(--bg-input);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:var(--red);border-radius:3px"></div>
              </div>
              <span style="font-size:11px;color:var(--text-3);min-width:28px">${pct}%</span>
            </div>
          </td>
        </tr>`;
    }).join('');
  },
};
