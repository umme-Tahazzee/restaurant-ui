/* ================================================
   PROFILE VIEW — Admin profile
================================================ */

const ProfileView = {

  render() {
    const p = DB.profile;
    const joinDate = new Date(p.joinDate);
    const tenure = Math.floor((new Date() - joinDate) / (365.25 * 24 * 60 * 60 * 1000));

    return `
      <div id="profileRoot">
        <div class="page-header anim-1">
          <div>
            <div class="page-subtitle">System</div>
            <h1 class="page-title">My <em style="color:var(--red);font-style:italic">Profile</em></h1>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ProfileView.saveProfile()"><i class="fa-solid fa-check"></i> Save Changes</button>
        </div>

        <!-- Profile Card -->
        <div class="profile-card anim-1" style="margin-bottom:20px">
          <div class="profile-banner">
            <div class="profile-avatar-lg" id="profAvatarDisp">${p.avatar}</div>
          </div>
          <div style="padding:50px 24px 24px">
            <h2 id="profNameDisp" style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700">${p.name}</h2>
            <div style="display:flex;align-items:center;gap:8px;margin-top:4px;margin-bottom:16px">
              <span class="tag tag-vip">${p.role}</span>
              <span style="font-size:11px;color:var(--text-3)"><i class="fa-solid fa-calendar" style="margin-right:4px"></i> Joined ${Utils.formatDate(p.joinDate)}</span>
            </div>
            <div style="display:flex;gap:20px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-envelope" style="color:var(--text-3)"></i> <span id="profEmailDisp">${p.email}</span></div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-phone" style="color:var(--text-3)"></i> <span id="profPhoneDisp">${p.phone}</span></div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-building" style="color:var(--text-3)"></i> ${p.branches}</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-location-dot" style="color:var(--text-3)"></i> <span id="profAddrDisp">${p.address}</span></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px">
          <!-- Edit Profile -->
          <div class="card anim-2">
            <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:16px">
              <i class="fa-solid fa-user-pen" style="color:var(--gold);margin-right:6px"></i> Edit Profile
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Full Name</label><input id="profName" class="form-control" value="${p.name}"/></div>
              <div class="form-group"><label class="form-label">Role</label><input class="form-control" value="${p.role}" disabled style="opacity:.6"/></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Email</label><input id="profEmail" class="form-control" value="${p.email}"/></div>
              <div class="form-group"><label class="form-label">Phone</label><input id="profPhone" class="form-control" value="${p.phone}"/></div>
            </div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">Address</label><input id="profAddress" class="form-control" value="${p.address}"/></div>
            <button class="btn btn-primary" onclick="ProfileView.saveProfile()"><i class="fa-solid fa-check"></i> Update Profile</button>
          </div>

          <!-- Change Password -->
          <div class="card anim-3">
            <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:16px">
              <i class="fa-solid fa-shield-halved" style="color:var(--red);margin-right:6px"></i> Change Password
            </div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">Current Password</label><input id="profOldPass" class="form-control" type="password" placeholder="Enter current password…"/></div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">New Password</label><input id="profNewPass" class="form-control" type="password" placeholder="Enter new password…"/></div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">Confirm Password</label><input id="profConfPass" class="form-control" type="password" placeholder="Confirm new password…"/></div>
            <button class="btn btn-primary" onclick="ProfileView.changePassword()"><i class="fa-solid fa-key"></i> Update Password</button>

            <!-- Activity Log -->
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border)">
              <div style="font-size:12px;font-weight:700;margin-bottom:12px;color:var(--text-2)"><i class="fa-solid fa-clock-rotate-left" style="margin-right:4px"></i> Recent Activity</div>
              <div style="display:flex;flex-direction:column;gap:8px" id="profActivityLog">
                <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-3)">
                  <span style="width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0"></span>
                  <span>Login from 192.168.1.1 — Today 09:15 AM</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-3)">
                  <span style="width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0"></span>
                  <span>Settings updated — Yesterday 04:30 PM</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-3)">
                  <span style="width:6px;height:6px;border-radius:50%;background:var(--orange);flex-shrink:0"></span>
                  <span>Password changed — Mar 10, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  async init() {
    await Api.getProfile();
    const area = document.getElementById('pageArea');
    if (area) area.innerHTML = this.render();
  },

  saveProfile() {
    const name = document.getElementById('profName').value.trim();
    const email = document.getElementById('profEmail').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const addr = document.getElementById('profAddress').value.trim();

    if (!name || !email) {
      Toast.show('Name and email are required fields', 'error');
      return;
    }

    DB.profile.name = name;
    DB.profile.email = email;
    DB.profile.phone = phone;
    DB.profile.address = addr;
    
    // Generate simple avatar initials
    const parts = name.split(' ');
    DB.profile.avatar = (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();

    // Update DOM directly to show immediate response without full reload flickers
    document.getElementById('profNameDisp').innerText = DB.profile.name;
    document.getElementById('profEmailDisp').innerText = DB.profile.email;
    document.getElementById('profPhoneDisp').innerText = DB.profile.phone;
    document.getElementById('profAddrDisp').innerText = DB.profile.address;
    document.getElementById('profAvatarDisp').innerText = DB.profile.avatar;

    this.logActivity('Profile updated', 'var(--green)');
    Toast.show('Profile updated successfully!', 'success');
  },

  changePassword() {
    const oldP = document.getElementById('profOldPass').value;
    const newP = document.getElementById('profNewPass').value;
    const confP = document.getElementById('profConfPass').value;

    if (!oldP || !newP || !confP) return Toast.show('Please fill all password fields', 'error');
    if (newP !== confP) return Toast.show('New passwords do not match', 'error');

    document.getElementById('profOldPass').value = '';
    document.getElementById('profNewPass').value = '';
    document.getElementById('profConfPass').value = '';

    this.logActivity('Password changed', 'var(--orange)');
    Toast.show('Password changed successfully!', 'success');
  },

  logActivity(text, color) {
    const log = document.getElementById('profActivityLog');
    if (!log) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
    const newLog = document.createElement('div');
    newLog.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-3)';
    newLog.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0"></span><span>${text} — Today ${time}</span>`;
    log.insertBefore(newLog, log.firstChild);
    if (log.children.length > 4) log.removeChild(log.lastChild);
  }

};
