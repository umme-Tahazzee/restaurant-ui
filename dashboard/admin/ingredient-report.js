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

        <!-- Filter controls — mobile এ wrap হবে -->
        <div class="flex flex-wrap gap-2 items-center w-full md:w-auto mt-3 md:mt-0">

          <!-- Branch select -->
          <select class="date-input" id="irBranchFilter"
                  onchange="IngredientReportView.applyFilter()"
                  style="padding:5px 8px;font-size:12px;min-width:0;flex:1 1 auto">
            <option value="All">All Branches</option>
            ${DB.branches.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
          </select>

          <!-- Date range -->
          <div class="flex items-center gap-1" style="flex:1 1 auto;min-width:0">
            <input type="date" class="date-input" id="irDateFrom"
                   value="${Utils.todayMinus(30)}"
                   style="flex:1;min-width:0;font-size:11px"/>
            <span style="color:var(--text-3);font-size:11px;white-space:nowrap">to</span>
            <input type="date" class="date-input" id="irDateTo"
                   value="${Utils.today()}"
                   style="flex:1;min-width:0;font-size:11px"/>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2">
            <button class="btn btn-primary btn-sm"
                    onclick="IngredientReportView.applyFilter()">
              <i class="fa-solid fa-filter"></i>
              <span class="hidden sm:inline">Filter</span>
            </button>
            <button class="btn btn-outline btn-sm"
                    onclick="IngredientReportView.exportCSV()">
              <i class="fa-solid fa-download"></i>
              <span class="hidden sm:inline">Export</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Tab bar — mobile এ scroll হবে -->
      <div class="tab-bar anim-1" style="overflow-x:auto;flex-wrap:nowrap;white-space:nowrap">
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

      <div class="grid-4 anim-2" style="margin-bottom:20px" id="irSummary"></div>
      <div id="irChart" style="margin-bottom:20px"></div>
      <div id="irContent" class="anim-2 mb-8"></div>

    </div>`;
},

  // ══════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════
  init() {
    this._tab           = 'ingredients';
    this._activeIngIdx  = null;
    this._activeRecipeIdx = null;
    this._computedIngredients = [];
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
    this._calculateData();
    this._renderSummary();
    this._renderChart();
    this._renderContent();
  },

  _getCustomIngredients() {
    const list = JSON.parse(localStorage.getItem('savoria-custom-ingredients') || '[]');
    return list.map(item => ({ ...item, isCustom: true }));
  },
  _saveCustomIngredients(list) {
    localStorage.setItem('savoria-custom-ingredients', JSON.stringify(list));
  },
  _getCustomRecipes() {
    return JSON.parse(localStorage.getItem('savoria-custom-recipes') || '[]');
  },
  _saveCustomRecipes(list) {
    localStorage.setItem('savoria-custom-recipes', JSON.stringify(list));
  },
  _getCustomPurchases() {
    return JSON.parse(localStorage.getItem('savoria-custom-purchases') || '[]');
  },
  _saveCustomPurchases(list) {
    localStorage.setItem('savoria-custom-purchases', JSON.stringify(list));
  },
  _getCustomExpenses() {
    return JSON.parse(localStorage.getItem('savoria-custom-expenses') || '[]');
  },
  _saveCustomExpenses(list) {
    localStorage.setItem('savoria-custom-expenses', JSON.stringify(list));
  },

  // ── computes ingredient used properties dynamically based on product sold count and selected branch
  _calculateData() {
    const branchFilter = document.getElementById('irBranchFilter')?.value || 'All';
    const purchases = this._getCustomPurchases();
    
    // Copy base ingredients
    const baseIngredients = [...DB.ingredients, ...this._getCustomIngredients()];
    
    // Track total received per ingredient from purchases
    const receivedMap = {};
    purchases.forEach(p => {
       receivedMap[p.ingredientId] = (receivedMap[p.ingredientId] || 0) + parseFloat(p.qtyReceived || 0);
    });

    this._computedIngredients = baseIngredients.map(ing => {
      const openingStock = ing.isCustom ? (receivedMap[ing.id] || 0) : ing.opening;
      return {
        ...ing,
        opening: openingStock,
        used: 0,
        dishBreakdown: [] 
      };
    });

    // Merge DB Product Ingredients and Custom Recipes
    const allRecipes = [...(DB.productIngredients || []), ...this._getCustomRecipes()];

    // Calculate usage
    allRecipes.forEach(product => {
      let soldCount = 0;
      if (product.soldByBranch) {
        if (branchFilter === 'All') {
          soldCount = Object.values(product.soldByBranch).reduce((sum, val) => sum + val, 0);
        } else {
          soldCount = product.soldByBranch[branchFilter] || 0;
        }
      } else {
        // For newly created recipes, we simulate standard sales across branches
        const mockSales = product.mockSales || 45;
        soldCount = branchFilter === 'All' ? mockSales : Math.round(mockSales / 4);
      }

      if (soldCount > 0) {
        (product.ingredients || []).forEach(pIng => {
          const compIng = this._computedIngredients.find(x => x.id === pIng.ingredientId || x.name === pIng.name);
          if (compIng && pIng.qtyVal) {
            const totalUsed = parseFloat(pIng.qtyVal) * soldCount;
            compIng.used += totalUsed;
            compIng.dishBreakdown.push({
              dishName: product.name,
              sold: soldCount,
              qtyPerItem: pIng.qtyVal,
              unit: pIng.qtyUnit || compIng.unit,
              totalUsedQty: totalUsed
            });
          }
        });
      }
    });

    // Finalize formatting
    this._computedIngredients.forEach(ing => {
      // round to 2 decimal places
      ing.used = Math.round(ing.used * 100) / 100;
      ing.closing = Math.round(Math.max(0, ing.opening - ing.used) * 100) / 100;
    });
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
        const ings      = this._computedIngredients;
        const totalUsed = ings.reduce((s, i) => s + i.used, 0);
        const totalCost = ings.reduce((s, i) => s + i.cost, 0);
        const lowStock  = ings.filter(i => (i.opening - i.used) / i.opening < 0.2).length;
        const suppliers = [...new Set(ings.map(i => i.supplier))].length;
        return [
          { label: 'Total Consumed',  value: totalUsed.toLocaleString(), sub: 'all ingredients',     color: '' },
          { label: 'Total Cost',      value: Utils.money(totalCost),      sub: 'purchase cost',        color: '' },
          { label: 'Low Stock Items', value: lowStock,                    sub: 'needs reorder (<20%)', color: 'var(--red)' },
          { label: 'Suppliers',       value: suppliers,                   sub: 'active suppliers',     color: '' },
        ];
      },
      recipe: () => {
        const recipes   = [...(DB.productIngredients || []), ...this._getCustomRecipes()];
        const totalDish = recipes.length;
        const avgCost   = totalDish > 0
          ? Math.round(recipes.reduce((s, r) => s + (r.cost||0), 0) / totalDish) : 0;
        const maxCost   = totalDish > 0 ? Math.max(...recipes.map(r => r.cost||0)) : 0;
        const minCost   = totalDish > 0 ? Math.min(...recipes.map(r => r.cost||0)) : 0;
        return [
          { label: 'Total Products',  value: totalDish,              sub: 'active menu items',   color: '' },
          { label: 'Avg Cost / Dish', value: Utils.money(avgCost),   sub: 'per serving',          color: '' },
          { label: 'Highest Cost',    value: Utils.money(maxCost),   sub: 'most expensive dish',  color: 'var(--gold)' },
          { label: 'Lowest Cost',     value: Utils.money(minCost),   sub: 'most economical dish', color: 'var(--green)' },
        ];
      },
      rawmat: () => {
        const rms        = this._getCustomPurchases();
        const totalVal   = rms.reduce((s, r) => s + (parseFloat(r.qtyReceived) * parseFloat(r.unitCost)), 0);
        const pending    = rms.filter(r => r.status === 'Pending').length;
        
        return [
          { label: 'Purchases',       value: rms.length,             sub: 'recorded entries',     color: '' },
          { label: 'Total Intake Val',value: Utils.money(totalVal),  sub: 'historical purchases', color: '' },
          { label: 'Pending Status',  value: pending,                sub: 'awaiting clearance',   color: 'var(--gold)' },
        ];
      },
      expense: () => {
        const exps     = [...(DB.expenses || []), ...this._getCustomExpenses()];
        const total    = exps.reduce((s, e) => s + (parseFloat(e.amount)||0), 0);
        const cats     = [...new Set(exps.map(e => e.category))].length;
        const largest  = exps.length ? exps.reduce((a, b) => (parseFloat(a.amount)||0) > (parseFloat(b.amount)||0) ? a : b) : { category:'—', amount:0 };
        const unpaid   = exps.filter(e => e.status === 'Pending').length;
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
    const top5     = [...this._computedIngredients].sort((a, b) => b.used - a.used).slice(0, 5);
    const labels   = top5.map(i => i.name);
    const stocks   = top5.map(i => i.opening);
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
    const recipes = [...(DB.productIngredients || []), ...this._getCustomRecipes()].slice(0, 6);
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
    const rms    = this._getCustomPurchases().slice(0, 7);
    if (!rms.length) { wrap.innerHTML = ''; return; }
    const labels = rms.map(r => r.ingredientName);
    const values = rms.map(r => r.qtyReceived * r.unitCost);

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
    const exps   = [...(DB.expenses || []), ...this._getCustomExpenses()];
    const catMap = {};
    if (!exps.length) { wrap.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-3)">No expenses recorded yet.</div>'; return; }
    
    exps.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + (parseFloat(e.amount)||0);
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
  const ings = this._computedIngredients;

  el.innerHTML = `
    <!-- Mobile: stack, Desktop: side by side -->
    <div class="flex flex-col lg:grid gap-4"
         style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)">

      <!-- Left: table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:14px 18px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">
            Stock & Consumption
          </div>
          <div style="display:flex; gap:8px;">
            <input type="text" class="date-input" placeholder="🔍 Search..."
              style="width:150px;padding:6px 10px;font-size:12px"
              oninput="IngredientReportView._filterIngTable(this.value)">
            <button class="btn btn-primary btn-sm" onclick="IngredientReportView.openAddModal()" style="padding:6px 12px;font-size:12px">
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>

        <!-- Table scroll wrapper -->
        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
          <table class="data-table" id="irIngTable" style="min-width:520px">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Unit</th>
                <th>Opening</th>
                <th>Consumed</th>
                <th>Closing</th>
                <th>Rem %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${ings.map((i, idx) => this._ingRow(i, idx)).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: detail panel -->
      <div class="card" id="irIngDetail" style="padding:18px">
        ${this._ingDetailEmpty()}
      </div>

    </div>`;
},

  _ingRow(i, idx) {
    const pct     = i.opening > 0 ? Math.round((i.closing / i.opening) * 100) : 0;
    const isLow   = pct < 20;
    const barClr  = pct <= 15 ? '#c0392b' : pct <= 35 ? '#c47a1a' : '#2d7a47';
    return `
      <tr class="ir-ing-row" data-idx="${idx}" data-name="${(i.name||'').toLowerCase()}"
          onclick="IngredientReportView._selectIng(${idx}, this)"
          style="cursor:pointer">
        <td style="font-weight:600;color:var(--text)">${i.name}</td>
        <td style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.04em">${i.unit}</td>
        <td style="font-weight:600">${i.opening.toLocaleString()}</td>
        <td style="font-weight:700;color:var(--red)">${i.used.toLocaleString()}</td>
        <td style="font-weight:700;color:${isLow ? 'var(--red)' : 'var(--green)'}">${i.closing.toLocaleString()}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div class="progress-bar" style="width:56px">
              <div class="progress-fill" style="width:${Math.max(pct,2)}%;background:${barClr}"></div>
            </div>
            <span style="font-size:11px;font-weight:600">${pct}%</span>
          </div>
        </td>
        <td><span class="tag tag-${isLow ? 'cancelled' : 'delivered'}">${isLow ? 'low' : 'ok'}</span></td>
        <td>
          ${i.isCustom ? `
            <button onclick="event.stopPropagation(); IngredientReportView.editIngredient('${i.id}')" style="color:var(--gold);margin-right:8px"><i class="fa-solid fa-pen"></i></button>
            <button onclick="event.stopPropagation(); IngredientReportView.deleteIngredient('${i.id}')" style="color:var(--red)"><i class="fa-solid fa-trash"></i></button>
          ` : `<span style="font-size:10px;color:var(--text-3)">System</span>`}
        </td>
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

    const i       = this._computedIngredients[idx];
    const pct     = i.opening > 0 ? Math.round((i.closing / i.opening) * 100) : 0;
    const isLow   = pct < 20;

    // dish breakdown — dynamic from i.dishBreakdown
    const dishRows = (i.dishBreakdown || [])
      .map(d => {
        // d: { dishName, sold, qtyPerItem, unit, totalUsedQty }
        return `
          <tr style="border-bottom: 1px dashed var(--border)">
            <td style="font-size:12px;color:var(--text);padding:8px 0">${d.dishName}</td>
            <td style="font-size:11px;color:var(--text-3);padding:8px 0">
              <span style="font-weight:600;color:var(--text-2)">${d.sold}</span> sold &times; ${d.qtyPerItem} ${d.unit}
            </td>
            <td style="font-size:12px;font-weight:700;color:var(--red);text-align:right;padding:8px 0">
               ${Math.round(d.totalUsedQty * 100)/100} ${d.unit}
            </td>
          </tr>`;
      }).join('') || `<tr><td colspan="3" style="font-size:12px;color:var(--text-3);text-align:center;padding:12px">
                        No recipe usage for selected branch</td></tr>`;

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
          { label: 'Opening',  val: i.opening.toLocaleString(), clr: '' },
          { label: 'Consumed', val: i.used.toLocaleString(),    clr: 'var(--red)' },
          { label: 'Closing',  val: i.closing.toLocaleString(), clr: isLow ? 'var(--red)' : 'var(--green)' },
        ].map(c => `
          <div style="background:var(--bg-surface2);border-radius:8px;padding:10px 12px">
            <div style="font-size:10px;color:var(--text-3);margin-bottom:4px">${c.label}</div>
            <div style="font-size:14px;font-weight:700;${c.clr ? `color:${c.clr}` : ''}">${c.val} <span style="font-size:10px;font-weight:normal;color:var(--text-3)">${i.unit}</span></div>
          </div>`).join('')}
      </div>

      <!-- Remaining bar -->
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;font-size:11px;
                    color:var(--text-3);margin-bottom:5px">
          <span>Stock remaining</span><span style="font-weight:700">${pct}%</span>
        </div>
        <div class="progress-bar" style="width:100%;height:8px">
          <div class="progress-fill" style="width:${Math.max(pct,1)}%;height:8px;background:${pct <= 15 ? 'var(--red)' : pct <= 35 ? '#c47a1a' : 'var(--green)'}"></div>
        </div>
      </div>

      <!-- Financial Calculation -->
      <div style="background:var(--bg-panel);border-radius:8px;padding:12px;margin-bottom:16px;border:1px solid var(--border)">
        <div style="font-size:11px;font-weight:700;color:var(--text-3);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em">
          Financial Impact (Unit Cost: ${Utils.money(i.cost)})
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
          <span style="color:var(--text-2)">Opening Value (${i.opening} &times; ${Utils.money(i.cost)})</span>
          <span style="font-weight:600">${Utils.money(i.opening * i.cost)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
          <span style="color:var(--red)">Consumed Value (${i.used} &times; ${Utils.money(i.cost)})</span>
          <span style="font-weight:600;color:var(--red)">- ${Utils.money(i.used * i.cost)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding-top:8px;border-top:1px dashed var(--border)">
          <span style="color:var(--text);font-weight:600">Remaining Value</span>
          <span style="font-weight:700;color:var(--green)">${Utils.money(i.closing * i.cost)}</span>
        </div>
      </div>

      <!-- Used in dishes -->
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                  letter-spacing:.08em;color:var(--text-3);margin-bottom:8px">
        Usage Breakdown & Calculation
      </div>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
        <table class="data-table" style="font-size:12px;min-width:350px">
          <thead>
            <tr>
              <th style="padding:8px 0;background:transparent">Dish</th>
              <th style="padding:8px 0;background:transparent">Calculation</th>
              <th style="padding:8px 0;background:transparent;text-align:right">Consumed</th>
            </tr>
          </thead>
          <tbody>
            ${dishRows}
            <tr>
              <td colspan="2" style="font-weight:600;font-size:11px;color:var(--text-2);padding:10px 0;text-align:right">Total Consumed:</td>
              <td style="font-weight:700;color:var(--red);text-align:right;padding:10px 0">${Math.round(i.used*100)/100} ${i.unit}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
  },

  _filterIngTable(q) {
    document.querySelectorAll('.ir-ing-row').forEach(r => {
      r.style.display = r.dataset.name.includes(q.toLowerCase()) ? '' : 'none';
    });
  },

  openAddModal(item = null) {
    const title = item ? 'Edit Ingredient' : 'Add Ingredient';
    const id = item ? item.id : '';
    const name = item ? item.name : '';
    const unit = item ? item.unit : '';
    const cost = item ? item.cost : 0;

    const html = `
      <div style="padding:20px">
        <h3 style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:15px">${title}</h3>
        <input type="hidden" id="irIngModalId" value="${id}" />
        
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Ingredient Name</label>
          <input type="text" id="irIngModalName" class="date-input" style="width:100%;padding:8px" value="${name}" />
        </div>

        <div style="display:flex;gap:12px;margin-bottom:16px">
          <div style="flex:1">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Unit (kg, L, pcs)</label>
            <input type="text" id="irIngModalUnit" class="date-input" style="width:100%;padding:8px" value="${unit}" />
          </div>
          <div style="flex:1">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Unit Cost ($)</label>
            <input type="number" id="irIngModalCost" step="0.01" min="0" class="date-input" style="width:100%;padding:8px" value="${cost}" />
          </div>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-outline btn-sm" onclick="Modal.close('genericModal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="IngredientReportView.saveIngredientForm()">Save</button>
        </div>
      </div>
    `;

    document.getElementById('genericModalContent').innerHTML = html;
    Modal.open('genericModal');
  },

  saveIngredientForm() {
    const id = document.getElementById('irIngModalId').value;
    const name = document.getElementById('irIngModalName').value;
    const unit = document.getElementById('irIngModalUnit').value;
    const cost = parseFloat(document.getElementById('irIngModalCost').value) || 0;

    if (!name || !unit) {
      Toast.show('Please fill in all fields', 'warning');
      return;
    }

    let list = this._getCustomIngredients();
    if (id) {
      list = list.map(item => item.id === id ? { ...item, name, unit, cost } : item);
      Toast.show('Ingredient updated successfully', 'success');
    } else {
      list.push({
        id: 'cust_' + Date.now(),
        name,
        unit,
        opening: 0,
        cost: cost,
        supplier: 'Custom',
        status: 'ok'
      });
      Toast.show('Ingredient added successfully', 'success');
    }

    this._saveCustomIngredients(list.map(i => {
      const { isCustom, ...rest } = i;
      return rest;
    }));
    Modal.close('genericModal');
    this._refresh();
  },

  deleteIngredient(id) {
    if(!confirm('Are you sure you want to delete this ingredient?')) return;
    let list = this._getCustomIngredients();
    list = list.filter(item => item.id !== id);
    this._saveCustomIngredients(list.map(i => {
      const { isCustom, ...rest } = i;
      return rest;
    }));
    Toast.show('Ingredient deleted successfully', 'success');
    this._refresh();
  },

  editIngredient(id) {
    const list = this._getCustomIngredients();
    const item = list.find(x => x.id === id);
    if(item) {
      this.openAddModal(item);
    }
  },

  // ── TAB 2: PRODUCT INGREDIENTS (RECIPE)
  _contentRecipe(el) {
    const allRecipes = [...(DB.productIngredients || []), ...this._getCustomRecipes()];

    el.innerHTML = `
      <!-- Recipe grid -->
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div>
            <span style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;">
              Product Recipe Cards
            </span>
            <span style="font-size:11px;font-weight:400;color:var(--text-3);margin-left:8px">
              — click a card to view ingredients
            </span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="IngredientReportView.openAddRecipeModal()">
            <i class="fa-solid fa-plus"></i> Add Recipe
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px"
             id="irRecipeGrid">
          ${allRecipes.length === 0 ? '<div style="font-size:12px;color:var(--text-3)">No recipes added yet.</div>' : ''}
          ${allRecipes.map((r, idx) => `
            <div class="card ir-recipe-card" data-idx="${idx}"
                 onclick="IngredientReportView._selectRecipe(${idx}, this)"
                 style="padding:14px 16px;cursor:pointer;transition:border-color .15s">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px;
                            line-height:1.3">${r.name}</div>
                <span class="tag tag-delivered" style="font-size:9px;margin-left:6px;white-space:nowrap">
                  ${r.category || 'Custom'}
                </span>
              </div>
              <div style="font-size:11px;color:var(--text-3);margin-bottom:8px">
                ${r.ingredients ? r.ingredients.length : 0} ingredients
              </div>
              <div style="display:flex;justify-content:space-between;align-items:flex-end">
                <div style="font-size:14px;font-weight:700;
                            font-family:'Playfair Display',serif;color:var(--gold)">
                  ${Utils.money(r.cost || 0)}
                </div>
                ${r.isCustom ? `
                   <div style="display:flex;gap:8px">
                     <button onclick="event.stopPropagation(); IngredientReportView.openAddRecipeModal('${r.id}')" style="color:var(--text-3);background:transparent;border:none;cursor:pointer">
                       <i class="fa-solid fa-pen" style="font-size:12px"></i>
                     </button>
                     <button onclick="event.stopPropagation(); IngredientReportView.deleteRecipe('${r.id}')" style="color:var(--red);background:transparent;border:none;cursor:pointer">
                       <i class="fa-solid fa-trash" style="font-size:12px"></i>
                     </button>
                   </div>
                ` : ''}
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

    const allRecipes = [...(DB.productIngredients || []), ...this._getCustomRecipes()];
    const r   = allRecipes[idx];
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
        </div>
        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
          <table class="data-table" style="min-width:400px">
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
                const dbIng = this._computedIngredients.find(x => x.name === ing.name);
                const isLow = dbIng ? (dbIng.closing / dbIng.opening < 0.2) : false;
                const status = isLow ? 'low' : 'ok';
                return `
                  <tr>
                    <td style="color:var(--text-3);font-size:11px">${i + 1}</td>
                    <td style="font-weight:600;color:var(--text)">${ing.name}</td>
                    <td>${ing.qtyVal} ${ing.qtyUnit}</td>
                    <td><span class="tag tag-${isLow ? 'cancelled' : 'delivered'}">${status}</span></td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  openAddRecipeModal(editId = null) {
    // Generate Product Options (from custom DB.products if available, else standard set)
    const prods = Store.KEYS && localStorage.getItem(Store.KEYS.products) 
                    ? JSON.parse(localStorage.getItem(Store.KEYS.products)) 
                    : DB.products || [];
                    
    let existing = null;
    if (editId) {
       existing = this._getCustomRecipes().find(r => r.id === editId);
    }
    
    const prodOpts = prods.map(p => {
       const sel = (existing && existing.productId === p.id) ? 'selected' : '';
       return `<option value="${p.id}" data-name="${p.name}" data-cat="${p.category}" ${sel}>${p.name}</option>`;
    }).join('');
    
    let rowHtml = '';
    if (existing && existing.ingredients && existing.ingredients.length > 0) {
       rowHtml = existing.ingredients.map(ing => this._recipeRowHtml(ing.ingredientId, ing.qtyVal)).join('');
    } else {
       rowHtml = this._recipeRowHtml();
    }
    
    const html = `
      <div style="padding:20px;max-height:80vh;overflow-y:auto">
        <h3 style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:15px">
           ${existing ? 'Edit Recipe' : 'Add Recipe'}
        </h3>
        <input type="hidden" id="irRecipeEditId" value="${existing ? existing.id : ''}" />
        
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Select Product</label>
          <select id="irRecipeProduct" class="date-input" style="width:100%;padding:8px">
            ${prodOpts}
          </select>
        </div>

        <div style="margin-bottom:16px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:8px">Ingredients</label>
          <div id="irRecipeRows" style="display:flex;flex-direction:column;gap:8px">
            ${rowHtml}
          </div>
          <button class="btn btn-outline btn-sm" style="margin-top:10px;width:100%" onclick="IngredientReportView.addRecipeIngredientRow()">
            <i class="fa-solid fa-plus"></i> Add Ingredient Row
          </button>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
          <button class="btn btn-outline btn-sm" onclick="Modal.close('genericModal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="IngredientReportView.saveRecipeForm()">Save Recipe</button>
        </div>
      </div>
    `;

    document.getElementById('genericModalContent').innerHTML = html;
    Modal.open('genericModal');
  },

  _recipeRowHtml(selId = '', selQty = '') {
    const ings = this._computedIngredients;
    const ingOpts = ings.map(i => {
       const valId = i.id || i.name;
       const sel = (valId === selId) ? 'selected' : '';
       return `<option value="${valId}" data-unit="${i.unit}" data-cost="${i.cost||0}" ${sel}>${i.name} (${i.unit})</option>`;
    }).join('');
    
    let unitLabel = '';
    if (selId) {
       const found = ings.find(x => (x.id || x.name) === selId);
       if (found) unitLabel = found.unit || '';
    }

    return `
      <div class="ir-recipe-row" style="display:flex;gap:8px;align-items:center">
        <select class="date-input ir-rr-ing" style="flex:2;padding:8px" onchange="IngredientReportView._updateRecipeRowUnit(this)">
          <option value="">Select ingredient...</option>
          ${ingOpts}
        </select>
        <div style="flex:1;position:relative">
          <input type="number" step="0.01" min="0" class="date-input ir-rr-qty" style="width:100%;padding:8px" placeholder="Qty" value="${selQty}" />
          <span class="ir-rr-unit-label" style="position:absolute;right:10px;top:8px;font-size:11px;color:var(--text-3)">${unitLabel}</span>
        </div>
        <button onclick="IngredientReportView.removeRecipeIngredientRow(this)" style="color:var(--text-3);background:none;border:none;cursor:pointer;padding:4px">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  },

  _updateRecipeRowUnit(sel) {
    const opt = sel.options[sel.selectedIndex];
    const unit = opt ? opt.getAttribute('data-unit') : '';
    const row = sel.closest('.ir-recipe-row');
    const label = row.querySelector('.ir-rr-unit-label');
    if(label) label.textContent = unit || '';
  },

  addRecipeIngredientRow() {
    const wrap = document.getElementById('irRecipeRows');
    wrap.insertAdjacentHTML('beforeend', this._recipeRowHtml());
  },

  removeRecipeIngredientRow(btn) {
    const wrap = document.getElementById('irRecipeRows');
    if (wrap.children.length > 1) {
      btn.closest('.ir-recipe-row').remove();
    }
  },

  saveRecipeForm() {
    const prodSel = document.getElementById('irRecipeProduct');
    const prodOpt = prodSel.options[prodSel.selectedIndex];
    if (!prodOpt) return;
    
    const productId = prodSel.value;
    const productName = prodOpt.getAttribute('data-name');
    const productCat = prodOpt.getAttribute('data-cat');

    const rows = document.querySelectorAll('.ir-recipe-row');
    const ingredients = [];
    let totalCost = 0;

    for (let row of rows) {
      const ingSel = row.querySelector('.ir-rr-ing');
      const qtyInp = row.querySelector('.ir-rr-qty');
      
      const ingId = ingSel.value;
      const qtyVal = parseFloat(qtyInp.value) || 0;
      
      if (ingId && qtyVal > 0) {
        const iOpt = ingSel.options[ingSel.selectedIndex];
        const ingName = iOpt.text.split(' (')[0];
        const unit = iOpt.getAttribute('data-unit');
        const cost = parseFloat(iOpt.getAttribute('data-cost')) || 0;
        
        ingredients.push({
          ingredientId: ingId,
          name: ingName,
          qtyVal: qtyVal,
          qtyUnit: unit
        });
        totalCost += (qtyVal * cost);
      }
    }

    if (ingredients.length === 0) {
      Toast.show('Please add valid ingredients with quantities', 'warning');
      return;
    }

    const editId = document.getElementById('irRecipeEditId').value;
    let list = this._getCustomRecipes();
    
    if (editId) {
      list = list.map(r => r.id === editId ? {
        ...r,
        productId, name: productName, category: productCat, cost: totalCost, ingredients
      } : r);
      Toast.show('Recipe updated successfully', 'success');
    } else {
      // Overwrite if same product for new additions to avoid dupes
      list = list.filter(r => r.productId !== productId);
      list.push({
        id: 'rec_' + Date.now(),
        productId,
        name: productName,
        category: productCat,
        cost: totalCost,
        servings: 1,
        isCustom: true,
        ingredients
      });
      Toast.show('Recipe saved successfully', 'success');
    }

    this._saveCustomRecipes(list);
    Modal.close('genericModal');
    Toast.show('Recipe saved successfully', 'success');
    this._refresh();
  },

  deleteRecipe(id) {
    if(!confirm('Delete this recipe?')) return;
    let list = this._getCustomRecipes();
    list = list.filter(r => r.id !== id);
    this._saveCustomRecipes(list);
    Toast.show('Recipe deleted', 'success');
    this._refresh();
  },

  // ── TAB 3: RAW MATERIALS
  _contentRawMat(el) {
    const rawMaterials = this._getCustomPurchases();
    // Pre-calculate sums for display
    const totalValue = rawMaterials.reduce((sum, p) => sum + (parseFloat(p.qtyReceived) * parseFloat(p.unitCost)), 0);

    el.innerHTML = `
      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:14px 18px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">
            Purchases & Intake Logs
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline btn-sm" onclick="IngredientReportView.exportCSV()">
              <i class="fa-solid fa-download"></i>
              <span class="hidden sm:inline">Export CSV</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="IngredientReportView.openAddRawMatModal()">
              <i class="fa-solid fa-plus"></i> Add Entry
            </button>
          </div>
        </div>

        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
          <table class="data-table" style="min-width:780px">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ingredient</th>
                <th>Supplier</th>
                <th>Received Qty</th>
                <th>Unit Cost</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rawMaterials.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-3)">No purchases recorded yet</td></tr>' : ''}
              ${rawMaterials.map(m => {
                const val = m.qtyReceived * m.unitCost;
                const sCls = m.status === 'Completed' ? 'delivered' : m.status === 'Pending' ? 'pending' : 'cancelled';
                return `
                  <tr>
                    <td style="color:var(--text-3);font-size:12px">${m.date}</td>
                    <td style="font-weight:600;color:var(--text);white-space:nowrap">${m.ingredientName}</td>
                    <td style="color:var(--text-3);white-space:nowrap">${m.supplier}</td>
                    <td style="font-weight:600;color:var(--green)">+${m.qtyReceived} ${m.unit}</td>
                    <td>${Utils.money(m.unitCost)}</td>
                    <td style="font-weight:700;font-family:'Playfair Display',serif">${Utils.money(val)}</td>
                    <td><span class="tag tag-${sCls}">${m.status}</span></td>
                    <td>
                      <div style="display:flex;gap:8px">
                        <button onclick="IngredientReportView.openAddRawMatModal('${m.id}')" style="color:var(--text-3);background:none;border:none;cursor:pointer"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="IngredientReportView.deleteRawMat('${m.id}')" style="color:var(--red);background:none;border:none;cursor:pointer"><i class="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>`;
              }).join('')}
              <tr style="background:var(--bg-surface2)">
                <td colspan="5" style="font-weight:700;color:var(--text);text-align:right">Total Historical Purchases Value:</td>
                <td style="font-weight:900;font-family:'Playfair Display',serif;font-size:14px;color:var(--red)">
                  ${Utils.money(totalValue)}
                </td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;
  },

  openAddRawMatModal(editId = null) {
    const ings = this._computedIngredients;
    if (ings.length === 0) {
      Toast.show('Please add an ingredient first', 'warning');
      return;
    }
    
    let existing = null;
    if (editId) {
       existing = this._getCustomPurchases().find(p => p.id === editId);
    }
    
    const ingOpts = ings.map(i => {
       const valId = i.id || i.name;
       const sel = (existing && existing.ingredientId === valId) ? 'selected' : '';
       return `<option value="${valId}" data-name="${i.name}" data-unit="${i.unit}" data-cost="${i.cost||0}" ${sel}>${i.name} (${i.unit})</option>`;
    }).join('');

    const html = `
      <div style="padding:20px">
        <h3 style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:15px">
           ${existing ? 'Edit Purchase Entry' : 'Add Purchase Entry'}
        </h3>
        <input type="hidden" id="irRmEditId" value="${existing ? existing.id : ''}" />
        <input type="hidden" id="irRmEditDate" value="${existing ? existing.date : ''}" />
        
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Select Ingredient</label>
          <select id="irRmIng" class="date-input" style="width:100%;padding:8px" onchange="IngredientReportView._updateRmCost(this)">
            <option value="">Select ingredient...</option>
            ${ingOpts}
          </select>
        </div>

        <div style="display:flex;gap:12px;margin-bottom:12px">
          <div style="flex:1">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Received Qty</label>
            <input type="number" id="irRmQty" class="date-input" style="width:100%;padding:8px" placeholder="0" value="${existing ? existing.qtyReceived : ''}" />
          </div>
          <div style="flex:1">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Unit Cost ($)</label>
            <input type="number" id="irRmCost" class="date-input" style="width:100%;padding:8px" placeholder="0" value="${existing ? existing.unitCost : ''}" />
          </div>
        </div>

        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Supplier Name</label>
          <input type="text" id="irRmSupplier" class="date-input" style="width:100%;padding:8px" value="${existing ? existing.supplier : 'Fresh Market Co.'}" />
        </div>
        
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Status</label>
          <select id="irRmStatus" class="date-input" style="width:100%;padding:8px">
            <option value="Completed" ${existing && existing.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Pending" ${existing && existing.status === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-outline btn-sm" onclick="Modal.close('genericModal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="IngredientReportView.saveRawMatForm()">Save Entry</button>
        </div>
      </div>
    `;

    document.getElementById('genericModalContent').innerHTML = html;
    Modal.open('genericModal');
  },

  _updateRmCost(sel) {
    const opt = sel.options[sel.selectedIndex];
    if(opt && opt.value) {
       document.getElementById('irRmCost').value = opt.getAttribute('data-cost');
    }
  },

  saveRawMatForm() {
    const ingSel = document.getElementById('irRmIng');
    const opt = ingSel.options[ingSel.selectedIndex];
    if (!opt || !opt.value) {
      Toast.show('Select an ingredient', 'warning'); return;
    }

    const qty = parseFloat(document.getElementById('irRmQty').value) || 0;
    const cost = parseFloat(document.getElementById('irRmCost').value) || 0;
    const sup = document.getElementById('irRmSupplier').value;
    const stat = document.getElementById('irRmStatus').value;

    if (qty <= 0) {
      Toast.show('Quantity must be greater than 0', 'warning'); return;
    }

    const id = opt.value;
    const name = opt.getAttribute('data-name');
    const unit = opt.getAttribute('data-unit');

    const editId = document.getElementById('irRmEditId').value;
    const editDate = document.getElementById('irRmEditDate').value;

    const dt = new Date();
    const formattedDate = editDate || `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;

    let list = this._getCustomPurchases();
    
    if (editId) {
      list = list.map(p => p.id === editId ? {
        ...p,
        ingredientId: id,
        ingredientName: name,
        unit: unit,
        qtyReceived: qty,
        unitCost: cost,
        supplier: sup,
        status: stat,
        date: formattedDate
      } : p);
      Toast.show('Purchase entry updated', 'success');
    } else {
      list.unshift({
        id: 'purch_' + Date.now(),
        ingredientId: id,
        ingredientName: name,
        unit: unit,
        qtyReceived: qty,
        unitCost: cost,
        supplier: sup,
        status: stat,
        date: formattedDate
      });
      Toast.show('Purchase entry saved', 'success');
    }

    this._saveCustomPurchases(list);
    Modal.close('genericModal');
    this._refresh();
  },

  deleteRawMat(id) {
    if(!confirm('Delete this purchase entry? This will permanently remove it from inventory logs.')) return;
    let list = this._getCustomPurchases();
    list = list.filter(p => p.id !== id);
    this._saveCustomPurchases(list);
    Toast.show('Purchase entry deleted', 'success');
    this._refresh();
  },

  // ── TAB 4: GENERAL EXPENSE
 _contentExpense(el) {
  const exps  = [...(DB.expenses || []), ...this._getCustomExpenses()];
  const total = exps.reduce((s, e) => s + (parseFloat(e.amount)||0), 0);
  const catMap = {};
  
  const colors = ['#c0392b','#2d7a47','#1a5276','#b8963e','#6d3b8e','#96281b','#c47a1a','#9b8c86'];
  
  exps.forEach((e, i) => {
    if (!catMap[e.category]) catMap[e.category] = { amount: 0, color: e.color || colors[Object.keys(catMap).length % colors.length] };
    catMap[e.category].amount += (parseFloat(e.amount)||0);
  });

  el.innerHTML = `
    <!-- Mobile: stack, Desktop: side by side -->
    <div class="flex flex-col lg:grid gap-4"
         style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)">

      <!-- Left: expense table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:14px 18px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">
            Expense Detail
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline btn-sm" onclick="IngredientReportView.exportCSV()">
              <i class="fa-solid fa-download"></i>
              <span class="hidden sm:inline">Export CSV</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="IngredientReportView.openAddExpenseModal()">
              <i class="fa-solid fa-plus"></i> Add Expense
            </button>
          </div>
        </div>

        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
          <table class="data-table" style="min-width:700px">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Branch</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${exps.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-3)">No expenses recorded</td></tr>' : ''}
              ${exps.map((e, idx) => {
                const status = e.status || 'Approved';
                const sCls   = status.toLowerCase() === 'pending' ? 'pending' : 'delivered';
                const color  = e.color || catMap[e.category].color;
                return `
                  <tr>
                    <td style="font-size:11px;color:var(--text-3);white-space:nowrap">
                      ${Utils.formatDate(e.date)}
                    </td>
                    <td>
                      <div style="display:flex;align-items:center;gap:7px">
                        <div style="width:8px;height:8px;border-radius:50%;
                                    background:${color};flex-shrink:0"></div>
                        <span style="font-weight:600;color:var(--text);white-space:nowrap">${e.category}</span>
                      </div>
                    </td>
                    <td style="color:var(--text-3);white-space:nowrap">${e.branch || 'All'}</td>
                    <td style="color:var(--text-3);font-size:11px;max-width:200px;
                               overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                      ${e.note || e.description || ''}
                    </td>
                    <td style="font-weight:700;font-family:'Playfair Display',serif;white-space:nowrap">
                      ${Utils.money(e.amount)}
                    </td>
                    <td><span class="tag tag-${sCls}">${status}</span></td>
                    <td>
                       ${e.isCustom ? `
                         <div style="display:flex;gap:8px">
                           <button onclick="IngredientReportView.openAddExpenseModal('${e.id}')" style="color:var(--text-3);background:none;border:none;cursor:pointer"><i class="fa-solid fa-pen"></i></button>
                           <button onclick="IngredientReportView.deleteExpense('${e.id}')" style="color:var(--red);background:none;border:none;cursor:pointer"><i class="fa-solid fa-trash"></i></button>
                         </div>
                       ` : ''}
                    </td>
                  </tr>`;
              }).join('')}
              <tr style="background:var(--bg-surface2)">
                <td colspan="4" style="font-weight:700;color:var(--text);text-align:right">Total</td>
                <td style="font-weight:900;font-family:'Playfair Display',serif;
                           font-size:14px;color:var(--red);white-space:nowrap">
                  ${Utils.money(total)}
                </td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: category summary -->
      <div class="card" style="padding:18px">
        <div style="font-family:'Playfair Display',serif;font-size:14px;font-weight:700;
                    margin-bottom:14px">Category Summary</div>
        ${Object.keys(catMap).length === 0 ? '<div style="font-size:12px;color:var(--text-3)">No data</div>' : ''}
        ${Object.entries(catMap).map(([cat, d]) => {
          const pct = total > 0 ? Math.round(d.amount / total * 100) : 0;
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;
                        padding:9px 0;border-bottom:1px solid var(--border)">
              <div style="display:flex;align-items:center;gap:8px;min-width:0">
                <div style="width:8px;height:8px;border-radius:50%;
                            background:${d.color};flex-shrink:0"></div>
                <span style="font-size:12px;color:var(--text);
                             overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${cat}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px">
                <span class="progress-bar" style="width:40px;height:4px;border-radius:2px;display:inline-block;background:var(--border);overflow:hidden">
                  <span style="display:block;height:100%;background:${d.color};width:${pct}%"></span>
                </span>
                <span style="font-size:11px;color:var(--text-3);width:24px;text-align:right">${pct}%</span>
                <span style="font-size:13px;font-weight:700;width:55px;text-align:right">${Utils.money(d.amount)}</span>
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

  openAddExpenseModal(editId = null) {
    const branches = ['All', 'Dhanmondi Branch', 'Gulshan Branch', 'Banani Branch', 'Uttara Branch'];
    const categories = ['Ingredients', 'Staff', 'Utilities', 'Equipment', 'Marketing', 'Cleaning', 'Beverages', 'Rent', 'Insurance', 'Other'];
    
    let existing = null;
    if (editId) {
       existing = this._getCustomExpenses().find(e => e.id === editId);
    }
    
    const html = `
      <div style="padding:20px;max-height:85vh;overflow-y:auto">
        <h3 style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:15px">
           ${existing ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <input type="hidden" id="irExpEditId" value="${existing ? existing.id : ''}" />
        
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Date</label>
          <input type="date" id="irExpDate" class="date-input" style="width:100%;padding:8px" value="${existing ? existing.date : new Date().toISOString().split('T')[0]}" />
        </div>

        <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Category</label>
            <select id="irExpCategory" class="date-input" style="width:100%;padding:8px">
              ${categories.map(c => `<option value="${c}" ${existing && existing.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div style="flex:1;min-width:140px">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Branch</label>
            <select id="irExpBranch" class="date-input" style="width:100%;padding:8px">
              ${branches.map(b => `<option value="${b}" ${existing && existing.branch === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Description / Note</label>
          <input type="text" id="irExpDesc" class="date-input" style="width:100%;padding:8px" placeholder="Details about this expense" value="${existing ? (existing.note || existing.description || '') : ''}" />
        </div>
        
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Amount ($)</label>
            <input type="number" id="irExpAmount" step="0.01" min="0" class="date-input" style="width:100%;padding:8px" placeholder="0.00" value="${existing ? existing.amount : ''}" />
          </div>
          <div style="flex:1;min-width:140px">
            <label style="display:block;font-size:12px;color:var(--text-3);margin-bottom:4px">Status</label>
            <select id="irExpStatus" class="date-input" style="width:100%;padding:8px">
              <option value="Approved" ${existing && existing.status === 'Approved' ? 'selected' : ''}>Approved</option>
              <option value="Pending" ${existing && existing.status === 'Pending' ? 'selected' : ''}>Pending</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-outline btn-sm" onclick="Modal.close('genericModal')">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="IngredientReportView.saveExpenseForm()">Save Expense</button>
        </div>
      </div>
    `;

    document.getElementById('genericModalContent').innerHTML = html;
    Modal.open('genericModal');
  },

  saveExpenseForm() {
    const date = document.getElementById('irExpDate').value;
    const cat = document.getElementById('irExpCategory').value;
    const branch = document.getElementById('irExpBranch').value;
    const desc = document.getElementById('irExpDesc').value;
    const amt = parseFloat(document.getElementById('irExpAmount').value) || 0;
    const status = document.getElementById('irExpStatus').value;

    if (amt <= 0) {
      Toast.show('Amount must be greater than 0', 'warning'); return;
    }
    if (!desc) {
      Toast.show('Please provide a description', 'warning'); return;
    }

    const editId = document.getElementById('irExpEditId').value;
    let list = this._getCustomExpenses();
    
    if (editId) {
      list = list.map(e => e.id === editId ? {
        ...e,
        date, category: cat, branch, description: desc, note: desc, amount: amt, status
      } : e);
      Toast.show('Expense updated', 'success');
    } else {
      list.unshift({
        id: 'exp_' + Date.now(),
        date,
        category: cat,
        branch,
        description: desc,
        note: desc,
        amount: amt,
        status,
        isCustom: true
      });
      Toast.show('Expense saved', 'success');
    }

    this._saveCustomExpenses(list);
    Modal.close('genericModal');
    this._refresh();
  },

  deleteExpense(id) {
    if(!confirm('Delete this expense?')) return;
    let list = this._getCustomExpenses();
    list = list.filter(e => e.id !== id);
    this._saveCustomExpenses(list);
    Toast.show('Expense deleted', 'success');
    this._refresh();
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