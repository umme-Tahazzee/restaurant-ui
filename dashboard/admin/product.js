/* ================================================
   PRODUCT VIEW — All products + categories
================================================ */

const ProductView = {

  _tab: 'products',
  _search: '',
  _data: null,

  async render() {
    try {
      this._data = await API.getProductsData();
    } catch(err) {
      return `<div style="padding:40px;color:var(--red);">Failed to load products data.</div>`;
    }

    return `
      <div id="productRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">Operations</div>
            <h1 class="page-title">Pro<em style="color:var(--red);font-style:italic">ducts</em></h1>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="ProductView.openAddModal()"><i class="fa-solid fa-plus"></i> Add Product</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar anim-1">
          <button class="tab-btn active" onclick="ProductView.setTab('products',this)">All Products</button>
          <button class="tab-btn" onclick="ProductView.setTab('categories',this)">Categories</button>
        </div>

        <!-- Summary -->
        <div class="grid-4 anim-1" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-label">Total Products</div><div class="stat-value">${this._data.products.length}</div></div>
          <div class="stat-card"><div class="stat-label">Active</div><div class="stat-value" style="color:var(--green)">${this._data.products.filter(p=>p.status==='active').length}</div></div>
          <div class="stat-card"><div class="stat-label">Categories</div><div class="stat-value">${this._data.categories.length}</div></div>
          <div class="stat-card"><div class="stat-label">Avg Price</div><div class="stat-value">${Utils.money(Math.round(this._data.products.reduce((s,p)=>s+p.price,0)/this._data.products.length))}</div></div>
        </div>

        <!-- Content -->
        <div id="productContent" class="anim-2"></div>
      </div>`;
  },

  init() { this.renderContent(); },

  setTab(tab, btn) {
    this._tab = tab;
    btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderContent();
  },

  renderContent() {
    const el = document.getElementById('productContent');
    if (!el) return;
    el.innerHTML = this._tab === 'categories' ? this._renderCategories() : this._renderProducts();
  },

  _renderProducts() {
    const products = this._search
      ? this._data.products.filter(p => p.name.toLowerCase().includes(this._search))
      : this._data.products;

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div class="topbar-search" style="max-width:250px">
          <i class="fa-solid fa-magnifying-glass" style="color:var(--text-3);font-size:11px"></i>
          <input type="text" placeholder="Search products…" oninput="ProductView._search=this.value.toLowerCase();ProductView.renderContent()"/>
        </div>
        <select class="select-styled" onchange="ProductView._filterCat=this.value;ProductView.renderContent()">
          <option value="">All Categories</option>
          ${this._data.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
        ${products.map(p => `
          <div class="product-card">
            <div class="product-card-img">${p.emoji}</div>
            <div class="product-card-body">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px">${p.name}</div>
              <div style="font-size:10px;color:var(--text-3);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.description}</div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:var(--red)">${Utils.money(p.price)}</span>
                <span class="tag tag-${p.status==='active'?'delivered':'cancelled'}" style="font-size:9px">${p.status}</span>
              </div>
              <div style="font-size:10px;color:var(--text-3);margin-top:4px">${p.category}</div>
              <div style="display:flex;gap:4px;margin-top:10px">
                <button class="btn btn-outline btn-sm" style="flex:1" onclick="Toast.show('Edit product','info')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="btn btn-outline btn-sm btn-icon" onclick="Toast.show('Deleted','error')"><i class="fa-solid fa-trash" style="color:var(--red)"></i></button>
              </div>
            </div>
          </div>`).join('')}
      </div>`;
  },

  _renderCategories() {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">All Categories</div>
        <button class="btn btn-primary btn-sm" onclick="Toast.show('Add category coming soon','info')"><i class="fa-solid fa-plus"></i> Add Category</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
        ${this._data.categories.map(c => `
          <div class="card" style="border-top:3px solid ${c.color}">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="font-size:32px">${c.icon}</div>
              <div>
                <div style="font-weight:700;font-size:15px">${c.name}</div>
                <div style="font-size:11px;color:var(--text-3)">${c.count} products</div>
              </div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-sm" style="flex:1"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-outline btn-sm btn-icon"><i class="fa-solid fa-trash" style="color:var(--red)"></i></button>
            </div>
          </div>`).join('')}
      </div>`;
  },

  openAddModal() {
    document.getElementById('productModalContent').innerHTML = `
      <div class="modal-title">Add New Product</div>
      <div class="form-group" style="margin-bottom:14px"><label class="form-label">Product Name</label><input class="form-control" placeholder="Enter product name…"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Category</label>
          <select class="form-control">${this._data.categories.map(c=>`<option>${c.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Price</label><input class="form-control" type="number" placeholder="0.00"/></div>
      </div>
      <div class="form-group" style="margin-bottom:14px"><label class="form-label">Description</label><textarea class="form-control" rows="2" placeholder="Product description…"></textarea></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control"><option>Active</option><option>Inactive</option></select>
        </div>
        <div></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn btn-outline" onclick="Modal.close('productModal')">Cancel</button>
        <button class="btn btn-primary" onclick="Toast.show('Product added!','success');Modal.close('productModal')">Add Product</button>
      </div>`;
    Modal.open('productModal');
  },

};
