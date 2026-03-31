/* ================================================
   BLOG VIEW — Blog management
================================================ */

const BlogView = {

  _filter: 'all',
  _loaded: false,
  _editId: null,

  render() {
    return `
      <div id="blogRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">Content</div>
            <h1 class="page-title">Bl<em style="color:var(--red);font-style:italic">og</em></h1>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="BlogView.openAddModal()"><i class="fa-solid fa-plus"></i> New Post</button>
          </div>
        </div>

        <!-- Summary -->
        <div class="grid-4 anim-1" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-label">Total Posts</div><div class="stat-value" id="blogTotal">${DB.blog.length}</div></div>
          <div class="stat-card"><div class="stat-label">Published</div><div class="stat-value" style="color:var(--green)" id="blogPublished">${DB.blog.filter(b=>b.status==='published').length}</div></div>
          <div class="stat-card"><div class="stat-label">Drafts</div><div class="stat-value" style="color:var(--orange)" id="blogDrafts">${DB.blog.filter(b=>b.status==='draft').length}</div></div>
          <div class="stat-card"><div class="stat-label">Total Views</div><div class="stat-value" id="blogViews">${DB.blog.reduce((s,b)=>s+b.views,0).toLocaleString()}</div></div>
        </div>

        <!-- Filter -->
        <div class="tab-bar anim-1">
          <button class="tab-btn active" onclick="BlogView.setFilter('all',this)">All Posts</button>
          <button class="tab-btn" onclick="BlogView.setFilter('published',this)">Published</button>
          <button class="tab-btn" onclick="BlogView.setFilter('draft',this)">Drafts</button>
        </div>

        <!-- Blog cards -->
        <div id="blogList" class="anim-2" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px"></div>
      </div>`;
  },

  async init() {
    const el = document.getElementById('blogList');
    if (!this._loaded) {
      if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-3);grid-column:1/-1"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Loading posts…</div>';
      await Api.getPosts();
      this._loaded = true;
    }
    this.updateStats();
    this.renderPosts();
  },

  updateStats() {
    const total = DB.blog.length;
    const published = DB.blog.filter(b=>b.status==='published').length;
    const drafts = DB.blog.filter(b=>b.status==='draft').length;
    const views = DB.blog.reduce((s,b)=>s+b.views,0).toLocaleString();

    const tEl = document.getElementById('blogTotal');
    const pEl = document.getElementById('blogPublished');
    const dEl = document.getElementById('blogDrafts');
    const vEl = document.getElementById('blogViews');

    if(tEl) tEl.innerText = total;
    if(pEl) pEl.innerText = published;
    if(dEl) dEl.innerText = drafts;
    if(vEl) vEl.innerText = views;
  },

  setFilter(filter, btn) {
    this._filter = filter;
    btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderPosts();
  },

  renderPosts() {
    const el = document.getElementById('blogList');
    if (!el) return;
    const filtered = this._filter === 'all' ? DB.blog : DB.blog.filter(b => b.status === this._filter);

    if (filtered.length === 0) {
      el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-3)">No posts found.</div>';
      return;
    }

    el.innerHTML = filtered.map(b => `
      <div class="blog-card">
        <div class="blog-card-img">${b.emoji || '📝'}</div>
        <div class="blog-card-body">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <span class="tag tag-${b.status}">${b.status}</span>
            <span style="font-size:10px;color:var(--text-3)">${b.category}</span>
          </div>
          <h3 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:8px;line-height:1.3">${b.title}</h3>
          <p style="font-size:12px;color:var(--text-3);line-height:1.5;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${b.excerpt}</p>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:6px">
              <div class="customer-avatar" style="width:24px;height:24px;font-size:9px;background:var(--red)">${b.author.charAt(0)}</div>
              <span style="font-size:11px;color:var(--text-2)">${b.author}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              ${b.views > 0 ? `<span style="font-size:10px;color:var(--text-3)"><i class="fa-solid fa-eye" style="font-size:9px;margin-right:3px"></i>${b.views.toLocaleString()}</span>` : ''}
              <span style="font-size:10px;color:var(--text-3)">${Utils.formatDate(b.date)}</span>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
            <button class="btn btn-outline btn-sm" style="flex:1" onclick="BlogView.openEditModal('${b.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
            ${b.status === 'draft' ? `<button class="btn btn-green btn-sm" style="flex:1" onclick="BlogView.publishPost('${b.id}')"><i class="fa-solid fa-globe"></i> Publish</button>` : ''}
            <button class="btn btn-outline btn-sm btn-icon" onclick="BlogView.deletePost('${b.id}')"><i class="fa-solid fa-trash" style="color:var(--red)"></i></button>
          </div>
        </div>
      </div>`).join('');
  },

  getEmojiForCategory(cat) {
    const map = {
      'Culinary': '🥩',
      'Menu Updates': '🌸',
      'Wine': '🍷',
      'Behind Scenes': '👨‍🍳',
      'Sustainability': '🌿',
      'News': '🎉'
    };
    return map[cat] || '📝';
  },

  openAddModal() {
    this._editId = null;
    this.renderModal('New Blog Post', {}, 'Draft saved');
  },

  openEditModal(id) {
    const post = DB.blog.find(b => b.id === id);
    if (!post) return;
    this._editId = id;
    this.renderModal('Edit Blog Post', post, 'Changes saved');
  },
  
  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  },

  renderModal(title, p = {}, successMsg) {
    document.getElementById('blogModalContent').innerHTML = `
      <div class="modal-title">${title}</div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Title</label>
        <input id="blogModalTitle" class="form-control" placeholder="Enter post title…" value="${this.escapeHtml(p.title || '')}"/>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Category</label>
          <select id="blogModalCategory" class="form-control">
            ${['Culinary','Menu Updates','Wine','Behind Scenes','Sustainability','News'].map(c => `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Author</label>
          <select id="blogModalAuthor" class="form-control">
            ${['Marco Ferretti','Sophia Laurent','Kenji Nakamura','Amara Osei'].map(a => `<option value="${a}" ${p.author === a ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Excerpt</label>
        <textarea id="blogModalExcerpt" class="form-control" rows="2" placeholder="Short summary…">${this.escapeHtml(p.excerpt || '')}</textarea>
      </div>
      <div class="form-group" style="margin-bottom:16px">
        <label class="form-label">Content</label>
        <textarea id="blogModalContentText" class="form-control" rows="6" placeholder="Write your blog post content…">${this.escapeHtml(p.content || '')}</textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-outline" onclick="Modal.close('blogModal')">Cancel</button>
        <button class="btn btn-gold" onclick="BlogView.savePost('draft', '${successMsg}')"><i class="fa-solid fa-save"></i> Save Draft</button>
        <button class="btn btn-primary" onclick="BlogView.savePost('published', 'Post published!')"><i class="fa-solid fa-globe"></i> Publish</button>
      </div>`;
    Modal.open('blogModal');
  },

  savePost(status, msg) {
    const titleEl = document.getElementById('blogModalTitle');
    const catEl = document.getElementById('blogModalCategory');
    const authEl = document.getElementById('blogModalAuthor');
    const excEl = document.getElementById('blogModalExcerpt');
    const contentEl = document.getElementById('blogModalContentText');

    const title = titleEl.value.trim();
    if (!title) {
        Toast.show('Title is required', 'error');
        return;
    }

    if (this._editId) {
      const post = DB.blog.find(b => b.id === this._editId);
      if (post) {
        post.title = title;
        post.category = catEl.value;
        post.author = authEl.value;
        post.excerpt = excEl.value.trim();
        post.content = contentEl.value.trim();
        if (status) post.status = status;
        post.emoji = this.getEmojiForCategory(post.category);
      }
    } else {
      DB.blog.unshift({
        id: 'bl' + Date.now(),
        title,
        category: catEl.value,
        author: authEl.value,
        excerpt: excEl.value.trim(),
        content: contentEl.value.trim(),
        status: status,
        date: new Date().toISOString().split('T')[0],
        views: 0,
        emoji: this.getEmojiForCategory(catEl.value)
      });
    }

    this.updateStats();
    this.renderPosts();
    Modal.close('blogModal');
    Toast.show(msg, 'success');
  },

  publishPost(id) {
    const post = DB.blog.find(b => b.id === id);
    if (!post) return;
    post.status = 'published';
    this.updateStats();
    this.renderPosts();
    Toast.show('Post published!', 'success');
  },

  deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    DB.blog = DB.blog.filter(b => b.id !== id);
    this.updateStats();
    this.renderPosts();
    Toast.show('Post deleted', 'success');
  }

};
