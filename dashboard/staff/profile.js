/* ================================================
   PROFILE VIEW  (views/profile.js)
   Staff-only personal profile page
   — Live preview, avatar cycling (palette stored in DB, not DOM)
   — PIN strength bar + label, localStorage sync on every write
   — Sidebar/topbar sync, all original bugs fixed
================================================ */

const ProfileView = {

  /* ─────────────────────────────────────────────
     INTERNAL: Current logged-in staff
  ───────────────────────────────────────────── */
  _me() {
    if (!DB.staff || !DB.staff.length) {
      DB.staff = [{
        id:          'STF001',
        name:        'Umme Tahazzee',
        role:        'Executive Chef',
        shift:       'Morning',
        status:      'active',
        pin:         '1234',
        joined:      '2023-01-15',
        phone:       '+880 171 000 0001',
        email:       '',
        emergency:   '',
        address:     '',
        avatarColor: '#c62828',
      }];
    }
    return DB.staff[0];
  },

  /* ─────────────────────────────────────────────
     INTERNAL: Compute live stats from DB.orders
  ───────────────────────────────────────────── */
  _stats() {
    const orders = DB.orders || [];
    const today  = new Date();
    const sameDay = o => {
      const d = new Date(o.created);
      return d.getFullYear() === today.getFullYear()
          && d.getMonth()    === today.getMonth()
          && d.getDate()     === today.getDate();
    };
    const delivered = orders.filter(o => o.status === 'delivered');
    const pending   = orders.filter(o => o.status === 'pending');
    const cancelled = orders.filter(o => o.status === 'cancelled');
    const revenue   = delivered.reduce((s, o) => s + (o.total || 0), 0);
    const avgVal    = delivered.length ? Math.round(revenue / delivered.length) : 0;
    const me        = this._me();
    return {
      totalOrders: orders.length,
      todayOrders: orders.filter(sameDay).length,
      delivered:   delivered.length,
      pending:     pending.length,
      cancelled:   cancelled.length,
      revenue,
      avgVal,
      joinedDays: Math.floor((Date.now() - new Date(me.joined)) / 86_400_000),
    };
  },

  /* ─────────────────────────────────────────────
     INTERNAL: Push DB state → visible elements
     (no full re-render needed)
  ───────────────────────────────────────────── */
  _syncUI() {
    const me       = this._me();
    const color    = me.avatarColor || '#c62828';
    const initials = me.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const av = document.getElementById('profileAvatar');
    if (av) { av.style.background = color; av.textContent = initials; }

    const pen = document.getElementById('avatarPenBtn');
    if (pen) pen.style.background = color;

    const dn = document.getElementById('prof-display-name');
    if (dn) dn.textContent = me.name;

    const dr = document.getElementById('prof-display-role');
    if (dr) dr.textContent = `${me.role} · ${me.shift} Shift`;

    const dp = document.getElementById('prof-phone-display');
    if (dp) dp.textContent = me.phone;

    this._updateSidebar(me.name, me.role, color);
  },

  /* ─────────────────────────────────────────────
     INTERNAL: Stats rows HTML
  ───────────────────────────────────────────── */
  _statsHTML(st) {
    return [
      { label: 'Total Orders',    value: st.totalOrders,          icon: 'fa-receipt',      color: 'var(--blue)'   },
      { label: "Today's Orders",  value: st.todayOrders,          icon: 'fa-fire',          color: 'var(--orange)' },
      { label: 'Delivered',       value: st.delivered,            icon: 'fa-circle-check',  color: 'var(--green)'  },
      { label: 'Pending',         value: st.pending,              icon: 'fa-clock',         color: 'var(--gold)'   },
      { label: 'Total Revenue',   value: Utils.money(st.revenue), icon: 'fa-dollar-sign',   color: 'var(--green)'  },
      { label: 'Avg Order Value', value: Utils.money(st.avgVal),  icon: 'fa-chart-bar',     color: 'var(--purple)' },
    ].map(s => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:32px;height:32px;border-radius:8px;background:var(--bg-surface);
                    border:1px solid var(--border);display:flex;align-items:center;
                    justify-content:center;flex-shrink:0">
          <i class="fa-solid ${s.icon}" style="color:${s.color};font-size:12px"></i>
        </div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--text-3)">${s.label}</div>
          <div style="font-weight:700;font-size:14px">${s.value}</div>
        </div>
      </div>`).join('');
  },

  /* ─────────────────────────────────────────────
     INTERNAL: Breakdown bars HTML
  ───────────────────────────────────────────── */
  _breakdownHTML(st) {
    const total = st.totalOrders || 1;
    return [
      { label: 'Delivered', count: st.delivered, color: 'var(--green)' },
      { label: 'Pending',   count: st.pending,   color: 'var(--gold)'  },
      { label: 'Cancelled', count: st.cancelled, color: 'var(--red)'   },
    ].map(b => {
      const pct = Math.round((b.count / total) * 100);
      return `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;
                      font-size:12px;margin-bottom:4px">
            <span style="color:var(--text-3)">${b.label}</span>
            <span style="font-weight:700">${b.count}
              <span style="color:var(--text-3);font-weight:400">(${pct}%)</span>
            </span>
          </div>
          <div style="height:6px;border-radius:3px;background:var(--border);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${b.color};
                        border-radius:3px;transition:width .5s ease"></div>
          </div>
        </div>`;
    }).join('');
  },

  /* ─────────────────────────────────────────────
     PUBLIC: render()
  ───────────────────────────────────────────── */
  render() {
    const me       = this._me();
    const st       = this._stats();
    const initials = me.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const color    = me.avatarColor || '#c62828';
    const statusClass = {
      active:     'tag-delivered',
      'on-leave': 'tag-pending',
      inactive:   'tag-cancelled',
    }[me.status] || 'tag-pending';

    return `
      <!-- PAGE HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">Manage your information and track your activity</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="ProfileView.saveProfile()">
          <i class="fa-solid fa-save"></i> Save Changes
        </button>
      </div>

      <!-- TWO-COLUMN GRID -->
      <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start">

        <!-- ══ LEFT COLUMN ══ -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- Avatar Card -->
          <div class="card" style="text-align:center;padding:28px 20px">
            <div style="position:relative;display:inline-block;margin-bottom:16px">
              <div id="profileAvatar"
                style="width:80px;height:80px;border-radius:50%;
                       background:${color};
                       display:flex;align-items:center;justify-content:center;
                       font-size:28px;font-weight:700;color:#fff;margin:0 auto;
                       font-family:'Playfair Display',serif;
                       border:3px solid var(--border);transition:background .3s">
                ${initials}
              </div>
              <button id="avatarPenBtn"
                onclick="ProfileView.changeAvatar()"
                title="Change avatar colour"
                style="position:absolute;bottom:0;right:0;width:26px;height:26px;
                       border-radius:50%;background:${color};color:#fff;
                       border:2px solid var(--bg);cursor:pointer;font-size:11px;
                       display:flex;align-items:center;justify-content:center;
                       transition:background .3s">
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>

            <div id="prof-display-name"
              style="font-family:'Playfair Display',serif;font-size:20px;
                     font-weight:700;margin-bottom:4px">
              ${me.name}
            </div>
            <div id="prof-display-role"
              style="color:var(--text-3);font-size:13px;margin-bottom:10px">
              ${me.role} &middot; ${me.shift} Shift
            </div>
            <span class="tag ${statusClass}">${me.status}</span>

            <div style="border-top:1px solid var(--border);margin-top:16px;
                        padding-top:14px;text-align:left">
              ${[
                { icon: 'fa-id-badge',       pre: 'ID:',    val: me.id },
                { icon: 'fa-phone',          pre: '',
                  val: `<span id="prof-phone-display">${me.phone}</span>` },
                { icon: 'fa-calendar',       pre: 'Since:', val: me.joined },
                { icon: 'fa-hourglass-half', pre: 'Active:',
                  val: `<span style="color:var(--green);font-weight:700">${st.joinedDays} days</span>` },
              ].map(r => `
                <div style="display:flex;align-items:center;gap:8px;
                            margin-bottom:8px;font-size:13px">
                  <i class="fa-solid ${r.icon}"
                    style="color:var(--text-3);width:16px"></i>
                  ${r.pre
                    ? `<span style="color:var(--text-3)">${r.pre}</span>` : ''}
                  <span style="font-weight:600">${r.val}</span>
                </div>`).join('')}
            </div>
          </div>

          <!-- Activity Stats -->
          <div class="card" style="padding:16px">
            <div style="display:flex;align-items:center;
                        justify-content:space-between;margin-bottom:12px">
              <p style="font-size:11px;font-weight:700;text-transform:uppercase;
                        letter-spacing:.08em;color:var(--text-3);margin:0">
                Activity Stats
              </p>
              <button onclick="ProfileView._refreshStats()"
                style="border:none;background:none;cursor:pointer;
                       color:var(--text-3);font-size:13px"
                title="Refresh">
                <i class="fa-solid fa-rotate"></i>
              </button>
            </div>
            <div id="profileStatsBlock">${this._statsHTML(st)}</div>
          </div>

          <!-- Order Breakdown -->
          <div class="card" style="padding:16px">
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:.08em;color:var(--text-3);margin-bottom:12px">
              Order Breakdown
            </p>
            <div id="profileBreakdown">${this._breakdownHTML(st)}</div>
          </div>

          <!-- Quick Actions -->
          <div class="card" style="padding:16px">
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:.08em;color:var(--text-3);margin-bottom:12px">
              Quick Actions
            </p>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                { icon: 'fa-plus',       color: 'var(--red)',    label: 'New Order',    view: 'getorder'    },
                { icon: 'fa-list',       color: 'var(--blue)',   label: 'View Orders',  view: 'orders'      },
                { icon: 'fa-chart-line', color: 'var(--green)',  label: 'Sales Report', view: 'salesreport' },
                { icon: 'fa-gear',       color: 'var(--text-3)', label: 'Settings',     view: 'settings'    },
              ].map(a => `
                <button class="btn btn-outline btn-sm"
                  style="justify-content:flex-start;gap:8px"
                  onclick="Router.go('${a.view}')">
                  <i class="fa-solid ${a.icon}" style="color:${a.color}"></i>
                  ${a.label}
                </button>`).join('')}
            </div>
          </div>

        </div><!-- /LEFT -->

        <!-- ══ RIGHT COLUMN ══ -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- Personal Information -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-user" style="color:var(--blue)"></i>
              Personal Information
            </div>
            <div style="padding:20px">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input class="form-control" id="pf-name" value="${me.name}"
                    oninput="ProfileView._livePreviewName(this.value)"/>
                  <div style="font-size:11px;color:var(--text-3);margin-top:3px">
                    Updates sidebar &amp; card instantly
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input class="form-control" id="pf-phone" value="${me.phone}"
                    oninput="ProfileView._livePreviewPhone(this.value)"/>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input class="form-control" id="pf-email" type="email"
                    value="${me.email || ''}" placeholder="you@savoria.com"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Emergency Contact</label>
                  <input class="form-control" id="pf-emergency"
                    value="${me.emergency || ''}" placeholder="+880 1XX XXX XXXX"/>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Home Address</label>
                <input class="form-control" id="pf-address"
                  value="${me.address || ''}" placeholder="House, Road, Area, City"/>
              </div>
            </div>
          </div>

          <!-- Work Information -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-briefcase" style="color:var(--orange)"></i>
              Work Information
            </div>
            <div style="padding:20px">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Role</label>
                  <input class="form-control" value="${me.role}" disabled
                    style="opacity:.6;cursor:not-allowed"/>
                  <div style="font-size:11px;color:var(--text-3);margin-top:3px">
                    Contact manager to change
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Shift Preference</label>
                  <select class="form-control" id="pf-shift">
                    ${['Morning', 'Evening', 'Night'].map(sh =>
                      `<option ${me.shift === sh ? 'selected' : ''}>${sh}</option>`
                    ).join('')}
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Employee ID</label>
                  <input class="form-control" value="${me.id}" disabled
                    style="opacity:.6;cursor:not-allowed"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Joining Date</label>
                  <input class="form-control" value="${me.joined}" disabled
                    style="opacity:.6;cursor:not-allowed"/>
                </div>
              </div>
            </div>
          </div>

          <!-- Security & PIN -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-shield-halved" style="color:var(--green)"></i>
              Security &amp; PIN
            </div>
            <div style="padding:20px">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Current PIN</label>
                  <input class="form-control" id="pf-oldpin"
                    type="password" maxlength="4" placeholder="••••"
                    oninput="this.value=this.value.replace(/\D/g,'')"/>
                </div>
                <div class="form-group">
                  <label class="form-label">New PIN</label>
                  <input class="form-control" id="pf-newpin"
                    type="password" maxlength="4" placeholder="••••"
                    oninput="this.value=this.value.replace(/\D/g,'');
                             ProfileView._pinStrength(this.value)"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm PIN</label>
                  <input class="form-control" id="pf-confirmpin"
                    type="password" maxlength="4" placeholder="••••"
                    oninput="this.value=this.value.replace(/\D/g,'')"/>
                </div>
              </div>
              <div style="height:4px;border-radius:2px;background:var(--border);
                          overflow:hidden;margin-bottom:4px">
                <div id="pinStrengthBar"
                  style="height:100%;width:0%;border-radius:2px;
                         background:var(--red);transition:all .3s"></div>
              </div>
              <div id="pinStrengthLabel"
                style="font-size:11px;color:var(--text-3);
                       margin-bottom:12px;min-height:16px"></div>
              <button class="btn btn-outline btn-sm"
                onclick="ProfileView.changePin()">
                <i class="fa-solid fa-key"></i> Update PIN
              </button>
              <div style="border-top:1px solid var(--border);
                          margin-top:16px;padding-top:14px">
                <div style="font-size:13px;font-weight:600;margin-bottom:4px">
                  Session Info
                </div>
                <div style="font-size:13px;color:var(--text-3)">
                  ${new Date().toLocaleString('en-US', {
                    dateStyle: 'medium', timeStyle: 'short',
                  })}
                </div>
              </div>
            </div>
          </div>

          <!-- My Preferences -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-sliders" style="color:var(--purple)"></i>
              My Preferences
            </div>
            <div style="padding:4px 0">
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Dark Mode</div>
                  <div class="settings-row-desc">Personal display preference</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" ${Theme._dark ? 'checked' : ''}
                    onchange="Theme.toggle(); this.checked = Theme._dark"/>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Sound Notifications</div>
                  <div class="settings-row-desc">Play alert when a new order arrives</div>
                </div>
                <label class="toggle">
                  <input type="checkbox"
                    ${DB.settings?.soundAlerts ? 'checked' : ''}
                    onchange="
                      if (!DB.settings) DB.settings = {};
                      DB.settings.soundAlerts = this.checked;
                      localStorage.setItem('DB', JSON.stringify(DB));"/>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Default View on Login</div>
                  <div class="settings-row-desc">Page to open after signing in</div>
                </div>
                <select class="form-control" style="width:130px"
                  onchange="
                    if (!DB.settings) DB.settings = {};
                    DB.settings.defaultView = this.value;
                    localStorage.setItem('DB', JSON.stringify(DB));">
                  ${['Dashboard', 'Orders', 'Get Order'].map(v =>
                    `<option ${(DB.settings?.defaultView || 'Dashboard') === v
                      ? 'selected' : ''}>${v}</option>`
                  ).join('')}
                </select>
              </div>
            </div>
          </div>

        </div><!-- /RIGHT -->
      </div>`;
  },

  /* ─────────────────────────────────────────────
     PUBLIC: init()
  ───────────────────────────────────────────── */
  init() {
    const me = this._me();
    this._updateSidebar(me.name, me.role, me.avatarColor || '#c62828');
    this._syncUI();
  },

  /* ─────────────────────────────────────────────
     PUBLIC: saveProfile()
  ───────────────────────────────────────────── */
  saveProfile() {
    const me  = this._me();
    const get = id => (document.getElementById(id)?.value ?? '').trim();

    const name  = get('pf-name');
    const phone = get('pf-phone');
    if (name)  me.name  = name;
    if (phone) me.phone = phone;

    const email     = get('pf-email');
    const emergency = get('pf-emergency');
    const address   = get('pf-address');
    const shift     = get('pf-shift');
    if (email)     me.email     = email;
    if (emergency) me.emergency = emergency;
    if (address)   me.address   = address;
    if (shift)     me.shift     = shift;

    this._syncUI();
    this._refreshStats();
    localStorage.setItem('DB', JSON.stringify(DB));
    Toast.show('Profile saved!', 'success');
  },

  /* ─────────────────────────────────────────────
     PUBLIC: changePin()
  ───────────────────────────────────────────── */
  changePin() {
    const me      = this._me();
    const val     = id => (document.getElementById(id)?.value ?? '');
    const oldPin  = val('pf-oldpin');
    const newPin  = val('pf-newpin');
    const confirm = val('pf-confirmpin');

    if (oldPin !== me.pin)
      { Toast.show('Current PIN is incorrect', 'error');        return; }
    if (!/^\d{4}$/.test(newPin))
      { Toast.show('PIN must be exactly 4 digits', 'error');    return; }
    if (newPin !== confirm)
      { Toast.show('PINs do not match', 'error');               return; }
    if (newPin === oldPin)
      { Toast.show('New PIN must differ from current', 'error');return; }

    me.pin = newPin;
    ['pf-oldpin', 'pf-newpin', 'pf-confirmpin'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    this._pinStrength('');
    localStorage.setItem('DB', JSON.stringify(DB));
    Toast.show('PIN updated successfully!', 'success');
  },

  /* ─────────────────────────────────────────────
     PUBLIC: changeAvatar()
     FIX: Uses me.avatarColor (hex string) to find
     palette index — NOT el.style.background which
     browsers convert to rgb() and breaks indexOf()
  ───────────────────────────────────────────── */
  changeAvatar() {
    const PALETTE = [
      '#c62828', '#1565c0', '#2e7d32',
      '#e65100', '#6a1b9a', '#00838f', '#ad1457',
    ];
    const me      = this._me();
    const current = me.avatarColor || PALETTE[0];
    const idx     = PALETTE.indexOf(current);
    const next    = PALETTE[(idx + 1) % PALETTE.length];

    me.avatarColor = next;

    // Update avatar background AND restore initials text
    const initials = me.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const av = document.getElementById('profileAvatar');
    if (av) { av.style.background = next; av.textContent = initials; }

    const pen = document.getElementById('avatarPenBtn');
    if (pen) pen.style.background = next;

    this._updateSidebar(me.name, me.role, next);
    localStorage.setItem('DB', JSON.stringify(DB));
    Toast.show('Avatar colour updated', 'info');
  },

  /* ─────────────────────────────────────────────
     PUBLIC: _refreshStats()
  ───────────────────────────────────────────── */
  _refreshStats() {
    const st = this._stats();
    const sb = document.getElementById('profileStatsBlock');
    const bb = document.getElementById('profileBreakdown');
    if (sb) sb.innerHTML = this._statsHTML(st);
    if (bb) bb.innerHTML = this._breakdownHTML(st);
    Toast.show('Stats refreshed', 'info');
  },

  /* ─────────────────────────────────────────────
     LIVE PREVIEW
  ───────────────────────────────────────────── */
  _livePreviewName(val) {
    const name     = val.trim() || this._me().name;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const dn = document.getElementById('prof-display-name');
    if (dn) dn.textContent = name;
    // Only update text, NOT background — avoids colour reset
    const av = document.getElementById('profileAvatar');
    if (av) av.textContent = initials;
    this._updateSidebar(name, this._me().role, this._me().avatarColor);
  },

  _livePreviewPhone(val) {
    const dp = document.getElementById('prof-phone-display');
    if (dp) dp.textContent = val.trim() || this._me().phone;
  },

  /* ─────────────────────────────────────────────
     SIDEBAR / TOPBAR SYNC
  ───────────────────────────────────────────── */
  _updateSidebar(name, role, color) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const sName   = document.querySelector('.sidebar-footer-name');
    const sRole   = document.querySelector('.sidebar-footer-role');
    const sAvatar = document.querySelector('.sidebar-avatar');
    const tAvatar = document.querySelector('.topbar-avatar');
    if (sName)   sName.textContent   = name;
    if (sRole)   sRole.textContent   = role;
    if (sAvatar) { sAvatar.textContent = initials; if (color) sAvatar.style.background = color; }
    if (tAvatar) { tAvatar.textContent = initials; tAvatar.title = name; if (color) tAvatar.style.background = color; }
  },

  /* ─────────────────────────────────────────────
     PIN STRENGTH BAR
  ───────────────────────────────────────────── */
  _pinStrength(val) {
    const bar   = document.getElementById('pinStrengthBar');
    const label = document.getElementById('pinStrengthLabel');
    if (!bar) return;
    const len    = Math.min(val.length, 4);
    const widths = ['0%',            '25%',       '50%',       '75%',          '100%'        ];
    const colors = ['var(--border)', 'var(--red)', 'var(--red)', 'var(--gold)', 'var(--green)'];
    const labels = ['',              'Too short',  'Too short', 'Almost there', 'Strong PIN ✓'];
    bar.style.width      = widths[len];
    bar.style.background = colors[len];
    if (label) label.textContent = labels[len];
  },
};

/* ════════════════════════════════════════════════
   BOOT HOOK — sidebar sync after DB is ready
   Polling replaces fragile fixed setTimeout
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const ready = setInterval(() => {
    if (typeof DB !== 'undefined' && DB.staff?.length) {
      clearInterval(ready);
      const me = DB.staff[0];
      ProfileView._updateSidebar(me.name, me.role, me.avatarColor || '#c62828');
    }
  }, 50);
});