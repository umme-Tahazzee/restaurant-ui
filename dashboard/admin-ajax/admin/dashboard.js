/* ================================================
   ADMIN DASHBOARD VIEW — REFACTORED VERSION
  
================================================ */

const DashboardView = {

  // সব chart এর reference এখানে রাখা হয় (destroy করার জন্য দরকার)
  _charts: {},

  // ─────────────────────────────────────────────────
  // IMPROVEMENT 1: SHARED AXIS CONFIG
  // একবার define করলেই সব chart এ reuse করা যাবে
  // ─────────────────────────────────────────────────
  _axisDefaults: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, color: 'var(--text-3)' }
    },
    y: {
      grid: { color: 'rgba(0,0,0,.04)' },
      ticks: {
        font: { size: 10 },
        color: 'var(--text-3)',
        // 12000 → "$12k" format এ দেখাবে
        callback: v => '$' + Math.round(v / 1000) + 'k'
      }
    }
  },

  // ─────────────────────────────────────────────────
  // IMPROVEMENT 2: CHART HELPER METHOD
  // এই একটা method call করলেই হবে
  //
  // @param key     — chart এর নাম, যেমন 'revenue', 'income'
  // @param ctxId   — HTML canvas element এর id
  // @param config  — Chart.js এর config object
  // ─────────────────────────────────────────────────
  _makeChart(key, ctxId, config) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return; 

    // আগের chart থাকলে আগে destroy করো (না করলে memory leak হয়)
    if (this._charts[key]) this._charts[key].destroy();

    // নতুন chart বানাও এবং reference রাখো
    this._charts[key] = new Chart(ctx, config);
  },

  // ─────────────────────────────────────────────────
  // IMPROVEMENT 3: KPI CARD DATA — ARRAY হিসেবে রাখা
  // data আলাদা, HTML rendering আলাদা — সহজে নতুন কার্ড যোগ করা যাবে
  // ─────────────────────────────────────────────────
  _getKpiCards(r, e, i, o) {
    // প্রতিটা object একটা KPI card represent করে
    return [
      {
        id: 'kpiRevenue',
        label: 'Total Revenue',
        value: Utils.money(r),
        color: 'green',
        icon: 'dollar-sign',
        sub: '<i class="fa-solid fa-arrow-trend-up" style="font-size:10px"></i> +14.2% vs last month',
        subColor: 'var(--green)'
      },
      {
        id: 'kpiExpense',
        label: 'Total Expense',
        value: Utils.money(e),
        color: 'red',
        icon: 'receipt',
        sub: '<i class="fa-solid fa-arrow-trend-down" style="font-size:10px"></i> +8.1% vs last month',
        subColor: 'var(--red)'
      },
      {
        id: 'kpiIncome',
        label: 'Net Income',
        value: Utils.money(i),
        color: 'gold',
        icon: 'chart-line',
        sub: '<i class="fa-solid fa-arrow-trend-up" style="font-size:10px"></i> +18.6% vs last month',
        subColor: 'var(--green)'
      },
      {
        id: 'kpiOrders',
        label: 'Total Orders',
        value: o.toLocaleString(),
        color: 'blue',
        icon: 'bag-shopping',
        sub: `<i class="fa-solid fa-store" style="font-size:10px;color:var(--blue)"></i> Across ${DB.branches.length} branches`,
        subColor: 'inherit'
      }
    ];
  },

  // ─────────────────────────────────────────────────
  // IMPROVEMENT 4: render() ভেঙে ছোট ছোট method
  // প্রতিটা section আলাদা method, render() শুধু জোড়া লাগায়
  // ─────────────────────────────────────────────────

  // মূল render — শুধু sections জোড়া লাগায়
  render() {
    const r = DB.branches.reduce((s, b) => s + b.revenue, 0);
    const e = DB.branches.reduce((s, b) => s + b.expense, 0);
    const i = DB.branches.reduce((s, b) => s + b.income,  0);
    const o = DB.branches.reduce((s, b) => s + b.orders,  0);

    return `
      <div id="dashRoot">
        ${this._renderHeader()}
        ${this._renderKpis(r, e, i, o)}
        ${this._renderChartRow()}
        ${this._renderApprovalsAndPeak()}
        ${this._renderSalesReports()}
        ${this._renderTopItems()}
        ${this._renderBranchSection()}
      </div>`;
  },

  // Section: Page header (title + filter + export button)
  _renderHeader() {
    return `
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
      </div>`;
  },

  // Section: ৪টা KPI card — array থেকে .map() দিয়ে বানায়
  _renderKpis(r, e, i, o) {
    const cards = this._getKpiCards(r, e, i, o);

    // প্রতিটা card object কে HTML এ convert করে
    const cardsHtml = cards.map(c => `
      <div class="stat-card" style="border-left:3px solid var(--${c.color})">
        <div class="stat-row">
          <div>
            <div class="stat-label">${c.label}</div>
            <div class="stat-value" id="${c.id}">${c.value}</div>
            <div class="stat-sub" style="color:${c.subColor}">${c.sub}</div>
          </div>
          <div class="stat-icon" style="background:var(--${c.color}-pale);color:var(--${c.color})">
            <i class="fa-solid fa-${c.icon}"></i>
          </div>
        </div>
      </div>`).join('');

    return `<div class="grid-4 anim-1" style="margin-bottom:20px">${cardsHtml}</div>`;
  },

  // Section: Revenue chart + Income chart পাশাপাশি
  _renderChartRow() {
    return `
      <div class="grid-2 anim-2" style="margin-bottom:20px">
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
      </div>`;
  },

  // Section: Expense approvals + Peak hours পাশাপাশি
  _renderApprovalsAndPeak() {
    return `
      <div class="grid-2 anim-3" style="margin-bottom:20px">
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
      </div>`;
  },

  // Section: Weekly + Monthly sales report পাশাপাশি
  _renderSalesReports() {
    return `
      <div class="grid-2 anim-3" style="margin-bottom:20px">
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
      </div>`;
  },

  // Section: Top sell items (today + this month) পাশাপাশি
  _renderTopItems() {
    return `
      <div class="grid-2 anim-4" style="margin-bottom:20px">
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
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div>
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">Monthly Best</div>
              <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">This Month's Top Sell Items</div>
            </div>
          </div>
          <div id="topItemsMonth"></div>
        </div>
      </div>`;
  },

  // Section: Branch performance cards এর wrapper
  _renderBranchSection() {
    return `
      <div class="anim-4">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--text-3);margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <i class="fa-solid fa-store" style="color:var(--gold)"></i> Branch Performance
        </div>
        <div class="grid-4" id="branchCards"></div>
      </div>`;
  },

  // ─────────────────────────────────────────────────
  // init() — সব chart ও dynamic content initialize করে
  // AJAX দিয়ে customers + approvals আগে load করে, তারপর সব render করে
  // ─────────────────────────────────────────────────
  async init() {
    // Static charts আগেই render করো (এগুলো DB.* এর fixed data দিয়ে চলে)
    this.renderRevenueChart();
    this.renderIncomeChart('weekly');
    this.renderPeakChart();
    this.renderWeekSalesChart();
    this.renderMonthSalesChart();
    this.renderTopItemsList('topItemsToday', DB.topItemsToday);
    this.renderTopItemsList('topItemsMonth', DB.topItemsMonth);
    this.renderBranchCards();

    // AJAX: Customers + Expense Approvals fetch করো
    // Promise.all দিয়ে দুটো request একসাথে পাঠাও (faster)
    await Api.getDashboardData();

    // নতুন data দিয়ে approvals re-render করো
    this.renderApprovals();
  },

  // Branch filter পরিবর্তন হলে KPI update করে
  onBranchChange() {
    const v = document.getElementById('branchFilter').value;
    // 'all' হলে সব branch, নাহলে শুধু selected branch
    const branches = v === 'all' ? DB.branches : DB.branches.filter(b => b.id === v);

    const r = branches.reduce((s, b) => s + b.revenue, 0);
    const e = branches.reduce((s, b) => s + b.expense, 0);
    const i = branches.reduce((s, b) => s + b.income,  0);
    const o = branches.reduce((s, b) => s + b.orders,  0);

    // DOM এ value গুলো update করো
    document.getElementById('kpiRevenue').textContent = Utils.money(r);
    document.getElementById('kpiExpense').textContent = Utils.money(e);
    document.getElementById('kpiIncome').textContent  = Utils.money(i);
    document.getElementById('kpiOrders').textContent  = o.toLocaleString();
  },

  // ─────────────────────────────────────────────────
  // CHART METHODS — সবাই _makeChart() helper use করে
  // ─────────────────────────────────────────────────

  renderRevenueChart() {
    const year = document.getElementById('yearFilter')?.value || '2026';
    const data = DB.yearlyData[year]?.months || [];
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Dark mode এ grid color আলাদা
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)';

    // Revenue থেকে expense ও income calculate
    const expenseData = data.map(v => Math.round(v * 0.35));
    const incomeData  = data.map((v, i) => v - expenseData[i]);

    // _makeChart() helper দিয়ে chart বানাও
    this._makeChart('revenue', 'revenueChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Revenue', data,        backgroundColor: 'rgba(192,57,43,.7)',  borderRadius: 4, barPercentage: .6, categoryPercentage: .7 },
          { label: 'Expense', data: expenseData, backgroundColor: 'rgba(196,122,26,.5)', borderRadius: 4, barPercentage: .6, categoryPercentage: .7 },
          { label: 'Income',  data: incomeData,  backgroundColor: 'rgba(45,122,71,.6)',  borderRadius: 4, barPercentage: .6, categoryPercentage: .7 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 16, font: { size: 10 } } }
        },
        scales: {
          // _axisDefaults reuse করছি — x এর জন্য grid বন্ধ
          x: this._axisDefaults.x,
          // y এর জন্য custom grid color দরকার (dark mode)
          y: { ...this._axisDefaults.y, grid: { color: gridColor } }
        }
      }
    });
  },

  _incomePeriod: 'weekly',

  setIncomePeriod(period, btn) {
    this._incomePeriod = period;
    // সব tab button থেকে active সরাও, শুধু clicked button এ active দাও
    btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderIncomeChart(period);
  },

  renderIncomeChart(period) {
    period = period || this._incomePeriod;
    const labels = period === 'weekly' ? DB.incomeData.weekLabels  : DB.incomeData.monthLabels;
    const data   = period === 'weekly' ? DB.incomeData.weekly      : DB.incomeData.monthly;

    this._makeChart('income', 'incomeChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Income',
          data,
          borderColor: '#c0392b',
          // Gradient fill — chart area পাওয়ার পর বানাতে হয়
          backgroundColor: (context) => {
            const { ctx: c, chartArea } = context.chart;
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
        scales: this._axisDefaults // সরাসরি shared config use
      }
    });
  },

  renderPeakChart() {
    this._makeChart('peak', 'peakChart', {
      type: 'bar',
      data: {
        labels: DB.peakHours.labels,
        datasets: [{
          data: DB.peakHours.data,
          // value অনুযায়ী bar এর color change হয়
          backgroundColor: (context) => {
            const v = context.raw;
            if (v >= 60) return 'rgba(192,57,43,.8)';  // সবচেয়ে busy
            if (v >= 40) return 'rgba(196,122,26,.7)';
            if (v >= 20) return 'rgba(184,150,62,.6)';
            return 'rgba(184,150,62,.25)';              // কম busy
          },
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ...this._axisDefaults.x, ticks: { ...this._axisDefaults.x.ticks, font: { size: 9 } } },
          y: { ...this._axisDefaults.y, ticks: { ...this._axisDefaults.y.ticks, font: { size: 9 }, callback: v => v } }
        }
      }
    });
  },

  renderWeekSalesChart() {
    this._makeChart('weekSales', 'weekSalesChart', {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          data: [12400, 14200, 11800, 15600, 13900, 16200, 14800],
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
          x: { ...this._axisDefaults.x, ticks: { ...this._axisDefaults.x.ticks, font: { size: 9 } } },
          y: { ...this._axisDefaults.y, ticks: { ...this._axisDefaults.y.ticks, font: { size: 9 } } }
        }
      }
    });
  },

  renderMonthSalesChart() {
    const days = Array.from({ length: 19 }, (_, i) => i + 1);
    const data  = [8200,9400,11800,10600,12400,14200,13800,9200,10800,12600,11400,13200,14800,12000,11600,13400,15200,14600,14820];

    this._makeChart('monthSales', 'monthSalesChart', {
      type: 'bar',
      data: {
        labels: days.map(d => `Mar ${d}`),
        datasets: [{
          data,
          // শেষ bar (আজকের) উজ্জ্বল, বাকিগুলো faded
          backgroundColor: (context) =>
            context.dataIndex === data.length - 1
              ? 'rgba(192,57,43,.8)'
              : 'rgba(192,57,43,.2)',
          borderRadius: 3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ...this._axisDefaults.x, ticks: { font: { size: 8 }, color: 'var(--text-3)', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
          y: { ...this._axisDefaults.y, ticks: { ...this._axisDefaults.y.ticks, font: { size: 9 } } }
        }
      }
    });
  },

  // ─────────────────────────────────────────────────
  // IMPROVEMENT 5: APPROVE / REJECT — shared method
  // আগে: দুটো আলাদা method এ same কাজ করা হতো
  // এখন: একটা private method, দুটো public method শুধু call করে
  // ─────────────────────────────────────────────────

  // Private method — actual কাজ করে
  _updateExpenseStatus(id, status, message, toastType) {
    const expense = DB.expenseApprovals.find(x => x.id === id);
    if (!expense) return; // না পেলে কিছু করো না
    expense.status = status;
    this.renderApprovals();
    Toast.show(message, toastType);
  },

  // Public method — approve button এ call হয়
  approveExpense(id) {
    this._updateExpenseStatus(id, 'approved', 'Expense approved!', 'success');
  },

  // Public method — reject button এ call হয়
  rejectExpense(id) {
    this._updateExpenseStatus(id, 'rejected', 'Expense rejected', 'error');
  },

  renderApprovals() {
    const el    = document.getElementById('approvalsList');
    const badge = document.getElementById('approvalCount');
    if (!el) return;

    const pending = DB.expenseApprovals.filter(e => e.status === 'pending');
    if (badge) badge.textContent = `${pending.length} pending`;

    el.innerHTML = DB.expenseApprovals.map(e => `
      <div class="approval-card">
        <div class="stat-icon" style="background:${e.status === 'pending' ? 'var(--orange-pale)' : 'var(--green-pale)'};color:${e.status === 'pending' ? 'var(--orange)' : 'var(--green)'}">
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
              </div>` : ''}
          </div>
        </div>
      </div>`).join('');
  },

  // Top items list render — আগে renderTopItems() ছিল, rename করা হয়েছে
  // কারণ: _renderTopItems() নামে section method আছে, conflict এড়াতে
  renderTopItemsList(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = items.map((item, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;${i < items.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
        <span style="font-size:10px;font-weight:700;color:var(--text-3);min-width:16px">${i + 1}</span>
        <span style="font-size:18px">${item.emoji}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name}</div>
          <div class="progress-bar" style="margin-top:4px">
            <div class="progress-fill" style="width:${item.pct}%;background:linear-gradient(90deg,var(--red),var(--gold))"></div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:11px;font-weight:700">${item.qty}x</div>
          <div style="font-size:10px;color:var(--green);font-weight:700">${Utils.money(item.revenue)}</div>
        </div>
      </div>`).join('');
  },

  renderBranchCards() {
    const el = document.getElementById('branchCards');
    if (!el) return;

    // প্রতিটা branch এর জন্য আলাদা color
    const colors = ['#c0392b', '#b8963e', '#1a5276', '#2d7a47'];

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

/*
  ════════════════════════════════════════════════════
  SUMMARY: কী কী change হয়েছে এবং কেন
  ════════════════════════════════════════════════════

  1. _axisDefaults    → chart axis options একবার লিখে সব chart এ reuse
  2. _makeChart()     → destroy + new Chart এর repetition দূর করেছে
  3. _getKpiCards()   → KPI data array এ রাখা, HTML loop এ বানানো
  4. render() split   → _renderHeader(), _renderKpis() ইত্যাদি ছোট method
  5. _updateExpenseStatus() → approve/reject এর duplicate logic একটা method এ

  ⚠️ কী change হয়নি:
  - কোনো HTML structure / CSS class পরিবর্তন হয়নি
  - Design একটুও পরিবর্তন হয়নি
  - DB, Utils, Toast এর usage একই আছে
  ════════════════════════════════════════════════════
*/