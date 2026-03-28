/* ================================================
   ADMIN DASHBOARD VIEW
   All Branch Overview — Charts, Reports, Sales
   ================================================ */

const DashboardView = (() => {

  /* ─────────────────────────────────────────────
     PRIVATE STATE
  ───────────────────────────────────────────── */

  const _charts = {};
  let _data     = null;
  let _incomePeriod = 'weekly';

  /* ─────────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────────── */

  const BRANCH_COLORS  = ['#c0392b', '#b8963e', '#1a5276', '#2d7a47'];
  const MONTH_LABELS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const WEEK_LABELS    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  /* ─────────────────────────────────────────────
     SHARED CHART HELPERS
  ───────────────────────────────────────────── */

  /**
   * Returns base Chart.js options shared across all charts.
   * @param {Function} [yTickCallback] - Optional Y-axis formatter.
   */
  function _baseChartOptions(yTickCallback = null) {
    const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 }, color: 'var(--text-3)' },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            font: { size: 9 },
            color: 'var(--text-3)',
            ...(yTickCallback && { callback: yTickCallback }),
          },
        },
      },
    };
  }

  /** Standard money formatter for Y-axis ticks. */
  const _moneyTick = v => '$' + Math.round(v / 1000) + 'k';

  /** Safely destroys an existing chart before re-rendering. */
  function _destroyChart(key) {
    if (_charts[key]) {
      _charts[key].destroy();
      _charts[key] = null;
    }
  }

  /* ─────────────────────────────────────────────
     KPI HELPERS
  ───────────────────────────────────────────── */

  function _aggregateKPIs(branches) {
    return branches.reduce(
      (acc, b) => ({
        revenue: acc.revenue + b.revenue,
        expense: acc.expense + b.expense,
        income:  acc.income  + b.income,
        orders:  acc.orders  + b.orders,
      }),
      { revenue: 0, expense: 0, income: 0, orders: 0 }
    );
  }

  function _updateKPIDisplay({ revenue, expense, income, orders }) {
    document.getElementById('kpiRevenue').textContent = Utils.money(revenue);
    document.getElementById('kpiExpense').textContent = Utils.money(expense);
    document.getElementById('kpiIncome').textContent  = Utils.money(income);
    document.getElementById('kpiOrders').textContent  = orders.toLocaleString();
  }

  /* ─────────────────────────────────────────────
     HTML TEMPLATE BUILDERS
  ───────────────────────────────────────────── */

  function _buildPageHeader() {
    const branchOptions = _data.branches
      .map(b => `<option value="${b.id}">${b.name}</option>`)
      .join('');

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
            ${branchOptions}
          </select>
          <button class="btn btn-outline btn-sm">
            <i class="fa-solid fa-download"></i> Export
          </button>
        </div>
      </div>`;
  }

  function _buildKPICard(label, value, id, color, icon, subText, subIcon = 'fa-arrow-trend-up') {
    const isMoney    = typeof value === 'number';
    const displayVal = isMoney ? Utils.money(value) : value;
    const isBlue     = color === 'var(--blue)';

    return `
      <div class="stat-card" style="border-left:3px solid ${color}">
        <div class="stat-row">
          <div>
            <div class="stat-label">${label}</div>
            <div class="stat-value" id="${id}">${displayVal}</div>
            <div class="stat-sub" style="color:${isBlue ? 'var(--text-3)' : color}">
              <i class="fa-solid ${subIcon}" style="font-size:10px;${isBlue ? `color:${color}` : ''}"></i>
              ${subText}
            </div>
          </div>
          <div class="stat-icon" style="background:${color.replace(')', 'pale)')};color:${color}">
            <i class="fa-solid ${icon}"></i>
          </div>
        </div>
      </div>`;
  }

  function _buildKPICards({ revenue, expense, income, orders }) {
    return `
      <div class="grid-4 anim-1" style="margin-bottom:20px">
        ${_buildKPICard('Total Revenue', revenue, 'kpiRevenue', 'var(--green)',  'fa-dollar-sign',  '+14.2% vs last month')}
        ${_buildKPICard('Total Expense', expense, 'kpiExpense', 'var(--red)',    'fa-receipt',      '+8.1% vs last month', 'fa-arrow-trend-down')}
        ${_buildKPICard('Net Income',    income,  'kpiIncome',  'var(--gold)',   'fa-chart-line',   '+18.6% vs last month')}
        ${_buildKPICard('Total Orders',  orders.toLocaleString(), 'kpiOrders', 'var(--blue)', 'fa-bag-shopping', `Across ${_data.branches.length} branches`, 'fa-store')}
      </div>`;
  }

  function _buildCardHeader(subTitle, title, rightSlot = '') {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3)">${subTitle}</div>
          <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">${title}</div>
        </div>
        ${rightSlot}
      </div>`;
  }

  function _buildRevenueChartSection() {
    const yearSelect = `
      <select class="select-styled" id="yearFilter" onchange="DashboardView.renderRevenueChart()" style="width:100px">
        <option value="2026">2026</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
      </select>`;

    return `
      <div class="card">
        ${_buildCardHeader('Financial Overview', 'Income / Expense / Revenue', yearSelect)}
        <div class="chart-container"><canvas id="revenueChart"></canvas></div>
      </div>`;
  }

  function _buildIncomeReportSection() {
    const tabs = `
      <div class="tab-bar" style="margin-bottom:0;padding:2px">
        <button class="tab-btn active" onclick="DashboardView.setIncomePeriod('weekly',this)">Weekly</button>
        <button class="tab-btn"        onclick="DashboardView.setIncomePeriod('monthly',this)">Monthly</button>
      </div>`;

    return `
      <div class="card">
        ${_buildCardHeader('Income Report', 'Weekly &amp; Monthly', tabs)}
        <div class="chart-container"><canvas id="incomeChart"></canvas></div>
      </div>`;
  }

  function _buildApprovalsSection() {
    return `
      <div class="card">
        ${_buildCardHeader('Pending', 'Expense Approvals', '<span class="tag tag-pending" id="approvalCount"></span>')}
        <div id="approvalsList" style="display:flex;flex-direction:column;gap:10px"></div>
      </div>`;
  }

  function _buildPeakHoursSection() {
    const datePicker = `
      <input type="date" class="date-input" id="peakDatePicker"
             value="2026-03-19" onchange="DashboardView.renderPeakChart()"/>`;

    return `
      <div class="card">
        ${_buildCardHeader('Traffic', "Today's Peak Hours", datePicker)}
        <div class="chart-container-sm"><canvas id="peakChart"></canvas></div>
      </div>`;
  }

  function _buildSalesSection(subTitle, titlePrefix, canvasId, dataObj) {
    const datePicker = `<input type="date" class="date-input" value="2026-03-19"/>`;

    return `
      <div class="card">
        ${_buildCardHeader(subTitle, `${titlePrefix} Sales Report`, datePicker)}
        <div class="chart-container-sm"><canvas id="${canvasId}"></canvas></div>
        <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px">
          <span style="color:var(--text-3)">Total:  <strong style="color:var(--text)">${Utils.money(dataObj.total)}</strong></span>
          <span style="color:var(--text-3)">Orders: <strong style="color:var(--text)">${dataObj.orders.toLocaleString()}</strong></span>
          <span style="color:var(--text-3)">Avg:    <strong style="color:var(--text)">${Utils.money(dataObj.avgTicket)}</strong></span>
        </div>
      </div>`;
  }

  function _buildTopItemsSection(subTitle, title, containerId, showHotBadge) {
    const badge = showHotBadge
      ? `<span class="tag tag-vip"><i class="fa-solid fa-fire"></i> Hot</span>`
      : '';

    return `
      <div class="card">
        ${_buildCardHeader(subTitle, title, badge)}
        <div id="${containerId}"></div>
      </div>`;
  }

  /* ─────────────────────────────────────────────
     CHART RENDERERS
  ───────────────────────────────────────────── */

  function _renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    _destroyChart('revenue');

    const year       = document.getElementById('yearFilter')?.value || '2026';
    const revenueData = _data.yearlyData[year]?.months || [];
    const expenseData = revenueData.map(v => Math.round(v * 0.35));
    const incomeData  = revenueData.map((v, i) => v - expenseData[i]);

    const options = _baseChartOptions(_moneyTick);
    options.plugins.legend = {
      position: 'top',
      labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 16, font: { size: 10 } },
    };

    _charts.revenue = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MONTH_LABELS,
        datasets: [
          { label: 'Revenue', data: revenueData, backgroundColor: 'rgba(192,57,43,.7)',  borderRadius: 4, barPercentage: .6, categoryPercentage: .7 },
          { label: 'Expense', data: expenseData, backgroundColor: 'rgba(196,122,26,.5)', borderRadius: 4, barPercentage: .6, categoryPercentage: .7 },
          { label: 'Income',  data: incomeData,  backgroundColor: 'rgba(45,122,71,.6)',  borderRadius: 4, barPercentage: .6, categoryPercentage: .7 },
        ],
      },
      options,
    });
  }

  function _renderIncomeChart(period) {
    const ctx = document.getElementById('incomeChart');
    if (!ctx) return;
    _destroyChart('income');

    const isWeekly = period === 'weekly';
    const labels   = isWeekly ? _data.incomeData.weekLabels  : _data.incomeData.monthLabels;
    const values   = isWeekly ? _data.incomeData.weekly      : _data.incomeData.monthly;

    _charts.income = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Income',
          data: values,
          borderColor: '#c0392b',
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
        }],
      },
      options: _baseChartOptions(_moneyTick),
    });
  }

  function _renderPeakChart() {
    const ctx = document.getElementById('peakChart');
    if (!ctx) return;
    _destroyChart('peak');

    _charts.peak = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: _data.peakHours.labels,
        datasets: [{
          data: _data.peakHours.data,
          backgroundColor: ({ raw: v }) => {
            if (v >= 60) return 'rgba(192,57,43,.8)';
            if (v >= 40) return 'rgba(196,122,26,.7)';
            if (v >= 20) return 'rgba(184,150,62,.6)';
            return 'rgba(184,150,62,.25)';
          },
          borderRadius: 4,
        }],
      },
      options: _baseChartOptions(),
    });
  }

  function _renderWeekSalesChart() {
    const ctx = document.getElementById('weekSalesChart');
    if (!ctx) return;
    _destroyChart('weekSales');

    _charts.weekSales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: WEEK_LABELS,
        datasets: [{
          data: [12400, 14200, 11800, 15600, 13900, 16200, 14800],
          borderColor: '#b8963e',
          backgroundColor: 'rgba(184,150,62,.08)',
          fill: true, tension: .4, borderWidth: 2,
          pointRadius: 3, pointBackgroundColor: '#b8963e',
        }],
      },
      options: _baseChartOptions(_moneyTick),
    });
  }

  function _renderMonthSalesChart() {
    const ctx = document.getElementById('monthSalesChart');
    if (!ctx) return;
    _destroyChart('monthSales');

    const data   = [8200,9400,11800,10600,12400,14200,13800,9200,10800,12600,11400,13200,14800,12000,11600,13400,15200,14600,14820];
    const labels = data.map((_, i) => `Mar ${i + 1}`);
    const lastIdx = data.length - 1;

    _charts.monthSales = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ({ dataIndex }) =>
            dataIndex === lastIdx ? 'rgba(192,57,43,.8)' : 'rgba(192,57,43,.2)',
          borderRadius: 3,
        }],
      },
      options: {
        ..._baseChartOptions(_moneyTick),
        scales: {
          ..._baseChartOptions(_moneyTick).scales,
          x: {
            grid: { display: false },
            ticks: { font: { size: 8 }, color: 'var(--text-3)', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
          },
        },
      },
    });
  }

  /* ─────────────────────────────────────────────
     COMPONENT RENDERERS
  ───────────────────────────────────────────── */

  function _renderApprovals() {
    const list  = document.getElementById('approvalsList');
    const badge = document.getElementById('approvalCount');
    if (!list) return;

    const pendingCount = _data.expenseApprovals.filter(e => e.status === 'pending').length;
    if (badge) badge.textContent = `${pendingCount} pending`;

    list.innerHTML = _data.expenseApprovals.map(e => {
      const isPending   = e.status === 'pending';
      const iconBg      = isPending ? 'var(--orange-pale)' : 'var(--green-pale)';
      const iconColor   = isPending ? 'var(--orange)'      : 'var(--green)';
      const actionBtns  = isPending ? `
        <div style="display:flex;gap:6px">
          <button class="btn btn-green btn-sm"  onclick="DashboardView.approveExpense('${e.id}')"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-danger btn-sm" onclick="DashboardView.rejectExpense('${e.id}')"><i class="fa-solid fa-xmark"></i></button>
        </div>` : '';

      return `
        <div class="approval-card">
          <div class="stat-icon" style="background:${iconBg};color:${iconColor}">
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
              ${actionBtns}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function _renderTopItems(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = items.map((item, i) => {
      const isLast  = i === items.length - 1;
      const divider = isLast ? '' : 'border-bottom:1px solid var(--border)';

      return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;${divider}">
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
        </div>`;
    }).join('');
  }

  function _renderBranchCards() {
    const el = document.getElementById('branchCards');
    if (!el) return;

    el.innerHTML = _data.branches.map((b, i) => {
      const color = BRANCH_COLORS[i];
      return `
        <div class="card" style="border-top:3px solid ${color}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <div style="width:40px;height:40px;border-radius:10px;background:${color}20;color:${color};display:flex;align-items:center;justify-content:center">
              <i class="fa-solid fa-store"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:13px">${b.name}</div>
              <div style="font-size:10px;color:var(--text-3)">${b.city}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${_branchStat('Revenue', Utils.money(b.revenue), 'var(--green)')}
            ${_branchStat('Expense', Utils.money(b.expense), 'var(--red)')}
            ${_branchStat('Orders',  b.orders.toLocaleString())}
            ${_branchStat('Rating',  `<i class="fa-solid fa-star" style="color:var(--gold);font-size:11px"></i> ${b.rating}`)}
          </div>
        </div>`;
    }).join('');
  }

  function _branchStat(label, value, color = 'var(--text)') {
    return `
      <div>
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);font-weight:700">${label}</div>
        <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:${color}">${value}</div>
      </div>`;
  }

  /* ─────────────────────────────────────────────
     EXPENSE APPROVAL ACTIONS
  ───────────────────────────────────────────── */

  async function _updateExpenseStatus(id, action) {
    try {
      await (action === 'approve' ? API.approveExpense(id) : API.rejectExpense(id));

      const entry = _data.expenseApprovals.find(x => x.id === id);
      if (entry) entry.status = action === 'approve' ? 'approved' : 'rejected';

      _renderApprovals();
      Toast.show(
        action === 'approve' ? 'Expense approved!' : 'Expense rejected',
        action === 'approve' ? 'success' : 'error'
      );
    } catch {
      Toast.show(`Failed to ${action} expense`, 'error');
    }
  }

  /* ─────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────── */

  return {

    /** Fetches data and returns the full dashboard HTML. */
    async render() {
      try {
        _data = await API.getDashboardData();
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        return `<div style="padding:40px;text-align:center;color:var(--red);
        ">Error loading dashboard data.</div>`;
      }

      const kpis = _aggregateKPIs(_data.branches);

      return `
        <div id="dashRoot">
          ${_buildPageHeader()}
          ${_buildKPICards(kpis)}

          <div class="grid-2 anim-2" style="margin-bottom:20px">
            ${_buildRevenueChartSection()}
            ${_buildIncomeReportSection()}
          </div>

          <div class="grid-2 anim-3" style="margin-bottom:20px">
            ${_buildApprovalsSection()}
            ${_buildPeakHoursSection()}
          </div>

          <div class="grid-2 anim-3" style="margin-bottom:20px">
            ${_buildSalesSection('This Week',  'Weekly',  'weekSalesChart',  _data.salesData.week)}
            ${_buildSalesSection('This Month', 'Monthly', 'monthSalesChart', _data.salesData.month)}
          </div>

          <div class="grid-2 anim-4" style="margin-bottom:20px">
            ${_buildTopItemsSection('Best Sellers', "Today's Top Sell Items",   'topItemsToday', true)}
            ${_buildTopItemsSection('Monthly Best', "This Month's Top Sell Items", 'topItemsMonth', false)}
          </div>

          <div class="anim-4">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--text-3);margin-bottom:12px;display:flex;align-items:center;gap:8px">
              <i class="fa-solid fa-store" style="color:var(--gold)"></i> Branch Performance
            </div>
            <div class="grid-4" id="branchCards"></div>
          </div>
        </div>`;
    },

    /** Initialises all charts and dynamic components after the DOM is ready. */
    init() {
      _renderRevenueChart();
      _renderIncomeChart('weekly');
      _renderPeakChart();
      _renderWeekSalesChart();
      _renderMonthSalesChart();
      _renderApprovals();
      _renderTopItems('topItemsToday', _data.topItemsToday);
      _renderTopItems('topItemsMonth', _data.topItemsMonth);
      _renderBranchCards();
    },

    /** Re-calculates and updates KPI cards when the branch filter changes. */
    onBranchChange() {
      const value    = document.getElementById('branchFilter').value;
      const branches = value === 'all'
        ? _data.branches
        : _data.branches.filter(b => b.id === value);

      _updateKPIDisplay(_aggregateKPIs(branches));
    },

    /** Switches the income chart between weekly and monthly views. */
    setIncomePeriod(period, btn) {
      _incomePeriod = period;
      btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _renderIncomeChart(period);
    },

    // Chart re-render hooks (called by inline event handlers)
    renderRevenueChart: _renderRevenueChart,
    renderPeakChart:    _renderPeakChart,

    // Approval actions (called by inline event handlers)
    approveExpense: id => _updateExpenseStatus(id, 'approve'),
    rejectExpense:  id => _updateExpenseStatus(id, 'reject'),
  };

})();