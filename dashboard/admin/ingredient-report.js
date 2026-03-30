/* ================================================
   SAVORIA ADMIN — INGREDIENT REPORT VIEW
   Tab-based: Ingredients | Product Ingredients
              Raw Materials | General Expense
================================================ */

window.IngredientReportView = {

  _tab: 'ingredients',
  _charts: {},
  _activeIngIdx: null,
  _activeRecipeIdx: null,

  // ══════════════════════════════════════════
  //  RENDER SHELL
  // ══════════════════════════════════════════
  render() {
    return `
      <div id="ingReportRoot">

        <div class="page-header anim-1">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;
                        letter-spacing:.12em;color:var(--gold);display:flex;
                        align-items:center;gap:8px;margin-bottom:4px">
              <span style="width:20px;height:1px;background:var(--gold);display:inline-block"></span>
              Ingredient Report
            </div>
            <h1 class="page-title">
              Ingredient <em style="color:var(--red);font-style:italic">Report</em>
            </h1>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="date" class="date-input" id="irDateFrom" value="${Utils.todayMinus(30)}"/>
            <span style="color:var(--text-3);font-size:12px">to</span>
            <input type="date" class="date-input" id="irDateTo"   value="${Utils.today()}"/>
            <button class="btn btn-primary btn-sm" onclick="IngredientReportView.applyFilter()">
              <i class="fa-solid fa-filter"></i> Filter
            </button>
            <button class="btn btn-outline btn-sm" onclick="IngredientReportView.exportCSV()">
              <i class="fa-solid fa-download"></i> Export
            </button>
          </div>
        </div>

        <div class="tab-bar anim-1">
          <button class="tab-btn active"
            onclick="IngredientReportView.setTab('ingredients',this)">
            <i class="fa-solid fa-box-open" style="font-size:11px;margin-right:5px"></i>
            Ingredients
          </button>
          <button class="tab-btn"
            onclick="IngredientReportView.setTab('recipe',this)">
            <i class="fa-solid fa-book-open" style="font-size:11px;margin-right:5px"></i>
            Product Ingredients
          </button>
          <button class="tab-btn"
            onclick="IngredientReportView.setTab('rawmat',this)">
            <i class="fa-solid fa-wheat-awn" style="font-size:11px;margin-right:5px"></i>
            Raw Materials
          </button>
          <button class="tab-btn"
            onclick="IngredientReportView.setTab('expense',this)">
            <i class="fa-solid fa-receipt" style="font-size:11px;margin-right:5px"></i>
            General Expense
          </button>
        </div>

        <!-- Summary cards -->
        <div class="grid-4 anim-2" style="margin-bottom:20px" id="irSummary"></div>

        <!-- Chart area -->
        <div id="irChart" style="margin-bottom:20px"></div>

        <!-- Main content -->
        <div id="irContent" class="anim-2"></div>

      </div>`;
  },

  // ══════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════
  init() {
    this._tab           = 'ingredients';
    this._activeIngIdx  = null;
    this._activeRecipeIdx = null;
    this._destroyCharts();
    this._refresh();
  },

  // ══════════════════════════════════════════
  //  TAB SWITCH
  // ══════════════════════════════════════════
  setTab(tab, btn) {
    this._tab             = tab;
    this._activeIngIdx    = null;
    this._activeRecipeIdx = null;
    if (btn) {
      btn.closest('.tab-bar').querySelectorAll('.tab-btn')
         .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    this._destroyCharts();
    this._refresh();
  },

  // ══════════════════════════════════════════
  //  FILTER
  // ══════════════════════════════════════════
  applyFilter() {
    const from = document.getElementById('irDateFrom').value;
    const to   = document.getElementById('irDateTo').value;
    if (!from || !to)  { Toast.show('Please select both dates', 'warning'); return; }
    if (from > to)     { Toast.show('Start date must be before end date', 'warning'); return; }
    this._destroyCharts();
    this._refresh();
    Toast.show(`Filter applied: ${Utils.formatDate(from)} — ${Utils.formatDate(to)}`, 'success');
  },

  // ── internal render orchestrator
  _refresh() {
    this._renderSummary();
    this._renderChart();
    this._renderContent();
  },

  // ══════════════════════════════════════════
  //  DESTROY CHARTS
  // ══════════════════════════════════════════
  _destroyCharts() {
    Object.values(this._charts).forEach(c => { try { c.destroy(); } catch (_) {} });
    this._charts = {};
  },

  // ══════════════════════════════════════════
  //  SUMMARY CARDS
  // ══════════════════════════════════════════
  _renderSummary() {
    const el = document.getElementById('irSummary');
    if (!el) return;

    const cards = {
      ingredients: () => {
        const ings      = DB.ingredients;
        const totalUsed = ings.reduce((s, i) => s + i.used, 0);
        const totalCost = ings.reduce((s, i) => s + i.cost, 0);
        const lowStock  = ings.filter(i => i.status === 'low').length;
        const suppliers = [...new Set(ings.map(i => i.supplier))].length;
        return [
          { label: 'Total Consumed',  value: totalUsed.toLocaleString(), sub: 'all ingredients',     color: '' },
          { label: 'Total Cost',      value: Utils.money(totalCost),      sub: 'purchase cost',        color: '' },
          { label: 'Low Stock Items', value: lowStock,                    sub: 'needs reorder',        color: 'var(--red)' },
          { label: 'Suppliers',       value: suppliers,                   sub: 'active suppliers',     color: '' },
        ];
      },
      recipe: () => {
        const recipes   = DB.productIngredients || [];
        const totalDish = recipes.length;
        const avgCost   = totalDish > 0
          ? Math.round(recipes.reduce((s, r) => s + r.cost, 0) / totalDish) : 0;
        const maxCost   = totalDish > 0 ? Math.max(...recipes.map(r => r.cost)) : 0;
        const minCost   = totalDish > 0 ? Math.min(...recipes.map(r => r.cost)) : 0;
        return [
          { label: 'Total Products',  value: totalDish,              sub: 'active menu items',   color: '' },
          { label: 'Avg Cost / Dish', value: Utils.money(avgCost),   sub: 'per serving',          color: '' },
          { label: 'Highest Cost',    value: Utils.money(maxCost),   sub: 'most expensive dish',  color: 'var(--gold)' },
          { label: 'Lowest Cost',     value: Utils.money(minCost),   sub: 'most economical dish', color: 'var(--green)' },
        ];
      },
      rawmat: () => {
        const rms        = DB.rawMaterials || [];
        const totalVal   = rms.reduce((s, r) => s + (r.closing * r.unitCost), 0);
        const pending    = rms.filter(r => r.orderStatus === 'Pending').length;
        const critical   = rms.filter(r => r.orderStatus === 'Critical').length;
        return [
          { label: 'Raw Materials',   value: rms.length,             sub: 'in inventory',         color: '' },
          { label: 'Stock Value',     value: Utils.money(totalVal),  sub: 'current closing value', color: '' },
          { label: 'Pending Orders',  value: pending,                sub: 'awaiting delivery',    color: 'var(--gold)' },
          { label: 'Critical Stock',  value: critical,               sub: 'order immediately',    color: 'var(--red)' },
        ];
      },
      expense: () => {
        const exps     = DB.expenses;
        const total    = exps.reduce((s, e) => s + e.amount, 0);
        const cats     = [...new Set(exps.map(e => e.category))].length;
        const largest  = exps.reduce((a, b) => a.amount > b.amount ? a : b, { amount: 0, category: '—' });
        const unpaid   = exps.filter(e => e.status === 'pending').length;
        return [
          { label: 'Total Expense',       value: Utils.money(total),         sub: 'this period',           color: '' },
          { label: 'Categories',          value: cats,                        sub: 'expense categories',    color: '' },
          { label: 'Largest Category',    value: largest.category,            sub: Utils.money(largest.amount), color: 'var(--red)' },
          { label: 'Pending Approvals',   value: unpaid,                      sub: 'awaiting approval',     color: unpaid > 0 ? 'var(--gold)' : '' },
        ];
      },
    };

    const data = cards[this._tab]?.() || [];
    el.innerHTML = data.map(c => `
      <div class="stat-card">
        <div class="stat-label">${c.label}</div>
        <div class="stat-value" ${c.color ? `style="color:${c.color}"` : ''}>${c.value}</div>
        <div class="stat-sub" style="font-size:11px;color:var(--text-3);margin-top:3px">${c.sub}</div>
      </div>`).join('');
  },

  // ══════════════════════════════════════════
  //  CHARTS
  // ══════════════════════════════════════════
  _renderChart() {
    const wrap = document.getElementById('irChart');
    if (!wrap) return;
    this._destroyCharts();

    const renderers = {
      ingredients: () => this._chartIngredients(wrap),
      recipe:      () => this._chartRecipe(wrap),
      rawmat:      () => this._chartRawMat(wrap),
      expense:     () => this._chartExpense(wrap),
    };
    renderers[this._tab]?.();
  },

  // ── Chart: Ingredient stock vs consumed (horizontal bar)
  _chartIngredients(wrap) {
    const top5     = [...DB.ingredients].sort((a, b) => b.used - a.used).slice(0, 5);
    const labels   = top5.map(i => i.name);
    const stocks   = top5.map(i => i.stock);
    const consumed = top5.map(i => i.used);
    const h        = top5.length * 56 + 80;

    wrap.innerHTML = this._chartCard(
      'Top 5 Ingredients — Stock vs Consumed',
      [
        { color: '#2d7a47', label: 'Opening Stock' },
        { color: '#c0392b', label: 'Consumed' },
      ],
      `<div style="position:relative;width:100%;height:${h}px"><canvas id="irChartCanvas"></canvas></div>`
    );

    const ctx = document.getElementById('irChartCanvas').getContext('2d');
    this._charts.main = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Opening Stock', data: stocks,   backgroundColor: 'rgba(45,122,71,0.72)',  borderColor: '#2d7a47', borderWidth: 1, borderRadius: 3 },
          { label: 'Consumed',      data: consumed, backgroundColor: 'rgba(192,57,43,0.72)', borderColor: '#c0392b', borderWidth: 1, borderRadius: 3 },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` ${ctx.parsed.x.toLocaleString()} ${top5[ctx.dataIndex]?.unit || ''}`
        }}},
        scales: {
          x: { ticks: { color: '#888', font: { size: 10 } }, grid: { color: 'rgba(128,128,128,0.1)' } },
          y: { ticks: { color: '#888', font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
  },

  // ── Chart: Recipe cost bar
  _chartRecipe(wrap) {
    const recipes = (DB.productIngredients || []).slice(0, 6);
    if (!recipes.length) { wrap.innerHTML = ''; return; }
    const labels = recipes.map(r => r.name);
    const costs  = recipes.map(r => r.cost);

    wrap.innerHTML = this._chartCard(
      'Product Cost per Serving',
      [{ color: '#b8963e', label: 'Cost ($)' }],
      `<div style="position:relative;width:100%;height:220px"><canvas id="irChartCanvas"></canvas></div>`
    );

    const ctx = document.getElementById('irChartCanvas').getContext('2d');
    this._charts.main = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cost',
          data: costs,
          backgroundColor: 'rgba(184,150,62,0.75)',
          borderColor: '#b8963e',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` $${ctx.parsed.y.toFixed(2)}`
        }}},
        scales: {
          x: { ticks: { color: '#888', font: { size: 11 } }, grid: { color: 'rgba(128,128,128,0.08)' } },
          y: { ticks: { color: '#888', font: { size: 10 }, callback: v => '$' + v }, grid: { color: 'rgba(128,128,128,0.08)' } },
        },
      },
    });
  },

  // ── Chart: Raw material closing stock value
  _chartRawMat(wrap) {
    const rms    = (DB.rawMaterials || []).slice(0, 7);
    if (!rms.length) { wrap.innerHTML = ''; return; }
    const labels = rms.map(r => r.name);
    const values = rms.map(r => r.closing * r.unitCost);

    wrap.innerHTML = this._chartCard(
      'Raw Material — Closing Stock Value',
      [{ color: '#1a5276', label: 'Stock Value ($)' }],
      `<div style="position:relative;width:100%;height:220px"><canvas id="irChartCanvas"></canvas></div>`
    );

    const ctx = document.getElementById('irChartCanvas').getContext('2d');
    this._charts.main = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Value',
          data: values,
          backgroundColor: 'rgba(26,82,118,0.72)',
          borderColor: '#1a5276',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` $${ctx.parsed.y.toLocaleString()}`
        }}},
        scales: {
          x: { ticks: { color: '#888', font: { size: 10 } }, grid: { color: 'rgba(128,128,128,0.08)' } },
          y: { ticks: { color: '#888', font: { size: 10 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, grid: { color: 'rgba(128,128,128,0.08)' } },
        },
      },
    });
  },

  // ── Chart: Expense doughnut
  _chartExpense(wrap) {
    const exps   = DB.expenses;
    const catMap = {};
    exps.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const labels = Object.keys(catMap);
    const values = Object.values(catMap);
    const colors = ['#c0392b','#2d7a47','#1a5276','#b8963e','#6d3b8e','#96281b','#c47a1a','#9b8c86'];

    wrap.innerHTML = this._chartCard(
      'Expense by Category',
      labels.map((l, i) => ({ color: colors[i % colors.length], label: l })),
      `<div style="display:flex;justify-content:center">
         <div style="position:relative;width:260px;height:260px">
           <canvas id="irChartCanvas"></canvas>
         </div>
       </div>`
    );

    const ctx = document.getElementById('irChartCanvas').getContext('2d');
    this._charts.main = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.map(c => c + 'bb'),
          borderColor: colors,
          borderWidth: 1.5,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: {
            label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString()}`
          }},
        },
      },
    });
  },

  // ── Shared chart card wrapper
  _chartCard(title, legend, bodyHTML) {
    const legendHTML = legend.map(l => `
      <span>
        <span style="display:inline-block;width:10px;height:10px;background:${l.color};
                     border-radius:2px;margin-right:4px"></span>${l.label}
      </span>`).join('');
    return `
      <div class="card" style="padding:16px 20px">
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${title}</div>
        <div style="display:flex;gap:16px;font-size:11px;color:var(--text-3);margin-bottom:14px;flex-wrap:wrap">
          ${legendHTML}
        </div>
        ${bodyHTML}
      </div>`;
  },

  // ══════════════════════════════════════════
  //  CONTENT (TABLE AREA)
  // ══════════════════════════════════════════
  _renderContent() {
    const el = document.getElementById('irContent');
    if (!el) return;

    const renderers = {
      ingredients: () => this._contentIngredients(el),
      recipe:      () => this._contentRecipe(el),
      rawmat:      () => this._contentRawMat(el),
      expense:     () => this._contentExpense(el),
    };
    renderers[this._tab]?.();
  },

  // ── TAB 1: INGREDIENTS — table + click detail panel
  _contentIngredients(el) {
    const ings = DB.ingredients;

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:16px">

        <!-- Left: table -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="display:flex;align-items:center;justify-content:space-between;
                      padding:14px 18px;border-bottom:1px solid var(--border)">
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">
              Stock & Consumption
            </div>
            <input type="text" class="date-input" placeholder="🔍 Search..."
              style="width:160px;padding:6px 10px;font-size:12px"
              oninput="IngredientReportView._filterIngTable(this.value)">
          </div>
          <table class="data-table" id="irIngTable">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Unit</th>
                <th>Opening</th>
                <th>Consumed</th>
                <th>Closing</th>
                <th>Rem %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${ings.map((i, idx) => this._ingRow(i, idx)).join('')}
            </tbody>
          </table>
        </div>

        <!-- Right: detail panel -->
        <div class="card" id="irIngDetail" style="padding:18px">
          ${this._ingDetailEmpty()}
        </div>

      </div>`;
  },

  _ingRow(i, idx) {
    const closing = Math.max(0, i.stock - i.used);
    const pct     = i.stock > 0 ? Math.round((closing / i.stock) * 100) : 0;
    const isLow   = i.status === 'low';
    const barClr  = pct <= 15 ? '#c0392b' : pct <= 35 ? '#c47a1a' : '#2d7a47';
    return `
      <tr class="ir-ing-row" data-idx="${idx}" data-name="${i.name.toLowerCase()}"
          onclick="IngredientReportView._selectIng(${idx}, this)"
          style="cursor:pointer">
        <td style="font-weight:600;color:var(--text)">${i.name}</td>
        <td style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.04em">${i.unit}</td>
        <td style="font-weight:600">${i.stock.toLocaleString()}</td>
        <td style="font-weight:700;color:var(--red)">${i.used.toLocaleString()}</td>
        <td style="font-weight:700;color:${isLow ? 'var(--red)' : 'var(--green)'}">${closing.toLocaleString()}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div class="progress-bar" style="width:56px">
              <div class="progress-fill" style="width:${Math.max(pct,2)}%;background:${barClr}"></div>
            </div>
            <span style="font-size:11px;font-weight:600">${pct}%</span>
          </div>
        </td>
        <td><span class="tag tag-${isLow ? 'cancelled' : 'delivered'}">${i.status}</span></td>
      </tr>`;
  },

  _ingDetailEmpty() {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  min-height:220px;gap:10px;color:var(--text-3)">
        <i class="fa-solid fa-hand-pointer" style="font-size:28px;opacity:.25"></i>
        <div style="font-size:13px;font-weight:600;color:var(--text-2)">Select an ingredient</div>
        <div style="font-size:11px;text-align:center;max-width:200px;line-height:1.6">
          Click any row to see dish-level breakdown
        </div>
      </div>`;
  },

  _selectIng(idx, row) {
    // highlight active row
    document.querySelectorAll('.ir-ing-row').forEach(r => r.style.background = '');
    row.style.background = 'var(--bg-surface2)';
    this._activeIngIdx = idx;

    const i       = DB.ingredients[idx];
    const closing = Math.max(0, i.stock - i.used);
    const pct     = i.stock > 0 ? Math.round((closing / i.stock) * 100) : 0;
    const isLow   = i.status === 'low';

    // dish breakdown — use productIngredients to map dishes that use this ingredient
    const dishRows = (DB.productIngredients || [])
      .filter(r => r.ingredients.some(x => x.name === i.name))
      .map(r => {
        const qty = r.ingredients.find(x => x.name === i.name)?.qty || '—';
        return `
          <tr>
            <td style="font-size:12px;color:var(--text)">${r.name}</td>
            <td style="font-size:12px;font-weight:600;color:var(--text)">${qty}</td>
          </tr>`;
      }).join('') || `<tr><td colspan="2" style="font-size:12px;color:var(--text-3);text-align:center;padding:12px">
                        No recipe mapping found</td></tr>`;

    document.getElementById('irIngDetail').innerHTML = `
      <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-bottom:2px">
        ${i.name}
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-bottom:14px">
        ${i.supplier} &nbsp;·&nbsp; Unit: ${i.unit}
      </div>

      <!-- Stock summary mini-cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        ${[
          { label: 'Opening',  val: i.stock.toLocaleString(),   clr: '' },
          { label: 'Consumed', val: i.used.toLocaleString(),    clr: 'var(--red)' },
          { label: 'Closing',  val: closing.toLocaleString(),   clr: isLow ? 'var(--red)' : 'var(--green)' },
        ].map(c => `
          <div style="background:var(--bg-surface2);border-radius:8px;padding:10px 12px">
            <div style="font-size:10px;color:var(--text-3);margin-bottom:4px">${c.label}</div>
            <div style="font-size:14px;font-weight:700;${c.clr ? `color:${c.clr}` : ''}">${c.val} ${i.unit}</div>
          </div>`).join('')}
      </div>

      <!-- Remaining bar -->
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;font-size:11px;
                    color:var(--text-3);margin-bottom:5px">
          <span>Stock remaining</span><span style="font-weight:700">${pct}%</span>
        </div>
        <div class="progress-bar" style="width:100%;height:8px">
          <div class="progress-fill"
               style="width:${Math.max(pct,1)}%;height:8px;
                      background:${pct <= 15 ? 'var(--red)' : pct <= 35 ? '#c47a1a' : 'var(--green)'}">
          </div>
        </div>
      </div>

      <!-- Cost -->
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:10px 0;border-top:1px solid var(--border);
                  border-bottom:1px solid var(--border);margin-bottom:14px">
        <span style="font-size:12px;color:var(--text-3)">Purchase Cost</span>
        <span style="font-size:15px;font-weight:700;font-family:'Playfair Display',serif">
          ${Utils.money(i.cost)}
        </span>
      </div>

      <!-- Used in dishes -->
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                  letter-spacing:.08em;color:var(--text-3);margin-bottom:8px">
        Used In Dishes
      </div>
      <table class="data-table" style="font-size:12px">
        <thead>
          <tr><th>Dish</th><th>Qty / Serving</th></tr>
        </thead>
        <tbody>${dishRows}</tbody>
      </table>`;
  },

  _filterIngTable(q) {
    document.querySelectorAll('.ir-ing-row').forEach(r => {
      r.style.display = r.dataset.name.includes(q.toLowerCase()) ? '' : 'none';
    });
  },

  // ── TAB 2: PRODUCT INGREDIENTS (RECIPE)
  _contentRecipe(el) {
    const recipes = DB.productIngredients || [];

    el.innerHTML = `
      <!-- Recipe grid -->
      <div style="margin-bottom:16px">
        <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-bottom:12px">
          Product Recipe Cards
          <span style="font-size:11px;font-weight:400;color:var(--text-3);margin-left:8px">
            — click a card to view ingredients
          </span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px"
             id="irRecipeGrid">
          ${recipes.map((r, idx) => `
            <div class="card ir-recipe-card" data-idx="${idx}"
                 onclick="IngredientReportView._selectRecipe(${idx}, this)"
                 style="padding:14px 16px;cursor:pointer;transition:border-color .15s">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px;
                            line-height:1.3">${r.name}</div>
                <span class="tag tag-delivered" style="font-size:9px;margin-left:6px;white-space:nowrap">
                  ${r.category}
                </span>
              </div>
              <div style="font-size:11px;color:var(--text-3);margin-bottom:8px">
                ${r.ingredients.length} ingredients &nbsp;·&nbsp; ${r.servings} serving
              </div>
              <div style="font-size:14px;font-weight:700;
                          font-family:'Playfair Display',serif;color:var(--gold)">
                ${Utils.money(r.cost)}
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Recipe detail -->
      <div id="irRecipeDetail"></div>`;
  },

  _selectRecipe(idx, card) {
    document.querySelectorAll('.ir-recipe-card').forEach(c => {
      c.style.border = '';
      c.style.boxShadow = '';
    });
    card.style.border = '1.5px solid var(--gold)';
    this._activeRecipeIdx = idx;

    const r   = (DB.productIngredients || [])[idx];
    const det = document.getElementById('irRecipeDetail');
    if (!r) { det.innerHTML = ''; return; }

    det.innerHTML = `
      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:14px 18px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">
              ${r.name}
            </div>
            <div style="font-size:11px;color:var(--text-3);margin-top:2px">
              ${r.category} &nbsp;·&nbsp; ${r.servings} serving per plate &nbsp;·&nbsp;
              Cost: <strong>${Utils.money(r.cost)}</strong>
            </div>
          </div>
          <span class="tag tag-delivered">${r.ingredients.length} ingredients</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ingredient</th>
              <th>Qty / Serving</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            ${r.ingredients.map((ing, i) => {
              const dbIng = DB.ingredients.find(x => x.name === ing.name);
              const status = dbIng ? dbIng.status : 'ok';
              return `
                <tr>
                  <td style="color:var(--text-3);font-size:11px">${i + 1}</td>
                  <td style="font-weight:600;color:var(--text)">${ing.name}</td>
                  <td>${ing.qty}</td>
                  <td><span class="tag tag-${status === 'low' ? 'cancelled' : 'delivered'}">${status}</span></td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  },

  // ── TAB 3: RAW MATERIALS
  _contentRawMat(el) {
    const rms = DB.rawMaterials || [];

    el.innerHTML = `
      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:14px 18px;border-bottom:1px solid var(--border)">
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">
            Raw Material Inventory
          </div>
          <button class="btn btn-outline btn-sm" onclick="IngredientReportView.exportCSV()">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Supplier</th>
              <th>Unit</th>
              <th>Opening</th>
              <th>Received</th>
              <th>Consumed</th>
              <th>Closing</th>
              <th>Unit Cost</th>
              <th>Stock Value</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            ${rms.map(m => {
              const closing = m.opening + m.received - m.consumed;
              const val     = closing * m.unitCost;
              const sCls    = m.orderStatus === 'Delivered' ? 'delivered'
                            : m.orderStatus === 'Pending'   ? 'pending'
                            : 'cancelled';
              return `
                <tr>
                  <td style="font-weight:600;color:var(--text)">${m.name}</td>
                  <td style="color:var(--text-3)">${m.supplier}</td>
                  <td style="color:var(--text-3);font-size:11px;text-transform:uppercase;
                             letter-spacing:.04em">${m.unit}</td>
                  <td style="font-weight:600">${m.opening.toLocaleString()}</td>
                  <td style="font-weight:600;color:var(--green)">
                    ${m.received > 0 ? '+' + m.received : '—'}
                  </td>
                  <td style="font-weight:700;color:var(--red)">${m.consumed.toLocaleString()}</td>
                  <td style="font-weight:700">${closing.toLocaleString()}</td>
                  <td>${Utils.money(m.unitCost)}</td>
                  <td style="font-weight:700;font-family:'Playfair Display',serif">
                    ${Utils.money(val)}
                  </td>
                  <td><span class="tag tag-${sCls}">${m.orderStatus}</span></td>
                </tr>`;
            }).join('')}
            <tr style="background:var(--bg-surface2)">
              <td colspan="8" style="font-weight:700;color:var(--text)">Total Stock Value</td>
              <td style="font-weight:900;font-family:'Playfair Display',serif;
                         font-size:14px;color:var(--red)">
                ${Utils.money(rms.reduce((s, m) => s + (m.opening + m.received - m.consumed) * m.unitCost, 0))}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>`;
  },

  // ── TAB 4: GENERAL EXPENSE
  _contentExpense(el) {
    const exps  = DB.expenses;
    const total = exps.reduce((s, e) => s + e.amount, 0);

    // group by category for summary
    const catMap = {};
    exps.forEach(e => {
      if (!catMap[e.category]) catMap[e.category] = { amount: 0, color: e.color };
      catMap[e.category].amount += e.amount;
    });

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px">

        <!-- Left: expense table -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="display:flex;align-items:center;justify-content:space-between;
                      padding:14px 18px;border-bottom:1px solid var(--border)">
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">
              Expense Detail
            </div>
            <button class="btn btn-outline btn-sm" onclick="IngredientReportView.exportCSV()">
              <i class="fa-solid fa-download"></i> Export CSV
            </button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Vendor</th>
                <th>Note</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Share</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${exps.map(e => {
                const pct    = total > 0 ? Math.round(e.amount / total * 100) : 0;
                const status = e.status || 'approved';
                const sCls   = status === 'pending' ? 'pending' : 'delivered';
                return `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:7px">
                        <div style="width:8px;height:8px;border-radius:50%;
                                    background:${e.color};flex-shrink:0"></div>
                        <span style="font-weight:600;color:var(--text)">${e.category}</span>
                      </div>
                    </td>
                    <td style="color:var(--text-3)">${e.vendor}</td>
                    <td style="color:var(--text-3);font-size:11px;max-width:180px;
                               overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                      ${e.note}
                    </td>
                    <td style="font-size:11px;color:var(--text-3)">${Utils.formatDate(e.date)}</td>
                    <td style="font-weight:700;font-family:'Playfair Display',serif">
                      ${Utils.money(e.amount)}
                    </td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px">
                        <div class="progress-bar" style="width:56px">
                          <div class="progress-fill"
                               style="width:${Math.max(pct,1)}%;background:${e.color}">
                          </div>
                        </div>
                        <span style="font-size:11px;font-weight:600">${pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="tag tag-${sCls}">${status}</span>
                    </td>
                  </tr>`;
              }).join('')}
              <tr style="background:var(--bg-surface2)">
                <td colspan="4" style="font-weight:700;color:var(--text)">Total</td>
                <td style="font-weight:900;font-family:'Playfair Display',serif;
                           font-size:14px;color:var(--red)">
                  ${Utils.money(total)}
                </td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right: category summary -->
        <div class="card" style="padding:18px">
          <div style="font-family:'Playfair Display',serif;font-size:14px;font-weight:700;
                      margin-bottom:14px">Category Summary</div>
          ${Object.entries(catMap).map(([cat, d]) => {
            const pct = total > 0 ? Math.round(d.amount / total * 100) : 0;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;
                          padding:9px 0;border-bottom:1px solid var(--border)">
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:8px;height:8px;border-radius:50%;
                              background:${d.color};flex-shrink:0"></div>
                  <span style="font-size:12px;color:var(--text)">${cat}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:11px;color:var(--text-3)">${pct}%</span>
                  <span style="font-size:13px;font-weight:700">${Utils.money(d.amount)}</span>
                </div>
              </div>`;
          }).join('')}
          <div style="display:flex;justify-content:space-between;align-items:center;
                      padding:12px 0 0;margin-top:4px">
            <span style="font-size:13px;font-weight:700;color:var(--text)">Total</span>
            <span style="font-size:16px;font-weight:900;
                         font-family:'Playfair Display',serif;color:var(--red)">
              ${Utils.money(total)}
            </span>
          </div>
        </div>

      </div>`;
  },

  // ══════════════════════════════════════════
  //  CSV EXPORT
  // ══════════════════════════════════════════
  exportCSV() {
    let csv = '', filename = '';

    if (this._tab === 'ingredients') {
      csv = 'Ingredient,Unit,Opening Stock,Consumed,Closing Stock,Cost,Supplier,Status\n';
      DB.ingredients.forEach(i => {
        const closing = Math.max(0, i.stock - i.used);
        csv += `"${i.name}",${i.unit},${i.stock},${i.used},${closing},${i.cost},"${i.supplier}",${i.status}\n`;
      });
      filename = 'savoria_ingredient_report.csv';

    } else if (this._tab === 'recipe') {
      csv = 'Product,Category,Servings,Cost,Ingredient,Qty\n';
      (DB.productIngredients || []).forEach(r => {
        r.ingredients.forEach(ing => {
          csv += `"${r.name}","${r.category}",${r.servings},${r.cost},"${ing.name}","${ing.qty}"\n`;
        });
      });
      filename = 'savoria_recipe_ingredients.csv';

    } else if (this._tab === 'rawmat') {
      csv = 'Material,Supplier,Unit,Opening,Received,Consumed,Closing,Unit Cost,Stock Value,Order Status\n';
      (DB.rawMaterials || []).forEach(m => {
        const closing = m.opening + m.received - m.consumed;
        csv += `"${m.name}","${m.supplier}",${m.unit},${m.opening},${m.received},${m.consumed},${closing},${m.unitCost},${closing * m.unitCost},"${m.orderStatus}"\n`;
      });
      filename = 'savoria_raw_materials.csv';

    } else {
      csv = 'Category,Vendor,Note,Date,Amount,Status\n';
      DB.expenses.forEach(e => {
        csv += `"${e.category}","${e.vendor}","${e.note}",${e.date},${e.amount},"${e.status || 'approved'}"\n`;
      });
      filename = 'savoria_general_expense.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Toast.show(`Exported: ${filename}`, 'success');
  },
};