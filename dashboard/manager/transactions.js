/* ================================================
   TRANSACTIONS VIEW  (views/transactions.js)
   Dynamic, responsive — uses DB.transactions
================================================ */

const TransactionsView = {

  _search:  '',
  _filter:  'all',   // all | completed | pending | refunded
  _sort:    'date',  // date | amount | customer

  /* ────────────────────────────────────────────
     render()
  ──────────────────────────────────────────── */
  render() {
    return `
      <style>
        /* ── Summary grid ── */
        .txn-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .txn-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .txn-kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        }

        /* ── Toolbar ── */
        .txn-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .txn-toolbar .topbar-search {
          flex: 1;
          min-width: 160px;
          max-width: 280px;
        }
        .txn-filter-bar {
          display: flex;
          gap: 4px;
          background: var(--bg-input);
          border-radius: 8px;
          padding: 3px;
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .txn-filter-bar::-webkit-scrollbar { display: none; }

        /* ── Table wrapper (horizontal scroll on mobile) ── */
        .txn-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Hide less-important cols on small screens ── */
        @media (max-width: 600px) {
          .txn-col-time,
          .txn-col-order { display: none; }
        }
        @media (max-width: 420px) {
          .txn-col-method { display: none; }
        }

        /* ── Method badge ── */
        .txn-method {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .04em;
        }
        .txn-method.card {
          background: var(--blue-pale);
          color: var(--blue);
        }
        .txn-method.cash {
          background: var(--green-pale);
          color: var(--green);
        }

        /* ── Empty state ── */
        .txn-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-3);
        }
        .txn-empty i {
          font-size: 36px;
          display: block;
          margin-bottom: 12px;
          opacity: .25;
        }
        .txn-empty p {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-3);
        }
        .txn-empty span { font-size: 12px; opacity: .7; }
      </style>

      <!-- Page Header -->
      <div class="page-header anim-1">
        <div>
          <div class="page-subtitle">Management</div>
          <h1 class="page-title">Transa<em style="color:var(--red);font-style:italic">ctions</em></h1>
        </div>
        <button class="btn btn-outline btn-sm" onclick="TransactionsView._exportCSV()">
          <i class="fa-solid fa-download"></i> Export
        </button>
      </div>

      <!-- KPI Summary Cards -->
      <div class="txn-kpi-grid anim-1">
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value" id="kpiTotal">—</div>
              <div class="stat-sub">Completed only</div>
            </div>
            <div class="stat-icon" style="background:var(--green-pale);color:var(--green)">
              <i class="fa-solid fa-dollar-sign"></i>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Transactions</div>
              <div class="stat-value" id="kpiCount">—</div>
              <div class="stat-sub">All statuses</div>
            </div>
            <div class="stat-icon" style="background:var(--blue-pale);color:var(--blue)">
              <i class="fa-solid fa-receipt"></i>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Pending</div>
              <div class="stat-value" id="kpiPending" style="color:var(--orange)">—</div>
              <div class="stat-sub" id="kpiPendingAmt"></div>
            </div>
            <div class="stat-icon" style="background:var(--orange-pale);color:var(--orange)">
              <i class="fa-solid fa-clock"></i>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-row">
            <div>
              <div class="stat-label">Refunded</div>
              <div class="stat-value" id="kpiRefunded" style="color:var(--red)">—</div>
              <div class="stat-sub" id="kpiRefundedAmt"></div>
            </div>
            <div class="stat-icon" style="background:var(--red-pale);color:var(--red)">
              <i class="fa-solid fa-rotate-left"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Toolbar: search + filter + sort -->
      <div class="txn-toolbar anim-2">

        <!-- Search -->
        <div class="topbar-search" style="max-width:260px">
          <i class="fa-solid fa-magnifying-glass" style="color:var(--text-3);font-size:12px"></i>
          <input type="text" placeholder="Search customer, order…"
            oninput="TransactionsView._onSearch(this.value)"/>
        </div>

        <!-- Status filter -->
        <div class="txn-filter-bar" id="txnFilterBar">
          ${['all','completed','pending','refunded'].map(f => `
            <button class="tab-btn ${this._filter === f ? 'active' : ''}"
              onclick="TransactionsView._setFilter('${f}', this)">
              ${f.charAt(0).toUpperCase() + f.slice(1)}
            </button>`).join('')}
        </div>

        <!-- Sort -->
        <select class="form-control" style="width:auto;padding:6px 10px;font-size:11px"
          onchange="TransactionsView._setSort(this.value)">
          <option value="date"     ${this._sort==='date'     ? 'selected':''}>Latest first</option>
          <option value="amount"   ${this._sort==='amount'   ? 'selected':''}>Highest amount</option>
          <option value="customer" ${this._sort==='customer' ? 'selected':''}>Customer A–Z</option>
        </select>

        <!-- Result count -->
        <span id="txnResultCount" style="font-size:11px;color:var(--text-3);white-space:nowrap;margin-left:auto"></span>
      </div>

      <!-- Transactions Table -->
      <div class="card anim-2" style="padding:0">
        <div class="txn-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th class="txn-col-order">Order</th>
                <th>Customer</th>
                <th class="txn-col-method">Method</th>
                <th class="txn-col-time">Time</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="txnBody">
              <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-3)">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading…
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ────────────────────────────────────────────
     init()
  ──────────────────────────────────────────── */
  init() {
    this._search = '';
    this._filter = 'all';
    this._sort   = 'date';
    this._updateKPIs();
    this._renderTable();
  },

  /* ── KPI calculations ── */
  _updateKPIs() {
    const txns = DB.transactions;

    const completed = txns.filter(t => t.status === 'completed');
    const pending   = txns.filter(t => t.status === 'pending');
    const refunded  = txns.filter(t => t.status === 'refunded');

    const totalRev      = completed.reduce((s, t) => s + t.amount, 0);
    const pendingAmt    = pending.reduce((s, t) => s + t.amount, 0);
    const refundedAmt   = refunded.reduce((s, t) => s + t.amount, 0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('kpiTotal',       Utils.money(totalRev));
    set('kpiCount',       txns.length);
    set('kpiPending',     pending.length);
    set('kpiPendingAmt',  Utils.money(pendingAmt) + ' pending');
    set('kpiRefunded',    refunded.length);
    set('kpiRefundedAmt', Utils.money(refundedAmt) + ' refunded');
  },

  /* ── Search handler ── */
  _onSearch(val) {
    this._search = val.toLowerCase().trim();
    this._renderTable();
  },

  /* ── Filter ── */
  _setFilter(f, btn) {
    this._filter = f;
    document.querySelectorAll('#txnFilterBar .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._renderTable();
  },

  /* ── Sort ── */
  _setSort(val) {
    this._sort = val;
    this._renderTable();
  },

  /* ── Get filtered + sorted data ── */
  _getRows() {
    let rows = [...DB.transactions];

    /* Filter by status */
    if (this._filter !== 'all') {
      rows = rows.filter(t => t.status === this._filter);
    }

    /* Search */
    if (this._search) {
      rows = rows.filter(t =>
        t.customer.toLowerCase().includes(this._search) ||
        t.id.toLowerCase().includes(this._search) ||
        t.orderId.toLowerCase().includes(this._search)
      );
    }

    /* Sort */
    if (this._sort === 'amount') {
      rows.sort((a, b) => b.amount - a.amount);
    } else if (this._sort === 'customer') {
      rows.sort((a, b) => a.customer.localeCompare(b.customer));
    } else {
      /* date — latest first (id is sequential so works fine) */
      rows.sort((a, b) => b.id.localeCompare(a.id));
    }

    return rows;
  },

  /* ── Render table body ── */
  _renderTable() {
    const tbody = document.getElementById('txnBody');
    if (!tbody) return;

    const rows   = this._getRows();
    const countEl = document.getElementById('txnResultCount');
    if (countEl) countEl.textContent = `${rows.length} result${rows.length !== 1 ? 's' : ''}`;

    if (!rows.length) {
      tbody.innerHTML = `
        <tr><td colspan="7">
          <div class="txn-empty">
            <i class="fa-solid fa-magnifying-glass"></i>
            <p>No transactions found</p>
            <span>Try adjusting your search or filter</span>
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(t => {
      const statusCfg = {
        completed: { cls: 'tag-delivered', label: 'Completed' },
        pending:   { cls: 'tag-pending',   label: 'Pending'   },
        refunded:  { cls: 'tag-refunded',  label: 'Refunded'  },
      }[t.status] || { cls: 'tag-regular', label: t.status };

      const methodIcon = t.method === 'card'
        ? '<i class="fa-solid fa-credit-card"></i>'
        : '<i class="fa-solid fa-money-bill-wave"></i>';

      const amtColor = t.status === 'refunded'
        ? 'color:var(--red)'
        : t.status === 'pending'
          ? 'color:var(--orange)'
          : 'color:var(--green)';

      const amtPrefix = t.status === 'refunded' ? '−' : '';

      return `
        <tr style="cursor:pointer" onclick="TransactionsView._viewDetail('${t.id}')">
          <td>
            <span style="font-family:'Playfair Display',serif;font-weight:700;
              font-size:12px;color:var(--text-3)">${t.id}</span>
          </td>
          <td class="txn-col-order">
            <span style="font-weight:600;color:var(--blue)">${t.orderId}</span>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:28px;height:28px;border-radius:50%;
                background:var(--bg-input);border:1px solid var(--border);
                display:flex;align-items:center;justify-content:center;
                font-size:11px;font-weight:700;color:var(--text-2);flex-shrink:0">
                ${t.customer.charAt(0)}
              </div>
              <span style="font-weight:600">${t.customer}</span>
            </div>
          </td>
          <td class="txn-col-method">
            <span class="txn-method ${t.method}">
              ${methodIcon} ${t.method}
            </span>
          </td>
          <td class="txn-col-time" style="font-size:11px;color:var(--text-3)">
            <div>${t.date}</div>
            <div style="font-size:10px">${t.time}</div>
          </td>
          <td>
            <span style="font-family:'Playfair Display',serif;font-weight:700;
              font-size:14px;${amtColor}">
              ${amtPrefix}${Utils.money(t.amount)}
            </span>
          </td>
          <td>
            <span class="tag ${statusCfg.cls}">${statusCfg.label}</span>
          </td>
        </tr>`;
    }).join('');
  },

  /* ── Detail modal ── */
  _viewDetail(id) {
    const t = DB.transactions.find(x => x.id === id);
    if (!t) return;

    const statusCfg = {
      completed: { cls: 'tag-delivered', label: 'Completed', icon: 'fa-circle-check',  color: 'var(--green)'  },
      pending:   { cls: 'tag-pending',   label: 'Pending',   icon: 'fa-clock',          color: 'var(--orange)' },
      refunded:  { cls: 'tag-refunded',  label: 'Refunded',  icon: 'fa-rotate-left',    color: 'var(--red)'    },
    }[t.status] || { cls: 'tag-regular', label: t.status, icon: 'fa-circle', color: 'var(--text-3)' };

    const content = document.getElementById('orderModalContent')
                 || document.getElementById('genericModalContent')
                 || document.getElementById('customerModalContent');
    if (!content) return;

    content.innerHTML = `
      <div class="modal-title">Transaction Details</div>

      <!-- Status banner -->
      <div style="display:flex;align-items:center;gap:10px;
        background:var(--bg-surface2);border:1px solid var(--border);
        border-radius:10px;padding:14px 16px;margin-bottom:20px">
        <div style="width:38px;height:38px;border-radius:10px;
          background:${statusCfg.color}22;
          display:flex;align-items:center;justify-content:center">
          <i class="fa-solid ${statusCfg.icon}" style="color:${statusCfg.color};font-size:16px"></i>
        </div>
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700">
            ${Utils.money(t.amount)}
          </div>
          <span class="tag ${statusCfg.cls}">${statusCfg.label}</span>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div style="font-size:11px;color:var(--text-3)">Transaction ID</div>
          <div style="font-weight:700;font-size:13px">${t.id}</div>
        </div>
      </div>

      <!-- Details grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
        ${[
          { label: 'Customer',   val: t.customer          },
          { label: 'Order',      val: t.orderId           },
          { label: 'Method',     val: t.method.charAt(0).toUpperCase() + t.method.slice(1) },
          { label: 'Date',       val: t.date              },
          { label: 'Time',       val: t.time              },
          { label: 'Status',     val: statusCfg.label     },
        ].map(r => `
          <div class="form-group">
            <div class="form-label">${r.label}</div>
            <div style="font-size:13px;font-weight:600">${r.val}</div>
          </div>`).join('')}
      </div>

      <div style="display:flex;gap:8px;justify-content:flex-end">
        ${t.status === 'pending' ? `
          <button class="btn btn-green btn-sm"
            onclick="TransactionsView._markComplete('${t.id}')">
            <i class="fa-solid fa-check"></i> Mark Complete
          </button>` : ''}
        <button class="btn btn-outline btn-sm"
          onclick="Modal.close('${
            document.getElementById('orderModal') ? 'orderModal' :
            document.getElementById('genericModal') ? 'genericModal' : 'customerModal'
          }')">
          Close
        </button>
      </div>`;

    const modalId = document.getElementById('orderModal')   ? 'orderModal'   :
                    document.getElementById('genericModal')  ? 'genericModal' : 'customerModal';
    Modal.open(modalId);
  },

  /* ── Mark pending → completed ── */
  _markComplete(id) {
    const t = DB.transactions.find(x => x.id === id);
    if (!t) return;
    t.status = 'completed';
    this._updateKPIs();
    this._renderTable();

    /* close any open modal */
    ['orderModal','genericModal','customerModal'].forEach(mid => {
      const el = document.getElementById(mid);
      if (el?.classList.contains('show')) Modal.close(mid);
    });

    Toast.show(`Transaction ${id} marked as completed`, 'success');
  },

  /* ── Export CSV ── */
  _exportCSV() {
    const rows  = this._getRows();
    const heads = ['ID','Order','Customer','Method','Date','Time','Amount','Status'];
    const lines = [
      heads.join(','),
      ...rows.map(t =>
        [t.id, t.orderId, `"${t.customer}"`, t.method, t.date, t.time, t.amount, t.status].join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `transactions_${Utils.today()}.csv`;
    a.click();
    Toast.show('CSV exported!', 'success');
  },
};