# Step-by-Step Implementation Guide

## 📦 Setup Overview

This guide will help you implement a complete multi-role login system for your 3 dashboards.

---

## 🚀 Step 1: Create the Shared Folder Structure

First, create a `shared` folder in your dashboard directory:

```
dashboard/
├── login.html
├── shared/
│   ├── auth.js          ← NEW: Shared authentication utility
│   └── config.js        ← NEW: (Optional) Configuration
├── admin/
│   ├── index.html
│   ├── app.js
│   └── theme.css
├── manager/
│   ├── index.html       ← NEW: Manager dashboard
│   ├── app.js           ← NEW: Manager logic
│   └── theme.css        ← NEW: Manager styling
└── staff/
    ├── index.html
    ├── app.js
    └── theme.css
```

---

## 🔧 Step 2: Add the Shared Auth.js File

**Action:** Copy the `auth.js` file to `dashboard/shared/auth.js`

This file provides all the authentication utilities you need:
- ✅ Check if user is logged in
- ✅ Get current user info
- ✅ Check user role and permissions
- ✅ Protect pages from unauthorized access
- ✅ Handle logout
- ✅ Session timeout management

---

## 📝 Step 3: Update Your Login Page

**Action:** Update `dashboard/login.html` with the improved version

Key improvements in the new login.html:
- ✅ Uses the shared auth.js library
- ✅ Better error handling
- ✅ "Remember me" functionality
- ✅ Demo credentials display
- ✅ Session timeout support
- ✅ Cleaner UI and code structure

---

## 📁 Step 4: Create the Manager Dashboard

**Action:** Create `dashboard/manager/` folder and copy the template

1. Create folder: `dashboard/manager/`
2. Copy `manager_dashboard_template.html` → `dashboard/manager/index.html`
3. Create `dashboard/manager/app.js` (manager-specific logic)
4. Copy theme.css from admin or staff folder to manager folder
5. Customize with manager-specific features

---

## 🔐 Step 5: Protect Each Dashboard

**Action:** Add this code to the top of each dashboard's `index.html` in the `<script>` section:

### For Admin Dashboard (`admin/index.html`):
```html
<script src="../../shared/auth.js"></script>
<script>
  // Protect page - only admin can access
  Auth.protectPage('admin');
  
  // Display current user
  const user = Auth.getCurrentUser();
  document.getElementById('userName').textContent = user.name;
</script>
```

### For Manager Dashboard (`manager/index.html`):
```html
<script src="../../shared/auth.js"></script>
<script>
  // Protect page - only manager can access
  Auth.protectPage('manager');
  
  // Display current user
  const user = Auth.getCurrentUser();
  document.getElementById('userName').textContent = user.name;
</script>
```

### For Staff Dashboard (`staff/index.html`):
```html
<script src="../../shared/auth.js"></script>
<script>
  // Protect page - only staff can access
  Auth.protectPage('staff');
  
  // Display current user
  const user = Auth.getCurrentUser();
  document.getElementById('userName').textContent = user.name;
</script>
```

---

## 🔴 Step 6: Add Logout Button to Each Dashboard

Add a logout button to the header/sidebar of each dashboard:

```html
<!-- Simple Logout Button -->
<button onclick="Auth.logout()" class="btn btn-danger">
  <i class="fa-solid fa-sign-out-alt"></i> Logout
</button>
```

Or in your existing user menu:

```javascript
function logout() {
  Auth.logout();
}
```

---

## 📋 Step 7: Update Login Form Redirection

In your `login.html`, update the login success handler:

```javascript
if (user) {
    const { password: _, ...userToStore } = user;
    userToStore.loginTime = Date.now();
    
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    
    showToast(`Welcome ${user.name}! 🎉`, 'success');

    setTimeout(() => {
      // Auto-redirect based on role
      location.href = `/dashboard/${user.role}/index.html`;
    }, 800);
}
```

---

## ✅ Step 8: Test Everything

### Test Login Flow:
```
1. Open login.html
2. Select role (Admin/Manager/Staff)
3. Enter credentials:
   - Admin: admin@restaurant.com / admin123
   - Manager: manager@restaurant.com / manager123
   - Staff: staff@restaurant.com / staff123
4. Click Sign In
5. Should redirect to appropriate dashboard
```

### Test Session Protection:
```
1. Close browser/clear localStorage
2. Try accessing dashboard directly (e.g., /admin/index.html)
3. Should redirect to login.html
```

### Test Session Persistence:
```
1. Login successfully
2. Refresh the page
3. Should remain logged in
4. Reload again - should still be logged in
```

### Test Logout:
```
1. Click logout button
2. Should redirect to login.html
3. LocalStorage should be cleared
4. Direct access to dashboard should fail
```

### Test Wrong Role Access:
```
1. Login as Staff
2. Try to access /admin/index.html directly
3. Should redirect to login with error
```

---

## 🔒 Step 9: Enhance with Backend (Optional but Recommended for Production)

When ready for production, replace the hardcoded users with API calls:

### Update login.html handleLogin function:

```javascript
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  const role = document.getElementById('selectedRole').value;

  // Show loading
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;

  try {
    // Call your backend API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        role 
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store user data with token
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        loginTime: Date.now(),
        token: data.token  // Add token for API calls
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      showToast(`Welcome ${user.name}! 🎉`, 'success');

      setTimeout(() => {
        location.href = `/dashboard/${role}/index.html`;
      }, 800);
    } else {
      showError(data.message || 'Invalid credentials');
    }
  } catch (error) {
    showError('Connection error. Please try again.');
    console.error('Login error:', error);
  } finally {
    btn.disabled = false;
  }
}
```

---

## 🛡️ Step 10: Add Request Authentication (For API calls)

Add this to your API request headers:

```javascript
const getAuthHeaders = () => {
  const user = Auth.getCurrentUser();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token || ''}`
  };
};

// Usage in API calls
fetch('/api/orders', {
  headers: getAuthHeaders()
})
```

---

## 📌 File Checklist

After completing all steps, your folder structure should look like:

```
dashboard/
├── login.html                    ✓ Updated with improved version
├── shared/
│   └── auth.js                   ✓ NEW: Shared auth utilities
├── admin/
│   ├── index.html                ✓ Added auth.js script + protectPage()
│   ├── app.js
│   ├── theme.css
│   └── [other files]
├── manager/
│   ├── index.html                ✓ NEW: Created from template
│   ├── app.js                    ✓ NEW: Manager-specific logic
│   ├── theme.css                 ✓ NEW: Manager styling
│   └── [other files]
└── staff/
    ├── index.html                ✓ Added auth.js script + protectPage()
    ├── app.js
    ├── theme.css
    └── [other files]
```

---

## 🚀 Advanced Features (Optional Additions)

### 1. Session Timeout Notification
```javascript
// Add in auth.js
function showSessionWarning() {
  if (confirm('Your session is about to expire. Continue?')) {
    Auth.resetSessionTimeout();
  } else {
    Auth.logout();
  }
}
```

### 2. Two-Factor Authentication
```javascript
// Add to login.html after password verification
const verifyOTP = (otp) => {
  // Call API to verify OTP
};
```

### 3. Role-Based UI Rendering
```javascript
// Show/hide elements based on role
function showIfRole(role, element) {
  if (Auth.hasRole(role)) {
    element.classList.remove('hidden');
  }
}
```

### 4. Activity Logging
```javascript
// Track user actions
const logActivity = (action) => {
  const user = Auth.getCurrentUser();
  fetch('/api/logs', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_id: user.id,
      action: action,
      timestamp: new Date()
    })
  });
};
```

### 5. User Permissions Fine-tuning
```javascript
// Check specific permissions
function canDeleteOrders() {
  const user = Auth.getCurrentUser();
  return user.role === 'admin' || user.role === 'manager';
}

function canViewReports() {
  return Auth.hasAnyRole(['admin', 'manager']);
}
```

---

## ⚙️ Configuration Settings

Create `dashboard/shared/config.js` for centralized settings:

```javascript
const CONFIG = {
  // Authentication
  SESSION_TIMEOUT_MINUTES: 30,
  REMEMBER_ME_DAYS: 7,
  
  // API
  API_BASE_URL: 'https://api.restaurant.local',
  
  // Paths
  LOGIN_PATH: '/dashboard/login.html',
  
  // Roles
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff'
  },
  
  // Permissions
  PERMISSIONS: {
    admin: ['all'],
    manager: ['manage-branch', 'view-reports', 'manage-staff'],
    staff: ['view-orders', 'manage-tables']
  }
};
```

Include in auth.js:
```javascript
<script src="config.js"></script>
```

---

## 🎯 Final Checklist

- [ ] Created `dashboard/shared/` folder
- [ ] Added `auth.js` to shared folder
- [ ] Updated `login.html` with improved version
- [ ] Created `manager/` folder and dashboard
- [ ] Added auth protection to admin dashboard
- [ ] Added auth protection to manager dashboard
- [ ] Added auth protection to staff dashboard
- [ ] Added logout buttons to all dashboards
- [ ] Tested login flow with all roles
- [ ] Tested session protection (direct URL access)
- [ ] Tested logout functionality
- [ ] Tested session persistence (page refresh)
- [ ] (Optional) Added backend API integration
- [ ] (Optional) Created config.js for settings

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Redirect loop on login** | Check Auth.protectPage() is called correctly |
| **Logout not working** | Ensure logout button calls Auth.logout() |
| **Can access other dashboards** | Make sure protectPage() checks the role parameter |
| **Session not persisting** | Check localStorage is not disabled in browser |
| **Auth.js not found** | Verify path: `../../shared/auth.js` is correct |
| **Role not redirecting** | Check user.role matches 'admin', 'manager', or 'staff' |

---

## 📞 Support Resources

- **localStorage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Session Management**: https://owasp.org/www-community/attacks/Session_hijacking_attack
- **Authentication Best Practices**: https://owasp.org/www-project-web-security-testing-guide/

---

## 🎉 You're Done!

Your multi-role login system is now complete and secure!

**Next Steps:**
1. Customize each dashboard with your actual data
2. Connect to backend APIs
3. Add more features and functionality
4. Test thoroughly in different browsers
5. Deploy to production with HTTPS

