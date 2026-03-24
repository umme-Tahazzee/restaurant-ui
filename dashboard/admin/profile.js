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
          <button class="btn btn-primary btn-sm" onclick="Toast.show('Profile updated!','success')"><i class="fa-solid fa-check"></i> Save Changes</button>
        </div>

        <!-- Profile Card -->
        <div class="profile-card anim-1" style="margin-bottom:20px">
          <div class="profile-banner">
            <div class="profile-avatar-lg">${p.avatar}</div>
          </div>
          <div style="padding:50px 24px 24px">
            <h2 style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700">${p.name}</h2>
            <div style="display:flex;align-items:center;gap:8px;margin-top:4px;margin-bottom:16px">
              <span class="tag tag-vip">${p.role}</span>
              <span style="font-size:11px;color:var(--text-3)"><i class="fa-solid fa-calendar" style="margin-right:4px"></i> Joined ${Utils.formatDate(p.joinDate)} · ${tenure}+ years</span>
            </div>
            <div style="display:flex;gap:20px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-envelope" style="color:var(--text-3)"></i> ${p.email}</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-phone" style="color:var(--text-3)"></i> ${p.phone}</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-building" style="color:var(--text-3)"></i> ${p.branches}</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><i class="fa-solid fa-location-dot" style="color:var(--text-3)"></i> ${p.address}</div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <!-- Edit Profile -->
          <div class="card anim-2">
            <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:16px">
              <i class="fa-solid fa-user-pen" style="color:var(--gold);margin-right:6px"></i> Edit Profile
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Full Name</label><input class="form-control" value="${p.name}"/></div>
              <div class="form-group"><label class="form-label">Role</label><input class="form-control" value="${p.role}" disabled style="opacity:.6"/></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Email</label><input class="form-control" value="${p.email}"/></div>
              <div class="form-group"><label class="form-label">Phone</label><input class="form-control" value="${p.phone}"/></div>
            </div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">Address</label><input class="form-control" value="${p.address}"/></div>
            <button class="btn btn-primary" onclick="Toast.show('Profile updated!','success')"><i class="fa-solid fa-check"></i> Update Profile</button>
          </div>

          <!-- Change Password -->
          <div class="card anim-3">
            <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:16px">
              <i class="fa-solid fa-shield-halved" style="color:var(--red);margin-right:6px"></i> Change Password
            </div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">Current Password</label><input class="form-control" type="password" placeholder="Enter current password…"/></div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">New Password</label><input class="form-control" type="password" placeholder="Enter new password…"/></div>
            <div class="form-group" style="margin-bottom:14px"><label class="form-label">Confirm Password</label><input class="form-control" type="password" placeholder="Confirm new password…"/></div>
            <button class="btn btn-primary" onclick="Toast.show('Password changed!','success')"><i class="fa-solid fa-key"></i> Update Password</button>

            <!-- Activity Log -->
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border)">
              <div style="font-size:12px;font-weight:700;margin-bottom:12px;color:var(--text-2)"><i class="fa-solid fa-clock-rotate-left" style="margin-right:4px"></i> Recent Activity</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-3)">
                  <span style="width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0"></span>
                  <span>Login from 192.168.1.x — Today 09:15 AM</span>
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

  init() {},

};
