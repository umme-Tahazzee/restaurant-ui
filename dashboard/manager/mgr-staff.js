/* ================================================
   SAVORIA — MANAGER STAFF VIEW  (mgr-staff.js)
   Full staff management: schedules, performance, roles
================================================ */

const MgrStaffView = {

  _filter: 'all',

  render() {
    const staff = DB.staff;
    const filtered = this._filter === 'all' ? staff : staff.filter(s => s.status === this._filter);

    return `
      <style>
        .ms-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px}
        .ms-filters{display:flex;gap:4px;background:var(--bg-input);border-radius:8px;padding:3px;flex-wrap:wrap}
        .ms-filter-btn{padding:5px 14px;border-radius:6px;border:none;font-family:inherit;font-size:11px;font-weight:600;color:var(--text-3);background:transparent;cursor:pointer;transition:all .2s;white-space:nowrap}
        .ms-filter-btn.active{background:var(--bg-surface);color:var(--text);box-shadow:var(--shadow-sm)}

        .ms-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:20px}
        @media(max-width:1100px){.ms-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:600px){.ms-grid{grid-template-columns:1fr}}

        .ms-card{position:relative;overflow:hidden;transition:box-shadow .2s}
        .ms-card:hover{box-shadow:var(--shadow-md)}
        .ms-card-stripe{position:absolute;top:0;left:0;right:0;height:3px}
        .ms-av{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#fff;flex-shrink:0}
        .ms-stars{display:flex;gap:2px}
        .ms-stars i{font-size:10px;color:var(--gold)}
        .ms-stars i.empty{color:var(--border)}
        .ms-action-bar{display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}

        .ms-summary-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        @media(max-width:700px){.ms-summary-row{grid-template-columns:repeat(2,1fr)}}
        .ms-summary-card{text-align:center}
        .ms-summary-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:var(--text)}
        .ms-summary-lbl{font-size:11px;color:var(--text-3);margin-top:2px}
      </style>

      <!-- Header -->
      <div class="ms-header">
        <div>
          <div class="page-title"><i class="fa-solid fa-users-gear" style="color:var(--gold);margin-right:8px"></i>Staff Management</div>
          <div class="page-subtitle">Manage shifts, performance and payroll</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="Toast.show('Schedule exported','info')">
            <i class="fa-solid fa-calendar-days"></i> Schedule
          </button>
          <button class="btn btn-primary btn-sm" onclick="MgrStaffView._addStaff()">
            <i class="fa-solid fa-plus"></i> Add Staff
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="ms-summary-row">
        ${this._summaryCard(DB.staff.length,'Total Staff','fa-users','blue')}
        ${this._summaryCard(DB.staff.filter(s=>s.status==='on').length,'On Duty','fa-circle-dot','green')}
        ${this._summaryCard(DB.staff.filter(s=>s.status==='off').length,'Off Duty','fa-moon','orange')}
        ${this._summaryCard(
          (DB.staff.reduce((s,x)=>s+(x.rating||0),0)/DB.staff.length).toFixed(1),
          'Avg Rating','fa-star','gold'
        )}
      </div>

      <!-- Filters -->
      <div class="ms-filters" style="margin-bottom:16px">
        ${[['all','All Staff'],['on','On Duty'],['off','Off Duty']].map(([v,l])=>`
          <button class="ms-filter-btn ${this._filter===v?'active':''}" onclick="MgrStaffView._setFilter('${v}')">${l}</button>
        `).join('')}
      </div>

      <!-- Staff Grid -->
      <div class="ms-grid">
        ${filtered.map(s => this._staffCard(s)).join('')}
      </div>
    `;
  },

  _summaryCard(val, label, icon, color) {
    return `
      <div class="card ms-summary-card">
        <div style="width:36px;height:36px;border-radius:10px;background:var(--${color==='gold'?'gold':color}-pale);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;color:var(--${color==='gold'?'gold':color});font-size:14px">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="ms-summary-val">${val}</div>
        <div class="ms-summary-lbl">${label}</div>
      </div>`;
  },

  _staffCard(s) {
    const statusColor = s.status === 'on' ? 'var(--green)' : 'var(--text-3)';
    const statusLabel = s.status === 'on' ? 'On Duty' : 'Off Duty';
    const statusBg    = s.status === 'on' ? 'var(--green-pale)' : 'var(--bg-input)';
    const stars = Array.from({length:5},(_,i)=>`<i class="fa-solid fa-star ${i<Math.round(s.rating)?'':'empty'}"></i>`).join('');

    return `
      <div class="card ms-card">
        <div class="ms-card-stripe" style="background:${s.color}"></div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div class="ms-av" style="background:${s.color}">${s.avatar}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:var(--text)">${s.name}</div>
            <div style="font-size:11px;color:var(--text-3)">${s.role}</div>
            <span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:${statusBg};color:${statusColor}">
              <span style="width:6px;height:6px;border-radius:50%;background:${statusColor}"></span>${statusLabel}
            </span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          <div style="background:var(--bg-surface2);border-radius:8px;padding:8px">
            <div style="font-size:10px;color:var(--text-3)">Shift</div>
            <div style="font-size:12px;font-weight:600;margin-top:2px">${s.shift}</div>
          </div>
          <div style="background:var(--bg-surface2);border-radius:8px;padding:8px">
            <div style="font-size:10px;color:var(--text-3)">Orders</div>
            <div style="font-size:12px;font-weight:600;margin-top:2px">${s.orders} today</div>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="ms-stars">${stars}</div>
          <span style="font-size:12px;font-weight:700;color:var(--gold)">${s.rating}</span>
        </div>

        <div class="ms-action-bar">
          <button class="btn btn-outline btn-sm" style="flex:1" onclick="MgrStaffView._viewStaff('${s.id}')">
            <i class="fa-solid fa-eye"></i> Profile
          </button>
          <button class="btn btn-outline btn-sm" style="flex:1" onclick="MgrStaffView._editShift('${s.id}')">
            <i class="fa-solid fa-clock"></i> Shift
          </button>
          <button class="btn ${s.status==='on'?'btn-danger':'btn-green'} btn-sm btn-icon" onclick="MgrStaffView._toggleStatus('${s.id}')"
            title="${s.status==='on'?'Mark Off':'Mark On'}">
            <i class="fa-solid ${s.status==='on'?'fa-user-minus':'fa-user-check'}"></i>
          </button>
        </div>
      </div>
    `;
  },

  _setFilter(f) {
    this._filter = f;
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _viewStaff(id) {
    const s = DB.staff.find(x=>x.id===id);
    if (!s) return;
    document.getElementById('staffModalContent').innerHTML = `
      <div style="padding:4px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
          <div style="width:60px;height:60px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff">${s.avatar}</div>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700">${s.name}</div>
            <div style="color:var(--text-3);font-size:12px">${s.role}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${[['Status',s.status==='on'?'On Duty':'Off Duty'],['Shift',s.shift],['Orders Today',s.orders],['Rating',s.rating+' / 5']].map(([k,v])=>`
            <div style="background:var(--bg-surface2);border-radius:8px;padding:10px">
              <div style="font-size:10px;color:var(--text-3)">${k}</div>
              <div style="font-size:14px;font-weight:600;margin-top:3px">${v}</div>
            </div>`).join('')}
        </div>
      </div>`;
    Modal.open('staffModal');
  },

  _editShift(id) {
    const s = DB.staff.find(x=>x.id===id);
    Toast.show(`Editing shift for ${s?.name || 'staff'}…`, 'info');
  },

  _toggleStatus(id) {
    const s = DB.staff.find(x=>x.id===id);
    if (!s) return;
    s.status = s.status === 'on' ? 'off' : 'on';
    Toast.show(`${s.name} marked ${s.status === 'on' ? 'On Duty' : 'Off Duty'}`, s.status==='on'?'success':'info');
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _addStaff() {
    Toast.show('Add staff form coming soon', 'info');
  },

  init() {},
};
