/* ================================================
   NOTIF — Real-time notification system
   localStorage persistent, event-driven
================================================ */

const Notif = {
  _KEY: 'savoria_notifications',
  _MAX: 50, // maximum stored notifications

  // ── dot colors per type
  _COLORS: {
    product:  'var(--red)',
    customer: 'var(--blue)',
    expense:  'var(--orange)',
    stock:    'var(--gold)',
    system:   'var(--green)',
    blog:     'var(--purple)',
  },

  // ── icons per type
  _ICONS: {
    product:  'fa-box-open',
    customer: 'fa-users',
    expense:  'fa-file-invoice-dollar',
    stock:    'fa-triangle-exclamation',
    system:   'fa-circle-check',
    blog:     'fa-newspaper',
  },

  // ── load from localStorage
  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._KEY)) || [];
    } catch { return []; }
  },

  // ── save to localStorage
  _save(list) {
    try {
      localStorage.setItem(this._KEY, JSON.stringify(list.slice(0, this._MAX)));
    } catch { console.warn('Notif save failed'); }
  },

  // ── add a new notification
  // type: 'product' | 'customer' | 'expense' | 'stock' | 'system' | 'blog'
  add(type, message) {
    const list = this._load();
    list.unshift({
      id:      Date.now(),
      type,
      message,
      read:    false,
      time:    new Date().toISOString(),
    });
    this._save(list);
    this.render();
    this._animateBell();
  },

  // ── mark all as read
  markAllRead() {
    const list = this._load().map(n => ({ ...n, read: true }));
    this._save(list);
    this.render();
  },

  // ── mark single as read
  markRead(id) {
    const list = this._load().map(n => n.id === id ? { ...n, read: true } : n);
    this._save(list);
    this.render();
  },

  // ── clear all
  clear() {
    this._save([]);
    this.render();
  },

  // ── unread count
  _unreadCount() {
    return this._load().filter(n => !n.read).length;
  },

  // ── time ago string
  _timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day ago`;
  },

  // ── render dropdown + badge
  render() {
    const list  = this._load();
    const count = list.filter(n => !n.read).length;

    // ── badge on bell icon (shows count)
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // ── badge count in dropdown header
    const countBadge = document.querySelector('.notif-count-badge');
    if (countBadge) {
      countBadge.textContent = count > 0 ? `${count} new` : 'All read';
      countBadge.className   = `tag ${count > 0 ? 'tag-pending' : 'tag-delivered'} notif-count-badge`;
    }

    // ── notification list
    const listEl = document.getElementById('notifList');
    if (!listEl) return;

    if (list.length === 0) {
      listEl.innerHTML = `
        <div class="notif-empty">
          <div style="text-align:center;padding:32px 16px;color:var(--text-3)">
          <i class="fa-solid fa-bell-slash" style="font-size:28px;margin-bottom:8px;display:block;opacity:.4"></i>
          <div style="font-size:12px">No notifications yet</div>
        </div>
        </div>`;
      return;
    }

    listEl.innerHTML = list.map(n => `
      <div class="notif-item ${n.read ? 'notif-read' : 'notif-unread'}"
           onclick="Notif.markRead(${n.id})"
           style="cursor:pointer">
        <div class="notif-icon-wrap" style="background:${(this._COLORS[n.type] || 'var(--text-3)')}15;color:${this._COLORS[n.type] || 'var(--text-3)'}">
          <i class="fa-solid ${this._ICONS[n.type] || 'fa-bell'}"></i>
        </div>
        <div style="flex:1;min-width:0">
          <p class="notif-message ${n.read ? '' : 'notif-message-unread'}">
            ${n.message}
          </p>
          <p class="notif-time">
            <i class="fa-regular fa-clock" style="font-size:9px;margin-right:3px"></i>
            ${this._timeAgo(n.time)}
          </p>
        </div>
        ${!n.read ? '<span class="notif-unread-dot"></span>' : ''}
      </div>`).join('');
  },

  // ── bell shake animation
  _animateBell() {
    const btn = document.getElementById('notifBtn');
    if (!btn) return;
    btn.classList.add('bell-shake');
    setTimeout(() => btn.classList.remove('bell-shake'), 600);
  },

  // ── init: render on load + start time refresh
  init() {
    this.render();
    // refresh "X min ago" timestamps every minute
    setInterval(() => this.render(), 60000);
  },
};