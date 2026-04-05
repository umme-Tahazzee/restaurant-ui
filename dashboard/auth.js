/**
 * SHARED AUTHENTICATION UTILITY
 * Use this file across all dashboards (Admin, Manager, Staff)
 * 
 * Place in: dashboard/shared/auth.js
 * Include in HTML: <script src="../../shared/auth.js"></script>
 */

const Auth = {
    /**
     * Get currently logged-in user
     * @returns {Object|null} User object or null
     */
    getCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    /**
     * Check if user is logged in
     * @returns {Boolean}
     */
    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    /**
     * Check if user has specific role
     * @param {String} role - Role to check (admin, manager, staff)
     * @returns {Boolean}
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    /**
     * Check if user has any of the specified roles
     * @param {Array} roles - Array of roles to check
     * @returns {Boolean}
     */
    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        return user && roles.includes(user.role);
    },

    /**
     * Get user's role
     * @returns {String|null} Role or null
     */
    getRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    /**
     * Get user's name
     * @returns {String|null}
     */
    getName() {
        const user = this.getCurrentUser();
        return user ? user.name : null;
    },

    /**
     * Get user's email
     * @returns {String|null}
     */
    getEmail() {
        const user = this.getCurrentUser();
        return user ? user.email : null;
    },

    /**
     * Get login time
     * @returns {Number|null} Timestamp
     */
    getLoginTime() {
        const user = this.getCurrentUser();
        return user ? user.loginTime : null;
    },

    /**
     * Check if session is expired
     * @param {Number} timeoutMinutes - Timeout duration in minutes (default: 30)
     * @returns {Boolean}
     */
    isSessionExpired(timeoutMinutes = 30) {
        const loginTime = this.getLoginTime();
        if (!loginTime) return true;
        
        const timeoutMs = timeoutMinutes * 60 * 1000;
        return (Date.now() - loginTime) > timeoutMs;
    },

    /**
     * Protect page - redirect to login if not authenticated
     * Can optionally check for specific role
     * @param {String} requiredRole - Optional: specific role required
     * @returns {Boolean} True if allowed, false if redirected
     */
    protectPage(requiredRole = null) {
        if (!this.isLoggedIn()) {
            this.redirectToLogin();
            return false;
        }

        if (requiredRole && !this.hasRole(requiredRole)) {
            this.redirectToUnauthorized();
            return false;
        }

        // Check session expiry
        if (this.isSessionExpired()) {
            this.logout('Session expired. Please login again.');
            return false;
        }

        return true;
    },

    /**
     * Logout user
     * @param {String} message - Optional message to show
     */
    logout(message = null) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sv_user');

        if (message) {
            console.info('Auth:', message);
        }

        // All dashboard pages are one level inside dashboard/
        location.href = '../login.html';
    },

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        location.href = '../login.html';
    },

    /**
     * Redirect to unauthorized page
     */
    redirectToUnauthorized() {
        alert('You do not have permission to access this page.');
        this.redirectToLogin();
    },

    /**
     * Update user data in localStorage
     * @param {Object} userData - New user data
     */
    updateUser(userData) {
        const user = this.getCurrentUser();
        if (user) {
            const updated = { ...user, ...userData };
            localStorage.setItem('currentUser', JSON.stringify(updated));
        }
    },

    /**
     * Set a session timeout that logs out the user
     * @param {Number} timeoutMinutes - Minutes before logout
     */
    setSessionTimeout(timeoutMinutes = 30) {
        const timeoutMs = timeoutMinutes * 60 * 1000;
        
        setInterval(() => {
            if (this.isLoggedIn() && this.isSessionExpired(timeoutMinutes)) {
                this.logout('Your session has expired. Please login again.');
            }
        }, 60000); // Check every minute
    },

    /**
     * Reset session timeout (call on user activity)
     */
    resetSessionTimeout() {
        const user = this.getCurrentUser();
        if (user) {
            user.loginTime = Date.now();
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    },

    /**
     * Get dashboard URL based on role
     * @param {String} role - User role
     * @returns {String} Dashboard URL
     */
    getDashboardUrl(role) {
        switch (role) {
            case 'admin':
                return 'dashboard/admin/index.html';
            case 'manager':
                return 'dashboard/manager/index.html';
            case 'staff':
                return 'dashboard/staff/index.html';
            default:
                return 'login.html';
        }
    },

    /**
     * Get role display name
     * @param {String} role - Role code
     * @returns {String} Display name
     */
    getRoleName(role) {
        const roleNames = {
            'admin': 'Administrator',
            'manager': 'Manager',
            'staff': 'Staff'
        };
        return roleNames[role] || role;
    }
};

// Initialize session timeout if logged in
if (Auth.isLoggedIn()) {
    Auth.setSessionTimeout(30); // 30-minute timeout
}

// Reset timeout on user activity (optional)
document.addEventListener('mousemove', Auth.resetSessionTimeout.bind(Auth));
document.addEventListener('keypress', Auth.resetSessionTimeout.bind(Auth));
document.addEventListener('click', Auth.resetSessionTimeout.bind(Auth));
