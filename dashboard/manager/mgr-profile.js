/* ================================================
   SAVORIA — MANAGER PROFILE VIEW  (mgr-profile.js)
================================================ */

const MgrProfileView = {

  _editing: false,

  _me() {
    return DB.profile;
  },

  render() {
    const me = this._me();
    if (!me || !me.joined) return '<div class="card">Loading profile...</div>';
    
    const daysSince = Math.floor((Date.now() - new Date(me.joined)) / 86_400_000);
    const yrs = Math.floor(daysSince / 365);
    const mos = Math.floor((daysSince % 365) / 30);
    const initials = me.name ? me.name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2) : '--';

    return `
      <style>
        .mp-grid
        {display:grid;
        grid-template-columns:300px 1fr;
        gap:16px;
        align-items:start
        }
        @media(max-width:800px){
        .mp-grid{
        grid-template-columns:1fr
        }}
        .mp-perm-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;background:var(--gold-pale);color:var(--gold);border:1px solid rgba(184,150,62,.2);margin:3px}
        .mp-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
        @media(max-width:500px){.mp-stat-row{grid-template-columns:1fr 1fr}}
        .mp-field{margin-bottom:14px}
        .mp-field label{display:block;font-size:11px;color:var(--text-3);margin-bottom:5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
        .mp-field input{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none;transition:border-color .2s}
        .mp-field input:focus{border-color:var(--gold)}
        .mp-field input:disabled{opacity:.6;cursor:not-allowed}
      </style>

      <div style="margin-bottom:20px">
        <div class="page-title"><i class="fa-solid fa-user-tie" style="color:var(--gold);margin-right:8px"></i>My Profile</div>
        <div class="page-subtitle">Manage your manager account details</div>
      </div>

      <div class="mp-grid">

        <!-- Left: Avatar Card -->
        <div>
          <div class="card" style="text-align:center;padding:28px 20px">
            <div style="width:80px;height:80px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:#fff;margin:0 auto 14px;box-shadow:0 0 0 4px var(--gold-pale)">${initials}</div>
            <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700">${me.name}</div>
            <div style="font-size:12px;color:var(--text-3);margin-top:2px">${me.role}</div>
            <div style="margin:10px 0">
              <span class="tag" style="background:var(--gold-pale);color:var(--gold);border:1px solid rgba(184,150,62,.25)">
                <i class="fa-solid fa-shield-halved"></i>&nbsp; Manager Access
              </span>
            </div>
            <div style="font-size:11px;color:var(--text-3)">
              <i class="fa-regular fa-calendar" style="margin-right:4px"></i>
              ${yrs} yr${yrs!==1?'s':''} ${mos} mo${mos!==1?'s':''} at Savoria
            </div>
            <div class="mp-stat-row">
              ${[['Staff','fa-users',DB.staff.length],['Tables','fa-table-cells',DB.tables.length],['Reviews','fa-star','4.8']].map(([l,ic,v])=>`
                <div style="background:var(--bg-surface2);border-radius:8px;padding:10px;text-align:center">
                  <i class="fa-solid ${ic}" style="color:var(--gold);font-size:14px;margin-bottom:4px"></i>
                  <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700">${v}</div>
                  <div style="font-size:10px;color:var(--text-3)">${l}</div>
                </div>`).join('')}
            </div>
          </div>

          <!-- Permissions -->
          <div class="card" style="margin-top:12px">
            <div style="font-family:'Playfair Display',serif;font-size:14px;font-weight:700;margin-bottom:10px">
              <i class="fa-solid fa-key" style="color:var(--gold);margin-right:6px"></i>Permissions
            </div>
            <div>${me.permissions.map(p=>`<span class="mp-perm-badge"><i class="fa-solid fa-check" style="font-size:9px"></i>${p}</span>`).join('')}</div>
          </div>
        </div>

        <!-- Right: Edit Form -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700">Account Details</div>
            <button class="btn ${this._editing?'btn-primary':'btn-outline'} btn-sm" onclick="MgrProfileView._toggleEdit()">
              <i class="fa-solid ${this._editing?'fa-floppy-disk':'fa-pen'}"></i> ${this._editing?'Save Changes':'Edit Profile'}
            </button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">
            <div class="mp-field">
              <label>Full Name</label>
              <input type="text" value="${me.name}" id="mgr_name" ${this._editing?'':'disabled'}/>
            </div>
            <div class="mp-field">
              <label>Role</label>
              <input type="text" value="${me.role}" disabled/>
            </div>
            <div class="mp-field">
              <label>Email</label>
              <input type="email" value="${me.email}" id="mgr_email" ${this._editing?'':'disabled'}/>
            </div>
            <div class="mp-field">
              <label>Phone</label>
              <input type="text" value="${me.phone}" id="mgr_phone" ${this._editing?'':'disabled'}/>
            </div>
            <div class="mp-field">
              <label>Shift</label>
              <input type="text" value="${me.shift}" disabled/>
            </div>
            <div class="mp-field">
              <label>Staff ID</label>
              <input type="text" value="${me.id}" disabled/>
            </div>
            <div class="mp-field">
              <label>Joined</label>
              <input type="text" value="${Utils.formatDate(me.joined)}" disabled/>
            </div>
          </div>

          ${this._editing ? `
            <div style="border-top:1px solid var(--border);padding-top:16px;margin-top:4px">
              <div style="font-family:'Playfair Display',serif;font-size:14px;font-weight:700;margin-bottom:12px">Change PIN</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="mp-field">
                  <label>Current PIN</label>
                  <input type="password" id="mgr_pin_cur" placeholder="••••" maxlength="6"/>
                </div>
                <div class="mp-field">
                  <label>New PIN</label>
                  <input type="password" id="mgr_pin_new" placeholder="••••" maxlength="6"/>
                </div>
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
              <button class="btn btn-outline btn-sm" onclick="MgrProfileView._cancelEdit()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="MgrProfileView._save()">
                <i class="fa-solid fa-floppy-disk"></i> Save Changes
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  _toggleEdit() {
    if (this._editing) {
      this._save();
      return;
    }
    this._editing = true;
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  _save() {
    const name  = document.getElementById('mgr_name').value.trim();
    const email = document.getElementById('mgr_email').value.trim();
    const phone = document.getElementById('mgr_phone').value.trim();

    if (!name || !email) {
      Toast.show('Name and Email are required', 'error');
      return;
    }

    // Update global state
    DB.profile.name  = name;
    DB.profile.email = email;
    DB.profile.phone = phone;

    // Persist
    if (window.ProfileStorage) ProfileStorage.save();

    // Sync shell UI (sidebar/topbar)
    if (window.updateUIProfile) updateUIProfile();

    this._editing = false;
    Toast.show('Profile updated successfully', 'success');
    
    document.getElementById('pageArea').innerHTML = this.render();
    if (this.init) this.init();
  },

  init() {},
};
