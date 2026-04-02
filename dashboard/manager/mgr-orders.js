/* ================================================
   SAVORIA — MANAGER ORDERS VIEW  (mgr-orders.js)
   Full order oversight with all statuses & filters
================================================ */

const MgrOrdersView = {

  _filter: 'all',
  _search: '',

  render() {
    const orders = this._filtered();
    const counts = {
      all:       DB.orders.length,
      pending:   DB.orders.filter(o=>o.status==='pending').length,
      preparing: DB.orders.filter(o=>o.status==='preparing').length,
      ready:     DB.orders.filter(o=>o.status==='ready').length,
      delivered: DB.orders.filter(o=>o.status==='delivered').length,
      cancelled: DB.orders.filter(o=>o.status==='cancelled').length,
    };

    return `
      <style>
        .mo-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px}
        .mo-filter-bar{display:flex;gap:4px;background:var(--bg-input);border-radius:8px;padding:3px;overflow-x:auto;scrollbar-width:none;flex-wrap:wrap;margin-bottom:16px}
        .mo-filter-btn{padding:5px 13px;border-radius:6px;border:none;font-family:inherit;font-size:11px;font-weight:600;color:var(--text-3);background:transparent;cursor:pointer;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:5px}
        .mo-filter-btn.active{background:var(--bg-surface);color:var(--text);box-shadow:var(--shadow-sm)}
        .mo-filter-btn .cnt{background:var(--bg-input);border-radius:20px;padding:1px 6px;font-size:9px}
        .mo-filter-btn.active .cnt{background:var(--red-pale);color:var(--red)}
        .mo-search-bar{display:flex;align-items:center;gap:8px;background:var(--bg-input);border-radius:8px;padding:8px 12px;margin-bottom:16px}
        .mo-search-bar input{border:none;background:transparent;font-family:inherit;font-size:12px;color:var(--text);outline:none;flex:1}
        .mo-table{width:100%;border-collapse:collapse}
        .mo-table th{font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;padding:8px 12px;border-bottom:1px solid var(--border);text-align:left;white-space:nowrap}
        .mo-table td{padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-2);vertical-align:middle}
        .mo-table tr:last-child td{border-bottom:none}
        .mo-table tr:hover td{background:var(--bg-surface2)}
        @media(max-width:700px){
          .mo-table th:nth-child(3),.mo-table td:nth-child(3),
          .mo-table th:nth-child(5),.mo-table td:nth-child(5){display:none}
        }
        @media(max-width:480px){
          .mo-table th:nth-child(4),.mo-table td:nth-child(4){display:none}
        }
        .mo-empty{text-align:center;padding:48px 0;color:var(--text-3)}
        .mo-kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
        @media(max-width:600px){.mo-kpi-row{grid-template-columns:1fr 1fr}}
      </style>

      <div class="mo-header">
        <div>
          <div class="page-title"><i class="fa-solid fa-receipt" style="color:var(--gold);margin-right:8px"></i>All Orders</div>
          <div class="page-subtitle">Complete order oversight and management</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" onclick="Toast.show('Orders exported to CSV','info')">
            <i class="fa-solid fa-file-csv"></i> Export
          </button>
        </div>
      </div>

      <!-- KPI -->
      <div class="mo-kpi-row">
        <div class="card" style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--gold-pale);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:16px;flex-shrink:0"><i class="fa-solid fa-receipt"></i></div>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900">${DB.orders.length}</div>
            <div style="font-size:11px;color:var(--text-3)">Total Orders</div>
          </div>
        </div>
        <div class="card" style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:16px;flex-shrink:0"><i class="fa-solid fa-circle-check"></i></div>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900">${Utils.money(DB.orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0),0))}</div>
            <div style="font-size:11px;color:var(--text-3)">Revenue from Orders</div>
          </div>
        </div>
        <div class="card" style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--orange-pale);display:flex;align-items:center;justify-content:center;color:var(--orange);font-size:16px;flex-shrink:0"><i class="fa-solid fa-clock"></i></div>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900">${counts.pending + counts.preparing}</div>
            <div style="font-size:11px;color:var(--text-3)">Active / In Progress</div>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="mo-search-bar">
        <i class="fa-solid fa-magnifying-glass" style="color:var(--text-3);font-size:12px"></i>
        <input id="moSearch" type="text" placeholder="Search by order ID, table, customer…" value="${this._search}"
          oninput="MgrOrdersView._doSearch(this.value)"/>
        ${this._search?`<button style="border:none;background:none;color:var(--text-3);cursor:pointer" onclick="MgrOrdersView._doSearch('')"><i class="fa-solid fa-xmark"></i></button>`:''}
      </div>

      <!-- Filter bar -->
      <div class="mo-filter-bar">
        ${[
          ['all','All',counts.all],
          ['pending','Pending',counts.pending],
          ['preparing','Preparing',counts.preparing],
          ['ready','Ready',counts.ready],
          ['delivered','Delivered',counts.delivered],
          ['cancelled','Cancelled',counts.cancelled],
        ].map(([v,l,c])=>`
          <button class="mo-filter-btn ${this._filter===v?'active':''}" onclick="MgrOrdersView._setFilter('${v}')">
            ${l}<span class="cnt">${c}</span>
          </button>`).join('')}
      </div>

      <!-- Table -->
      <div class="card">
        ${orders.length === 0 ? `
          <div class="mo-empty">
            <i class="fa-solid fa-inbox" style="font-size:32px;margin-bottom:10px"></i>
            <div style="font-size:14px;font-weight:600">No orders found</div>
            <div style="font-size:11px;margin-top:4px">${this._search ? 'Try a different search term' : 'No orders in this category yet'}</div>
          </div>
        ` : `
          <table class="mo-table">
            <thead>
              <tr>
                <th>Order</th><th>Table</th><th>Items</th><th>Total</th><th>Time</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => {
                const st = ORDER_STATUS[o.status] || { label:o.status, tagClass:'tag-pending' };
                return `
                  <tr>
                    <td style="font-weight:700;color:var(--text)">${o.id}</td>
                    <td><span class="tag" style="background:var(--blue-pale);color:var(--blue);font-size:9px">T-${o.table||'?'}</span></td>
                    <td>${(o.items||[]).length} item${(o.items||[]).length!==1?'s':''}</td>
                    <td style="font-weight:700;color:var(--text)">${Utils.money(o.total||0)}</td>
                    <td>${Utils.timeAgo(o.created)}</td>
                    <td><span class="tag ${st.tagClass}">${st.label}</span></td>
                    <td>
                      <div style="display:flex;gap:4px">
                        <button class="btn btn-outline btn-sm btn-icon" title="View" onclick="MgrOrdersView._viewOrder('${o.id}')">
                          <i class="fa-solid fa-eye"></i>
                        </button>
                        ${st.next ? `<button class="btn btn-primary btn-sm btn-icon" title="Advance status" onclick="MgrOrdersView._advance('${o.id}')">
                          <i class="fa-solid fa-arrow-right"></i>
                        </button>` : ''}
                        ${o.status==='pending'||o.status==='preparing'?`<button class="btn btn-danger btn-sm btn-icon" title="Cancel" onclick="MgrOrdersView._cancel('${o.id}')">
                          <i class="fa-solid fa-ban"></i>
                        </button>`:''}
                      </div>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  },

  _filtered() {
    let orders = [...DB.orders];
    if (this._filter !== 'all') orders = orders.filter(o=>o.status===this._filter);
    if (this._search) {
      const q = this._search.toLowerCase();
      orders = orders.filter(o =>
        (o.id||'').toLowerCase().includes(q) ||
        String(o.table||'').includes(q) ||
        (o.customer||'').toLowerCase().includes(q)
      );
    }
    return orders;
  },

  _setFilter(f) {
    this._filter = f;
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _doSearch(q) {
    this._search = q;
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
    const inp = document.getElementById('moSearch');
    if (inp) { inp.focus(); inp.setSelectionRange(q.length, q.length); }
  },

  _viewOrder(id) {
    const o = DB.orders.find(x=>x.id===id);
    if (!o) return;
    const st = ORDER_STATUS[o.status] || { label: o.status, tagClass:'tag-pending' };
    document.getElementById('orderModalContent').innerHTML = `
      <div style="padding:4px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700">Order ${o.id}</div>
            <div style="font-size:12px;color:var(--text-3)">Table ${o.table||'?'} · ${Utils.timeAgo(o.created)}</div>
          </div>
          <span class="tag ${st.tagClass}">${st.label}</span>
        </div>
        <div style="margin-bottom:14px">
          ${(o.items||[]).map(item=>`
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:13px">${item.emoji||''} ${item.name}</span>
              <span style="font-size:13px;font-weight:600">${Utils.money((item.price||0)*(item.qty||1))}</span>
            </div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;padding-top:8px">
          <span>Total</span><span style="color:var(--green)">${Utils.money(o.total||0)}</span>
        </div>
        ${o.notes?`<div style="margin-top:12px;padding:10px;background:var(--orange-pale);border-radius:8px;font-size:12px;color:var(--orange)"><i class="fa-solid fa-note-sticky" style="margin-right:6px"></i>${o.notes}</div>`:''}
      </div>`;
    Modal.open('orderModal');
  },

  async _advance(id) {
    const o = DB.orders.find(x=>x.id===id);
    if (!o) return;
    const st = ORDER_STATUS[o.status];
    if (!st?.next) return;
    try {
      await API.updateOrderStatus(id, st.next);
      Toast.show(`Order ${id} → ${ORDER_STATUS[st.next].label}`, 'success');
    } catch(e) {
      o.status = st.next;
      Toast.show(`Order ${id} → ${ORDER_STATUS[st.next].label}`, 'success');
    }
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  async _cancel(id) {
    try { await API.cancelOrder(id); }
    catch(e) { const o = DB.orders.find(x=>x.id===id); if(o) o.status='cancelled'; }
    Toast.show(`Order ${id} cancelled`, 'error');
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  init() {},
};
