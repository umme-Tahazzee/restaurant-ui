/* ================================================
   SAVORIA — DASHBOARD VIEW  (dashboard.js)
   Fully responsive: mobile / tablet / desktop
================================================ */

const DashboardView = {

  _chart: null,
  _timer: null,

  /* ────────────────────────────────────────────
     render()
  ──────────────────────────────────────────── */
  render() {
    return `
      <!-- ══ RESPONSIVE STYLES (dashboard-scoped) ══ -->
      <style>
        /* ── KPI row ── */
        .db-kpi-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 1024px) {
          .db-kpi-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }
        @media (max-width: 480px) {
          .db-kpi-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        }

        /* ── Hero ── */
        .db-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .db-hero-left  { flex: 1; min-width: 220px; }
        .db-hero-right { flex-shrink: 0; }
        @media (max-width: 640px) {
          .db-hero { flex-direction: column; gap: 16px; margin-bottom: 16px; }
          .db-hero-right { width: 100%; }
          .db-hero-revenue-val { font-size: 28px !important; }
          .db-hero-badges { flex-wrap: wrap; gap: 6px; }
        }

        /* ── Section label ── */
        .db-section-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: .08em;
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 20px 0 10px;
        }

        /* ── Pipeline ── */
        .db-pipeline {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
          position: relative;
        }
        @media (max-width: 900px) {
          .db-pipeline {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .db-pipe-arrow { display: none !important; }
        }
        @media (max-width: 480px) {
          .db-pipeline {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 10px;
            padding-bottom: 8px;
            margin-left: -2px;
            margin-right: -2px;
          }
          .db-pipe-col {
            scroll-snap-align: start;
            flex: 0 0 82vw;
            max-width: 280px;
          }
          .db-pipe-arrow { display: none !important; }
        }

        /* ── Mid grid (chart + table map) ── */
        .db-mid-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .db-mid-grid { grid-template-columns: 1fr; }
        }

        /* ── Bottom grid (4 cards) ── */
        .db-bottom-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 1100px) {
          .db-bottom-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        }
        @media (max-width: 540px) {
          .db-bottom-grid { grid-template-columns: 1fr; gap: 10px; }
        }

        /* ── Table grid ── */
        .db-table-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }
        @media (max-width: 480px) {
          .db-table-grid { grid-template-columns: repeat(4, 1fr); gap: 5px; }
        }

        /* ── Pipeline scroll indicator on mobile ── */
        .db-pipe-scroll-hint {
          display: none;
          font-size: 10px;
          color: var(--text-3);
          text-align: right;
          margin-bottom: 6px;
        }
        @media (max-width: 480px) {
          .db-pipe-scroll-hint { display: block; }
        }

        /* ── Spark row ── */
        .db-spark-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .db-spark-stat { text-align: left; }
        .db-spark-val  { font-size: 16px; font-weight: 700; color: var(--text); }
        .db-spark-lbl  { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: .05em; }
        .db-spark-divider { width: 1px; height: 28px; background: var(--border-1); flex-shrink: 0; }

        /* ── KPI card internals ── */
        .db-kpi-card {
          background: var(--bg-card);
          border: 1px solid var(--border-1);
          border-radius: 14px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          border-top: 3px solid var(--accent, var(--gold));
          transition: box-shadow .2s;
        }
        .db-kpi-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); }
        .db-kpi-top   { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .db-kpi-label { font-size: 10px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
        .db-kpi-value { font-size: 24px; font-weight: 700; color: var(--text); font-family: 'Playfair Display', serif; line-height: 1.1; }
        .db-kpi-sub   { font-size: 10px; margin-top: 3px; }
        .db-kpi-icon  { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }

        @media (max-width: 480px) {
          .db-kpi-value { font-size: 20px; }
          .db-kpi-card  { padding: 12px; }
          .db-kpi-icon  { width: 30px; height: 30px; font-size: 12px; }
        }

        /* ── Pipeline card ── */
        .db-pipe-col { position: relative; }
        .db-pipe-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 12px; border-radius: 10px 10px 0 0; border: 1px solid var(--border-1);
          border-bottom: none;
        }
        .db-pipe-body {
          border: 1px solid var(--border-1); border-top: none; border-radius: 0 0 10px 10px;
          padding: 8px; display: flex; flex-direction: column; gap: 7px;
          min-height: 80px; background: var(--bg-card);
        }
        .db-pipe-badge {
          min-width: 20px; height: 20px; border-radius: 10px; display: flex;
          align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; padding: 0 6px;
        }
        .db-pipe-card {
          background: var(--bg-input); border-radius: 8px; padding: 10px; cursor: pointer;
          transition: transform .15s, box-shadow .15s; border: 1px solid var(--border-1);
        }
        .db-pipe-card:hover { transform: translateY(-1px); box-shadow: 0 3px 12px rgba(0,0,0,.1); }
        .db-pipe-empty { text-align: center; font-size: 11px; color: var(--text-3); padding: 20px 0; }
        .db-pipe-arrow {
          position: absolute; right: -8px; top: 50%; transform: translateY(-50%);
          z-index: 2; color: var(--text-3); font-size: 11px;
        }

        /* ── Table cell ── */
        .db-table-cell {
          aspect-ratio: 1; border-radius: 8px; border: 2px solid transparent;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: default; transition: opacity .2s;
        }
        .db-table-num    { font-size: 13px; font-weight: 700; line-height: 1; }
        .db-table-guests { font-size: 9px; line-height: 1.2; }
        .db-table-time   { font-size: 8px; line-height: 1.2; text-align: center; }
        @media (max-width: 480px) {
          .db-table-num { font-size: 11px; }
          .db-table-time, .db-table-guests { display: none; }
        }

        /* ── Reservation / alert / staff / item rows ── */
        .db-resv-row  { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-1); }
        .db-resv-row:last-child { border-bottom: none; }
        .db-resv-time { font-size: 11px; font-weight: 700; color: var(--gold); min-width: 52px; }
        .db-alert-row { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; border-radius: 8px; margin-bottom: 6px; }
        .db-staff-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--border-1); }
        .db-staff-row:last-child { border-bottom: none; }
        .db-staff-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .db-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .db-item-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border-1); }
        .db-item-row:last-child { border-bottom: none; }

        /* ── Card shared ── */
        .db-card-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px; gap: 8px; flex-wrap: wrap;
        }
        .db-card-title { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: var(--text); }
        .db-micro-btn {
          font-size: 10px; padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border-1);
          background: transparent; color: var(--text-3); cursor: pointer; transition: all .15s; font-family: 'Jost', sans-serif;
        }
        .db-micro-btn.active,
        .db-micro-btn:hover { background: var(--gold); color: #fff; border-color: var(--gold); }
        .db-count-badge {
          font-size: 10px; padding: 2px 8px; border-radius: 10px; background: var(--bg-input);
          color: var(--text-3); font-weight: 600;
        }
        .db-count-badge.red { background: var(--red); color: #fff; }
        .db-live-pill {
          font-size: 9px; font-weight: 700; color: var(--green); background: var(--green-pale);
          padding: 2px 7px; border-radius: 10px; letter-spacing: .06em; margin-left: 4px;
        }
        .db-table-legend {
          display: flex; align-items: center; gap: 8px; font-size: 10px; color: var(--text-3); flex-wrap: wrap;
        }
        .db-leg-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 2px; }

        /* ── Hero specific ── */
        .db-hero-greeting { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .db-hero-date     { font-size: 12px; color: var(--text-3); margin-bottom: 10px; }
        .db-hero-badges   { display: flex; gap: 8px; align-items: center; }
        .db-hero-badge    { font-size: 11px; padding: 4px 10px; border-radius: 20px; background: var(--bg-input); color: var(--text-3); display: flex; align-items: center; gap: 5px; border: 1px solid var(--border-1); }
        .db-hero-badge.green { background: var(--green-pale); color: var(--green); border-color: transparent; }
        .db-hero-badge.gold  { background: var(--gold-pale);  color: var(--gold);  border-color: transparent; }
        .db-hero-revenue-label { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
        .db-hero-revenue-val   { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--text); line-height: 1; }
        .db-hero-revenue-sub   { font-size: 11px; color: var(--green); margin-top: 4px; font-weight: 600; }
      </style>

      <div id="dashRoot" style="padding: 4px 0">

        <!-- ══ 1. HERO HEADER ══ -->
        ${this._heroHTML()}

        <!-- ══ 2. KPI CARDS ══ -->
        <div class="db-kpi-row" id="kpiRow"></div>

        <!-- ══ 3. ORDER PIPELINE ══ -->
        <div class="db-section-label">
          <i class="fa-solid fa-fire-flame-curved" style="color:var(--red)"></i>
          Live Order Pipeline
          <span class="db-live-pill">● LIVE</span>
        </div>
        <div class="db-pipe-scroll-hint">← swipe to see all stages →</div>
        <div id="pipelineRow" class="db-pipeline"></div>

        <!-- ══ 4. MID GRID: Chart + Table Map ══ -->
        <div class="db-mid-grid">

          <div class="card">
            <div class="db-card-head">
              <span class="db-card-title">Today's Revenue</span>
              <div style="display:flex;gap:4px" id="revPeriodBtns">
                <button class="db-micro-btn active" onclick="DashboardView.setRevPeriod('hourly',this)">Hourly</button>
                <button class="db-micro-btn" onclick="DashboardView.setRevPeriod('daily',this)">7-Day</button>
              </div>
            </div>
            <div class="db-spark-row" id="sparkSummary"></div>
            <div style="position:relative;height:200px"><canvas id="dashRevChart"></canvas></div>
          </div>

          <div class="card">
            <div class="db-card-head">
              <span class="db-card-title">Table Status</span>
              <div class="db-table-legend">
                <span class="db-leg-dot" style="background:var(--red)"></span>Occupied
                <span class="db-leg-dot" style="background:var(--green)"></span>Empty
                <span class="db-leg-dot" style="background:var(--gold)"></span>Reserved
                <span class="db-leg-dot" style="background:var(--text-3)"></span>Cleaning
              </div>
            </div>
            <div id="tableGrid" class="db-table-grid"></div>
            <div id="occupancyBar" style="margin-top:12px"></div>
          </div>

        </div>

        <!-- ══ 5. BOTTOM GRID ══ -->
        <div class="db-bottom-grid">

          <div class="card" id="reservationsCard">
            <div class="db-card-head">
              <span class="db-card-title">Tonight's Reservations</span>
              <span class="db-count-badge" id="resvCount"></span>
            </div>
            <div id="reservationsList"></div>
          </div>

          <div class="card" id="alertsCard">
            <div class="db-card-head">
              <span class="db-card-title">Active Alerts</span>
              <span id="alertCount" class="db-count-badge red"></span>
            </div>
            <div id="alertsList"></div>
          </div>

          <div class="card" id="staffCard">
            <div class="db-card-head">
              <span class="db-card-title">Staff on Duty</span>
              <span class="db-count-badge" id="staffCount"></span>
            </div>
            <div id="staffList"></div>
          </div>

          <div class="card" id="topItemsCard">
            <div class="db-card-head">
              <span class="db-card-title">Top Items Today</span>
            </div>
            <div id="topItemsList"></div>
          </div>

        </div>

      </div>`;
  },

  /* ────────────────────────────────────────────
     init()
  ──────────────────────────────────────────── */
  init() {
    this._revPeriod = 'hourly';
    this._renderKPIs();
    this._renderPipeline();
    this._renderRevChart();
    this._renderSparkSummary();
    this._renderTableGrid();
    this._renderReservations();
    this._renderAlerts();
    this._renderStaff();
    this._renderTopItems();

    this._timer = setInterval(() => {
      if (document.getElementById('dashRoot')) {
        this._renderKPIs();
        this._renderPipeline();
        this._renderAlerts();
      } else {
        clearInterval(this._timer);
      }
    }, 30000);
  },

  /* ──────────────────────────────────────────
     1. HERO
  ────────────────────────────────────────── */
  _heroHTML() {
    const h        = new Date().getHours();
    const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const icon     = h < 12 ? '☀️' : h < 17 ? '🌤️' : '🌙';
    const shift    = h < 14 ? 'Morning Shift' : h < 20 ? 'Evening Shift' : 'Night Shift';

    const activeOrders = DB.orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
    const todayRevenue = DB.transactions
      .filter(t => t.status === 'completed' && t.date === '2025-03-16')
      .reduce((s, t) => s + t.amount, 0);
    const occupiedTbls = DB.tables.filter(t => t.status === 'occupied').length;

    return `
      <div class="db-hero">
        <div class="db-hero-left">
          <div class="db-hero-greeting">${icon} ${greeting}, Marco</div>
          <div class="db-hero-date">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
          <div class="db-hero-badges">
            <span class="db-hero-badge"><i class="fa-solid fa-clock"></i> ${shift}</span>
            <span class="db-hero-badge green"><i class="fa-solid fa-circle-check"></i> ${activeOrders} Active Orders</span>
            <span class="db-hero-badge gold"><i class="fa-solid fa-chair"></i> ${occupiedTbls}/${DB.tables.length} Tables</span>
          </div>
        </div>
        <div class="db-hero-right">
          <div class="db-hero-revenue-label">Today's Revenue</div>
          <div class="db-hero-revenue-val">$${todayRevenue.toLocaleString()}</div>
          <div class="db-hero-revenue-sub">+12% vs yesterday</div>
          <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="Router.go('getorder')">
              <i class="fa-solid fa-plus"></i> New Order
            </button>
            <button class="btn btn-outline btn-sm" onclick="Router.go('orders')">
              <i class="fa-solid fa-receipt"></i> View Orders
            </button>
          </div>
        </div>
      </div>`;
  },

  /* ──────────────────────────────────────────
     2. KPI CARDS
  ────────────────────────────────────────── */
  _renderKPIs() {
    const el = document.getElementById('kpiRow');
    if (!el) return;

    const todayTxns     = DB.transactions.filter(t => t.date === '2025-03-16');
    const revenue       = todayTxns.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const activeOrders  = DB.orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
    const pendingOrders = DB.orders.filter(o => o.status === 'pending').length;
    const readyOrders   = DB.orders.filter(o => o.status === 'ready').length;
    const totalGuests   = DB.tables.filter(t => t.status === 'occupied').reduce((s, t) => s + t.guests, 0);
    const totalExpenses = DB.expenses.reduce((s, e) => s + e.amount, 0);
    const profit        = revenue - (totalExpenses * 0.08);
    const occupancyPct  = Math.round(DB.tables.filter(t => t.status === 'occupied').length / DB.tables.length * 100);

    const cards = [
      {
        label: "Today's Revenue", value: `$${revenue.toLocaleString()}`,
        sub: '+12% vs yesterday', subColor: 'var(--green)',
        icon: 'fa-dollar-sign', iconBg: 'var(--green-pale)', iconClr: 'var(--green)',
        accent: 'var(--green)',
      },
      {
        label: 'Active Orders', value: activeOrders,
        sub: `${pendingOrders} pending action`, subColor: pendingOrders > 0 ? 'var(--orange)' : 'var(--text-3)',
        icon: 'fa-fire-flame-curved', iconBg: 'var(--red-pale)', iconClr: 'var(--red)',
        accent: 'var(--red)',
        bar: {
          pending:   pendingOrders,
          preparing: DB.orders.filter(o => o.status === 'preparing').length,
          ready:     readyOrders,
        },
      },
      {
        label: 'Guests Seated', value: totalGuests,
        sub: `${DB.tables.filter(t=>t.status==='occupied').length} of ${DB.tables.length} tables`,
        subColor: 'var(--text-3)',
        icon: 'fa-users', iconBg: 'var(--blue-pale)', iconClr: 'var(--blue)',
        accent: 'var(--blue)', pct: occupancyPct,
      },
      {
        label: "Est. Profit", value: `$${Math.max(0, Math.round(profit)).toLocaleString()}`,
        sub: `~${Math.round(totalExpenses * 0.08 / (revenue || 1) * 100)}% expense ratio`,
        subColor: 'var(--text-3)',
        icon: 'fa-chart-line', iconBg: 'var(--gold-pale)', iconClr: 'var(--gold)',
        accent: 'var(--gold)',
      },
    ];

    el.innerHTML = cards.map(c => `
      <div class="db-kpi-card" style="--accent:${c.accent}">
        <div class="db-kpi-top">
          <div>
            <div class="db-kpi-label">${c.label}</div>
            <div class="db-kpi-value">${c.value}</div>
            <div class="db-kpi-sub" style="color:${c.subColor}">${c.sub}</div>
          </div>
          <div class="db-kpi-icon" style="background:${c.iconBg};color:${c.iconClr}">
            <i class="fa-solid ${c.icon}"></i>
          </div>
        </div>
        ${c.bar ? `
          <div style="display:flex;gap:3px;margin-top:12px">
            <div style="flex:${c.bar.pending};height:4px;background:var(--orange);border-radius:2px;min-width:${c.bar.pending?'4px':'0'}"></div>
            <div style="flex:${c.bar.preparing};height:4px;background:var(--blue);border-radius:2px;min-width:${c.bar.preparing?'4px':'0'}"></div>
            <div style="flex:${c.bar.ready};height:4px;background:var(--gold);border-radius:2px;min-width:${c.bar.ready?'4px':'0'}"></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:5px;flex-wrap:wrap">
            <span style="font-size:9px;color:var(--orange)">● ${c.bar.pending} Pending</span>
            <span style="font-size:9px;color:var(--blue)">● ${c.bar.preparing} Prep</span>
            <span style="font-size:9px;color:var(--gold)">● ${c.bar.ready} Ready</span>
          </div>` : ''}
        ${c.pct !== undefined ? `
          <div style="margin-top:12px">
            <div style="height:4px;background:var(--bg-input);border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${c.pct}%;background:var(--blue);border-radius:2px;transition:width .6s ease"></div>
            </div>
            <div style="font-size:9px;color:var(--text-3);margin-top:4px">${c.pct}% occupancy rate</div>
          </div>` : ''}
      </div>`).join('');
  },

  /* ──────────────────────────────────────────
     3. ORDER PIPELINE
  ────────────────────────────────────────── */
  _renderPipeline() {
    const el = document.getElementById('pipelineRow');
    if (!el) return;

    const stages = ['pending','preparing','ready','confirmed'];
    const stageConfig = {
      pending:   { label:'Pending',   icon:'fa-clock',        color:'var(--orange)', bg:'var(--orange-pale)' },
      preparing: { label:'Preparing', icon:'fa-fire',         color:'var(--blue)',   bg:'var(--blue-pale)'   },
      ready:     { label:'Ready',     icon:'fa-bell',         color:'var(--gold)',   bg:'var(--gold-pale)'   },
      confirmed: { label:'Confirmed', icon:'fa-circle-check', color:'var(--purple)', bg:'var(--purple-pale)' },
    };

    el.innerHTML = stages.map((stage, si) => {
      const orders = DB.orders.filter(o => o.status === stage);
      const cfg    = stageConfig[stage];
      return `
        <div class="db-pipe-col">
          <div class="db-pipe-head" style="background:${cfg.bg}">
            <div style="display:flex;align-items:center;gap:7px">
              <i class="fa-solid ${cfg.icon}" style="color:${cfg.color};font-size:13px"></i>
              <span style="font-size:11px;font-weight:700;color:${cfg.color};text-transform:uppercase;letter-spacing:.06em">${cfg.label}</span>
            </div>
            <span class="db-pipe-badge" style="background:${cfg.color}">${orders.length}</span>
          </div>
          <div class="db-pipe-body">
            ${orders.length === 0
              ? `<div class="db-pipe-empty">No orders</div>`
              : orders.map(o => this._pipelineCardHTML(o, cfg)).join('')}
          </div>
          ${si < stages.length - 1 ? '<div class="db-pipe-arrow"><i class="fa-solid fa-chevron-right"></i></div>' : ''}
        </div>`;
    }).join('');
  },

  _pipelineCardHTML(o, cfg) {
    const mins    = Math.floor((new Date() - o.created) / 60000);
    const urgency = mins > 30 ? 'var(--red)' : mins > 15 ? 'var(--orange)' : 'var(--green)';

    return `
      <div class="db-pipe-card" onclick="Router.go('orders')" title="Go to Orders">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
          <span style="font-weight:700;font-size:12px;font-family:'Playfair Display',serif">${o.id}</span>
          <span style="font-size:10px;font-weight:700;color:${urgency}">
            <i class="fa-regular fa-clock"></i> ${mins}m
          </span>
        </div>
        <div style="font-size:10px;color:var(--text-3);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${o.items.slice(0,2).join(', ')}${o.items.length > 2 ? ` +${o.items.length-2}` : ''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:10px;background:var(--gold-pale);color:var(--gold);padding:2px 6px;border-radius:4px;font-weight:700">
            T-${o.table}
          </span>
          <span style="font-size:11px;font-weight:700;color:var(--green)">${Utils.money(o.total)}</span>
        </div>
        <div style="height:3px;background:var(--bg-input);border-radius:2px;margin-top:8px;overflow:hidden">
          <div style="height:100%;width:${Math.min(100, mins/40*100)}%;background:${urgency};border-radius:2px;transition:width .5s"></div>
        </div>
      </div>`;
  },

  /* ──────────────────────────────────────────
     4a. REVENUE CHART
  ────────────────────────────────────────── */
  _revPeriod: 'hourly',

  setRevPeriod(p, btn) {
    this._revPeriod = p;
    document.querySelectorAll('#revPeriodBtns .db-micro-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._renderRevChart();
    this._renderSparkSummary();
  },

  _getRevData() {
    return {
      hourly: {
        labels: ['10','11','12','1pm','2','3','4','5','6','7','8','9'],
        data:   [120,180,420,380,210,160,190,240,580,740,890,316],
      },
      daily: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Today'],
        data:   [1240,980,1480,1320,1890,2340,316],
      },
    }[this._revPeriod];
  },

  _renderSparkSummary() {
    const el = document.getElementById('sparkSummary');
    if (!el) return;
    const d     = this._getRevData();
    const total = d.data.reduce((a, b) => a + b, 0);
    const peak  = Math.max(...d.data);
    const avg   = Math.round(total / d.data.length);

    el.innerHTML = `
      <div class="db-spark-stat"><div class="db-spark-val">$${total.toLocaleString()}</div><div class="db-spark-lbl">Total</div></div>
      <div class="db-spark-divider"></div>
      <div class="db-spark-stat"><div class="db-spark-val">$${peak.toLocaleString()}</div><div class="db-spark-lbl">Peak</div></div>
      <div class="db-spark-divider"></div>
      <div class="db-spark-stat"><div class="db-spark-val">$${avg.toLocaleString()}</div><div class="db-spark-lbl">Average</div></div>`;
  },

  _renderRevChart() {
    const ctx = document.getElementById('dashRevChart');
    if (!ctx) return;
    if (this._chart) this._chart.destroy();

    const d      = this._getRevData();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridC  = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)';
    const tickC  = isDark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.35)';

    this._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [{
          data: d.data,
          borderColor: '#c0392b',
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'transparent';
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(192,57,43,.25)');
            gradient.addColorStop(1, 'rgba(192,57,43,.01)');
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#c0392b',
          tension: .45,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: gridC },
            ticks: { color: tickC, font: { size: 10 }, maxTicksLimit: 8 },
          },
          y: {
            grid: { color: gridC },
            ticks: { color: tickC, font: { size: 10 }, callback: v => '$' + v },
          },
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });
  },

  /* ──────────────────────────────────────────
     4b. TABLE MAP
  ────────────────────────────────────────── */
  _renderTableGrid() {
    const grid = document.getElementById('tableGrid');
    const oBar = document.getElementById('occupancyBar');
    if (!grid) return;

    const statusStyle = {
      occupied: { bg: 'var(--red)',    txt: '#fff',           border: 'var(--red-deep)' },
      empty:    { bg: 'var(--green)',  txt: '#fff',           border: 'var(--green)' },
      reserved: { bg: 'var(--gold)',   txt: '#fff',           border: 'var(--gold-light)' },
      cleaning: { bg: 'var(--text-3)', txt: 'var(--bg-page)', border: 'var(--border-2)' },
    };

    grid.innerHTML = DB.tables.map(t => {
      const s = statusStyle[t.status] || statusStyle.empty;
      return `
        <div class="db-table-cell" style="background:${s.bg};border-color:${s.border}"
          title="${t.status === 'occupied' ? `${t.guests} guests · ${t.seated} · ${t.waiter}` : t.status}">
          <div class="db-table-num" style="color:${s.txt}">${t.num}</div>
          ${t.status === 'occupied' ? `<div class="db-table-guests" style="color:${s.txt}">${t.guests}p</div>` : ''}
          ${t.status === 'occupied' ? `<div class="db-table-time" style="color:${s.txt};opacity:.8">${t.seated}</div>` : ''}
          ${t.status === 'reserved' ? `<div class="db-table-time" style="color:${s.txt};opacity:.9">${t.seated}</div>` : ''}
          ${t.status === 'cleaning' ? `<div style="font-size:11px;margin-top:2px">🧹</div>` : ''}
        </div>`;
    }).join('');

    if (oBar) {
      const occ    = DB.tables.filter(t => t.status === 'occupied').length;
      const rsv    = DB.tables.filter(t => t.status === 'reserved').length;
      const cln    = DB.tables.filter(t => t.status === 'cleaning').length;
      const total  = DB.tables.length;
      const occPct = occ / total * 100;
      const rsvPct = rsv / total * 100;
      const clnPct = cln / total * 100;

      oBar.innerHTML = `
        <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;gap:2px">
          <div style="width:${occPct}%;background:var(--red);border-radius:4px 0 0 4px" title="${occ} occupied"></div>
          <div style="width:${rsvPct}%;background:var(--gold)" title="${rsv} reserved"></div>
          <div style="width:${clnPct}%;background:var(--text-3)" title="${cln} cleaning"></div>
          <div style="flex:1;background:var(--green);border-radius:0 4px 4px 0" title="${total-occ-rsv-cln} empty"></div>
        </div>
        <div style="display:flex;gap:12px;margin-top:6px;font-size:10px;color:var(--text-3);flex-wrap:wrap">
          <span><span style="color:var(--red)">■</span> ${occ} Occupied</span>
          <span><span style="color:var(--green)">■</span> ${total-occ-rsv-cln} Empty</span>
          <span><span style="color:var(--gold)">■</span> ${rsv} Reserved</span>
          <span><span style="color:var(--text-3)">■</span> ${cln} Cleaning</span>
        </div>`;
    }
  },

  /* ──────────────────────────────────────────
     5a. RESERVATIONS
  ────────────────────────────────────────── */
  _renderReservations() {
    const el    = document.getElementById('reservationsList');
    const badge = document.getElementById('resvCount');
    if (!el) return;

    const upcoming = DB.reservations.filter(r => r.status === 'confirmed' || r.status === 'pending');
    if (badge) badge.textContent = `${upcoming.length} tonight`;

    el.innerHTML = DB.reservations.map(r => `
      <div class="db-resv-row">
        <div class="db-resv-time">${r.time}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.name}</div>
          ${r.note ? `<div style="font-size:10px;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.note}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          <span style="font-size:10px;color:var(--text-3)">
            <i class="fa-solid fa-users" style="font-size:9px"></i> ${r.covers}
          </span>
          <span class="tag ${r.status === 'confirmed' ? 'tag-delivered' : 'tag-pending'}" style="padding:2px 7px">
            ${r.status}
          </span>
        </div>
      </div>`).join('');
  },

  /* ──────────────────────────────────────────
     5b. ALERTS
  ────────────────────────────────────────── */
  _renderAlerts() {
    const el    = document.getElementById('alertsList');
    const badge = document.getElementById('alertCount');
    if (!el) return;

    const alerts = [];

    DB.inventory.filter(i => i.status !== 'ok').forEach(i => {
      alerts.push({
        type:  i.status === 'critical' ? 'critical' : 'warning',
        icon:  i.status === 'critical' ? 'fa-circle-exclamation' : 'fa-triangle-exclamation',
        color: i.status === 'critical' ? 'var(--red)' : 'var(--orange)',
        bg:    i.status === 'critical' ? 'var(--red-pale)' : 'var(--orange-pale)',
        title: `Low Stock: ${i.name}`,
        desc:  `Only ${i.stock} ${i.unit} left (min: ${i.min})`,
      });
    });

    DB.orders.filter(o => o.status === 'pending').forEach(o => {
      const mins = Math.floor((new Date() - o.created) / 60000);
      if (mins > 5) {
        alerts.push({
          type: 'info', icon: 'fa-clock', color: 'var(--blue)', bg: 'var(--blue-pale)',
          title: `Order ${o.id} waiting ${mins}m`,
          desc:  `Table ${o.table} — ${o.customer}`,
        });
      }
    });

    DB.orders.filter(o => o.status === 'ready').forEach(o => {
      alerts.push({
        type: 'warning', icon: 'fa-bell', color: 'var(--gold)', bg: 'var(--gold-pale)',
        title: `Order ${o.id} is READY`,
        desc:  `Table ${o.table} — waiting for pickup`,
      });
    });

    if (badge) {
      badge.textContent = alerts.length;
      badge.style.background = alerts.some(a => a.type === 'critical') ? 'var(--red)' : 'var(--orange)';
      if (!alerts.length) badge.style.background = 'var(--green)';
    }

    if (!alerts.length) {
      el.innerHTML = `
        <div style="text-align:center;padding:28px;color:var(--text-3)">
          <i class="fa-solid fa-circle-check" style="font-size:24px;color:var(--green);opacity:.5;display:block;margin-bottom:8px"></i>
          <p style="font-size:12px">All clear! No active alerts.</p>
        </div>`;
      return;
    }

    el.innerHTML = alerts.map(a => `
      <div class="db-alert-row" style="background:${a.bg};border-left:3px solid ${a.color}">
        <i class="fa-solid ${a.icon}" style="color:${a.color};font-size:14px;flex-shrink:0;margin-top:1px"></i>
        <div style="min-width:0">
          <div style="font-size:12px;font-weight:700;color:var(--text)">${a.title}</div>
          <div style="font-size:10px;color:var(--text-3)">${a.desc}</div>
        </div>
      </div>`).join('');
  },

  /* ──────────────────────────────────────────
     5c. STAFF
  ────────────────────────────────────────── */
  _renderStaff() {
    const el    = document.getElementById('staffList');
    const badge = document.getElementById('staffCount');
    if (!el) return;

    const onDuty = DB.staff.filter(s => s.status === 'on' || s.status === 'break');
    if (badge) badge.textContent = `${onDuty.filter(s => s.status === 'on').length} active`;

    el.innerHTML = DB.staff.map(s => `
      <div class="db-staff-row">
        <div class="db-staff-avatar" style="background:${s.color}">${s.avatar}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name}</div>
          <div style="font-size:10px;color:var(--text-3)">${s.role}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          ${s.orders > 0 ? `<span style="font-size:10px;color:var(--text-3)">${s.orders}x</span>` : ''}
          <span class="db-status-dot" style="background:${s.status === 'on' ? 'var(--green)' : 'var(--orange)'}"></span>
          <span style="font-size:10px;font-weight:600;color:${s.status === 'on' ? 'var(--green)' : 'var(--orange)'}">
            ${s.status === 'on' ? 'On' : 'Break'}
          </span>
        </div>
      </div>`).join('');
  },

  /* ──────────────────────────────────────────
     5d. TOP ITEMS
  ────────────────────────────────────────── */
  _renderTopItems() {
    const el = document.getElementById('topItemsList');
    if (!el) return;

    const items = [
      { emoji:'🥩', name:'Bistecca Fiorentina', qty:14, revenue:672,  pct:100 },
      { emoji:'🍝', name:'Tagliatelle al Ragù', qty:12, revenue:336,  pct:85  },
      { emoji:'🍮', name:'Panna Cotta',          qty:10, revenue:140,  pct:71  },
      { emoji:'🍄', name:'Truffle Risotto',      qty:8,  revenue:256,  pct:57  },
      { emoji:'🥩', name:'Wagyu Tenderloin',      qty:3,  revenue:495,  pct:42  },
      { emoji:'🍰', name:'Tiramisu',              qty:8,  revenue:96,   pct:57  },
    ];

    el.innerHTML = items.map((item, i) => `
      <div class="db-item-row">
        <span style="font-size:10px;font-weight:700;color:var(--text-3);min-width:14px">${i+1}</span>
        <span style="font-size:16px">${item.emoji}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name}</div>
          <div style="height:3px;background:var(--bg-input);border-radius:2px;margin-top:4px;overflow:hidden">
            <div style="height:100%;width:${item.pct}%;background:var(--red);border-radius:2px"></div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:11px;font-weight:700;color:var(--text)">${item.qty}x</div>
          <div style="font-size:10px;color:var(--green);font-weight:700">${Utils.money(item.revenue)}</div>
        </div>
      </div>`).join('');
  },

};