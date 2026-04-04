/* ================================================
   SAVORIA — MANAGER DASHBOARD VIEW  (mgr-dashboard.js)
   Executive overview: revenue, staff, tables, alerts
================================================ */

const MgrDashboardView = {

  _chart: null,
  _pieChart: null,
  _timer: null,

  render() {
    return `
      <style>
        .md-kpi-row { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px }
        @media(max-width:1024px){.md-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}
        @media(max-width:480px){.md-kpi-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}}

        .md-hero { display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px }
        .md-hero-left { flex:1;min-width:220px }
        .md-hero-right { flex-shrink:0 }
        @media(max-width:640px){.md-hero{flex-direction:column;gap:16px;margin-bottom:16px}.md-hero-right{width:100%}}

        .md-section-label { font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;display:flex;align-items:center;gap:7px;margin:20px 0 10px }

        .md-mid-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px }
        @media(max-width:900px){.md-mid-grid{grid-template-columns:1fr}}

        .md-bottom-grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:20px }
        @media(max-width:900px){.md-bottom-grid{grid-template-columns:1fr 1fr;gap:12px}}
        @media(max-width:540px){.md-bottom-grid{grid-template-columns:1fr;gap:10px}}

        .md-staff-row { display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border) }
        .md-staff-row:last-child { border-bottom:none }
        .md-staff-av { width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0 }
        .md-staff-name { font-size:13px;font-weight:600;color:var(--text) }
        .md-staff-role { font-size:11px;color:var(--text-3) }
        .md-staff-shift { font-size:11px;color:var(--text-2);margin-left:auto;text-align:right }

        .md-alert-item { display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border) }
        .md-alert-item:last-child { border-bottom:none }
        .md-alert-icon { width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px }
        .md-alert-msg { font-size:12px;color:var(--text-2);line-height:1.5 }
        .md-alert-time { font-size:10px;color:var(--text-3);margin-top:2px }

        .md-table-mini { display:grid;grid-template-columns:repeat(5,1fr);gap:6px }
        @media(max-width:480px){.md-table-mini{grid-template-columns:repeat(4,1fr);gap:5px}}
        .md-tbl-cell { aspect-ratio:1;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:1.5px solid transparent;font-size:10px;font-weight:600;cursor:pointer;transition:transform .15s }
        .md-tbl-cell:hover{transform:scale(1.06)}
        .md-tbl-cell.occupied{background:var(--red-pale);border-color:rgba(192,57,43,.2);color:var(--red)}
        .md-tbl-cell.empty{background:var(--green-pale);border-color:rgba(45,122,71,.2);color:var(--green)}
        .md-tbl-cell.reserved{background:var(--blue-pale);border-color:rgba(26,82,118,.2);color:var(--blue)}
        .md-tbl-cell.cleaning{background:var(--orange-pale);border-color:rgba(196,122,26,.2);color:var(--orange)}

        .md-kpi-card { position:relative;overflow:hidden }
        .md-kpi-card::before { content:'';position:absolute;top:0;left:0;right:0;height:3px }
        .md-kpi-card.red::before{background:var(--red)}
        .md-kpi-card.gold::before{background:var(--gold)}
        .md-kpi-card.green::before{background:var(--green)}
        .md-kpi-card.blue::before{background:var(--blue)}

        .md-trend { display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px }
        .md-trend.up{background:var(--green-pale);color:var(--green)}
        .md-trend.down{background:var(--red-pale);color:var(--red)}

        .md-approval-item { display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border) }
        .md-approval-item:last-child{border-bottom:none}
      </style>

      <!-- ══ HERO ══ -->
      <div class="md-hero">
        <div class="md-hero-left">
          <div style="font-size:11px;color:var(--text-3);margin-bottom:4px;display:flex;align-items:center;gap:6px">
            <i class="fa-solid fa-shield-halved" style="color:var(--gold);font-size:10px"></i>
            MANAGER OVERVIEW · ${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </div>
          <h1 style="font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:var(--text);line-height:1.15">
            Good ${this._greeting()}, <em style="color:var(--red)">Manger</em>
          </h1>
          <p style="font-size:13px;color:var(--text-3);margin-top:4px">${this._summary()}</p>
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
            <span class="tag" style="background:var(--gold-pale);color:var(--gold);border:1px solid rgba(184,150,62,.2)">
              <i class="fa-solid fa-fire-flame-curved"></i>&nbsp; Peak Hours: 7–9 PM
            </span>
            <span class="tag" style="background:var(--green-pale);color:var(--green)">
              <i class="fa-solid fa-arrow-trend-up"></i>&nbsp; +14% vs last week
            </span>
            <span class="tag" style="background:var(--blue-pale);color:var(--blue)">
              <i class="fa-solid fa-users"></i>&nbsp; ${DB.staff.filter(s=>s.status==='on').length} staff on duty
            </span>
          </div>
        </div>
        <div class="md-hero-right">
          <div class="card" style="min-width:200px;text-align:center;padding:20px 28px">
            <div style="font-size:10px;color:var(--text-3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Today's Revenue</div>
            <div style="font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:var(--text)">${Utils.money(this._todayRevenue())}</div>
            <div class="md-trend up" style="margin:8px auto;width:fit-content"><i class="fa-solid fa-arrow-up"></i> 14% vs yesterday</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:4px">Target: ${Utils.money(4200)}</div>
            <div style="background:var(--bg-input);border-radius:6px;height:6px;margin-top:8px;overflow:hidden">
              <div style="background:var(--gold);height:100%;width:${Math.min(100,Math.round(this._todayRevenue()/4200*100))}%;border-radius:6px;transition:width .6s"></div>
            </div>
            <div style="font-size:10px;color:var(--text-3);margin-top:4px">${Math.min(100,Math.round(this._todayRevenue()/4200*100))}% of daily target</div>
          </div>
        </div>
      </div>

      <!-- ══ KPI ROW ══ -->
      <div class="md-kpi-row">
        ${this._kpiCard('Total Orders','fa-receipt',DB.orders.length,'','red','+5 today')}
        ${this._kpiCard('Active Tables','fa-table-cells',DB.tables.filter(t=>t.status==='occupied').length + ' / ' + DB.tables.length,'','gold','3 reserved')}
        ${this._kpiCard('Staff On Duty','fa-users-gear',DB.staff.filter(s=>s.status==='on').length + ' / ' + DB.staff.length,'','green','All present')}
        ${this._kpiCard('Avg Bill Size','fa-dollar-sign',Utils.money(this._avgBill()),'','blue','+$8 vs avg')}
      </div>

      <!-- ══ MID GRID ══ -->
      <div class="md-mid-grid">

        <!-- Revenue Chart -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div>
              <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">Hourly Revenue</div>
              <div style="font-size:11px;color:var(--text-3)">Today's performance</div>
            </div>
            <div class="md-trend up"><i class="fa-solid fa-arrow-up"></i> Live</div>
          </div>
          <canvas id="mgrRevenueChart" height="160"></canvas>
        </div>

        <!-- Table Map -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div>
              <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">Table Status</div>
              <div style="font-size:11px;color:var(--text-3)">Real-time floor view</div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="Router.go('mgr-tables')">
              <i class="fa-solid fa-expand"></i> Full View
            </button>
          </div>
          <div class="md-table-mini">
            ${DB.tables.map(t => `
              <div class="md-tbl-cell ${t.status}" title="Table ${t.num}${t.status==='occupied'?' · '+t.guests+' guests':''}">
                <i class="fa-solid fa-chair" style="font-size:12px"></i>
                <span>${t.num}</span>
              </div>
            `).join('')}
          </div>
          <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap">
            ${[['occupied','red','Occupied'],['empty','green','Available'],['reserved','blue','Reserved'],['cleaning','orange','Cleaning']].map(([s,c,l])=>`
              <span style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text-3)">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--${c})"></span>${l}: ${DB.tables.filter(t=>t.status===s).length}
              </span>`).join('')}
          </div>
        </div>
      </div>

      <!-- ══ BOTTOM GRID ══ -->
      <div class="md-bottom-grid">

        <!-- Staff On Duty -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">Staff On Duty</div>
            <button class="btn btn-outline btn-sm" onclick="Router.go('mgr-staff')">
              <i class="fa-solid fa-users-gear"></i> Manage
            </button>
          </div>
          ${DB.staff.filter(s=>s.status==='on').slice(0,5).map(s=>`
            <div class="md-staff-row">
              <div class="md-staff-av" style="background:${s.color}">${s.avatar}</div>
              <div>
                <div class="md-staff-name">${s.name}</div>
                <div class="md-staff-role">${s.role}</div>
              </div>
              <div class="md-staff-shift">
                <div style="font-size:10px;color:var(--text-3)">Shift</div>
                <div style="font-size:11px;font-weight:600">${s.shift}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Manager Alerts -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">Alerts & Actions</div>
            <span class="tag tag-pending" style="font-size:9px">${this._alerts().length} new</span>
          </div>
          ${this._alerts().map(a=>`
            <div class="md-alert-item">
              <div class="md-alert-icon" style="background:${a.bg};color:${a.color}">
                <i class="fa-solid ${a.icon}"></i>
              </div>
              <div>
                <div class="md-alert-msg">${a.msg}</div>
                <div class="md-alert-time">${a.time}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Pending Approvals -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">Pending Approvals</div>
          </div>
          ${this._approvals().map((a,i)=>`
            <div class="md-approval-item">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--text)">${a.title}</div>
                <div style="font-size:11px;color:var(--text-3)">${a.sub}</div>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-green btn-sm btn-icon" title="Approve" onclick="MgrDashboardView._approve(${i},true)"><i class="fa-solid fa-check"></i></button>
                <button class="btn btn-danger btn-sm btn-icon" title="Reject" onclick="MgrDashboardView._approve(${i},false)"><i class="fa-solid fa-xmark"></i></button>
              </div>
            </div>
          `).join('')}
          ${this._approvals().length===0?`<p style="font-size:12px;color:var(--text-3);text-align:center;padding:16px 0">All clear — no pending approvals</p>`:''}
        </div>
      </div>

      <!-- ══ BOTTOM: Top Items + Expense Breakdown ══ -->
      <div class="md-mid-grid">
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-bottom:14px">Top Menu Items Today</div>
          ${this._topItems().map((item,i)=>`
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <span style="font-size:18px">${item.emoji}</span>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-size:12px;font-weight:600">${item.name}</span>
                  <span style="font-size:12px;color:var(--text-3)">${item.count}x · ${Utils.money(item.rev)}</span>
                </div>
                <div style="background:var(--bg-input);border-radius:4px;height:4px;overflow:hidden">
                  <div style="background:${['var(--red)','var(--gold)','var(--blue)','var(--green)'][i%4]};height:100%;width:${item.pct}%;border-radius:4px"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-bottom:14px">Expense Breakdown</div>
          <canvas id="mgrExpenseChart" height="180"></canvas>
        </div>
      </div>
    `;
  },

  init() {
    this._buildRevenueChart();
    this._buildExpenseChart();
    this._timer = setInterval(() => {
      const badge = document.getElementById('pendingBadge');
      if (badge) badge.textContent = DB.orders.filter(o=>o.status==='pending').length;
    }, 5000);
  },

  destroy() { if (this._timer) clearInterval(this._timer); },

  _greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  },

  _summary() {
    const pending = DB.orders.filter(o=>o.status==='pending').length;
    const occupied = DB.tables.filter(t=>t.status==='occupied').length;
    return `${pending} order${pending!==1?'s':''} pending · ${occupied} table${occupied!==1?'s':''} occupied · Restaurant running smoothly`;
  },

  _todayRevenue() {
    const base = DB.orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0),0);
    return base || 3240;
  },

  _avgBill() {
    const delivered = DB.orders.filter(o=>o.status==='delivered');
    if (!delivered.length) return 68;
    return Math.round(delivered.reduce((s,o)=>s+(o.total||0),0) / delivered.length);
  },

  _kpiCard(label, icon, val, sub, color, badge) {
    return `
      <div class="card md-kpi-card ${color}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--${color==='red'?'red':color==='gold'?'gold':color==='green'?'green':'blue'}-pale);display:flex;align-items:center;justify-content:center;color:var(--${color==='red'?'red':color==='gold'?'gold':color==='green'?'green':'blue'});font-size:14px">
            <i class="fa-solid ${icon}"></i>
          </div>
          <span class="md-trend up" style="font-size:9px">${badge}</span>
        </div>
        <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:900;margin-top:10px;color:var(--text)">${val}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:2px">${label}</div>
      </div>`;
  },

  _alerts() {
    const list = [];
    const pending = DB.orders.filter(o=>o.status==='pending');
    if (pending.length) list.push({ icon:'fa-clock', bg:'var(--orange-pale)', color:'var(--orange)', msg:`${pending.length} order${pending.length>1?'s':''} waiting to be prepared`, time:'Just now' });
    const cleaning = DB.tables.filter(t=>t.status==='cleaning');
    if (cleaning.length) list.push({ icon:'fa-broom', bg:'var(--blue-pale)', color:'var(--blue)', msg:`Table${cleaning.length>1?'s':''} ${cleaning.map(t=>t.num).join(', ')} need cleaning`, time:'5 min ago' });
    list.push({ icon:'fa-wine-bottle', bg:'var(--red-pale)', color:'var(--red)', msg:'Chianti Classico stock running low (3 bottles)', time:'15 min ago' });
    list.push({ icon:'fa-star', bg:'var(--gold-pale)', color:'var(--gold)', msg:'New review: Table 7 left 5-star feedback', time:'32 min ago' });
    return list.slice(0, 4);
  },

  _approvals() {
    return [
      { title: 'Shift Swap Request', sub: 'Amara T. ↔ Luca M. · Friday 6 PM' },
      { title: 'Extra Staff Overtime', sub: 'Kenji N. · +2h tonight · $48 extra' },
      { title: 'Emergency Supply Order', sub: 'Truffle oil & saffron · $240' },
    ];
  },

  _approve(i, approved) {
    const labels = ['Shift Swap Request','Overtime','Supply Order'];
    Toast.show(`${labels[i] || 'Request'} ${approved ? 'approved ✓' : 'rejected'}`, approved ? 'success' : 'error');
    // Re-render approvals section
    const items = document.querySelectorAll('.md-approval-item');
    if (items[i]) items[i].style.opacity = '0.3';
  },

  _topItems() {
    const allItems = Utils.allMenuItems();
    const picks = [
      { ...allItems.find(i=>i.id==='m9'),  count: 8,  rev: 8*165, pct: 100 },
      { ...allItems.find(i=>i.id==='m6'),  count: 12, rev: 12*32,  pct: 78  },
      { ...allItems.find(i=>i.id==='m8'),  count: 6,  rev: 6*48,   pct: 60  },
      { ...allItems.find(i=>i.id==='m18'), count: 15, rev: 15*18,  pct: 45  },
      { ...allItems.find(i=>i.id==='m15'), count: 10, rev: 10*16,  pct: 35  },
    ];
    return picks;
  },

  _buildRevenueChart() {
    const ctx = document.getElementById('mgrRevenueChart');
    if (!ctx) return;
    const hours = ['11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm'];
    const data  = [120, 340, 480, 290, 180, 220, 410, 680, 920, 840, 760];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
    const textColor = isDark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.35)';
    if (this._chart) this._chart.destroy();
    this._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hours,
        datasets: [{
          data,
          backgroundColor: data.map((v,i) => i === data.indexOf(Math.max(...data)) ? 'rgba(184,150,62,.85)' : 'rgba(192,57,43,.55)'),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: ctx => ' $' + ctx.raw.toLocaleString() }
        }},
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 }, callback: v => '$'+v } },
        }
      }
    });
  },

  _buildExpenseChart() {
    const ctx = document.getElementById('mgrExpenseChart');
    if (!ctx) return;
    const cats = DB.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    if (this._pieChart) this._pieChart.destroy();
    this._pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(cats),
        datasets: [{
          data: Object.values(cats),
          backgroundColor: ['#c0392b','#b8963e','#1a5276','#2d7a47','#6d3b8e','#c47a1a','#9b8c86','#96281b'],
          borderWidth: 2,
          borderColor: 'var(--bg-surface)',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true, cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 10 }, padding: 8, usePointStyle: true, pointStyleWidth: 8 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: $${ctx.raw.toLocaleString()}` } }
        }
      }
    });
  },
};
