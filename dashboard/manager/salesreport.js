/* ================================================
   SALES REPORT VIEW  (views/salesreport.js)

   Shows revenue charts for 4 time periods:
   Hourly  |  Daily  |  Weekly  |  Monthly
================================================ */

const SalesReportView = {

  /* ── STATE ── */
  period:     'hourly',
  chartInst:  null,
  chartInst2: null,

  /* ────────────────────────────────────────────
     render() — page HTML
  ──────────────────────────────────────────── */
  render() {
    return `
      <style>
        /* Period switcher wraps on small screens */
        .sr-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        .sr-period-bar {
          display: flex;
          gap: 4px;
          background: var(--bg-input);
          border-radius: 8px;
          padding: 3px;
          flex-wrap: wrap;
        }

        /* KPI grid: 4 → 2 → 1 */
        .sr-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 16px;
        }
        @media (max-width: 900px) {
          .sr-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .sr-kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        }

        /* Charts row: 2 col → 1 col */
        .sr-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .sr-charts-grid { grid-template-columns: 1fr; }
        }

        /* Chart height shrinks on mobile */
        .sr-chart-wrap {
          position: relative;
          height: 260px;
        }
        @media (max-width: 480px) {
          .sr-chart-wrap { height: 200px; }
        }

        /* Top items table: hide % bar on very small screens */
        @media (max-width: 480px) {
          .sr-bar-col { display: none; }
          .data-table th:nth-child(1),
          .data-table td:nth-child(1) { display: none; }
        }

        /* Scrollable table wrapper */
        .sr-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      </style>

      <!-- Header + period switcher -->
      <div class="sr-header anim-1">
        <div>
          <div class="page-subtitle">Reports</div>
          <h1 class="page-title">Sales <em style="color:var(--red);font-style:italic">Report</em></h1>
        </div>
        <div class="sr-period-bar" id="periodBar">
          <button class="tab-btn active" onclick="SalesReportView.setPeriod('hourly',this)">Hourly</button>
          <button class="tab-btn" onclick="SalesReportView.setPeriod('daily',this)">Daily</button>
          <button class="tab-btn" onclick="SalesReportView.setPeriod('weekly',this)">Weekly</button>
          <button class="tab-btn" onclick="SalesReportView.setPeriod('monthly',this)">Monthly</button>
        </div>
      </div>

      <!-- KPI summary cards -->
      <div class="sr-kpi-grid anim-1">
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value" id="kpiRevenue">—</div>
              <div class="stat-sub" id="kpiRevSub"></div>
            </div>
            <div class="stat-icon" style="background:var(--green-pale);color:var(--green)">
              <i class="fa-solid fa-dollar-sign"></i>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Total Orders</div>
              <div class="stat-value" id="kpiOrders">—</div>
              <div class="stat-sub" id="kpiOrdSub"></div>
            </div>
            <div class="stat-icon" style="background:var(--blue-pale);color:var(--blue)">
              <i class="fa-solid fa-receipt"></i>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Avg Order Value</div>
              <div class="stat-value" id="kpiAvg">—</div>
              <div class="stat-sub">Per order</div>
            </div>
            <div class="stat-icon" style="background:var(--gold-pale);color:var(--gold)">
              <i class="fa-solid fa-chart-simple"></i>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Peak Period</div>
              <div class="stat-value" id="kpiPeak" style="font-size:15px">—</div>
              <div class="stat-sub" id="kpiPeakSub"></div>
            </div>
            <div class="stat-icon" style="background:var(--red-pale);color:var(--red)">
              <i class="fa-solid fa-trophy"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="sr-charts-grid anim-2">
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px"
               id="chartTitle">Hourly Revenue Today</div>
          <div class="sr-chart-wrap"><canvas id="salesChart"></canvas></div>
        </div>
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px">
            Revenue Breakdown
          </div>
          <div class="sr-chart-wrap"><canvas id="breakdownChart"></canvas></div>
        </div>
      </div>

      <!-- Top selling items -->
      <div class="card anim-3">
        <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;margin-bottom:16px">
          Top Selling Items
        </div>
        <div class="sr-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th class="sr-bar-col">% of Total</th>
              </tr>
            </thead>
            <tbody id="topItemsBody"></tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ────────────────────────────────────────────
     init()
  ──────────────────────────────────────────── */
  init() {
    this.period = 'hourly';
    this.updateKPIs();
    this.renderSalesChart();
    this.renderBreakdownChart();
    this.renderTopItems();
  },

  /* ── Switch period ── */
  setPeriod(p, btn) {
    this.period = p;
    document.querySelectorAll('#periodBar .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.updateKPIs();
    this.renderSalesChart();
  },

  /* ── Mock data ── */
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

  /* ── KPI cards ── */
  updateKPIs() {
    const d       = this._getData();
    const total   = d.data.reduce((a, b) => a + b, 0);
    const orders  = d.orders.reduce((a, b) => a + b, 0);
    const peakIdx = d.data.indexOf(Math.max(...d.data));
    const subLabel = {
      hourly: 'Today', daily: 'This week',
      weekly: 'This month', monthly: 'This year',
    }[this.period];

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('kpiRevenue', `$${(total / 1000).toFixed(1)}k`);
    set('kpiRevSub',  subLabel);
    set('kpiOrders',  orders);
    set('kpiOrdSub',  subLabel);
    set('kpiAvg',     `$${Math.round(total / orders)}`);
    set('kpiPeak',    d.labels[peakIdx]);
    set('kpiPeakSub', `$${Math.max(...d.data).toLocaleString()}`);

    const titleMap = {
      hourly:  'Hourly Revenue Today',
      daily:   'Daily Revenue This Week',
      weekly:  'Weekly Revenue This Month',
      monthly: 'Monthly Revenue 2025',
    };
    set('chartTitle', titleMap[this.period]);
  },

  /* ── Bar + Line chart ── */
  renderSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    if (this.chartInst) this.chartInst.destroy();

    const d       = this._getData();
    const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridClr = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
    const tickClr = isDark ? 'rgba(255,255,255,.4)'  : 'rgba(0,0,0,.4)';

    /* On small screens show fewer x-axis labels */
    const isMobile = window.innerWidth < 600;

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
            pointRadius: isMobile ? 2 : 3,
            tension: .4,
            fill: true,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: tickClr,
              font: { size: isMobile ? 10 : 11 },
              boxWidth: isMobile ? 10 : 14,
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridClr },
            ticks: {
              color: tickClr,
              font: { size: isMobile ? 8 : 10 },
              maxRotation: isMobile ? 45 : 0,
              maxTicksLimit: isMobile ? 6 : 20,
            },
          },
          y: {
            grid: { color: gridClr },
            ticks: {
              color: tickClr,
              font: { size: isMobile ? 8 : 10 },
              callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v),
            },
          },
          y2: {
            position: 'right',
            grid: { display: false },
            ticks: { color: tickClr, font: { size: isMobile ? 8 : 10 } },
          },
        },
      },
    });
  },

  /* ── Doughnut chart ── */
  renderBreakdownChart() {
    const ctx = document.getElementById('breakdownChart');
    if (!ctx) return;
    if (this.chartInst2) this.chartInst2.destroy();

    const isMobile = window.innerWidth < 600;

    this.chartInst2 = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Dine-in', 'Takeaway', 'Delivery', 'Bar'],
        datasets: [{
          data: [58, 22, 15, 5],
          backgroundColor: [
            'rgba(192,57,43,.8)',
            'rgba(184,150,62,.8)',
            'rgba(26,82,118,.8)',
            'rgba(109,59,142,.8)',
          ],
          borderWidth: 2,
          borderColor: 'transparent',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: isMobile ? 'right' : 'bottom',
            labels: {
              font: { size: isMobile ? 10 : 11 },
              padding: isMobile ? 8 : 12,
              boxWidth: isMobile ? 10 : 14,
            },
          },
        },
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
          <td class="sr-bar-col">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:6px;background:var(--bg-input);border-radius:3px;overflow:hidden;min-width:60px">
                <div style="height:100%;width:${pct}%;background:var(--red);border-radius:3px"></div>
              </div>
              <span style="font-size:11px;color:var(--text-3);min-width:28px">${pct}%</span>
            </div>
          </td>
        </tr>`;
    }).join('');
  },
};