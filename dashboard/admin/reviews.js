/* ================================================
   REVIEWS VIEW
================================================ */

const ReviewsView = {

  _filter: 'all',
  _data: null,

  async render() {
    try {
      this._data = await API.getReviews();
    } catch(err) {
      return `<div style="padding:40px;color:var(--red);">Failed to load reviews data.</div>`;
    }

    const avg = (this._data.reduce((s,r) => s+r.rating, 0) / this._data.length).toFixed(1);
    const r5 = this._data.filter(r => r.rating === 5).length;
    const r4 = this._data.filter(r => r.rating === 4).length;
    const r3 = this._data.filter(r => r.rating === 3).length;

    return `
      <div id="reviewRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">Management</div>
            <h1 class="page-title">Custo<em style="color:var(--red);font-style:italic">mer Reviews</em></h1>
          </div>
          <div style="display:flex;gap:8px">
            <select class="select-styled" onchange="ReviewsView.filter(this.value)">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>
        </div>

        <!-- Summary -->
        <div class="grid-4 anim-1" style="margin-bottom:20px">
          <div class="stat-card" style="text-align:center">
            <div style="font-size:42px;font-family:'Playfair Display',serif;font-weight:900;color:var(--gold)">${avg}</div>
            <div>${Utils.starsHTML(Math.round(avg))}</div>
            <div class="stat-sub">${this._data.length} reviews</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">5 Star Reviews</div>
            <div class="stat-value" style="color:var(--green)">${r5}</div>
            <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:${r5/this._data.length*100}%;background:var(--green)"></div></div>
          </div>
          <div class="stat-card">
            <div class="stat-label">4 Star Reviews</div>
            <div class="stat-value" style="color:var(--gold)">${r4}</div>
            <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:${r4/this._data.length*100}%;background:var(--gold)"></div></div>
          </div>
          <div class="stat-card">
            <div class="stat-label">3 Star Reviews</div>
            <div class="stat-value" style="color:var(--orange)">${r3}</div>
            <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:${r3/this._data.length*100}%;background:var(--orange)"></div></div>
          </div>
        </div>

        <!-- Review Cards -->
        <div id="reviewList" class="anim-2" style="display:flex;flex-direction:column;gap:14px"></div>
      </div>`;
  },

  init() { this.renderReviews(); },

  filter(val) { this._filter = val; this.renderReviews(); },

  renderReviews() {
    const el = document.getElementById('reviewList');
    if (!el) return;
    const filtered = this._filter === 'all' ? this._data : this._data.filter(r => r.rating === parseInt(this._filter));

    el.innerHTML = filtered.map(r => `
      <div class="review-card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="customer-avatar" style="background:var(--red)">${r.customer.charAt(0)}</div>
            <div>
              <div style="font-weight:700;font-size:13px">${r.customer}</div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
                ${Utils.starsHTML(r.rating)}
                <span style="font-size:10px;color:var(--text-3)">${Utils.formatDate(r.date)}</span>
                <span class="tag" style="background:var(--bg-surface2);color:var(--text-3);font-size:9px">${r.branch}</span>
              </div>
            </div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:10px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px">"${r.comment}"</p>
        ${r.reply ? `
          <div style="background:var(--bg-surface2);border-radius:8px;padding:10px 14px;border-left:3px solid var(--gold)">
            <div style="font-size:10px;font-weight:700;color:var(--gold);margin-bottom:4px"><i class="fa-solid fa-reply" style="margin-right:4px"></i> Admin Reply</div>
            <p style="font-size:12px;color:var(--text-2)">${r.reply}</p>
          </div>
        ` : `
          <button class="btn btn-outline btn-sm" onclick="Toast.show('Reply feature coming soon','info')">
            <i class="fa-solid fa-reply"></i> Reply
          </button>
        `}
      </div>`).join('');
  },

};
