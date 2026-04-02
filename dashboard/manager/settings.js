/* ================================================
   SETTINGS VIEW  (views/settings.js)
   Staff-only settings page — fully responsive
================================================ */

const SettingsView = {

  _activeTab: 'appearance',

  /* ─────────────────────────────────────────────
     render()
  ───────────────────────────────────────────── */
  render() {
    const TABS = [
      { key: 'appearance',    icon: 'fa-palette',   label: 'Appearance',    color: '#e91e8c'       },
      { key: 'notifications', icon: 'fa-bell',      label: 'Notifications', color: 'var(--purple)' },
      { key: 'account',       icon: 'fa-user-gear', label: 'Account',       color: 'var(--blue)'   },
      { key: 'shift',         icon: 'fa-clock',     label: 'Shift & Work',  color: 'var(--orange)' },
    ];

    return `
      <style>
        /* ── Settings layout ── */
        .sv-wrap {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 16px;
          align-items: start;
        }

        /* ── Left nav (desktop) ── */
        .sv-sidenav {
          padding: 8px;
          position: sticky;
          top: 16px;
        }

        /* ── Mobile horizontal tab bar ── */
        .sv-mobile-tabs {
          display: none;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          gap: 4px;
          background: var(--bg-input);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 16px;
          scrollbar-width: none;
        }
        .sv-mobile-tabs::-webkit-scrollbar { display: none; }
        .sv-mobile-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 7px;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-3);
          cursor: pointer;
          white-space: nowrap;
          transition: all .2s;
          flex-shrink: 0;
        }
        .sv-mobile-tab.active {
          background: var(--bg-surface);
          color: var(--text);
          box-shadow: var(--shadow-sm);
        }

        /* ── Responsive breakpoint ── */
        @media (max-width: 640px) {
          .sv-wrap {
            grid-template-columns: 1fr;
          }
          .sv-sidenav { display: none; }         /* hide left nav */
          .sv-mobile-tabs { display: flex; }     /* show tab bar  */

          /* form-row stacks on mobile */
          .settings-form-row {
            grid-template-columns: 1fr !important;
          }

          /* settings-row: stack label + control */
          .settings-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 10px;
          }
          .settings-row select,
          .settings-row .toggle { align-self: flex-start; }

          /* Accent color dots wrap */
          .sv-accent-dots { flex-wrap: wrap; }

          /* Day buttons wrap */
          .sv-day-btns { justify-content: flex-start; }

          /* Current assignment cards stack */
          .sv-assignment-cards { flex-direction: column; }
        }

        @media (max-width: 900px) and (min-width: 641px) {
          .sv-wrap { grid-template-columns: 160px 1fr; }
        }
      </style>

      <!-- PAGE HEADER -->
      <div class="page-header anim-1">
        <div>
          <div class="page-subtitle">System</div>
          <h1 class="page-title">Sett<em style="color:var(--red);font-style:italic">ings</em></h1>
        </div>
        <button class="btn btn-primary btn-sm" onclick="SettingsView.saveAll()">
          <i class="fa-solid fa-save"></i> Save Changes
        </button>
      </div>

      <!-- Unsaved changes banner -->
      <div id="unsavedBanner"
        style="display:none;background:var(--gold-pale);
               border:1px solid var(--gold);border-radius:10px;
               padding:10px 16px;margin-bottom:16px;
               align-items:center;gap:10px;font-size:13px;
               font-weight:600;color:var(--gold)">
        <i class="fa-solid fa-circle-exclamation"></i>
        You have unsaved changes
        <button class="btn btn-sm"
          style="margin-left:auto;background:var(--gold);
                 color:#fff;border:none;border-radius:6px;
                 padding:4px 12px;cursor:pointer;font-size:12px"
          onclick="SettingsView.saveAll()">Save Now</button>
      </div>

      <!-- Mobile horizontal tabs -->
      <div class="sv-mobile-tabs" id="mobileTabs">
        ${TABS.map(t => `
          <button class="sv-mobile-tab ${this._activeTab === t.key ? 'active' : ''}"
            onclick="SettingsView.switchTab('${t.key}', this, true)">
            <i class="fa-solid ${t.icon}" style="color:${t.color};font-size:12px"></i>
            ${t.label}
          </button>`).join('')}
      </div>

      <!-- Main layout -->
      <div class="sv-wrap anim-2">

        <!-- Left sidenav (tablet/desktop) -->
        <div class="card sv-sidenav">
          ${TABS.map(t => `
            <button
              onclick="SettingsView.switchTab('${t.key}', this, false)"
              class="settings-nav-btn"
              style="width:100%;display:flex;align-items:center;gap:10px;
                     padding:10px 12px;border:none;cursor:pointer;
                     font-size:13px;text-align:left;border-radius:8px;
                     transition:all .15s;font-family:inherit;
                     background:${this._activeTab === t.key
                       ? 'var(--bg-hover,rgba(0,0,0,.05))' : 'transparent'};
                     font-weight:${this._activeTab === t.key ? '700' : '500'};
                     color:${this._activeTab === t.key ? t.color : 'var(--text-2)'}">
              <i class="fa-solid ${t.icon}"
                style="width:16px;color:${t.color};font-size:13px"></i>
              ${t.label}
            </button>`).join('')}
        </div>

        <!-- Content area -->
        <div id="settingsContent">
          ${this._renderTab(this._activeTab)}
        </div>

      </div>`;
  },

  /* ─────────────────────────────────────────────
     switchTab() — isMobile flag decides which
     set of buttons to re-highlight
  ───────────────────────────────────────────── */
  switchTab(key, btn, isMobile) {
    this._activeTab = key;

    const COLORS = {
      appearance:    '#e91e8c',
      notifications: 'var(--purple)',
      account:       'var(--blue)',
      shift:         'var(--orange)',
    };

    if (isMobile) {
      /* highlight mobile tabs */
      document.querySelectorAll('.sv-mobile-tab').forEach(b => {
        b.classList.remove('active');
        b.style.color = 'var(--text-3)';
      });
      if (btn) { btn.classList.add('active'); btn.style.color = 'var(--text)'; }
    } else {
      /* highlight sidenav buttons */
      document.querySelectorAll('.settings-nav-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.fontWeight = '500';
        b.style.color      = 'var(--text-2)';
      });
      if (btn) {
        btn.style.background = 'var(--bg-hover,rgba(0,0,0,.05))';
        btn.style.fontWeight = '700';
        btn.style.color      = COLORS[key] || 'var(--text)';
      }
    }

    const content = document.getElementById('settingsContent');
    if (content) content.innerHTML = this._renderTab(key);
  },

  _renderTab(key) {
    const map = {
      appearance:    () => this._tabAppearance(),
      notifications: () => this._tabNotifications(),
      account:       () => this._tabAccount(),
      shift:         () => this._tabShift(),
    };
    return (map[key] || map.appearance)();
  },

  /* ── Section wrapper ── */
  _section(title, icon, color, content) {
    return `
      <div class="settings-section" style="margin-bottom:16px">
        <div class="settings-section-header">
          <i class="fa-solid ${icon}" style="color:${color}"></i> ${title}
        </div>
        <div style="padding:20px">${content}</div>
      </div>`;
  },

  /* ── Toggle row ── */
  _toggle(key, label, desc, checked, onchange) {
    const handler = onchange ||
      `if(!DB.settings)DB.settings={};
       DB.settings['${key}']=this.checked;
       localStorage.setItem('DB',JSON.stringify(DB));
       SettingsView._markDirty()`;
    return `
      <div class="settings-row">
        <div>
          <div class="settings-row-label">${label}</div>
          <div class="settings-row-desc">${desc}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="s-${key}"
            ${checked ? 'checked' : ''} onchange="${handler}"/>
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  },

  _markDirty() {
    const b = document.getElementById('unsavedBanner');
    if (b) b.style.display = 'flex';
  },

  /* ─────────────────────────────────────────────
     TAB: Appearance
  ───────────────────────────────────────────── */
  _tabAppearance() {
    const s = DB.settings || {};
    return this._section('Appearance', 'fa-palette', '#e91e8c', `

      ${this._toggle(
        'darkMode',
        'Dark Mode',
        'Switch to dark theme for low-light environments',
        Theme._dark,
        `Theme.toggle(); this.checked = Theme._dark`,
      )}

      <!-- Accent Color -->
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Accent Color</div>
          <div class="settings-row-desc">Primary color used across buttons and highlights</div>
        </div>
        <div class="sv-accent-dots"
          style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          ${['#c62828','#1565c0','#2e7d32','#e65100','#6a1b9a','#00838f'].map(c => `
            <div onclick="SettingsView.setAccent('${c}')" title="${c}"
              style="width:24px;height:24px;border-radius:50%;background:${c};
                     cursor:pointer;border:2px solid var(--border);flex-shrink:0;
                     transition:transform .15s,border-color .15s"
              onmouseenter="this.style.transform='scale(1.2)';this.style.borderColor='var(--text-3)'"
              onmouseleave="this.style.transform='scale(1)';this.style.borderColor='var(--border)'">
            </div>`).join('')}
        </div>
      </div>

      <!-- Font Size -->
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Font Size</div>
          <div class="settings-row-desc">Adjust text size across the dashboard</div>
        </div>
        <select class="form-control" id="s-fontsize" style="width:110px"
          onchange="SettingsView._applyFontSize(this.value);SettingsView._markDirty()">
          ${['Small','Medium','Large'].map(f =>
            `<option ${(s.fontSize||'Medium')===f?'selected':''}>${f}</option>`
          ).join('')}
        </select>
      </div>

      <!-- Sidebar Position -->
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Sidebar Position</div>
          <div class="settings-row-desc">Choose where the navigation appears</div>
        </div>
        <select class="form-control" id="s-sidebar" style="width:110px"
          onchange="SettingsView._markDirty()">
          ${['Left','Right'].map(p =>
            `<option ${(s.sidebarPos||'Left')===p?'selected':''}>${p}</option>`
          ).join('')}
        </select>
      </div>

      ${this._toggle(
        'compactMode',
        'Compact Mode',
        'Reduce padding and spacing for more content on screen',
        s.compactMode || false,
      )}
    `);
  },

  setAccent(color) {
    document.documentElement.style.setProperty('--red', color);
    if (!DB.settings) DB.settings = {};
    DB.settings.accentColor = color;
    localStorage.setItem('DB', JSON.stringify(DB));
    Toast.show('Accent colour updated', 'success');
  },

  _applyFontSize(size) {
    const map = { Small: '13px', Medium: '15px', Large: '17px' };
    document.documentElement.style.setProperty('--font-size-base', map[size] || '15px');
    if (!DB.settings) DB.settings = {};
    DB.settings.fontSize = size;
    localStorage.setItem('DB', JSON.stringify(DB));
  },

  /* ─────────────────────────────────────────────
     TAB: Notifications
  ───────────────────────────────────────────── */
  _tabNotifications() {
    const s = DB.settings || {};
    return this._section('Notifications', 'fa-bell', 'var(--purple)', `

      ${this._toggle('soundAlerts',   'Sound Alerts',
        'Play audio when new orders arrive', s.soundAlerts || false)}

      ${this._toggle('browserPush',   'Browser Notifications',
        'Show desktop pop-ups for new orders', s.browserPush || false)}

      ${this._toggle('shiftReminder', 'Shift Reminder',
        'Notify 15 minutes before your shift starts', s.shiftReminder || false)}

      ${this._toggle('orderAlerts',   'Order Status Alerts',
        'Get notified when your order status changes', s.orderAlerts !== false)}

      <div class="settings-row">
        <div>
          <div class="settings-row-label">Alert Sound</div>
          <div class="settings-row-desc">Choose sound for new order notifications</div>
        </div>
        <select class="form-control" id="s-sound" style="width:130px"
          onchange="SettingsView._markDirty()">
          ${['Chime','Bell','Ping','None'].map(v =>
            `<option ${(s.alertSound||'Chime')===v?'selected':''}>${v}</option>`
          ).join('')}
        </select>
      </div>

      <div style="margin-top:8px">
        <button class="btn btn-outline btn-sm" onclick="SettingsView._previewSound()">
          <i class="fa-solid fa-volume-high"></i> Preview Sound
        </button>
      </div>
    `);
  },

  _previewSound() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch (_) {
      Toast.show('Sound preview not supported', 'warning');
    }
  },

  /* ─────────────────────────────────────────────
     TAB: Account
  ───────────────────────────────────────────── */
  _tabAccount() {
    const s  = DB.settings || {};
    const me = DB.staff?.[0] || {};
    return `
      ${this._section('Account Preferences', 'fa-user-gear', 'var(--blue)', `

        <div class="settings-row">
          <div>
            <div class="settings-row-label">Default View on Login</div>
            <div class="settings-row-desc">Page to open after signing in</div>
          </div>
          <select class="form-control" id="s-defaultview" style="width:130px"
            onchange="SettingsView._markDirty()">
            ${['Dashboard','Orders','Get Order','Profile'].map(v =>
              `<option ${(s.defaultView||'Dashboard')===v?'selected':''}>${v}</option>`
            ).join('')}
          </select>
        </div>

        <div class="settings-row">
          <div>
            <div class="settings-row-label">Language</div>
            <div class="settings-row-desc">Display language for the interface</div>
          </div>
          <select class="form-control" id="s-lang" style="width:130px"
            onchange="SettingsView._markDirty()">
            ${['English','Bengali'].map(l =>
              `<option ${(s.language||'English')===l?'selected':''}>${l}</option>`
            ).join('')}
          </select>
        </div>

        <div class="settings-row">
          <div>
            <div class="settings-row-label">Date Format</div>
            <div class="settings-row-desc">How dates are displayed across the dashboard</div>
          </div>
          <select class="form-control" id="s-datefmt" style="width:130px"
            onchange="SettingsView._markDirty()">
            ${['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(f =>
              `<option ${(s.dateFormat||'DD/MM/YYYY')===f?'selected':''}>${f}</option>`
            ).join('')}
          </select>
        </div>

        ${this._toggle('autoLock',
          'Auto-lock after Idle',
          'Lock the screen after 10 minutes of inactivity',
          s.autoLock || false,
        )}
      `)}

      ${this._section('Read-only Info', 'fa-circle-info', 'var(--text-3)', `
        <div style="font-size:13px;color:var(--text-3);margin-bottom:14px">
          These fields are managed by your manager. Contact them to update.
        </div>
        <div class="form-row settings-form-row">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input class="form-control" value="${me.name || '—'}" disabled
              style="opacity:.6;cursor:not-allowed"/>
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <input class="form-control" value="${me.role || '—'}" disabled
              style="opacity:.6;cursor:not-allowed"/>
          </div>
        </div>
        <div class="form-row settings-form-row">
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input class="form-control" value="${me.id || '—'}" disabled
              style="opacity:.6;cursor:not-allowed"/>
          </div>
          <div class="form-group">
            <label class="form-label">Joining Date</label>
            <input class="form-control" value="${me.joined || '—'}" disabled
              style="opacity:.6;cursor:not-allowed"/>
          </div>
        </div>
      `)}`;
  },

  /* ─────────────────────────────────────────────
     TAB: Shift & Work
  ───────────────────────────────────────────── */
  _tabShift() {
    const me = DB.staff?.[0] || {};
    const s  = DB.settings || {};
    return this._section('Shift & Work Preferences', 'fa-clock', 'var(--orange)', `

      <div class="settings-row">
        <div>
          <div class="settings-row-label">Preferred Shift</div>
          <div class="settings-row-desc">Your preferred working shift (subject to manager approval)</div>
        </div>
        <select class="form-control" id="s-prefshift" style="width:120px"
          onchange="SettingsView._markDirty()">
          ${['Morning','Evening','Night'].map(sh =>
            `<option ${(me.shift||'Morning')===sh?'selected':''}>${sh}</option>`
          ).join('')}
        </select>
      </div>

      <!-- Available days -->
      <div class="settings-row" style="align-items:flex-start;padding:14px 0">
        <div>
          <div class="settings-row-label">Available Days</div>
          <div class="settings-row-desc">Days you are available to work this week</div>
        </div>
        <div class="sv-day-btns"
          style="display:flex;flex-wrap:wrap;gap:6px">
          ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => {
            const active = (s.availableDays || ['Mon','Tue','Wed','Thu','Fri']).includes(d);
            return `
              <button id="day-${d}"
                onclick="SettingsView._toggleDay('${d}', this)"
                style="padding:5px 12px;border-radius:6px;font-size:12px;
                       font-weight:600;cursor:pointer;border:1px solid;
                       font-family:inherit;transition:all .15s;
                       background:${active ? 'var(--red)' : 'transparent'};
                       color:${active ? '#fff' : 'var(--text-3)'};
                       border-color:${active ? 'var(--red)' : 'var(--border)'}">
                ${d}
              </button>`;
          }).join('')}
        </div>
      </div>

      ${this._toggle('overtime',
        'Open to Overtime',
        'Let managers know you are willing to work extra hours',
        s.overtime || false,
      )}

      ${this._toggle('breakReminder',
        'Break Reminder',
        'Get a notification reminder after 4 hours on shift',
        s.breakReminder || false,
      )}

      <!-- Current assignment (read-only) -->
      <div style="border-top:1px solid var(--border);margin-top:4px;padding-top:16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;
                    letter-spacing:.08em;color:var(--text-3);margin-bottom:10px">
          Current Assignment
        </div>
        <div class="sv-assignment-cards"
          style="display:flex;gap:12px;flex-wrap:wrap">
          ${[
            { label: 'Assigned Shift', val: me.shift  || 'Morning' },
            { label: 'Status',         val: me.status || 'active'  },
            { label: 'Joined',         val: me.joined || '—'       },
          ].map(r => `
            <div style="background:var(--bg-surface2);border:1px solid var(--border);
                        border-radius:8px;padding:10px 14px;flex:1;min-width:100px">
              <div style="font-size:11px;color:var(--text-3);margin-bottom:2px">
                ${r.label}
              </div>
              <div style="font-weight:700;font-size:14px">${r.val}</div>
            </div>`).join('')}
        </div>
      </div>
    `);
  },

  _toggleDay(day, btn) {
    if (!DB.settings) DB.settings = {};
    let days = DB.settings.availableDays || ['Mon','Tue','Wed','Thu','Fri'];
    if (days.includes(day)) {
      days = days.filter(d => d !== day);
      btn.style.background  = 'transparent';
      btn.style.color       = 'var(--text-3)';
      btn.style.borderColor = 'var(--border)';
    } else {
      days.push(day);
      btn.style.background  = 'var(--red)';
      btn.style.color       = '#fff';
      btn.style.borderColor = 'var(--red)';
    }
    DB.settings.availableDays = days;
    localStorage.setItem('DB', JSON.stringify(DB));
    this._markDirty();
  },

  /* ─────────────────────────────────────────────
     saveAll()
  ───────────────────────────────────────────── */
  saveAll() {
    const s   = DB.settings || (DB.settings = {});
    const get = id => document.getElementById(id)?.value ?? null;

    const fontSize    = get('s-fontsize');
    const sidebarPos  = get('s-sidebar');
    const alertSound  = get('s-sound');
    const defaultView = get('s-defaultview');
    const language    = get('s-lang');
    const dateFormat  = get('s-datefmt');
    const prefShift   = get('s-prefshift');

    if (fontSize)    { s.fontSize   = fontSize;    this._applyFontSize(fontSize); }
    if (sidebarPos)  s.sidebarPos   = sidebarPos;
    if (alertSound)  s.alertSound   = alertSound;
    if (defaultView) s.defaultView  = defaultView;
    if (language)    s.language     = language;
    if (dateFormat)  s.dateFormat   = dateFormat;
    if (prefShift && DB.staff?.[0]) DB.staff[0].shift = prefShift;

    localStorage.setItem('DB', JSON.stringify(DB));

    const banner = document.getElementById('unsavedBanner');
    if (banner) banner.style.display = 'none';

    Toast.show('Settings saved!', 'success');
  },

  /* ─────────────────────────────────────────────
     init()
  ───────────────────────────────────────────── */
  init() {
    const saved    = DB.settings?.accentColor;
    if (saved) document.documentElement.style.setProperty('--red', saved);
    const fontSize = DB.settings?.fontSize;
    if (fontSize) this._applyFontSize(fontSize);
  },
};