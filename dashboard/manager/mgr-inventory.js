const MgrInventoryView = {

  _activeTab: 'all',

  render() {
    const items = this._activeTab === 'all' ? DB.inventory :
                  this._activeTab === 'low' ? DB.inventory.filter(i=>i.status==='low'||i.status==='out') :
                  DB.inventory.filter(i=>i.cat===this._activeTab);
    const cats = [...new Set(DB.inventory.map(i=>i.cat))];

    return `
      <style>
        .mi-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px}
        .mi-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        @media(max-width:700px){
        .mi-stats{grid-template-columns:repeat(2,1fr)}
        }
        .mi-tabs{
        display:flex;
        gap:4px;
        background:var(--bg-input);
        border-radius:8px;
        padding:3px;
        margin-bottom:16px;
        overflow-x:auto;
        scrollbar-width:none;
        flex-wrap:wrap
        }
        .mi-tab{
        padding:5px 12px;
        border-radius:6px;
        border:none;
        font-family:inherit;
        font-size:11px;
        font-weight:600;
        color:var(--text-3);
        background:transparent;
        cursor:pointer;
        transition:all .2s;
        white-space:nowrap
        }
        .mi-tab.active{
        background:var(--bg-surface);
        color:var(--text);
        box-shadow:var(--shadow-sm)
        }
        .mi-table{width:100%;border-collapse:collapse}
        .mi-table th{font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;padding:8px 12px;border-bottom:1px solid var(--border);text-align:left}
        .mi-table td{padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-2)}
        .mi-table tr:last-child td{border-bottom:none}
        .mi-table tr:hover td{background:var(--bg-surface2)}
        .mi-qty-bar{height:4px;border-radius:2px;margin-top:4px;overflow:hidden;background:var(--border)}
        .mi-qty-fill{height:100%;border-radius:2px}
        @media(max-width:640px){.mi-table thead{display:none}.mi-table tr{display:flex;flex-wrap:wrap;padding:10px;border-bottom:1px solid var(--border)}.mi-table td{border:none;padding:2px 6px;font-size:11px}}
      </style>

      <div class="mi-header">
        <div>
          <div class="page-title"><i class="fa-solid fa-boxes-stacked" style="color:var(--gold);margin-right:8px"></i>Inventory</div>
          <div class="page-subtitle">Track stock levels and place orders</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" onclick="MgrInventoryView._openInventoryModal()">
            <i class="fa-solid fa-cart-plus"></i> Order Supplies
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="mi-stats">
        ${[
          [DB.inventory.length,'Total Items','fa-boxes-stacked','blue'],
          [DB.inventory.filter(i=>i.status==='ok').length,'In Stock','fa-circle-check','green'],
          [DB.inventory.filter(i=>i.status==='low').length,'Low Stock','fa-triangle-exclamation','orange'],
          [DB.inventory.filter(i=>i.status==='out').length,'Out of Stock','fa-ban','red'],
        ].map(([v,l,ic,c])=>`
          <div class="card" style="text-align:center">
            <div style="width:36px;height:36px;border-radius:10px;background:var(--${c}-pale);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;color:var(--${c});font-size:14px">
              <i class="fa-solid ${ic}"></i>
            </div>
            <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900">${v}</div>
            <div style="font-size:11px;color:var(--text-3)">${l}</div>
          </div>`).join('')}
      </div>

      <!-- Tabs -->
      <div class="mi-tabs">
        ${[['all','All'],['low','⚠ Alerts'],...cats.map(c=>[c,c])].map(([v,l])=>`
          <button class="mi-tab ${this._activeTab===v?'active':''}" onclick="MgrInventoryView._setTab('${v}')">${l}</button>`).join('')}
      </div>

      <!-- Table -->
      <div class="card">
        <table class="mi-table">
          <thead>
            <tr>
              <th>Item</th><th>Category</th><th>Stock</th><th>Min. Required</th><th>Cost/Unit</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const pct = Math.min(100, Math.round(item.qty / Math.max(1, item.minQty * 1.5) * 100));
              const [sBg,sClr,sLabel] = item.status==='ok'
                ? ['var(--green-pale)','var(--green)','In Stock']
                : item.status==='low'
                ? ['var(--orange-pale)','var(--orange)','Low Stock']
                : ['var(--red-pale)','var(--red)','Out of Stock'];
              const fillClr = item.status==='ok' ? 'var(--green)' : item.status==='low' ? 'var(--orange)' : 'var(--red)';
              return `
                <tr>
                  <td style="font-weight:600;color:var(--text)">${item.name}</td>
                  <td><span class="tag" style="background:var(--bg-input);color:var(--text-3);font-size:9px">${item.cat}</span></td>
                  <td>
                    <div>${item.qty} ${item.unit}</div>
                    <div class="mi-qty-bar"><div class="mi-qty-fill" style="width:${pct}%;background:${fillClr}"></div></div>
                  </td>
                  <td>${item.minQty} ${item.unit}</td>
                  <td>$${item.cost}</td>
                  <td><span class="tag" style="background:${sBg};color:${sClr};font-size:9px">${sLabel}</span></td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn btn-outline btn-sm btn-icon" onclick="MgrInventoryView._restock('${item.id}')" title="Restock">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                      <button class="btn btn-outline btn-sm btn-icon" style="color:var(--red)" onclick="MgrInventoryView._deleteItem('${item.id}')" title="Delete">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _setTab(t) {
    this._activeTab = t;
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _restock(id) {
    const item = DB.inventory.find(i=>i.id===id);
    if (!item) return;
    item.qty += item.minQty;
    item.status = item.qty >= item.minQty ? 'ok' : 'low';
    Toast.show(`${item.name} restocked (+${item.minQty} ${item.unit})`, 'success');
    InventoryStorage.save();
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _openInventoryModal() {
    document.getElementById('invItemName').value = '';
    document.getElementById('invItemQty').value = '';
    document.getElementById('invItemUnit').value = '';
    document.getElementById('invItemMin').value = '10';
    document.getElementById('invItemCost').value = '';
    document.getElementById('invNameError').style.display = 'none';
    Modal.open('inventoryModal');
  },

  _saveNewItem() {
    const name = document.getElementById('invItemName').value.trim();
    const cat = document.getElementById('invItemCat').value;
    const unit = document.getElementById('invItemUnit').value.trim() || 'kg';
    const qty = parseFloat(document.getElementById('invItemQty').value) || 0;
    const min = parseFloat(document.getElementById('invItemMin').value) || 1;
    const cost = parseFloat(document.getElementById('invItemCost').value) || 0;
    const errEl = document.getElementById('invNameError');

    if (!name) {
      errEl.textContent = 'Please enter an item name.';
      errEl.style.display = 'block';
      return;
    }

    // Duplicate check
    if (DB.inventory.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      errEl.textContent = 'This item already exists in inventory.';
      errEl.style.display = 'block';
      return;
    }

    const newItem = {
      id: 'i' + Date.now(),
      name,
      cat,
      qty,
      unit,
      minQty: min,
      cost,
      status: qty === 0 ? 'out' : (qty < min ? 'low' : 'ok')
    };

    DB.inventory.push(newItem);
    InventoryStorage.save();
    
    Modal.close('inventoryModal');
    Toast.show(`${name} added to inventory`, 'success');
    
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _deleteItem(id) {
    const item = DB.inventory.find(i=>i.id===id);
    if (!item) return;
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    DB.inventory = DB.inventory.filter(i => i.id !== id);
    InventoryStorage.save();
    Toast.show('Item removed from inventory', 'info');
    
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  init() {},
};
