/* ================================================
   ORDERS VIEW  (views/orders.js)

   Shows all orders with 6 status filters.
   advance() → API.updateOrderStatus (AJAX PATCH)
   cancel()  → API.cancelOrder       (AJAX DELETE)
   refresh() → re-renders from current DB.orders
================================================ */

const OrdersView = {

  /* ── STATE ── */
  currentFilter: 'all',

  /* ────────────────────────────────────────────
     render()
  ──────────────────────────────────────────── */
  render() {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Orders</h1>
          <p class="page-subtitle">Manage and track all restaurant orders</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" onclick="OrdersView.refresh()">
            <i class="fa-solid fa-rotate"></i> Refresh
          </button>
          <button class="btn btn-primary btn-sm" onclick="Router.go('getorder')">
            <i class="fa-solid fa-plus"></i> New Order
          </button>
        </div>
      </div>

      <!-- Status count pills -->
      <div id="statusPills" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap"></div>

      <!-- Filter tabs -->
      <div class="tab-bar" id="orderTabs">
        <button class="tab-btn active" onclick="OrdersView.setFilter('all',this)">All</button>
        <button class="tab-btn" onclick="OrdersView.setFilter('pending',this)">🟠 Pending</button>
        <button class="tab-btn" onclick="OrdersView.setFilter('preparing',this)">🔵 Preparing</button>
        <button class="tab-btn" onclick="OrdersView.setFilter('ready',this)">🟡 Ready</button>
        <button class="tab-btn" onclick="OrdersView.setFilter('confirmed',this)">🟣 Confirmed</button>
        <button class="tab-btn" onclick="OrdersView.setFilter('delivered',this)">🟢 Delivered</button>
        <button class="tab-btn" onclick="OrdersView.setFilter('cancelled',this)">🔴 Cancelled</button>
      </div>

      <!-- Orders table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Table</th><th>Customer</th>
                <th>Items</th><th>Total</th><th>Status</th>
                <th>Time</th><th>Actions</th>
              </tr>
            </thead>
            <tbody id="ordersTableBody"></tbody>
          </table>
        </div>
      </div>`;
  },

  /* ────────────────────────────────────────────
     init()
  ──────────────────────────────────────────── */
  init() {
    this.currentFilter = 'all';
    this.renderStatusPills();
    this.renderTable();
  },

  /* ── STATUS PILLS ── */
  renderStatusPills() {
    const counts = {};
    DB.orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

    const el = document.getElementById('statusPills');
    if (!el) return;

    el.innerHTML = Object.keys(ORDER_STATUS).map(s => `
      <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;padding:6px 14px;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700">
        <span class="tag ${ORDER_STATUS[s].tagClass}" style="padding:1px 6px">${ORDER_STATUS[s].label}</span>
        <span style="color:var(--text)">${counts[s] || 0}</span>
      </div>`).join('');
  },

  /* ── FILTER TABS ── */
  setFilter(status, btn) {
    this.currentFilter = status;
    document.querySelectorAll('#orderTabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderTable();
  },

  /* ── TABLE ROWS ── */
  renderTable() {
    const orders = this.currentFilter === 'all'
      ? DB.orders
      : DB.orders.filter(o => o.status === this.currentFilter);

    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (!orders.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:40px;color:var(--text-3)">
            No orders found
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => this._rowHTML(o)).join('');
  },

  /* ── SINGLE ROW ── */
  _rowHTML(o) {
    const cfg       = ORDER_STATUS[o.status];
    const nextCfg   = cfg.next ? ORDER_STATUS[cfg.next] : null;
    const canCancel = o.status !== 'delivered' && o.status !== 'cancelled';

    return `
      <tr id="row-${o.id.replace('#','')}">
        <td><b style="font-family:'Playfair Display',serif">${o.id}</b></td>
        <td>
          <span style="background:var(--gold-pale);color:var(--gold);font-weight:700;padding:3px 8px;border-radius:6px;font-size:11px">
            T-${o.table}
          </span>
        </td>
        <td style="font-weight:500">${o.customer}</td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-3)">
          ${o.items.join(', ')}
        </td>
        <td style="font-weight:700;color:var(--green)">${Utils.money(o.total)}</td>
        <td><span class="tag ${cfg.tagClass}">${cfg.label}</span></td>
        <td style="color:var(--text-3)">${Utils.timeAgo(o.created)}</td>
        <td>
          <div style="display:flex;gap:4px">
            <!-- View detail -->
            <button class="btn btn-outline btn-sm" onclick="OrdersView.viewOrder('${o.id}')">
              <i class="fa-solid fa-eye"></i>
            </button>
            <!-- Advance status — AJAX PATCH -->
            ${nextCfg ? `
              <button class="btn btn-primary btn-sm" id="adv-${o.id.replace('#','')}"
                onclick="OrdersView.advance('${o.id}')">
                → ${nextCfg.label}
              </button>` : ''}
            <!-- Cancel — AJAX DELETE -->
            ${canCancel ? `
              <button class="btn btn-danger btn-sm" id="cxl-${o.id.replace('#','')}"
                onclick="OrdersView.cancel('${o.id}')">✕</button>` : ''}
          </div>
        </td>
      </tr>`;
  },

  /* ── MODAL: view order detail ── */
  viewOrder(id) {
    const o   = DB.orders.find(x => x.id === id);
    if (!o) return;
    const cfg       = ORDER_STATUS[o.status];
    const nextCfg   = cfg.next ? ORDER_STATUS[cfg.next] : null;
    const canCancel = o.status !== 'delivered' && o.status !== 'cancelled';

    document.getElementById('orderModalContent').innerHTML = `
      <div class="modal-title">Order ${o.id}</div>
      <div class="grid-2" style="margin-bottom:16px">
        <div class="card" style="padding:12px;box-shadow:none">
          <p style="font-size:10px;color:var(--text-3);text-transform:uppercase">Table</p>
          <p style="font-size:18px;font-weight:700;font-family:'Playfair Display',serif">Table ${o.table}</p>
        </div>
        <div class="card" style="padding:12px;box-shadow:none">
          <p style="font-size:10px;color:var(--text-3);text-transform:uppercase">Customer</p>
          <p style="font-size:14px;font-weight:600">${o.customer}</p>
        </div>
      </div>
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);margin-bottom:8px">Items</p>
      ${o.items.map(item => `
        <div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">${item}</div>`).join('')}
      <div style="display:flex;justify-content:space-between;padding:16px 0;font-weight:700;font-size:16px;border-top:2px solid var(--border);margin-top:8px">
        <span>Total</span>
        <span style="color:var(--green)">${Utils.money(o.total)}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <span>Status</span>
        <span class="tag ${cfg.tagClass}">${cfg.label}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${nextCfg ? `
          <button class="btn btn-primary" onclick="OrdersView.advance('${o.id}');Modal.close('orderModal')">
            <i class="fa-solid fa-arrow-right"></i> Move to ${nextCfg.label}
          </button>` : ''}
        ${canCancel ? `
          <button class="btn btn-danger" onclick="OrdersView.cancel('${o.id}');Modal.close('orderModal')">
            <i class="fa-solid fa-ban"></i> Cancel Order
          </button>` : ''}
      </div>`;

    Modal.open('orderModal');
  },

  /* ────────────────────────────────────────────
     advance() — AJAX PATCH দিয়ে status বাড়ায়
  ──────────────────────────────────────────── */
  async advance(id) {
    const o = DB.orders.find(x => x.id === id);
    if (!o || !ORDER_STATUS[o.status].next) return;

    const nextStatus = ORDER_STATUS[o.status].next;

    // Button loading state
    const btn = document.getElementById(`adv-${id.replace('#','')}`);
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }

    try {
      // ── AJAX PATCH ──
      await API.updateOrderStatus(id, nextStatus);

      // o.status ইতিমধ্যে API এর ভেতরে update হয়ে গেছে
      Toast.show(`Order ${id} → ${ORDER_STATUS[nextStatus].label}`, 'success');

    } catch (err) {
      console.error('Advance error:', err);
      Toast.show('Status update failed. Try again.', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = `→ ${ORDER_STATUS[nextStatus].label}`; }
      return;
    }

    this.renderStatusPills();
    this.renderTable();
  },

  /* ────────────────────────────────────────────
     cancel() — AJAX DELETE দিয়ে cancel করে
  ──────────────────────────────────────────── */
  async cancel(id) {
    const o = DB.orders.find(x => x.id === id);
    if (!o) return;

    // Button loading
    const btn = document.getElementById(`cxl-${id.replace('#','')}`);
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }

    try {
      // ── AJAX DELETE ──
      await API.cancelOrder(id);

      Toast.show(`Order ${id} cancelled`, 'warning');

    } catch (err) {
      console.error('Cancel error:', err);
      Toast.show('Cancel failed. Try again.', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '✕'; }
      return;
    }

    this.renderStatusPills();
    this.renderTable();
  },

  /* ── Refresh — DB.orders থেকে re-render ── */
  refresh() {
    this.renderStatusPills();
    this.renderTable();
    Toast.show('Orders refreshed', 'info');
  },
};