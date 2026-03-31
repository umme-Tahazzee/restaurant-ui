/* ================================================
   SETTINGS VIEW
================================================ */

const SettingsView = {

  render() {
    const s = DB.settings;
    return `
      <div id="settingsRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">System</div>
            <h1 class="page-title">Set<em style="color:var(--red);font-style:italic">tings</em></h1>
          </div>
          <button class="btn btn-primary btn-sm" onclick="SettingsView.saveSettings()"><i class="fa-solid fa-check"></i> Save Changes</button>
        </div>

        <!-- Restaurant Info -->
        <div class="settings-section anim-1">
          <div class="settings-section-header"><i class="fa-solid fa-store" style="color:var(--gold)"></i> Restaurant Information</div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Restaurant Name</div><div class="settings-row-desc">Business display name</div></div>
            <input type="text" id="setResName" class="form-control" style="width:100%;max-width:300px" value="${s.restaurantName}">
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Address</div><div class="settings-row-desc">Primary location</div></div>
            <input type="text" id="setAddress" class="form-control" style="width:100%;max-width:300px" value="${s.address}">
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Phone</div><div class="settings-row-desc">Contact number for customers</div></div>
            <input type="text" id="setPhone" class="form-control" style="width:100%;max-width:300px" value="${s.phone}">
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Email</div><div class="settings-row-desc">Support and business email</div></div>
            <input type="email" id="setEmail" class="form-control" style="width:100%;max-width:300px" value="${s.email}">
          </div>
        </div>

        <!-- Financial -->
        <div class="settings-section anim-2">
          <div class="settings-section-header"><i class="fa-solid fa-dollar-sign" style="color:var(--green)"></i> Financial Settings</div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Currency</div><div class="settings-row-desc">Store base currency</div></div>
            <select id="setCurrency" class="select-styled" style="width:100%;max-width:300px">
              <option value="$" ${s.currency==='$'?'selected':''}>USD ($)</option>
              <option value="€" ${s.currency==='€'?'selected':''}>EUR (€)</option>
              <option value="£" ${s.currency==='£'?'selected':''}>GBP (£)</option>
              <option value="৳" ${s.currency==='৳'?'selected':''}>BDT (৳)</option>
            </select>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Tax Rate</div><div class="settings-row-desc">Default tax applied to orders</div></div>
            <div style="display:flex;align-items:center;gap:8px;width:100%;max-width:300px">
              <input type="number" id="setTax" class="form-control" style="text-align:right" value="${s.taxRate}" step="0.1">
              <span>%</span>
            </div>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Service Charge</div><div class="settings-row-desc">Default mandatory tip</div></div>
            <div style="display:flex;align-items:center;gap:8px;width:100%;max-width:300px">
              <input type="number" id="setService" class="form-control" style="text-align:right" value="${s.serviceCharge}" step="1">
              <span>%</span>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="settings-section anim-3">
          <div class="settings-section-header"><i class="fa-solid fa-bell" style="color:var(--blue)"></i> Notifications</div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Email Notifications</div><div class="settings-row-desc">Receive order and report emails</div></div>
            <label class="toggle"><input type="checkbox" id="setEmailNotif" ${s.emailNotif?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">SMS Notifications</div><div class="settings-row-desc">Receive SMS alerts for urgent items</div></div>
            <label class="toggle"><input type="checkbox" id="setSmsNotif" ${s.smsNotif?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Sound Effects</div><div class="settings-row-desc">Play sound on new orders</div></div>
            <label class="toggle"><input type="checkbox" id="setSound" ${s.soundAlerts?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Auto Accept Orders</div><div class="settings-row-desc">Automatically accept incoming orders</div></div>
            <label class="toggle"><input type="checkbox" id="setAutoAccept" ${s.autoAccept?'checked':''}><span class="toggle-slider"></span></label>
          </div>
        </div>

        <!-- Appearance -->
        <div class="settings-section anim-4">
          <div class="settings-section-header"><i class="fa-solid fa-palette" style="color:var(--purple)"></i> Appearance</div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Dark Mode</div><div class="settings-row-desc">Switch between light and dark interface</div></div>
            <label class="toggle"><input type="checkbox" onchange="Theme.toggle()" ${document.documentElement.getAttribute('data-theme')==='dark'?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Language</div><div class="settings-row-desc">Interface language</div></div>
            <select id="setLanguage" class="select-styled" style="width:100%;max-width:300px">
              <option value="English" ${s.language==='English'?'selected':''}>English</option>
              <option value="Bengali" ${s.language==='Bengali'?'selected':''}>Bengali</option>
              <option value="Spanish" ${s.language==='Spanish'?'selected':''}>Spanish</option>
              <option value="French" ${s.language==='French'?'selected':''}>French</option>
            </select>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Timezone</div><div class="settings-row-desc">System operating timezone</div></div>
            <select id="setTimezone" class="select-styled" style="width:100%;max-width:300px">
              <option value="America/New_York" ${s.timezone==='America/New_York'?'selected':''}>America/New_York</option>
              <option value="Asia/Dhaka" ${s.timezone==='Asia/Dhaka'?'selected':''}>Asia/Dhaka</option>
              <option value="Europe/London" ${s.timezone==='Europe/London'?'selected':''}>Europe/London</option>
            </select>
          </div>
        </div>

        <!-- Security -->
        <div class="settings-section anim-4">
          <div class="settings-section-header"><i class="fa-solid fa-shield-halved" style="color:var(--red)"></i> Security</div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Change Password</div><div class="settings-row-desc">Update your admin password</div></div>
            <button class="btn btn-outline btn-sm" onclick="Router.go('profile')"><i class="fa-solid fa-key"></i> Change</button>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Two-Factor Authentication</div><div class="settings-row-desc">Add an extra layer of security</div></div>
            <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row" style="flex-wrap:wrap;gap:16px">
            <div style="flex:1;min-width:200px"><div class="settings-row-label">Login History</div><div class="settings-row-desc">View recent login activity</div></div>
            <button class="btn btn-outline btn-sm" onclick="Router.go('profile')"><i class="fa-solid fa-clock-rotate-left"></i> View</button>
          </div>
        </div>
      </div>`;
  },

  saveSettings() {
    DB.settings.restaurantName = document.getElementById('setResName').value.trim();
    DB.settings.address = document.getElementById('setAddress').value.trim();
    DB.settings.phone = document.getElementById('setPhone').value.trim();
    DB.settings.email = document.getElementById('setEmail').value.trim();
    
    DB.settings.currency = document.getElementById('setCurrency').value;
    DB.settings.taxRate = parseFloat(document.getElementById('setTax').value) || 0;
    DB.settings.serviceCharge = parseFloat(document.getElementById('setService').value) || 0;

    DB.settings.emailNotif = document.getElementById('setEmailNotif').checked;
    DB.settings.smsNotif = document.getElementById('setSmsNotif').checked;
    DB.settings.soundAlerts = document.getElementById('setSound').checked;
    DB.settings.autoAccept = document.getElementById('setAutoAccept').checked;

    DB.settings.language = document.getElementById('setLanguage').value;
    DB.settings.timezone = document.getElementById('setTimezone').value;

    Toast.show('Settings saved successfully!', 'success');
  },

  init() {},

};
