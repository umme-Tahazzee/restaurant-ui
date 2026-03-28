/* ================================================
   SETTINGS VIEW
================================================ */

const SettingsView = {

  _data: null,

  async render() {
    try {
      this._data = await API.getSettings();
    } catch(err) {
      return `<div style="padding:40px;color:var(--red);">Failed to load settings data.</div>`;
    }

    const s = this._data;
    return `
      <div id="settingsRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">System</div>
            <h1 class="page-title">Set<em style="color:var(--red);font-style:italic">tings</em></h1>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Toast.show('Settings saved!','success')"><i class="fa-solid fa-check"></i> Save Changes</button>
        </div>

        <!-- Restaurant Info -->
        <div class="settings-section anim-1">
          <div class="settings-section-header"><i class="fa-solid fa-store" style="color:var(--gold)"></i> Restaurant Information</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Restaurant Name</div><div class="settings-row-desc">${s.restaurantName}</div></div>
            <button class="btn btn-outline btn-sm" onclick="Toast.show('Edit modal coming soon','info')"><i class="fa-solid fa-pen"></i> Edit</button>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Address</div><div class="settings-row-desc">${s.address}</div></div>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i> Edit</button>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Phone</div><div class="settings-row-desc">${s.phone}</div></div>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i> Edit</button>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Email</div><div class="settings-row-desc">${s.email}</div></div>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i> Edit</button>
          </div>
        </div>

        <!-- Financial -->
        <div class="settings-section anim-2">
          <div class="settings-section-header"><i class="fa-solid fa-dollar-sign" style="color:var(--green)"></i> Financial Settings</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Currency</div><div class="settings-row-desc">USD ($)</div></div>
            <select class="select-styled" style="width:120px"><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>BDT (৳)</option></select>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Tax Rate</div><div class="settings-row-desc">${s.taxRate}%</div></div>
            <input type="number" class="form-control" style="width:100px;text-align:right" value="${s.taxRate}" step="0.5"/>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Service Charge</div><div class="settings-row-desc">${s.serviceCharge}%</div></div>
            <input type="number" class="form-control" style="width:100px;text-align:right" value="${s.serviceCharge}" step="1"/>
          </div>
        </div>

        <!-- Notifications -->
        <div class="settings-section anim-3">
          <div class="settings-section-header"><i class="fa-solid fa-bell" style="color:var(--blue)"></i> Notifications</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Email Notifications</div><div class="settings-row-desc">Receive order and report emails</div></div>
            <label class="toggle"><input type="checkbox" ${s.emailNotif?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">SMS Notifications</div><div class="settings-row-desc">Receive SMS alerts for urgent items</div></div>
            <label class="toggle"><input type="checkbox" ${s.smsNotif?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Sound Effects</div><div class="settings-row-desc">Play sound on new orders</div></div>
            <label class="toggle"><input type="checkbox" ${s.soundAlerts?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Auto Accept Orders</div><div class="settings-row-desc">Automatically accept incoming orders</div></div>
            <label class="toggle"><input type="checkbox" ${s.autoAccept?'checked':''}><span class="toggle-slider"></span></label>
          </div>
        </div>

        <!-- Appearance -->
        <div class="settings-section anim-4">
          <div class="settings-section-header"><i class="fa-solid fa-palette" style="color:var(--purple)"></i> Appearance</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Dark Mode</div><div class="settings-row-desc">Switch between light and dark interface</div></div>
            <label class="toggle"><input type="checkbox" onchange="Theme.toggle()" ${document.documentElement.getAttribute('data-theme')==='dark'?'checked':''}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Language</div><div class="settings-row-desc">Interface language</div></div>
            <select class="select-styled" style="width:140px"><option>English</option><option>Bengali</option><option>Spanish</option><option>French</option></select>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Timezone</div><div class="settings-row-desc">${s.timezone}</div></div>
            <select class="select-styled" style="width:200px"><option>America/New_York</option><option>Asia/Dhaka</option><option>Europe/London</option></select>
          </div>
        </div>

        <!-- Security -->
        <div class="settings-section anim-4">
          <div class="settings-section-header"><i class="fa-solid fa-shield-halved" style="color:var(--red)"></i> Security</div>
          <div class="settings-row">
            <div><div class="settings-row-label">Change Password</div><div class="settings-row-desc">Update your admin password</div></div>
            <button class="btn btn-outline btn-sm" onclick="Toast.show('Password change modal coming soon','info')"><i class="fa-solid fa-key"></i> Change</button>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Two-Factor Authentication</div><div class="settings-row-desc">Add an extra layer of security</div></div>
            <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Login History</div><div class="settings-row-desc">View recent login activity</div></div>
            <button class="btn btn-outline btn-sm"><i class="fa-solid fa-clock-rotate-left"></i> View</button>
          </div>
        </div>
      </div>`;
  },

  init() {},

};
