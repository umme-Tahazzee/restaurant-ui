/* ================================================
   SETTINGS VIEW  (views/settings.js)
   — Dynamic, professional, staff-aware
================================================ */

const SettingsView = {

  _activeTab: 'restaurant',

  render() {
    const s = DB.settings;

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Configure your restaurant preferences</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" onclick="SettingsView.exportConfig()">
            <i class="fa-solid fa-file-export"></i> Export Config
          </button>
          <button class="btn btn-primary btn-sm" onclick="SettingsView.saveAll()">
            <i class="fa-solid fa-save"></i> Save Changes
          </button>
        </div>
      </div>

      <!-- Unsaved changes banner (hidden by default) -->
      <div id="unsavedBanner" style="display:none;background:var(--gold-pale);border:1px solid var(--gold);border-radius:10px;padding:10px 16px;margin-bottom:16px;display:none;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--gold)">
        <i class="fa-solid fa-circle-exclamation"></i>
        You have unsaved changes
        <button class="btn btn-sm" style="margin-left:auto;background:var(--gold);color:#fff;border:none" onclick="SettingsView.saveAll()">Save Now</button>
      </div>

      <!-- Layout: sidebar nav + content -->
      <div style="display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:start">

        <!-- Left nav -->
        <div class="card" style="padding:8px;position:sticky;top:16px">
          ${[
            { key:'restaurant', icon:'fa-store',               label:'Restaurant',  color:'var(--red)' },
            { key:'financial',  icon:'fa-dollar-sign',         label:'Financial',   color:'var(--green)' },
            { key:'staff',      icon:'fa-users',               label:'Staff',       color:'var(--blue)' },
            { key:'operations', icon:'fa-kitchen-set',         label:'Operations',  color:'var(--orange)' },
            { key:'notif',      icon:'fa-bell',                label:'Notifications',color:'var(--purple)' },
            { key:'appearance', icon:'fa-palette',             label:'Appearance',  color:'var(--pink,#e91e8c)' },
            { key:'danger',     icon:'fa-triangle-exclamation',label:'Danger Zone', color:'var(--red)' },
          ].map(tab => `
            <button onclick="SettingsView.switchTab('${tab.key}',this)"
              class="settings-nav-btn ${this._activeTab === tab.key ? 'active' : ''}"
              style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:${this._activeTab === tab.key ? 'var(--bg-hover,rgba(0,0,0,.05))' : 'transparent'};border-radius:8px;cursor:pointer;font-size:13px;font-weight:${this._activeTab === tab.key ? '700' : '500'};color:${this._activeTab === tab.key ? tab.color : 'var(--text-2)'};text-align:left;transition:all .15s">
              <i class="fa-solid ${tab.icon}" style="width:16px;color:${tab.color};font-size:13px"></i>
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Right: tab panels -->
        <div id="settingsContent">
          ${this._renderTab(this._activeTab)}
        </div>
      </div>`;
  },

  switchTab(key, btn) {
    this._activeTab = key;
    // Update nav highlight
    document.querySelectorAll('.settings-nav-btn').forEach(b => {
      b.style.background = 'transparent';
      b.style.fontWeight = '500';
    });
    if (btn) { btn.style.background = 'var(--bg-hover,rgba(0,0,0,.05))'; btn.style.fontWeight = '700'; }
    document.getElementById('settingsContent').innerHTML = this._renderTab(key);
  },

  _renderTab(key) {
    const s = DB.settings;
    const tabs = {
      restaurant: this._tabRestaurant(s),
      financial:  this._tabFinancial(s),
      staff:      this._tabStaff(),
      operations: this._tabOperations(s),
      notif:      this._tabNotifications(s),
      appearance: this._tabAppearance(),
      danger:     this._tabDanger(),
    };
    return tabs[key] || '';
  },

  /* ── Helpers ── */
  _section(title, icon, color, content) {
    return `
      <div class="settings-section" style="margin-bottom:16px">
        <div class="settings-section-header">
          <i class="fa-solid ${icon}" style="color:${color}"></i> ${title}
        </div>
        <div style="padding:20px">${content}</div>
      </div>`;
  },

  _toggle(key, label, desc, checked, onChange) {
    return `
      <div class="settings-row">
        <div>
          <div class="settings-row-label">${label}</div>
          <div class="settings-row-desc">${desc}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="s-${key}" ${checked ? 'checked' : ''} onchange="${onChange || `DB.settings['${key}']=this.checked;SettingsView._markDirty()`}"/>
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  },

  _markDirty() {
    const b = document.getElementById('unsavedBanner');
    if (b) b.style.display = 'flex';
  },

  /* ════════════════════════════════
     TAB: Restaurant
  ════════════════════════════════ */
  _tabRestaurant(s) {
    return this._section('Restaurant Information', 'fa-store', 'var(--red)', `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Restaurant Name</label>
          <input class="form-control" id="s-name" value="${s.restaurantName}" oninput="SettingsView._markDirty()"/>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input class="form-control" id="s-phone" value="${s.phone}" oninput="SettingsView._markDirty()"/>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Address</label>
        <input class="form-control" id="s-address" value="${s.address}" oninput="SettingsView._markDirty()"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" id="s-email" value="${s.email}" oninput="SettingsView._markDirty()"/>
        </div>
        <div class="form-group">
          <label class="form-label">Website</label>
          <input class="form-control" id="s-website" value="${s.website || ''}" placeholder="https://savoria.com" oninput="SettingsView._markDirty()"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Opening Time</label>
          <input class="form-control" id="s-open" type="time" value="${s.openTime || '11:00'}" oninput="SettingsView._markDirty()"/>
        </div>
        <div class="form-group">
          <label class="form-label">Closing Time</label>
          <input class="form-control" id="s-close" type="time" value="${s.closeTime || '23:00'}" oninput="SettingsView._markDirty()"/>
        </div>
        <div class="form-group">
          <label class="form-label">Total Tables</label>
          <input class="form-control" id="s-tables" type="number" min="1" value="${s.totalTables || 20}" oninput="SettingsView._markDirty()"/>
        </div>
      </div>
    `);
  },

  /* ════════════════════════════════
     TAB: Financial
  ════════════════════════════════ */
  _tabFinancial(s) {
    return this._section('Financial Settings', 'fa-dollar-sign', 'var(--green)', `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Currency Symbol</label>
          <select class="form-control" id="s-currency" onchange="SettingsView._markDirty()">
            ${['$','€','£','৳','¥','₹'].map(c => `<option ${s.currency===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tax Rate (%)</label>
          <input class="form-control" id="s-tax" type="number" step="0.1" value="${s.taxRate}" oninput="SettingsView._markDirty()"/>
        </div>
        <div class="form-group">
          <label class="form-label">Service Charge (%)</label>
          <input class="form-control" id="s-service" type="number" step="0.5" value="${s.serviceCharge}" oninput="SettingsView._markDirty()"/>
        </div>
      </div>

      <!-- Live preview -->
      <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;padding:16px;margin-top:8px">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);margin-bottom:12px">Live Preview — $100 order</p>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:13px" id="feePreview">
          ${this._buildFeePreview(s.taxRate, s.serviceCharge)}
        </div>
      </div>

      <div class="form-row" style="margin-top:16px">
        <div class="form-group">
          <label class="form-label">Language</label>
          <select class="form-control" id="s-lang" onchange="SettingsView._markDirty()">
            ${['English','Bengali','Italian','French','Spanish'].map(l=>`<option>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date Format</label>
          <select class="form-control" id="s-datefmt" onchange="SettingsView._markDirty()">
            <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    `);
  },

  _buildFeePreview(tax, service) {
    const sub = 100, t = sub * tax / 100, sv = sub * service / 100, total = sub + t + sv;
    const row = (l, v, bold) => `<div style="display:flex;justify-content:space-between;${bold?'font-weight:700;border-top:1px solid var(--border);padding-top:6px;margin-top:2px':''}"><span style="color:var(--text-3)">${l}</span><span>$${v.toFixed(2)}</span></div>`;
    return row('Subtotal', sub) + row(`Tax (${tax}%)`, t) + row(`Service (${service}%)`, sv) + row('Grand Total', total, true);
  },

  /* ════════════════════════════════
     TAB: Staff Management
  ════════════════════════════════ */
  _tabStaff() {
    // Make sure DB.staff exists
    if (!DB.staff) DB.staff = [
      { id:'STF001', name:'Arif Hossain',   role:'Manager',  shift:'Morning',   status:'active',  pin:'1234', joined:'2023-01-15', phone:'+880 171 000 0001' },
      { id:'STF002', name:'Mitu Begum',      role:'Waiter',   shift:'Morning',   status:'active',  pin:'2345', joined:'2023-03-20', phone:'+880 171 000 0002' },
      { id:'STF003', name:'Rahim Uddin',     role:'Chef',     shift:'Evening',   status:'active',  pin:'3456', joined:'2022-11-10', phone:'+880 171 000 0003' },
      { id:'STF004', name:'Sharmin Akter',   role:'Cashier',  shift:'Morning',   status:'on-leave',pin:'4567', joined:'2023-06-01', phone:'+880 171 000 0004' },
      { id:'STF005', name:'Karim Sheikh',    role:'Waiter',   shift:'Night',     status:'active',  pin:'5678', joined:'2024-01-05', phone:'+880 171 000 0005' },
    ];

    const roles   = ['Manager','Chef','Waiter','Cashier','Cleaner','Security'];
    const shifts  = ['Morning','Evening','Night'];
    const statusColors = { active:'tag-delivered', 'on-leave':'tag-pending', inactive:'tag-cancelled' };

    return `
      <div class="settings-section" style="margin-bottom:16px">
        <div class="settings-section-header" style="display:flex;align-items:center;justify-content:space-between">
          <span><i class="fa-solid fa-users" style="color:var(--blue)"></i> Staff Management</span>
          <button class="btn btn-primary btn-sm" onclick="SettingsView.openAddStaff()">
            <i class="fa-solid fa-plus"></i> Add Staff
          </button>
        </div>
        <div style="padding:16px 20px">

          <!-- Staff count pills -->
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
            ${['active','on-leave','inactive'].map(st => {
              const count = DB.staff.filter(m=>m.status===st).length;
              const tag   = statusColors[st];
              return `<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;display:flex;align-items:center;gap:6px">
                <span class="tag ${tag}" style="padding:1px 6px">${st}</span>
                <span style="color:var(--text)">${count}</span>
              </div>`;
            }).join('')}
          </div>

          <!-- Staff table -->
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Role</th><th>Shift</th>
                  <th>Phone</th><th>Status</th><th>PIN</th><th>Actions</th>
                </tr>
              </thead>
              <tbody id="staffTableBody">
                ${DB.staff.map(m => this._staffRow(m, statusColors)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add/Edit Staff Modal -->
      <div id="staffModal" class="modal-backdrop" style="display:none">
        <div class="modal-box" style="max-width:480px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div class="modal-title" id="staffModalTitle">Add Staff Member</div>
            <button class="btn btn-outline btn-sm" onclick="document.getElementById('staffModal').style.display='none'">✕</button>
          </div>
          <div id="staffModalContent"></div>
        </div>
      </div>`;
  },

  _staffRow(m, statusColors) {
    return `
      <tr id="staff-row-${m.id}">
        <td><b style="font-size:11px;color:var(--text-3)">${m.id}</b></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:30px;height:30px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0">
              ${m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style="font-weight:600;font-size:13px">${m.name}</div>
              <div style="font-size:11px;color:var(--text-3)">Joined ${m.joined}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size:12px;font-weight:600">${m.role}</span></td>
        <td>
          <span style="background:var(--bg-surface);border:1px solid var(--border);border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600">
            ${m.shift}
          </span>
        </td>
        <td style="font-size:12px;color:var(--text-3)">${m.phone}</td>
        <td><span class="tag ${statusColors[m.status]}">${m.status}</span></td>
        <td>
          <div style="font-family:monospace;font-size:12px;letter-spacing:3px;color:var(--text-3)" id="pin-${m.id}">••••</div>
          <button style="font-size:10px;border:none;background:none;cursor:pointer;color:var(--red)" onclick="SettingsView.togglePin('${m.id}','${m.pin}')">show</button>
        </td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-outline btn-sm" onclick="SettingsView.openEditStaff('${m.id}')" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-sm" onclick="SettingsView.toggleStatus('${m.id}')" title="Toggle Status">
              <i class="fa-solid fa-power-off"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="SettingsView.removeStaff('${m.id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  },

  togglePin(id, pin) {
    const el = document.getElementById(`pin-${id}`);
    if (!el) return;
    el.textContent = el.textContent.includes('•') ? pin : '••••';
  },

  toggleStatus(id) {
    const m = DB.staff.find(x => x.id === id);
    if (!m) return;
    const cycle = { active:'on-leave', 'on-leave':'inactive', inactive:'active' };
    m.status = cycle[m.status];
    this._refreshStaffTable();
    Toast.show(`${m.name} → ${m.status}`, 'info');
  },

  removeStaff(id) {
    const m = DB.staff.find(x => x.id === id);
    if (!m || !confirm(`Remove ${m.name}?`)) return;
    DB.staff = DB.staff.filter(x => x.id !== id);
    this._refreshStaffTable();
    Toast.show(`${m.name} removed`, 'warning');
  },

  _refreshStaffTable() {
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;
    const statusColors = { active:'tag-delivered', 'on-leave':'tag-pending', inactive:'tag-cancelled' };
    tbody.innerHTML = DB.staff.map(m => this._staffRow(m, statusColors)).join('');
  },

  openAddStaff() {
    const modal = document.getElementById('staffModal');
    if (!modal) return;
    document.getElementById('staffModalTitle').textContent = 'Add Staff Member';
    document.getElementById('staffModalContent').innerHTML = this._staffForm(null);
    modal.style.display = 'flex';
  },

  openEditStaff(id) {
    const m     = DB.staff.find(x => x.id === id);
    const modal = document.getElementById('staffModal');
    if (!m || !modal) return;
    document.getElementById('staffModalTitle').textContent = `Edit — ${m.name}`;
    document.getElementById('staffModalContent').innerHTML = this._staffForm(m);
    modal.style.display = 'flex';
  },

  _staffForm(m) {
    const roles  = ['Manager','Chef','Waiter','Cashier','Cleaner','Security'];
    const shifts = ['Morning','Evening','Night'];
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-control" id="sf-name" value="${m?.name || ''}" placeholder="e.g. Arif Hossain"/>
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-control" id="sf-phone" value="${m?.phone || ''}" placeholder="+880 1XX XXX XXXX"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-control" id="sf-role">
            ${roles.map(r=>`<option ${m?.role===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Shift</label>
          <select class="form-control" id="sf-shift">
            ${shifts.map(sh=>`<option ${m?.shift===sh?'selected':''}>${sh}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">4-digit PIN</label>
          <input class="form-control" id="sf-pin" type="password" maxlength="4" value="${m?.pin || ''}" placeholder="••••"/>
        </div>
        <div class="form-group">
          <label class="form-label">Joined Date</label>
          <input class="form-control" id="sf-joined" type="date" value="${m?.joined || Utils.today()}"/>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-outline" style="flex:1" onclick="document.getElementById('staffModal').style.display='none'">Cancel</button>
        <button class="btn btn-primary" style="flex:2" onclick="SettingsView.saveStaff('${m?.id || ''}')">
          <i class="fa-solid fa-save"></i> ${m ? 'Update' : 'Add Member'}
        </button>
      </div>`;
  },

  saveStaff(existingId) {
    const get = id => document.getElementById(id)?.value?.trim();
    const name = get('sf-name'), phone = get('sf-phone'), role = get('sf-role');
    const shift = get('sf-shift'), pin = get('sf-pin'), joined = get('sf-joined');

    if (!name || !pin || pin.length !== 4 || isNaN(pin)) {
      Toast.show('Enter valid name and 4-digit PIN', 'error'); return;
    }

    if (existingId) {
      const m = DB.staff.find(x => x.id === existingId);
      if (m) Object.assign(m, { name, phone, role, shift, pin, joined });
      Toast.show(`${name} updated`, 'success');
    } else {
      const id = 'STF' + String(DB.staff.length + 1).padStart(3, '0');
      DB.staff.push({ id, name, role, shift, status:'active', pin, joined, phone });
      Toast.show(`${name} added`, 'success');
    }

    document.getElementById('staffModal').style.display = 'none';
    this._refreshStaffTable();
  },

  /* ════════════════════════════════
     TAB: Operations
  ════════════════════════════════ */
  _tabOperations(s) {
    return this._section('Operations', 'fa-kitchen-set', 'var(--orange)', `
      ${this._toggle('autoAccept', 'Auto-accept Orders', 'Automatically accept new orders without confirmation', s.autoAccept)}
      ${this._toggle('kitchenDisplay', 'Kitchen Display System', 'Show live orders on kitchen screen', s.kitchenDisplay)}
      ${this._toggle('tableQR', 'QR Table Ordering', 'Allow customers to order via QR code', s.tableQR)}
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Order Timeout (minutes)</div>
          <div class="settings-row-desc">Auto-cancel orders not confirmed within this time</div>
        </div>
        <input class="form-control" id="s-timeout" type="number" min="5" max="60"
          value="${s.orderTimeout || 30}" style="width:80px;text-align:center" oninput="SettingsView._markDirty()"/>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Low Stock Alert Threshold</div>
          <div class="settings-row-desc">Notify when ingredient stock falls below this value</div>
        </div>
        <input class="form-control" id="s-stockAlert" type="number" min="1"
          value="${s.stockAlertThreshold || 10}" style="width:80px;text-align:center" oninput="SettingsView._markDirty()"/>
      </div>
    `);
  },

  /* ════════════════════════════════
     TAB: Notifications
  ════════════════════════════════ */
  _tabNotifications(s) {
    return this._section('Notifications', 'fa-bell', 'var(--purple)', `
      ${this._toggle('soundAlerts', 'Sound Alerts', 'Play audio when new orders arrive', s.soundAlerts)}
      ${this._toggle('emailNotif', 'Email Notifications', 'Send order summaries to email', s.emailNotif)}
      ${this._toggle('smsNotif', 'SMS Notifications', 'Send SMS alerts for new orders', s.smsNotif)}
      ${this._toggle('browserPush', 'Browser Push Notifications', 'Show desktop notifications in browser', s.browserPush)}
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Notification Sound</div>
          <div class="settings-row-desc">Choose alert sound for new orders</div>
        </div>
        <select class="form-control" id="s-sound" style="width:140px" onchange="SettingsView._markDirty()">
          <option>Chime</option><option>Bell</option><option>Ping</option><option>None</option>
        </select>
      </div>
    `);
  },

  /* ════════════════════════════════
     TAB: Appearance
  ════════════════════════════════ */
  _tabAppearance() {
    return this._section('Appearance', 'fa-palette', '#e91e8c', `
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Dark Mode</div>
          <div class="settings-row-desc">Switch to dark theme for low-light environments</div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${Theme._dark ? 'checked' : ''}
            onchange="Theme.toggle(); this.checked = Theme._dark"/>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Accent Color</div>
          <div class="settings-row-desc">Primary color used across buttons and highlights</div>
        </div>
        <div style="display:flex;gap:8px">
          ${['#c62828','#1565c0','#2e7d32','#e65100','#6a1b9a'].map(c=>`
            <div onclick="SettingsView.setAccent('${c}')"
              style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;border:2px solid transparent;transition:border-color .15s"
              onmouseenter="this.style.borderColor='#999'" onmouseleave="this.style.borderColor='transparent'"></div>
          `).join('')}
        </div>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Sidebar Position</div>
          <div class="settings-row-desc">Choose where the navigation sidebar appears</div>
        </div>
        <select class="form-control" style="width:120px" onchange="SettingsView._markDirty()">
          <option>Left</option><option>Right</option>
        </select>
      </div>
    `);
  },

  setAccent(color) {
    document.documentElement.style.setProperty('--red', color);
    Toast.show('Accent color updated', 'success');
  },

  /* ════════════════════════════════
     TAB: Danger Zone
  ════════════════════════════════ */
  _tabDanger() {
    return `
      <div class="settings-section" style="border-color:var(--red);margin-bottom:16px">
        <div class="settings-section-header" style="color:var(--red)">
          <i class="fa-solid fa-triangle-exclamation"></i> Danger Zone
        </div>
        ${[
          { label:'Clear All Orders',       desc:'Remove all order history permanently',       action:"if(confirm('Clear ALL orders?')){DB.orders=[];Toast.show('Orders cleared','warning')}" },
          { label:'Clear All Transactions', desc:'Delete all payment records',                  action:"if(confirm('Clear ALL transactions?')){DB.transactions=[];Toast.show('Transactions cleared','warning')}" },
          { label:'Clear Staff Data',       desc:'Remove all staff member records',             action:"if(confirm('Remove all staff?')){DB.staff=[];Toast.show('Staff data cleared','warning')}" },
          { label:'Reset Settings',         desc:'Restore all settings to factory defaults',   action:"if(confirm('Reset settings?')){Router.go('settings');Toast.show('Settings reset','info')}" },
        ].map(d=>`
          <div class="settings-row">
            <div>
              <div class="settings-row-label">${d.label}</div>
              <div class="settings-row-desc">${d.desc}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="${d.action}">
              <i class="fa-solid fa-trash"></i> ${d.label.split(' ')[0]}
            </button>
          </div>`).join('')}
      </div>`;
  },

  /* ── Save All ── */
  init() { this._activeTab = 'restaurant'; },

  saveAll() {
    const get = id => document.getElementById(id)?.value;
    const s   = DB.settings;
    s.restaurantName  = get('s-name')    || s.restaurantName;
    s.phone           = get('s-phone')   || s.phone;
    s.address         = get('s-address') || s.address;
    s.email           = get('s-email')   || s.email;
    s.website         = get('s-website') || s.website;
    s.currency        = get('s-currency')|| s.currency;
    s.taxRate         = parseFloat(get('s-tax'))      || s.taxRate;
    s.serviceCharge   = parseFloat(get('s-service'))  || s.serviceCharge;
    s.openTime        = get('s-open')    || s.openTime;
    s.closeTime       = get('s-close')   || s.closeTime;
    s.totalTables     = parseInt(get('s-tables'))      || s.totalTables;
    s.orderTimeout    = parseInt(get('s-timeout'))     || s.orderTimeout;
    s.stockAlertThreshold = parseInt(get('s-stockAlert')) || s.stockAlertThreshold;
    const banner = document.getElementById('unsavedBanner');
    if (banner) banner.style.display = 'none';
    Toast.show('All settings saved!', 'success');
  },

  exportConfig() {
    const config = JSON.stringify({ settings: DB.settings, staff: DB.staff }, null, 2);
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(config);
    a.download = 'savoria-config.json';
    a.click();
    Toast.show('Config exported!', 'success');
  },
};


/* ================================================
   PROFILE VIEW  (views/profile.js)
   Staff personal profile page
================================================ */

const ProfileView = {

  /* Current logged-in staff (in real app: from session) */
  _current() {
    if (!DB.staff || !DB.staff.length) {
      // Fallback default profile
      return { id:'STF001', name:'Arif Hossain', role:'Manager', shift:'Morning',
               status:'active', pin:'1234', joined:'2023-01-15', phone:'+880 171 000 0001' };
    }
    return DB.staff[0];
  },

  render() {
    const me = this._current();
    const initials = me.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    const statusColors = { active:'tag-delivered', 'on-leave':'tag-pending', inactive:'tag-cancelled' };

    // Stats from DB
    const totalOrders  = DB.orders?.length || 0;
    const todayOrders  = DB.orders?.filter(o => {
      const d = new Date(o.created); const t = new Date();
      return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate();
    }).length || 0;
    const totalRevenue = DB.orders?.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0) || 0;

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">Manage your personal information and preferences</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="ProfileView.saveProfile()">
          <i class="fa-solid fa-save"></i> Save Changes
        </button>
      </div>

      <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start">

        <!-- Left: profile card -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- Avatar + basic info -->
          <div class="card" style="text-align:center;padding:28px 20px">
            <!-- Avatar -->
            <div style="position:relative;display:inline-block;margin-bottom:16px">
              <div id="profileAvatar" style="width:80px;height:80px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;margin:0 auto;font-family:'Playfair Display',serif;border:3px solid var(--border)">
                ${initials}
              </div>
              <button onclick="ProfileView.changeAvatar()" style="position:absolute;bottom:0;right:0;width:26px;height:26px;border-radius:50%;background:var(--red);color:#fff;border:2px solid var(--bg);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center">
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>

            <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:4px">${me.name}</div>
            <div style="color:var(--text-3);font-size:13px;margin-bottom:10px">${me.role} · ${me.shift} Shift</div>
            <span class="tag ${statusColors[me.status]}">${me.status}</span>

            <div style="border-top:1px solid var(--border);margin-top:16px;padding-top:14px;text-align:left">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px">
                <i class="fa-solid fa-id-badge" style="color:var(--text-3);width:16px"></i>
                <span style="color:var(--text-3)">ID:</span>
                <span style="font-weight:600">${me.id}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px">
                <i class="fa-solid fa-phone" style="color:var(--text-3);width:16px"></i>
                <span id="prof-phone-display" style="font-weight:600">${me.phone}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:13px">
                <i class="fa-solid fa-calendar" style="color:var(--text-3);width:16px"></i>
                <span style="color:var(--text-3)">Since:</span>
                <span style="font-weight:600">${me.joined}</span>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="card" style="padding:16px">
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);margin-bottom:12px">Activity Stats</p>
            ${[
              { label:'Total Orders Handled', value: totalOrders,              icon:'fa-receipt',   color:'var(--blue)' },
              { label:"Today's Orders",        value: todayOrders,              icon:'fa-fire',      color:'var(--orange)' },
              { label:'Revenue Generated',     value: Utils.money(totalRevenue),icon:'fa-dollar-sign',color:'var(--green)' },
              { label:'Shift',                 value: me.shift,                 icon:'fa-clock',     color:'var(--purple)' },
            ].map(st=>`
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <div style="width:32px;height:32px;border-radius:8px;background:var(--bg-surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <i class="fa-solid ${st.icon}" style="color:${st.color};font-size:12px"></i>
                </div>
                <div style="flex:1">
                  <div style="font-size:11px;color:var(--text-3)">${st.label}</div>
                  <div style="font-weight:700;font-size:14px">${st.value}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Quick actions -->
          <div class="card" style="padding:16px">
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-3);margin-bottom:12px">Quick Actions</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button class="btn btn-outline btn-sm" style="justify-content:flex-start;gap:8px" onclick="Router.go('getorder')">
                <i class="fa-solid fa-plus" style="color:var(--red)"></i> New Order
              </button>
              <button class="btn btn-outline btn-sm" style="justify-content:flex-start;gap:8px" onclick="Router.go('orders')">
                <i class="fa-solid fa-list" style="color:var(--blue)"></i> View Orders
              </button>
              <button class="btn btn-outline btn-sm" style="justify-content:flex-start;gap:8px" onclick="ProfileView.printBadge()">
                <i class="fa-solid fa-id-card" style="color:var(--green)"></i> Print Badge
              </button>
            </div>
          </div>
        </div>

        <!-- Right: edit forms -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- Personal info -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-user" style="color:var(--blue)"></i> Personal Information
            </div>
            <div style="padding:20px">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input class="form-control" id="pf-name" value="${me.name}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input class="form-control" id="pf-phone" value="${me.phone}"/>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input class="form-control" id="pf-email" type="email" value="${me.email || ''}" placeholder="arif@savoria.com"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Emergency Contact</label>
                  <input class="form-control" id="pf-emergency" value="${me.emergency || ''}" placeholder="+880 1XX XXX XXXX"/>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input class="form-control" id="pf-address" value="${me.address || ''}" placeholder="House, Road, Area, City"/>
              </div>
            </div>
          </div>

          <!-- Work info (read-only for non-managers) -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-briefcase" style="color:var(--orange)"></i> Work Information
            </div>
            <div style="padding:20px">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Role</label>
                  <input class="form-control" value="${me.role}" disabled style="opacity:.6;cursor:not-allowed"/>
                  <div style="font-size:11px;color:var(--text-3);margin-top:4px">Contact manager to change role</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Shift</label>
                  <select class="form-control" id="pf-shift">
                    ${['Morning','Evening','Night'].map(sh=>`<option ${me.shift===sh?'selected':''}>${sh}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Employee ID</label>
                  <input class="form-control" value="${me.id}" disabled style="opacity:.6;cursor:not-allowed"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Joining Date</label>
                  <input class="form-control" value="${me.joined}" disabled style="opacity:.6;cursor:not-allowed"/>
                </div>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-shield-halved" style="color:var(--green)"></i> Security & PIN
            </div>
            <div style="padding:20px">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Current PIN</label>
                  <input class="form-control" id="pf-oldpin" type="password" maxlength="4" placeholder="••••"/>
                </div>
                <div class="form-group">
                  <label class="form-label">New PIN</label>
                  <input class="form-control" id="pf-newpin" type="password" maxlength="4" placeholder="••••"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm PIN</label>
                  <input class="form-control" id="pf-confirmpin" type="password" maxlength="4" placeholder="••••"/>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="ProfileView.changePin()">
                <i class="fa-solid fa-key"></i> Update PIN
              </button>

              <div style="border-top:1px solid var(--border);margin-top:16px;padding-top:14px">
                <div style="font-size:13px;font-weight:600;margin-bottom:4px">Last Login</div>
                <div style="font-size:13px;color:var(--text-3)">${new Date().toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'})}</div>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="settings-section">
            <div class="settings-section-header">
              <i class="fa-solid fa-sliders" style="color:var(--purple)"></i> My Preferences
            </div>
            <div style="padding:4px 0">
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Dark Mode</div>
                  <div class="settings-row-desc">Personal display preference</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" ${Theme._dark ? 'checked' : ''} onchange="Theme.toggle();this.checked=Theme._dark"/>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Sound Notifications</div>
                  <div class="settings-row-desc">Play alert when a new order arrives</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="pf-sound" ${DB.settings?.soundAlerts ? 'checked' : ''} onchange="DB.settings.soundAlerts=this.checked"/>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Default View on Login</div>
                  <div class="settings-row-desc">Page to open after signing in</div>
                </div>
                <select class="form-control" id="pf-defaultView" style="width:130px">
                  <option>Dashboard</option><option>Orders</option><option>Get Order</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>`;
  },

  init() {},

  saveProfile() {
    const me = this._current();
    const get = id => document.getElementById(id)?.value?.trim();

    me.name      = get('pf-name')      || me.name;
    me.phone     = get('pf-phone')     || me.phone;
    me.email     = get('pf-email')     || me.email;
    me.emergency = get('pf-emergency') || me.emergency;
    me.address   = get('pf-address')   || me.address;
    me.shift     = get('pf-shift')     || me.shift;

    // Refresh the display phone
    const phoneDisplay = document.getElementById('prof-phone-display');
    if (phoneDisplay) phoneDisplay.textContent = me.phone;

    Toast.show('Profile saved successfully!', 'success');
  },

  changePin() {
    const me      = this._current();
    const oldPin  = document.getElementById('pf-oldpin')?.value;
    const newPin  = document.getElementById('pf-newpin')?.value;
    const confirm = document.getElementById('pf-confirmpin')?.value;

    if (oldPin !== me.pin) { Toast.show('Current PIN is incorrect', 'error'); return; }
    if (!newPin || newPin.length !== 4 || isNaN(newPin)) { Toast.show('PIN must be 4 digits', 'error'); return; }
    if (newPin !== confirm) { Toast.show('PINs do not match', 'error'); return; }

    me.pin = newPin;
    ['pf-oldpin','pf-newpin','pf-confirmpin'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    Toast.show('PIN updated successfully!', 'success');
  },

  changeAvatar() {
    const colors = ['#c62828','#1565c0','#2e7d32','#e65100','#6a1b9a','#00838f'];
    const me = this._current();
    const el = document.getElementById('profileAvatar');
    if (!el) return;
    const next = colors[(colors.indexOf(el.style.background) + 1) % colors.length];
    el.style.background = next;
    Toast.show('Avatar color changed', 'info');
  },

  printBadge() {
    const me = this._current();
    Toast.show(`Printing badge for ${me.name}...`, 'info');
  },
};