/* ================================================
   BLOG VIEW — Blog management
================================================ */

const BlogView = {

  _filter: 'all',

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
          <div class="stat-card"><div class="stat-label">Total Posts</div><div class="stat-value">${DB.blog.length}</div></div>
          <div class="stat-card"><div class="stat-label">Published</div><div class="stat-value" style="color:var(--green)">${DB.blog.filter(b=>b.status==='published').length}</div></div>
          <div class="stat-card"><div class="stat-label">Drafts</div><div class="stat-value" style="color:var(--orange)">${DB.blog.filter(b=>b.status==='draft').length}</div></div>
          <div class="stat-card"><div class="stat-label">Total Views</div><div class="stat-value">${DB.blog.reduce((s,b)=>s+b.views,0).toLocaleString()}</div></div>
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

  // AJAX: JSONPlaceholder /posts থেকে blog posts load করে
  async init() {
    const el = document.getElementById('blogList');
    if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-3);grid-column:1/-1"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Loading posts…</div>';
    await Api.getPosts();
    this.renderPosts();
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

    el.innerHTML = filtered.map(b => `
      <div class="blog-card">
        <div class="blog-card-img">${b.emoji}</div>
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
            <button class="btn btn-outline btn-sm" style="flex:1" onclick="Toast.show('Edit post','info')"><i class="fa-solid fa-pen"></i> Edit</button>
            ${b.status === 'draft' ? `<button class="btn btn-green btn-sm" style="flex:1" onclick="Toast.show('Post published!','success')"><i class="fa-solid fa-globe"></i> Publish</button>` : ''}
            <button class="btn btn-outline btn-sm btn-icon" onclick="Toast.show('Post deleted','error')"><i class="fa-solid fa-trash" style="color:var(--red)"></i></button>
          </div>
        </div>
      </div>`).join('');
  },

  openAddModal() {
    document.getElementById('blogModalContent').innerHTML = `
      <div class="modal-title">New Blog Post</div>
      <div class="form-group" style="margin-bottom:14px"><label class="form-label">Title</label><input class="form-control" placeholder="Enter post title…"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Category</label>
          <select class="form-control"><option>Culinary</option><option>Menu Updates</option><option>Wine</option><option>Behind Scenes</option><option>Sustainability</option><option>News</option></select>
        </div>
        <div class="form-group"><label class="form-label">Author</label>
          <select class="form-control"><option>Marco Ferretti</option><option>Sophia Laurent</option><option>Kenji Nakamura</option><option>Amara Osei</option></select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:14px"><label class="form-label">Excerpt</label><textarea class="form-control" rows="2" placeholder="Short summary…"></textarea></div>
      <div class="form-group" style="margin-bottom:16px"><label class="form-label">Content</label><textarea class="form-control" rows="6" placeholder="Write your blog post content…"></textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-outline" onclick="Modal.close('blogModal')">Cancel</button>
        <button class="btn btn-gold" onclick="Toast.show('Draft saved','info');Modal.close('blogModal')"><i class="fa-solid fa-save"></i> Save Draft</button>
        <button class="btn btn-primary" onclick="Toast.show('Post published!','success');Modal.close('blogModal')"><i class="fa-solid fa-globe"></i> Publish</button>
      </div>`;
    Modal.open('blogModal');
  },

};
