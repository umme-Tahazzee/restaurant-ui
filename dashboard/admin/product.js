/* ================================================
   PRODUCT VIEW — All products + categories
================================================ */

const ProductView = {
  _tab:          'products',
  _search:       '',
  _filterCat:    '',
  _sort:         '',
  _uploadedImage: null,

  // ── Constants
  _EMOJIS: ['🥩','🍄','🍝','🧀','🍮','🍷','🦪','🦆','🍸','🐟','🍰','🍜','🍖','🍊','🍫','🦞'],
  _COLORS: ['#2d7a47','#b8963e','#c0392b','#6d3b8e','#96281b','#1a5276','#c47a1a'],
  _ICONS:  ['🥗','🍝','🥩','🍮','🍷','🍜','🧀','🐟','🍰','🦪','🍸','🥘','🫕','🍱'],

  render() {
    return `
      <div id="productRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">Operations</div>
            <h1 class="page-title">Pro<em style="color:var(--red);font-style:italic">ducts</em></h1>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="ProductView.openAddModal()">
              <i class="fa-solid fa-plus"></i> Add Product
            </button>
          </div>
        </div>

        <div class="tab-bar anim-1">
          <button class="tab-btn active" onclick="ProductView.setTab('products',this)">All Products</button>
          <button class="tab-btn" onclick="ProductView.setTab('categories',this)">Categories</button>
        </div>

        <div class="grid-4 anim-1" style="margin-bottom:20px" id="productSummary">
          <div class="stat-card"><div class="stat-label">Total Products</div><div class="stat-value">${DB.products.length}</div></div>
          <div class="stat-card"><div class="stat-label">Active</div><div class="stat-value" style="color:var(--green)">${DB.products.filter(p => p.status === 'active').length}</div></div>
          <div class="stat-card"><div class="stat-label">Categories</div><div class="stat-value">${DB.categories.length}</div></div>
          <div class="stat-card"><div class="stat-label">Avg Price</div><div class="stat-value">${Utils.money(Math.round(DB.products.reduce((s,p) => s+p.price, 0) / DB.products.length))}</div></div>
        </div>

        <div id="productContent" class="anim-2"></div>
      </div>`;
  },

  async init() {
    const el = document.getElementById('productContent');
    if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-3)"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Loading products…</div>';
    await Api.getProducts();
    this.renderContent();
    this._updateSummary();
  },

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

  // ── Helpers ──────────────────────────────────

  _getSortedProducts() {
    let list = [...DB.products];
    if (this._search)    list = list.filter(p => p.name.toLowerCase().includes(this._search));
    if (this._filterCat) list = list.filter(p => p.category === this._filterCat);
    const sorters = {
      'name-asc':   (a,b) => a.name.localeCompare(b.name),
      'name-desc':  (a,b) => b.name.localeCompare(a.name),
      'price-asc':  (a,b) => a.price - b.price,
      'price-desc': (a,b) => b.price - a.price,
      'category':   (a,b) => a.category.localeCompare(b.category),
    };
    if (sorters[this._sort]) list.sort(sorters[this._sort]);
    return list;
  },

  _updateSummary() {
    const el = document.getElementById('productSummary');
    if (!el) return;
    const s = el.querySelectorAll('.stat-value');
    s[0].textContent = DB.products.length;
    s[1].textContent = DB.products.filter(p => p.status === 'active').length;
    s[2].textContent = DB.categories.length;
    s[3].textContent = DB.products.length
      ? Utils.money(Math.round(DB.products.reduce((s,p) => s+p.price, 0) / DB.products.length))
      : '$0';
  },

  _persist() {
    Store.save();
  },

  // ── Render helpers ────────────────────────────

  _categoryOptions(selected = '') {
    return DB.categories.map(c =>
      `<option value="${c.name}" ${selected === c.name ? 'selected' : ''}>${c.name}</option>`
    ).join('');
  },

  _emojiOptions(selected = '') {
    return this._EMOJIS.map(e =>
      `<option value="${e}" ${selected === e ? 'selected' : ''}>${e}</option>`
    ).join('');
  },

  _colorOptions(selected = '') {
    return this._COLORS.map(c =>
      `<option value="${c}" ${selected === c ? 'selected' : ''} style="background:${c};color:#fff">${c}</option>`
    ).join('');
  },

  _iconOptions(selected = '') {
    return this._ICONS.map(i =>
      `<option value="${i}" ${selected === i ? 'selected' : ''}>${i}</option>`
    ).join('');
  },

  _imageUploadHTML(existing = null) {
    return `
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Product Image</label>
        <div id="imgUploadArea" onclick="document.getElementById('_imgInput').click()"
          style="border:2px dashed var(--border);border-radius:10px;padding:20px;text-align:center;cursor:pointer;transition:border-color .2s"
          onmouseover="this.style.borderColor='var(--red)'" onmouseout="this.style.borderColor='var(--border)'">
          <div id="imgPreview" style="margin-bottom:8px;${existing ? '' : 'display:none'}">
            <img id="imgPreviewImg" src="${existing || ''}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--border)"/>
          </div>
          <div id="imgUploadText">
            ${existing
              ? `<div style="font-size:11px;color:var(--green)"><i class="fa-solid fa-check"></i> Image uploaded — click to change</div>`
              : `<i class="fa-solid fa-cloud-arrow-up" style="font-size:24px;color:var(--text-3);margin-bottom:6px;display:block"></i>
                 <div style="font-size:12px;color:var(--text-3)">Click to upload image</div>
                 <div style="font-size:10px;color:var(--text-3);margin-top:2px">JPG, PNG, WEBP (max 2MB)</div>`
            }
          </div>
        </div>
        <input id="_imgInput" type="file" accept="image/*" style="display:none"
          onchange="ProductView._handleImageUpload(this)"/>
      </div>`;
  },

  _handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Toast.show('Image too large! Max 2MB', 'warning');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      this._uploadedImage = e.target.result;
      document.getElementById('imgPreviewImg').src = e.target.result;
      document.getElementById('imgPreview').style.display = 'block';
      document.getElementById('imgUploadText').innerHTML =
        `<div style="font-size:11px;color:var(--green)"><i class="fa-solid fa-check"></i> Image ready</div>`;
    };
    reader.readAsDataURL(file);
  },

  // ── Render views ──────────────────────────────

  _renderProducts() {
    const products = this._getSortedProducts();
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div class="topbar-search" style="max-width:250px">
            <i class="fa-solid fa-magnifying-glass" style="color:var(--text-3);font-size:11px"></i>
            <input type="text" placeholder="Search products…" value="${this._search}"
              oninput="ProductView._search=this.value.toLowerCase();ProductView.renderContent()"/>
          </div>
          <select class="select-styled" onchange="ProductView._filterCat=this.value;ProductView.renderContent()">
            <option value="">All Categories</option>
            ${this._categoryOptions(this._filterCat)}
          </select>
        </div>
        <select class="select-styled" onchange="ProductView._sort=this.value;ProductView.renderContent()">
          <option value="">Sort by…</option>
          <option value="name-asc"   ${this._sort==='name-asc'   ?'selected':''}>Name (A → Z)</option>
          <option value="name-desc"  ${this._sort==='name-desc'  ?'selected':''}>Name (Z → A)</option>
          <option value="price-asc"  ${this._sort==='price-asc'  ?'selected':''}>Price (Low → High)</option>
          <option value="price-desc" ${this._sort==='price-desc' ?'selected':''}>Price (High → Low)</option>
          <option value="category"   ${this._sort==='category'   ?'selected':''}>Category</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
        ${products.length === 0
          ? '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-3)">No products found</div>'
          : products.map(p => `
              <div class="product-card">
                <div class="product-card-img" style="padding:0;overflow:hidden">
                  ${p.image
                    ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover"/>`
                    : `<img src="https://placehold.co/200x160/f5f0eb/c0392b?text=${encodeURIComponent(p.emoji)}" style="width:100%;height:100%;object-fit:cover"/>`
                  }
                </div>
                <div class="product-card-body">
                  <div style="font-weight:700;font-size:13px;margin-bottom:4px">${p.name}</div>
                  <div style="font-size:10px;color:var(--text-3);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.description}</div>
                  <div style="display:flex;align-items:center;justify-content:space-between">
                    <span style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:var(--red)">${Utils.money(p.price)}</span>
                    <span class="tag tag-${p.status === 'active' ? 'delivered' : 'cancelled'}" style="font-size:9px">${p.status}</span>
                  </div>
                  <div style="font-size:10px;color:var(--text-3);margin-top:4px">${p.category}</div>
                  <div style="display:flex;gap:4px;margin-top:10px">
                    <button class="btn btn-outline btn-sm" style="flex:1" onclick="ProductView.openEditModal('${p.id}')">
                      <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn btn-outline btn-sm btn-icon" onclick="ProductView.deleteProduct('${p.id}')">
                      <i class="fa-solid fa-trash" style="color:var(--red)"></i>
                    </button>
                  </div>
                </div>
              </div>`).join('')
        }
      </div>`;
  },

  _renderCategories() {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">All Categories</div>
        <button class="btn btn-primary btn-sm" onclick="ProductView.openAddCategoryModal()">
          <i class="fa-solid fa-plus"></i> Add Category
        </button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
        ${DB.categories.map(c => `
          <div class="card" style="border-top:3px solid ${c.color}">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="font-size:32px">${c.icon}</div>
              <div>
                <div style="font-weight:700;font-size:15px">${c.name}</div>
                <div style="font-size:11px;color:var(--text-3)">${DB.products.filter(p => p.category === c.name).length} products</div>
              </div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-sm" style="flex:1" onclick="ProductView.openEditCategoryModal('${c.id}')">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
              <button class="btn btn-outline btn-sm btn-icon" onclick="ProductView.deleteCategory('${c.id}')">
                <i class="fa-solid fa-trash" style="color:var(--red)"></i>
              </button>
            </div>
          </div>`).join('')}
      </div>`;
  },

  // ── Product CRUD ──────────────────────────────

  openAddModal() {
    document.getElementById('productModalContent').innerHTML = `
      <div class="modal-title">Add New Product</div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Product Name</label>
        <input id="addProdName" class="form-control" placeholder="Enter product name…"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="addProdCat" class="form-control">${this._categoryOptions()}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Price ($)</label>
          <input id="addProdPrice" class="form-control" type="number" min="0" step="0.01" placeholder="0.00"/>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Description</label>
        <textarea id="addProdDesc" class="form-control" rows="2" placeholder="Product description…"></textarea>
      </div>
      ${this._imageUploadHTML()}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="addProdStatus" class="form-control">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fallback Emoji</label>
          <select id="addProdEmoji" class="form-control">${this._emojiOptions()}</select>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn btn-outline" onclick="Modal.close('productModal')">Cancel</button>
        <button class="btn btn-primary" onclick="ProductView.addProduct()">Add Product</button>
      </div>`;
    this._uploadedImage = null;
    Modal.open('productModal');
  },

  addProduct() {
    const name   = document.getElementById('addProdName').value.trim();
    const price  = parseFloat(document.getElementById('addProdPrice').value) || 0;
    const cat    = document.getElementById('addProdCat').value;
    const desc   = document.getElementById('addProdDesc').value.trim();
    const status = document.getElementById('addProdStatus').value;
    const emoji  = document.getElementById('addProdEmoji').value;

    if (!name)    { Toast.show('Please enter a product name', 'warning'); return; }
    if (price <= 0) { Toast.show('Please enter a valid price', 'warning'); return; }

    DB.products.unshift({
      id: 'p' + Date.now(), name, price, category: cat, status, emoji,
      image: this._uploadedImage || null,
      description: desc || 'House specialty — freshly prepared daily.',
    });
    this._uploadedImage = null;
    this._persist();
    this.renderContent();
    this._updateSummary();
    Modal.close('productModal');
    Toast.show(`Product "${name}" added successfully!`, 'success');
    Notif.add('product', `New product "${name}" added`);
  },

  openEditModal(id) {
    const p = DB.products.find(x => x.id === id);
    if (!p) return;

    document.getElementById('productModalContent').innerHTML = `
      <div class="modal-title">Edit Product</div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Product Name</label>
        <input id="editProdName" class="form-control" value="${Utils.sanitize(p.name)}"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="editProdCat" class="form-control">${this._categoryOptions(p.category)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Price ($)</label>
          <input id="editProdPrice" class="form-control" type="number" min="0" step="0.01" value="${p.price}"/>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Description</label>
        <textarea id="editProdDesc" class="form-control" rows="2">${Utils.sanitize(p.description)}</textarea>
      </div>
      ${this._imageUploadHTML(p.image)}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="editProdStatus" class="form-control">
            <option value="active"   ${p.status === 'active'   ? 'selected' : ''}>Active</option>
            <option value="inactive" ${p.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fallback Emoji</label>
          <select id="editProdEmoji" class="form-control">${this._emojiOptions(p.emoji)}</select>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn btn-outline" onclick="Modal.close('productModal')">Cancel</button>
        <button class="btn btn-primary" onclick="ProductView.saveEdit('${p.id}')">
          <i class="fa-solid fa-floppy-disk"></i> Save Changes
        </button>
      </div>`;
    this._uploadedImage = p.image || null;
    Modal.open('productModal');
  },

  saveEdit(id) {
    const p = DB.products.find(x => x.id === id);
    if (!p) return;

    const name  = document.getElementById('editProdName').value.trim();
    const price = parseFloat(document.getElementById('editProdPrice').value) || 0;

    if (!name)      { Toast.show('Please enter a product name', 'warning'); return; }
    if (price <= 0) { Toast.show('Please enter a valid price', 'warning'); return; }

    p.name        = Utils.sanitize(name);
    p.price       = price;
    p.category    = document.getElementById('editProdCat').value;
    p.description = Utils.sanitize(document.getElementById('editProdDesc').value.trim());
    p.status      = document.getElementById('editProdStatus').value;
    p.emoji       = document.getElementById('editProdEmoji').value;
    if (this._uploadedImage) p.image = this._uploadedImage;
    this._uploadedImage = null;

    Service.saveProducts().then(() => {
      this.renderContent();
      this._updateSummary();
      Modal.close('productModal');
      Toast.show(`"${p.name}" updated successfully!`, 'success');
      Notif.add('product', `Product "${p.name}" was updated`);
    });
  },

  deleteProduct(id) {
    const idx = DB.products.findIndex(p => p.id === id);
    if (idx === -1) return;
    const name = DB.products[idx].name;
    DB.products.splice(idx, 1);
    this._persist();
    this.renderContent();
    this._updateSummary();
    Toast.show(`Product "${name}" deleted`, 'error');
  },

  // ── Category CRUD ─────────────────────────────

  openAddCategoryModal() {
    document.getElementById('productModalContent').innerHTML = `
      <div class="modal-title">Add New Category</div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Category Name</label>
        <input id="addCatName" class="form-control" placeholder="e.g. Soups, Grills…"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Icon</label>
          <select id="addCatIcon" class="form-control">${this._iconOptions()}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Color</label>
          <select id="addCatColor" class="form-control">${this._colorOptions()}</select>
        </div>
      </div>
      <div style="margin-bottom:14px">
        <label class="form-label">Preview</label>
        <div style="border:2px solid var(--border);border-radius:10px;padding:14px;display:flex;align-items:center;gap:12px">
          <div id="catPreviewIcon" style="font-size:32px">🥗</div>
          <div>
            <div id="catPreviewName" style="font-weight:700;font-size:15px">Category Name</div>
            <div style="font-size:11px;color:var(--text-3)">0 products</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn btn-outline" onclick="Modal.close('productModal')">Cancel</button>
        <button class="btn btn-primary" onclick="ProductView.addCategory()">Add Category</button>
      </div>`;
    document.getElementById('addCatName').addEventListener('input', function() {
      document.getElementById('catPreviewName').textContent = this.value || 'Category Name';
    });
    document.getElementById('addCatIcon').addEventListener('change', function() {
      document.getElementById('catPreviewIcon').textContent = this.value;
    });
    Modal.open('productModal');
  },

  addCategory() {
    const name  = document.getElementById('addCatName').value.trim();
    const icon  = document.getElementById('addCatIcon').value;
    const color = document.getElementById('addCatColor').value;

    if (!name) { Toast.show('Please enter a category name', 'warning'); return; }
    if (DB.categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      Toast.show('Category already exists!', 'warning'); return;
    }

    DB.categories.push({ id: 'cat' + Date.now(), name, icon, color, count: 0 });
    this._persist();
    this.renderContent();
    this._updateSummary();
    Modal.close('productModal');
    Toast.show(`Category "${name}" added!`, 'success');
    Notif.add('category', `New category "${name}" added`);

  },

  openEditCategoryModal(id) {
    const c = DB.categories.find(x => x.id === id);
    if (!c) return;

    document.getElementById('productModalContent').innerHTML = `
      <div class="modal-title">Edit Category</div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Category Name</label>
        <input id="editCatName" class="form-control" value="${c.name}"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Icon</label>
          <select id="editCatIcon" class="form-control">${this._iconOptions(c.icon)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Color</label>
          <select id="editCatColor" class="form-control">${this._colorOptions(c.color)}</select>
        </div>
      </div>
      <div style="margin-bottom:14px">
        <label class="form-label">Preview</label>
        <div style="border:2px solid var(--border);border-radius:10px;padding:14px;display:flex;align-items:center;gap:12px">
          <div id="catPreviewIcon" style="font-size:32px">${c.icon}</div>
          <div>
            <div id="catPreviewName" style="font-weight:700;font-size:15px">${c.name}</div>
            <div style="font-size:11px;color:var(--text-3)">${DB.products.filter(p => p.category === c.name).length} products</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn btn-outline" onclick="Modal.close('productModal')">Cancel</button>
        <button class="btn btn-primary" onclick="ProductView.saveEditCategory('${c.id}')">
          <i class="fa-solid fa-floppy-disk"></i> Save Changes
        </button>
      </div>`;
    document.getElementById('editCatName').addEventListener('input', function() {
      document.getElementById('catPreviewName').textContent = this.value || 'Category Name';
    });
    document.getElementById('editCatIcon').addEventListener('change', function() {
      document.getElementById('catPreviewIcon').textContent = this.value;
    });
    Modal.open('productModal');
  },

  saveEditCategory(id) {
    const c = DB.categories.find(x => x.id === id);
    if (!c) return;

    const name = document.getElementById('editCatName').value.trim();
    if (!name) { Toast.show('Please enter a category name', 'warning'); return; }

    const oldName = c.name;
    c.name  = name;
    c.icon  = document.getElementById('editCatIcon').value;
    c.color = document.getElementById('editCatColor').value;

    if (oldName !== name) {
      DB.products.forEach(p => { if (p.category === oldName) p.category = name; });
    }

    this._persist();
    this.renderContent();
    this._updateSummary();
    Modal.close('productModal');
    Notif.add('category', `Category "${name}" updated`);
    Toast.show(`Category "${name}" updated!`, 'success');
  },

  deleteCategory(id) {
    const c = DB.categories.find(x => x.id === id);
    if (!c) return;

    const count = DB.products.filter(p => p.category === c.name).length;
    if (count > 0) {
      Toast.show(`Cannot delete — ${count} product(s) use this category`, 'warning');
      return;
    }

    DB.categories = DB.categories.filter(x => x.id !== id);
    this._persist();
    this.renderContent();
    this._updateSummary();
    Toast.show(`Category "${c.name}" deleted`, 'error');
  },
};