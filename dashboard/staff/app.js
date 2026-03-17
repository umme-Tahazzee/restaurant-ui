/* ================================================
   SAVORIA — APP CORE  (js/app.js)

   Contains: Theme, Sidebar, Router, Toast, Clock
   All global utilities used across the whole app.
================================================ */


/* ────────────────────────────────────────────────
   UTILS
   Small helper functions used everywhere
──────────────────────────────────────────────── */
const Utils = {

  // Format a number as money  →  $46.00
  money(n) {
    return `$${Number(n).toFixed(2)}`;
  },

  // How long ago was a date?  →  "14m ago"
  timeAgo(date) {
    if (!date) return '—';
    const diff = Math.floor((new Date() - date) / 60000);
    if (diff < 1)  return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  },

  // Get flat list of all menu items (across all categories)
  allMenuItems() {
    return DB.menu.flatMap(cat => cat.items);
  },

};


/* ────────────────────────────────────────────────
   ORDER STATUS CONFIG
   Central config for all 6 order statuses.
   Add a new status here and it works everywhere.
──────────────────────────────────────────────── */
const ORDER_STATUS = {
  pending:   { label: 'Pending',   tagClass: 'tag-pending',   next: 'preparing' },
  preparing: { label: 'Preparing', tagClass: 'tag-preparing', next: 'ready'     },
  ready:     { label: 'Ready',     tagClass: 'tag-ready',     next: 'confirmed' },
  confirmed: { label: 'Confirmed', tagClass: 'tag-confirmed', next: 'delivered' },
  delivered: { label: 'Delivered', tagClass: 'tag-delivered', next: null        },
  cancelled: { label: 'Cancelled', tagClass: 'tag-cancelled', next: null        },
};


/* ────────────────────────────────────────────────
   TOAST (popup notification)
   Usage: Toast.show('Order placed!', 'success')
   Types: 'success' | 'error' | 'info' | 'warning'
──────────────────────────────────────────────── */
const Toast = {
  icons: {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    info:    'fa-circle-info',
    warning: 'fa-triangle-exclamation',
  },

  show(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <i class="fa-solid ${this.icons[type]} toast-icon"></i>
      <span>${message}</span>`;
    container.appendChild(el);

    // Auto remove after 3 seconds
    setTimeout(() => {
      el.style.animation = 'toastIn .3s ease reverse';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  },
};


/* ────────────────────────────────────────────────
   MODAL
   Usage: Modal.open('orderModal') / Modal.close('orderModal')
──────────────────────────────────────────────── */
const Modal = {
  open(id)  { document.getElementById(id).classList.add('show');    },
  close(id) { document.getElementById(id).classList.remove('show'); },
};

// Expose globally so onclick="Modal.close(...)" works in HTML strings
window.Modal = Modal;


/* ────────────────────────────────────────────────
   THEME (Light / Dark)
   Reads from localStorage on boot.
   Toggles the data-theme attribute on <html>.
──────────────────────────────────────────────── */
const Theme = {
  _dark: false,

  init() {
    const saved = localStorage.getItem('savoria-theme') || 'light';
    this._dark = (saved === 'dark');
    this._apply();
  },

  toggle() {
    this._dark = !this._dark;
    this._apply();
    localStorage.setItem('savoria-theme', this._dark ? 'dark' : 'light');
  },

  _apply() {
    document.documentElement.setAttribute('data-theme', this._dark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = this._dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    DB.settings.darkMode = this._dark;
  },
};


/* ────────────────────────────────────────────────
   SIDEBAR
   Collapses to icon-only mode on toggle.
──────────────────────────────────────────────── */
const Sidebar = {
  _collapsed: false,

  toggle() {
    this._collapsed = !this._collapsed;
    document.getElementById('sidebar').classList.toggle('collapsed', this._collapsed);
  },
};


/* ────────────────────────────────────────────────
   NOTIFICATION DROPDOWN
──────────────────────────────────────────────── */
function toggleNotif() {
  const drop = document.getElementById('notifDrop');
  drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
}

// Close notif dropdown when clicking outside
document.addEventListener('click', e => {
  const drop = document.getElementById('notifDrop');
  if (!drop) return;
  if (!e.target.closest('#notifDrop') && !e.target.closest('#notifBtn')) {
    drop.style.display = 'none';
  }
});


/* ────────────────────────────────────────────────
   ROUTER
   Maps view names to their View objects.
   Call: Router.go('orders')
──────────────────────────────────────────────── */
const Router = {

  // Register all available views here
  views: {
    dashboard:     () => DashboardView,
    orders:        () => OrdersView,
    getorder:      () => GetOrderView,
    salesreport:   () => SalesReportView,
    expensereport: () => ExpenseReportView,
    customers:     () => CustomersView,
    transactions:  () => TransactionsView,
    settings:      () => SettingsView,
  },

  go(name, navEl) {
    const getView = this.views[name];
    if (!getView) return console.warn(`View "${name}" not found`);

    const area = document.getElementById('pageArea');
    area.classList.add('loading');

    setTimeout(() => {
      const view = getView();
      area.innerHTML = view.render();
      area.classList.remove('loading');

      // Highlight active nav item
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const target = navEl || document.querySelector(`.nav-item[data-view="${name}"]`);
      if (target) target.classList.add('active');

      // Run view-specific setup
      if (view.init) view.init();
    }, 80);
  },
};


/* ────────────────────────────────────────────────
   CLOCK — top bar live time display
──────────────────────────────────────────────── */
function updateClock() {
  const el = document.getElementById('topClock');
  if (!el) return;
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  el.textContent = `${date} · ${time}`;
}


/* ────────────────────────────────────────────────
   BOOT — runs when page first loads
──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  updateClock();
  setInterval(updateClock, 30000);
  Router.go('dashboard'); // Start on dashboard page
});
