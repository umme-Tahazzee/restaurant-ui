/* ================================================
   ADMIN DASHBOARD VIEW
   All Branch Overview with charts, reports, sales
================================================ */

const DashboardView = {

  _charts: {},

  render() {
    const totalRevenue = DB.branches.reduce((s,b) => s + b.revenue, 0);
    const totalExpense = DB.branches.reduce((s,b) => s + b.expense, 0);
    const totalIncome  = DB.branches.reduce((s,b) => s + b.income, 0);
    const totalOrders  = DB.branches.reduce((s,b) => s + b.orders, 0);

    return `
      <div id="dashRoot">

        <!-- Page Header -->
        <div class="page-header anim-1">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="width:20px;height:1px;background:var(--gold);display:inline-block"></span>
              All Branch Overview
            </div>
            <h1 class="page-title">Admin <em style="color:var(--red);font-style:italic">Dashboard</em></h1>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <select class="select-styled" id="branchFilter" onchange="DashboardView.onBranchChange()">
              <option value="all">All Branches</option>
              ${DB.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-download"></i> Export</button>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid-4 anim-1" style="margin-bottom:20px">
          <div class="stat-card" style="border-left:3px solid var(--green)">
            <div class="stat-row">
              <div>
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value" id="kpiRevenue">${Utils.money(totalRevenue)}</div>
                <div class="stat-sub" style="color:var(--green)"><i class="fa-solid fa-arrow-trend-up" style="font-size:10px"></i> +14.2% vs last month</div>
              </div>
              <div class="stat-icon" style="background:var(--green-pale);color:var(--green)"><i class="fa-solid fa-dollar-sign"></i></div>
            </div>
          </div>
          <div class="stat-card" style="border-left:3px solid var(--red)">
            <div class="stat-row">
              <div>
                <div class="stat-label">Total Expense</div>
                <div class="stat-value" id="kpiExpense">${Utils.money(totalExpense)}</div>
                <div class="stat-sub" style="color:var(--red)"><i class="fa-solid fa-arrow-trend-down" style="font-size:10px"></i> +8.1% vs last month</div>
              </div>
              <div class="stat-icon" style="background:var(--red-pale);color:var(--red)"><i class="fa-solid fa-receipt"></i></div>
            </div>
          </div>
          <div class="stat-card" style="border-left:3px solid var(--gold)">
            <div class="stat-row">
              <div>
                <div class="stat-label">Net Income</div>
                <div class="stat-value" id="kpiIncome">${Utils.money(totalIncome)}</div>
                <div class="stat-sub" style="color:var(--green)"><i class="fa-solid fa-arrow-trend-up" style="font-size:10px"></i> +18.6% vs last month</div>
              </div>
              <div class="stat-icon" style="background:var(--gold-pale);color:var(--gold)"><i class="fa-solid fa-chart-line"></i></div>
            </div>
          </div>
          <div class="stat-card" style="border-left:3px solid var(--blue)">
            <div class="stat-row">
              <div>
                <div class="stat-label">Total Orders</div>
                <div class="stat-value" id="kpiOrders">${totalOrders.toLocaleString()}</div>
                <div class="stat-sub"><i class="fa-solid fa-store" style="font-size:10px;color:var(--blue)"></i> Across ${DB.branches.length} branches</div>
              </div>
              <div class="stat-icon" style="background:var(--blue-pale);color:var(--blue)"><i class="fa-solid fa-bag-shopping"></i></div>
            </div>
          </div>
        </div>

        <!-- Row: Revenue Chart + Income Report -->
        <div class="grid-2 anim-2" style="margin-bottom:20px">
          <!-- Income/Expense/Revenue Chart -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">Financial Overview</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Income / Expense / Revenue</div>
              </div>
              <select class="select-styled" id="yearFilter" onchange="DashboardView.renderRevenueChart()" style="width:100px">
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div class="chart-container"><canvas id="revenueChart"></canvas></div>
          </div>

          <!-- Income Report -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">Income Report</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Weekly & Monthly</div>
              </div>
              <div class="tab-bar" style="margin-bottom:0;padding:2px">
                <button class="tab-btn active" onclick="DashboardView.setIncomePeriod('weekly',this)">Weekly</button>
                <button class="tab-btn" onclick="DashboardView.setIncomePeriod('monthly',this)">Monthly</button>
              </div>
            </div>
            <div class="chart-container"><canvas id="incomeChart"></canvas></div>
          </div>
        </div>

        <!-- Row: Expense Approvals + Peak Hours -->
        <div class="grid-2 anim-3" style="margin-bottom:20px">
          <!-- Expense Approval Requests -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">Pending</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Expense Approvals</div>
              </div>
              <span class="tag tag-pending" id="approvalCount"></span>
            </div>
            <div id="approvalsList" style="display:flex;flex-direction:column;gap:10px"></div>
          </div>

          <!-- Peak Hours -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">Traffic</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Today's Peak Hours</div>
              </div>
              <input type="date" class="date-input" id="peakDatePicker" value="2026-03-19" onchange="DashboardView.renderPeakChart()"/>
            </div>
            <div class="chart-container-sm"><canvas id="peakChart"></canvas></div>
          </div>
        </div>

        <!-- Row: Sales Reports -->
        <div class="grid-2 anim-3" style="margin-bottom:20px">
          <!-- This Week Sales -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">This Week</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Weekly Sales Report</div>
              </div>
              <input type="date" class="date-input" value="2026-03-19"/>
            </div>
            <div class="chart-container-sm"><canvas id="weekSalesChart"></canvas></div>
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px">
              <span style="color:var(--text-3)">Total: <strong style="color:var(--text)">${Utils.money(DB.salesData.week.total)}</strong></span>
              <span style="color:var(--text-3)">Orders: <strong style="color:var(--text)">${DB.salesData.week.orders.toLocaleString()}</strong></span>
              <span style="color:var(--text-3)">Avg: <strong style="color:var(--text)">${Utils.money(DB.salesData.week.avgTicket)}</strong></span>
            </div>
          </div>

          <!-- This Month Sales -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">This Month</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Monthly Sales Report</div>
              </div>
              <input type="date" class="date-input" value="2026-03-19"/>
            </div>
            <div class="chart-container-sm"><canvas id="monthSalesChart"></canvas></div>
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px">
              <span style="color:var(--text-3)">Total: <strong style="color:var(--text)">${Utils.money(DB.salesData.month.total)}</strong></span>
              <span style="color:var(--text-3)">Orders: <strong style="color:var(--text)">${DB.salesData.month.orders.toLocaleString()}</strong></span>
              <span style="color:var(--text-3)">Avg: <strong style="color:var(--text)">${Utils.money(DB.salesData.month.avgTicket)}</strong></span>
            </div>
          </div>
        </div>

        <!-- Row: Top Sell Items -->
        <div class="grid-2 anim-4" style="margin-bottom:20px">
          <!-- Today's Top Sell -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">Best Sellers</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">Today's Top Sell Items</div>
              </div>
              <span class="tag tag-vip"><i class="fa-solid fa-fire"></i> Hot</span>
            </div>
            <div id="topItemsToday"></div>
          </div>

          <!-- This Month's Top Sell -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">Monthly Best</div>
                <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">This Month's Top Sell Items</div>
              </div>
            </div>
            <div id="topItemsMonth"></div>
          </div>
        </div>

        <!-- Branch Overview Cards -->
        <div class="anim-4">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--text-3);margin-bottom:12px;display:flex;align-items:center;gap:8px">
            <i class="fa-solid fa-store" style="color:var(--gold)"></i> Branch Performance
          </div>
          <div class="grid-4" id="branchCards"></div>
        </div>

      </div>`;
  },

  init() {
    this.renderRevenueChart();
    this.renderIncomeChart('weekly');
    this.renderPeakChart();
    this.renderWeekSalesChart();
    this.renderMonthSalesChart();
    this.renderApprovals();
    this.renderTopItems('topItemsToday', DB.topItemsToday);
    this.renderTopItems('topItemsMonth', DB.topItemsMonth);
    this.renderBranchCards();
  },

  onBranchChange() {
    // Re-render KPIs based on filter
    const v = document.getElementById('branchFilter').value;
    const branches = v === 'all' ? DB.branches : DB.branches.filter(b => b.id === v);
    const r = branches.reduce((s,b) => s+b.revenue, 0);
    const e = branches.reduce((s,b) => s+b.expense, 0);
    const i = branches.reduce((s,b) => s+b.income, 0);
    const o = branches.reduce((s,b) => s+b.orders, 0);
    document.getElementById('kpiRevenue').textContent = Utils.money(r);
    document.getElementById('kpiExpense').textContent = Utils.money(e);
    document.getElementById('kpiIncome').textContent = Utils.money(i);
    document.getElementById('kpiOrders').textContent = o.toLocaleString();
  },

  /* ── Revenue Chart ── */
  renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    if (this._charts.revenue) this._charts.revenue.destroy();

    const year = document.getElementById('yearFilter')?.value || '2026';
    const data = DB.yearlyData[year]?.months || [];
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridC = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)';

    // Simulated expense data (60% of revenue)
    const expenseData = data.map(v => Math.round(v * 0.35));
    const incomeData = data.map((v,i) => v - expenseData[i]);

    this._charts.revenue = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Revenue',  data, backgroundColor: 'rgba(192,57,43,.7)', borderRadius: 4, barPercentage:.6, categoryPercentage:.7 },
          { label: 'Expense',  data: expenseData, backgroundColor: 'rgba(196,122,26,.5)', borderRadius: 4, barPercentage:.6, categoryPercentage:.7 },
          { label: 'Income',   data: incomeData, backgroundColor: 'rgba(45,122,71,.6)', borderRadius: 4, barPercentage:.6, categoryPercentage:.7 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 16, font: { size: 10 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: 'var(--text-3)' } },
          y: { grid: { color: gridC }, ticks: { font: { size: 10 }, color: 'var(--text-3)', callback: v => '$'+Math.round(v/1000)+'k' } },
        }
      }
    });
  },

  /* ── Income Chart ── */
  _incomePeriod: 'weekly',
  setIncomePeriod(period, btn) {
    this._incomePeriod = period;
    btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderIncomeChart(period);
  },

  renderIncomeChart(period) {
    const ctx = document.getElementById('incomeChart');
    if (!ctx) return;
    if (this._charts.income) this._charts.income.destroy();

    period = period || this._incomePeriod;
    const labels = period === 'weekly' ? DB.incomeData.weekLabels : DB.incomeData.monthLabels;
    const data = period === 'weekly' ? DB.incomeData.weekly : DB.incomeData.monthly;

    this._charts.income = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Income',
          data,
          borderColor: '#c0392b',
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'transparent';
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, 'rgba(192,57,43,.2)');
            g.addColorStop(1, 'rgba(192,57,43,.01)');
            return g;
          },
          fill: true, tension: .4, borderWidth: 2,
          pointRadius: 4, pointBackgroundColor: '#c0392b', pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: 'var(--text-3)' } },
          y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 }, color: 'var(--text-3)', callback: v => '$'+Math.round(v/1000)+'k' } },
        }
      }
    });
  },

  /* ── Peak Hours Chart ── */
  renderPeakChart() {
    const ctx = document.getElementById('peakChart');
    if (!ctx) return;
    if (this._charts.peak) this._charts.peak.destroy();

    this._charts.peak = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: DB.peakHours.labels,
        datasets: [{
          data: DB.peakHours.data,
          backgroundColor: (context) => {
            const v = context.raw;
            if (v >= 60) return 'rgba(192,57,43,.8)';
            if (v >= 40) return 'rgba(196,122,26,.7)';
            if (v >= 20) return 'rgba(184,150,62,.6)';
            return 'rgba(184,150,62,.25)';
          },
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: 'var(--text-3)' } },
          y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 9 }, color: 'var(--text-3)' } },
        }
      }
    });
  },

  /* ── Week Sales Chart ── */
  renderWeekSalesChart() {
    const ctx = document.getElementById('weekSalesChart');
    if (!ctx) return;
    if (this._charts.weekSales) this._charts.weekSales.destroy();

    this._charts.weekSales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          data: [12400,14200,11800,15600,13900,16200,14800],
          borderColor: '#b8963e',
          backgroundColor: 'rgba(184,150,62,.08)',
          fill: true, tension: .4, borderWidth: 2,
          pointRadius: 3, pointBackgroundColor: '#b8963e',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: 'var(--text-3)' } },
          y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 9 }, color: 'var(--text-3)', callback: v => '$'+Math.round(v/1000)+'k' } },
        }
      }
    });
  },

  /* ── Month Sales Chart ── */
  renderMonthSalesChart() {
    const ctx = document.getElementById('monthSalesChart');
    if (!ctx) return;
    if (this._charts.monthSales) this._charts.monthSales.destroy();

    const days = Array.from({length:19}, (_,i) => i+1);
    const data = [8200,9400,11800,10600,12400,14200,13800,9200,10800,12600,11400,13200,14800,12000,11600,13400,15200,14600,14820];

    this._charts.monthSales = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days.map(d => `Mar ${d}`),
        datasets: [{
          data,
          backgroundColor: (context) => context.dataIndex === data.length - 1 ? 'rgba(192,57,43,.8)' : 'rgba(192,57,43,.2)',
          borderRadius: 3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 8 }, color: 'var(--text-3)', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
          y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 9 }, color: 'var(--text-3)', callback: v => '$'+Math.round(v/1000)+'k' } },
        }
      }
    });
  },

  /* ── Expense Approvals ── */
  renderApprovals() {
    const el = document.getElementById('approvalsList');
    const badge = document.getElementById('approvalCount');
    if (!el) return;

    const pending = DB.expenseApprovals.filter(e => e.status === 'pending');
    if (badge) badge.textContent = `${pending.length} pending`;

    el.innerHTML = DB.expenseApprovals.map(e => `
      <div class="approval-card">
        <div class="stat-icon" style="background:${e.status==='pending'?'var(--orange-pale)':'var(--green-pale)'};color:${e.status==='pending'?'var(--orange)':'var(--green)'}">
          <i class="fa-solid fa-file-invoice-dollar"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:700;font-size:13px">${Utils.money(e.amount)}</span>
            <span class="tag tag-${e.status}">${e.status}</span>
          </div>
          <div style="font-size:11px;color:var(--text-2)">${e.category} — ${e.branch}</div>
          <div style="font-size:10px;color:var(--text-3);margin-top:2px">${e.note}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
            <span style="font-size:10px;color:var(--text-3)">By ${e.requestedBy} · ${Utils.formatDate(e.date)}</span>
            ${e.status === 'pending' ? `
              <div style="display:flex;gap:6px">
                <button class="btn btn-green btn-sm" onclick="DashboardView.approveExpense('${e.id}')"><i class="fa-solid fa-check"></i> Approve</button>
                <button class="btn btn-danger btn-sm" onclick="DashboardView.rejectExpense('${e.id}')"><i class="fa-solid fa-xmark"></i></button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>`).join('');
  },

  approveExpense(id) {
    const e = DB.expenseApprovals.find(x => x.id === id);
    if (e) { e.status = 'approved'; this.renderApprovals(); Toast.show('Expense approved!', 'success'); }
  },
  rejectExpense(id) {
    const e = DB.expenseApprovals.find(x => x.id === id);
    if (e) { e.status = 'rejected'; this.renderApprovals(); Toast.show('Expense rejected', 'error'); }
  },

  /* ── Top Items ── */
  renderTopItems(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map((item, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;${i < items.length-1 ? 'border-bottom:1px solid var(--border)' : ''}">
        <span style="font-size:10px;font-weight:700;color:var(--text-3);min-width:16px">${i+1}</span>
        <span style="font-size:18px">${item.emoji}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name}</div>
          <div class="progress-bar" style="margin-top:4px"><div class="progress-fill" style="width:${item.pct}%;background:linear-gradient(90deg,var(--red),var(--gold))"></div></div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:11px;font-weight:700">${item.qty}x</div>
          <div style="font-size:10px;color:var(--green);font-weight:700">${Utils.money(item.revenue)}</div>
        </div>
      </div>`).join('');
  },

  /* ── Branch Cards ── */
  renderBranchCards() {
    const el = document.getElementById('branchCards');
    if (!el) return;
    const colors = ['#c0392b','#b8963e','#1a5276','#2d7a47'];
    el.innerHTML = DB.branches.map((b, i) => `
      <div class="card" style="border-top:3px solid ${colors[i]}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:40px;height:40px;border-radius:10px;background:${colors[i]}20;color:${colors[i]};display:flex;align-items:center;justify-content:center">
            <i class="fa-solid fa-store"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:13px">${b.name}</div>
            <div style="font-size:10px;color:var(--text-3)">${b.city}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);font-weight:700">Revenue</div><div style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:var(--green)">${Utils.money(b.revenue)}</div></div>
          <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);font-weight:700">Expense</div><div style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:var(--red)">${Utils.money(b.expense)}</div></div>
          <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);font-weight:700">Orders</div><div style="font-weight:700;font-size:14px">${b.orders.toLocaleString()}</div></div>
          <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);font-weight:700">Rating</div><div style="font-weight:700;font-size:14px"><i class="fa-solid fa-star" style="color:var(--gold);font-size:11px"></i> ${b.rating}</div></div>
        </div>
      </div>`).join('');
  },

};
