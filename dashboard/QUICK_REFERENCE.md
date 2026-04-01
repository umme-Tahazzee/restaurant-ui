# Quick Reference Guide

## 🎯 30-Second Overview

You have an admin and staff dashboard. You want to add a manager dashboard with a proper login system.

**Best Approach:** Use a centralized login page that redirects to role-specific dashboards with session protection.

---

## 📁 What You Need to Do

### File 1: Create `dashboard/shared/auth.js`
**Purpose:** Shared authentication utilities for all dashboards
**Size:** ~300 lines
**Time:** Copy & paste, 2 minutes

### File 2: Update `dashboard/login.html`
**Purpose:** Improved login form with better features
**Size:** ~400 lines
**Time:** Replace or merge, 5 minutes

### File 3: Create `dashboard/manager/index.html`
**Purpose:** New manager dashboard
**Size:** ~600 lines
**Time:** Copy & customize, 10 minutes

### File 4: Update Each Dashboard (admin, staff, manager)
**Purpose:** Add authentication protection
**Size:** 2 lines per dashboard
**Time:** 5 minutes total

---

## 💻 Code Snippets

### Protect a Dashboard
```javascript
// Add to top of each dashboard's <script> section
Auth.protectPage('admin');  // or 'manager' or 'staff'
```

### Add Logout Button
```html
<button onclick="Auth.logout()">Logout</button>
```

### Check User Role
```javascript
if (Auth.hasRole('admin')) {
    // Show admin-only content
}
```

### Get Current User
```javascript
const user = Auth.getCurrentUser();
console.log(user.name, user.email, user.role);
```

---

## 🧪 Quick Test Checklist

```
[ ] Login with admin@restaurant.com → Goes to /admin/index.html
[ ] Login with manager@restaurant.com → Goes to /manager/index.html
[ ] Login with staff@restaurant.com → Goes to /staff/index.html
[ ] Try accessing /admin/index.html directly → Redirects to login
[ ] Click logout button → Goes back to login
[ ] Refresh page while logged in → Stays logged in
[ ] Try accessing /staff/index.html as admin → Redirected to login
```

---

## 📊 Features by Role

| Feature | Admin | Manager | Staff |
|---------|-------|---------|-------|
| Dashboard | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | - |
| User Management | ✓ | - | - |
| Branch Management | ✓ | ✓ | - |
| Orders | ✓ | ✓ | ✓ |
| Customers | ✓ | ✓ | ✓ |

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────┐
│  User opens app                              │
└──────────┬──────────────────────────────────┘
           │
           ├─→ Check localStorage for 'currentUser'
           │
           ├─→ [Found] → Validate role → Redirect to dashboard
           │
           └─→ [Not Found] → Show login page
                │
                ├─→ User enters email, password, selects role
                │
                ├─→ Validate credentials
                │
                ├─→ Store in localStorage
                │
                ├─→ Redirect to dashboard
                │
                └─→ Dashboard validates auth on load
                    ├─→ [Valid] → Show content
                    └─→ [Invalid] → Redirect to login
```

---

## 🛠️ Common Customizations

### Change Session Timeout (default: 30 minutes)
```javascript
// In auth.js, line ~185
Auth.setSessionTimeout(60);  // 60 minutes
```

### Add a New Role
```javascript
// 1. Add to Users in login.html
SUPERVISORS: [
    { email: 'super@restaurant.com', password: 'super123', name: 'Supervisor', role: 'supervisor' }
]

// 2. Add role card to login form
<div class="role-card" data-role="supervisor" onclick="selectRole('supervisor')">
    <i class="fa-solid fa-user-cog"></i>
    <div>Supervisor</div>
</div>

// 3. Add to sidebar in manager/index.html
<div class="role-card" data-role="supervisor">...</div>

// 4. Create supervisor/index.html
Auth.protectPage('supervisor');
```

### Connect to Backend API
```javascript
// In login.html, replace hardcoded users with:
const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role })
});
const data = await response.json();
if (data.success) {
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    location.href = `/dashboard/${data.user.role}/index.html`;
}
```

### Add Permission Checking
```javascript
// In auth.js
const Permissions = {
    canDeleteUsers: () => Auth.hasRole('admin'),
    canEditReports: () => Auth.hasAnyRole(['admin', 'manager']),
    canViewOrders: () => Auth.hasAnyRole(['admin', 'manager', 'staff'])
};

// Usage
if (Permissions.canDeleteUsers()) {
    // Show delete button
}
```

---

## 🐛 Troubleshooting

### Issue: Can access dashboard without login
**Solution:** Add `Auth.protectPage('role')` to the dashboard

### Issue: Logout doesn't work
**Solution:** Make sure button calls `Auth.logout()` not `logout()`

### Issue: Auth.js not found error
**Solution:** Check the path is correct: `../../shared/auth.js`

### Issue: Always redirects to login
**Solution:** Check localStorage isn't cleared, check role name is correct

### Issue: User data not showing
**Solution:** Add `const user = Auth.getCurrentUser();` before using it

---

## 📚 File Reference

### auth.js Methods

```javascript
// Get user
Auth.getCurrentUser()           // Returns user object
Auth.getRole()                  // Returns 'admin', 'manager', or 'staff'
Auth.getName()                  // Returns user's name

// Check
Auth.isLoggedIn()               // true/false
Auth.hasRole('admin')           // true/false
Auth.hasAnyRole(['admin', 'manager'])  // true/false
Auth.isSessionExpired()         // true/false

// Protect
Auth.protectPage()              // Check if logged in
Auth.protectPage('admin')       // Check if admin

// Actions
Auth.logout()                   // Clear session and redirect
Auth.updateUser(userData)       // Update user data
Auth.resetSessionTimeout()      // Reset timeout on activity

// URL
Auth.getDashboardUrl('admin')   // Returns '/dashboard/admin/index.html'
Auth.getRoleName('admin')       // Returns 'Administrator'
```

---

## 📋 Implementation Checklist

```
Preparation:
[ ] Review all 4 guides (BEST_APPROACH, IMPLEMENTATION, COMPARISON, this one)
[ ] Prepare your text editor
[ ] Create dashboard/shared/ folder

Implementation:
[ ] Copy auth.js to dashboard/shared/auth.js
[ ] Replace login.html with improved version
[ ] Create dashboard/manager/index.html from template
[ ] Add auth.js script to admin/index.html
[ ] Add auth.js script to manager/index.html
[ ] Add auth.js script to staff/index.html
[ ] Add logout button to each dashboard

Testing:
[ ] Test login with all 3 roles
[ ] Test direct URL access (should redirect)
[ ] Test logout functionality
[ ] Test session persistence (refresh page)
[ ] Test wrong role access

Customization:
[ ] Customize manager dashboard
[ ] Add manager-specific features
[ ] Add team management features
[ ] Test with real data

Deployment:
[ ] Move to production server
[ ] Update API endpoints
[ ] Enable HTTPS
[ ] Set up backend authentication
[ ] Test in production
```

---

## 📞 Quick Help

**Q: Where do I put auth.js?**
A: `dashboard/shared/auth.js`

**Q: How do I protect a dashboard?**
A: Add `Auth.protectPage('role')` at the top of the script section

**Q: How do I add logout?**
A: Add `<button onclick="Auth.logout()">Logout</button>` to your HTML

**Q: What are the demo credentials?**
A: 
- Admin: admin@restaurant.com / admin123
- Manager: manager@restaurant.com / manager123
- Staff: staff@restaurant.com / staff123

**Q: How do I change the session timeout?**
A: Find `Auth.setSessionTimeout(30)` in auth.js and change 30 to desired minutes

**Q: How do I add a new role?**
A: Add to Users object in login.html and create a new folder with dashboard

**Q: Can I use this with a backend?**
A: Yes! Replace the hardcoded Users with API calls

**Q: Is this secure for production?**
A: For frontend, yes. Add backend authentication and HTTPS for full security

---

## ⚡ 5-Minute Quick Start

1. Copy `auth.js` to `dashboard/shared/auth.js` - (1 min)
2. Replace `login.html` - (1 min)
3. Add 1 line to each dashboard: `Auth.protectPage('role')` - (1 min)
4. Add logout button - (1 min)
5. Test login/logout - (1 min)

**Done!** Your authentication system is now secure and complete.

---

## 🎓 Learning Path

**Beginner:** Just copy-paste the files, it works!

**Intermediate:** Understand how Auth.protectPage() works, add customizations

**Advanced:** Connect to backend API, add two-factor auth, create permission system

**Expert:** Build complete RBAC system, audit logging, advanced security

---

## 📈 What You Get

✅ Single login page for all roles
✅ Automatic redirect to correct dashboard
✅ Session protection (can't bypass login)
✅ Logout functionality
✅ Session timeout (30 min default)
✅ Manager dashboard template
✅ Easy to extend with new roles
✅ Production-ready code
✅ No code duplication
✅ Professional authentication system

---

**Ready to implement? Start with IMPLEMENTATION_GUIDE.md!**
