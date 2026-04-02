/* ================================================
   SAVORIA — APP CORE  (js/app.js)
================================================ */

const Utils = {
   money(n) { return `$${Number(n).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0})}`; },
  moneyFull(n) { return `$${Number(n).toFixed(2)}`; },
  timeAgo(date) {
    if (!date) return '—';
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return `${Math.floor(diff/1440)}d ago`;
  },
  formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  },
  today:      () => new Date().toISOString().split('T')[0],
  todayMinus: (days) => { const d = new Date(); d.setDate(d.getDate()-days); return d.toISOString().split('T')[0]; },
  starsHTML(rating, max=5) {
    let html = '<div class="stars">';
    for (let i = 1; i <= max; i++) {
      html += `<i class="fa-solid fa-star ${i <= rating ? 'filled' : 'empty'}"></i>`;
    }
    html += '</div>';
    return html;
  },
  sanitize(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
},
  allMenuItems() { return DB.menu.flatMap(cat => cat.items); },
};

const ORDER_STATUS = {
  pending:   { label:'Pending',   tagClass:'tag-pending',   next:'preparing' },
  preparing: { label:'Preparing', tagClass:'tag-preparing', next:'ready'     },
  ready:     { label:'Ready',     tagClass:'tag-ready',     next:'confirmed' },
  confirmed: { label:'Confirmed', tagClass:'tag-confirmed', next:'delivered' },
  delivered: { label:'Delivered', tagClass:'tag-delivered', next:null        },
  cancelled: { label:'Cancelled', tagClass:'tag-cancelled', next:null        },
};

const Toast = {
  icons: { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info', warning:'fa-triangle-exclamation' },
  show(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${this.icons[type]} toast-icon"></i><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.style.animation = 'toastIn .3s ease reverse'; setTimeout(() => el.remove(), 300); }, 3000);
  },
};

const Modal = {
  open(id)  { document.getElementById(id).classList.add('show');    },
  close(id) { document.getElementById(id).classList.remove('show'); },
};
window.Modal = Modal;

const Theme = {
  _dark: false,
  init() {
    this._dark = (localStorage.getItem('savoria-theme') || 'light') === 'dark';
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

const Sidebar = {
  _collapsed: false,
  toggle() {
    this._collapsed = !this._collapsed;
    document.getElementById('sidebar').classList.toggle('collapsed', this._collapsed);
  },
};

function toggleNotif() {
  const drop = document.getElementById('notifDrop');
  drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
}
document.addEventListener('click', e => {
  const drop = document.getElementById('notifDrop');
  if (!drop) return;
  if (!e.target.closest('#notifDrop') && !e.target.closest('#notifBtn')) drop.style.display = 'none';
});

const Router = {
  views: {
    dashboard:     () => DashboardView,
    orders:        () => OrdersView,
    getorder:      () => GetOrderView,
    salesreport:   () => SalesReportView,
    expensereport: () => ExpenseReportView,
    customers:     () => CustomersView,
    transactions:  () => TransactionsView,
    profile:       () => ProfileView,
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
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const target = navEl || document.querySelector(`.nav-item[data-view="${name}"]`);
      if (target) target.classList.add('active');
      if (view.init) view.init();
    }, 80);
  },
};

function updateClock() {
  const el = document.getElementById('topClock');
  if (!el) return;
  const now  = new Date();
  const date = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  el.textContent = `${date} · ${time}`;
}

function showLoadingScreen() {
  document.getElementById('pageArea').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:70vh;gap:16px">
      <div style="width:48px;height:48px;border:3px solid var(--border-1);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite"></div>
      <p style="font-family:'Playfair Display',serif;font-size:15px;color:var(--text-3);letter-spacing:.04em">Loading Savoria…</p>
      <p style="font-family:'Jost',sans-serif;font-size:11px;color:var(--text-3);opacity:.6">Fetching latest data</p>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg);}}</style>`;
}

/* ════════════════════════════════════════
   BOOT
   ১. Theme + Clock
   ২. localStorage থেকে orders load
   ৩. AJAX দিয়ে customers আনো
   ৪. Dashboard দেখাও
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  Theme.init();
  updateClock();
  setInterval(updateClock, 30000);
  showLoadingScreen();

  /* ── ১. localStorage থেকে orders restore করো ── */
  const savedOrders = OrderStorage.load();
  if (savedOrders.length) {
    DB.orders = savedOrders;
    console.log(`✅ ${savedOrders.length} orders loaded from localStorage`);
  }

  /* ── ২. AJAX দিয়ে customers আনো ── */
  try {
    await API.getCustomers();
  } catch (err) {
    console.warn('Customer fetch failed:', err);
    Toast.show('Could not load customer data.', 'warning');
  }

  /* ── ৩. Sidebar pending badge set করো ── */
  _updatePendingBadge();

  /* ── ৪. Toast — কতটা order ছিল জানাও ── */
  if (savedOrders.length) {
    Toast.show(`${savedOrders.length} order(s) restored from last session.`, 'info');
  } else {
    Toast.show('Ready! Add orders from Get Order.', 'success');
  }

  Router.go('dashboard');
});