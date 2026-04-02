/* ================================================
   SAVORIA ADMIN — APP CORE
   Router, Theme, Sidebar, Toast, Modal, Clock
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
};

const Toast = {
  icons: { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info', warning:'fa-triangle-exclamation' },
  show(message, type='success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${this.icons[type]} toast-icon"></i><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.style.animation = 'toastIn .3s ease reverse'; 
      setTimeout(() => el.remove(), 300); }, 3000);
  },
};

const Modal = {
  open(id) { document.getElementById(id).classList.add('show'); },
  close(id) { document.getElementById(id).classList.remove('show'); },
};
window.Modal = Modal;

const Theme = {
  _dark: false,
  init() {
    const saved = localStorage.getItem('savoria-admin-theme') || 'light';
    this._dark = (saved === 'dark');
    this._apply();
    Notif.init();
  },
  toggle() {
    this._dark = !this._dark;
    this._apply();
    localStorage.setItem('savoria-admin-theme', this._dark ? 'dark' : 'light');
  },
  _apply() {
    document.documentElement.setAttribute('data-theme', this._dark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = this._dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  },
  
};

const Sidebar = {
  _collapsed: false,
  toggle() {
    this._collapsed = !this._collapsed;
    document.getElementById('sidebar').classList.toggle('collapsed', this._collapsed);
  },
  openMobile() {
    document.getElementById('sidebar').classList.add('mobile-open');
    document.getElementById('mobileOverlay').style.display = 'block';
  },
  closeMobile() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('mobileOverlay').style.display = 'none';
  },
};

function toggleNotif() {
  const drop = document.getElementById('notifDrop');
  drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
}
document.addEventListener('click', e => {
  const drop = document.getElementById('notifDrop');
  if (!drop) return;
  if (!e.target.closest('#notifDrop') && !e.target.closest('#notifBtn')) {
    drop.style.display = 'none';
  }
});

const Router = {
  views: {
    dashboard:    () => DashboardView,
    report:       () => ReportView,
    ingredient:   () => IngredientReportView,
    customers:    () => CustomersView,
    reviews:      () => ReviewsView,
    transactions: () => TransactionsView,
    settings:     () => SettingsView,
    expense:      () => ExpenseView,
    product:      () => ProductView,
    blog:         () => BlogView,
    profile:      () => ProfileView,
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
      Sidebar.closeMobile();
    }, 80);
  },
};

function updateClock() {
  const el = document.getElementById('topClock');
  if (!el) return;
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  el.textContent = `${date} · ${time}`;
}

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  updateClock();
  setInterval(updateClock, 30000);
  Router.go('dashboard');
});
