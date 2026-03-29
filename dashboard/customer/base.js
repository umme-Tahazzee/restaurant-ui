/* ═══════════════════════════════════════════════════
   base.js — Savoria Profile Dashboard
   Handles: user load, stats, tabs, addresses,
            loyalty tiers, settings, modals, toast
   Django: replace MOCK_* with fetch('/api/...')
═══════════════════════════════════════════════════ */

const BASE = (() => {

  /* ─────────────────────────────────────
     MOCK DATA
     Django: GET /api/profile/
  ───────────────────────────────────── */
  const MOCK_USER = {
    name:   'John Doe',
    email:  'john@example.com',
    phone:  '+1 (555) 234-5678',
    dob:    '1992-06-15',
    member: 'Gold Member',
    joined: 'March 2026',
    city:   'New York, USA',
    rating: '4.9',
    diet:   '',
    points: 2400,
    spent:  680,
    visits: 12,
    notifications: {
      order_updates:         true,
      reservation_reminders: true,
      offers:                true,
      loyalty_points:        false,
    },
  };

  const MOCK_ADDRESSES = [
    { id:1, label:'home',   street:'42 West 58th St, Apt 12B',      city:'New York', zip:'NY 10019', isDefault:true  },
    { id:2, label:'office', street:'1 World Trade Center, Floor 55', city:'New York', zip:'NY 10007', isDefault:false },
  ];

  const TIERS = [
    { name:'Silver',   icon:'fa-medal',  color:'#9ca3af', bg:'bg-gray-100',  range:'0 – 999 pts'      },
    { name:'Gold',     icon:'fa-crown',  color:'#b8963e', bg:'bg-gold/10',   range:'1,000 – 4,999 pts'},
    { name:'Platinum', icon:'fa-gem',    color:'#6366f1', bg:'bg-purple-50', range:'5,000+ pts'        },
  ];

  const NOTIF_CONFIG = [
    { key:'order_updates',         label:'Order Updates',           desc:'Get notified when your order status changes'     },
    { key:'reservation_reminders', label:'Reservation Reminders',   desc:'Reminder 2 hours before your table time'         },
    { key:'offers',                label:'Special Offers & Events', desc:'Exclusive deals, seasonal menus & new dishes'    },
    { key:'loyalty_points',        label:'Loyalty Points',          desc:'Alerts when you earn or reach a new tier'        },
  ];

  /* ─────────────────────────────────────
     STATE
  ───────────────────────────────────── */
  let currentUser = null;
  let addresses   = [];
  let editAddrId  = null;

  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  function init() {
    _loadUser();
    _renderAddresses();
    _renderTiers();
    _renderNotifications();
  }

  /* ─────────────────────────────────────
     LOAD USER
     Django: const u = await fetch('/api/profile/').then(r=>r.json())
  ───────────────────────────────────── */
  function _loadUser() {
    const stored = JSON.parse(localStorage.getItem('sv_user') || 'null');
    currentUser  = stored ? { ...MOCK_USER, ...stored } : { ...MOCK_USER };

    // Hero section
    _set('profileName',   currentUser.name   || 'Guest');
    _set('profileEmail',  currentUser.email  || '');
    _set('memberBadge',   currentUser.member || 'Member');
    _set('profileJoined', currentUser.joined || '');
    _set('profileCity',   currentUser.city   || '');
    _set('profileRating', currentUser.rating || '4.9');
    document.getElementById('avatarLetter').textContent =
      (currentUser.name || 'G').charAt(0).toUpperCase();

    // Stats (computed from orders data shared via window)
    const orders    = window.ORDERS_DATA || [];
    const delivered = orders.filter(o => o.status === 'delivered');
    const totalSpent = delivered.reduce((sum, o) => {
      const sub  = o.items.reduce((s, i) => s + i.price * i.qty, 0);
      const disc = o.discount > 0 ? sub * o.discount / 100 : 0;
      return sum + sub + sub * 0.08 - disc + o.tip;
    }, 0);

    const pts   = currentUser.points || 2400;
    const spent = Math.round(totalSpent) || currentUser.spent;

    _set('statOrders',  delivered.length);
    _set('statVisits',  currentUser.visits || 12);
    _set('statSaved',   (window.WISHLIST_DATA || []).length);
    _set('statRating',  '★ ' + (currentUser.rating || '4.9'));
    _set('statSpent',   '$' + spent);
    _set('statPoints',  pts.toLocaleString());

    // Loyalty bar
    const target = 5000;
    const pct    = Math.min(100, Math.round(pts / target * 100));
    _set('loyaltyPts',      pts.toLocaleString());
    _set('loyaltyPct',      pct + '%');
    _set('loyaltyCardPts',  pts.toLocaleString());
    _set('loyaltyCardCredit','$' + Math.floor(pts / 50));
    _set('loyaltyCardOrders', delivered.length);
    document.getElementById('loyaltyBar')
      .style.setProperty('--lw', pct + '%');

    // Settings form
    const [first, ...rest] = (currentUser.name || '').split(' ');
    _val('settFirst', first || '');
    _val('settLast',  rest.join(' ') || '');
    _val('settEmail', currentUser.email || '');
    _val('settPhone', currentUser.phone || '');
    _val('settDob',   currentUser.dob   || '');
    if (currentUser.diet) _val('settDiet', currentUser.diet);
  }

  /* ─────────────────────────────────────
     TABS
  ───────────────────────────────────── */
  function showTab(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('[id^="tab-"]').forEach(t => t.classList.remove('active'));
    const panel = document.getElementById('panel-' + id);
    if (panel) {
      panel.classList.remove('hidden');
      // Re-trigger animation
      panel.style.animation = 'none';
      void panel.offsetWidth;
      panel.style.animation = '';
    }
    document.getElementById('tab-' + id)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ─────────────────────────────────────
     ADDRESSES
     Django: GET /api/addresses/
  ───────────────────────────────────── */
  function _renderAddresses() {
    addresses = [...MOCK_ADDRESSES];
    const grid = document.getElementById('addressGrid');
    if (!grid) return;

    const labelMap = { home:'🏠 Home', office:'💼 Office', other:'📍 Other' };
    const iconMap  = { home:'fa-house', office:'fa-briefcase', other:'fa-location-dot' };

    grid.innerHTML = addresses.map(a => `
      <div class="border-[1.5px] ${a.isDefault ? 'border-red bg-red-pale/20' : 'border-border hover:border-red'} rounded-[14px] p-4 transition cursor-pointer">
        <div class="flex items-start justify-between mb-3">
          <div class="w-9 h-9 rounded-xl ${a.isDefault ? 'bg-red-pale' : 'bg-cream'} flex items-center justify-center">
            <i class="fa-solid ${iconMap[a.label] || 'fa-location-dot'} ${a.isDefault ? 'text-red' : 'text-ink-mid'} text-sm"></i>
          </div>
          ${a.isDefault ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[.12em] bg-gold/12 text-gold border border-gold/25">Default</span>` : ''}
        </div>
        <p class="font-bold text-ink text-sm">${labelMap[a.label] || a.label}</p>
        <p class="text-ink-mid/50 text-sm mt-1 leading-relaxed">${a.street}<br/>${a.city}, ${a.zip}</p>
        <div class="flex gap-2 mt-3 flex-wrap">
          <button onclick="BASE.openAddrModal(${a.id})" class="text-[10px] font-bold text-red uppercase tracking-widest hover:underline">Edit</button>
          <span class="text-ink-mid/30">·</span>
          <button onclick="BASE.deleteAddress(${a.id})" class="text-[10px] font-bold text-ink-mid/40 uppercase tracking-widest hover:underline">Delete</button>
          ${!a.isDefault ? `<span class="text-ink-mid/30">·</span><button onclick="BASE.setDefault(${a.id})" class="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline">Set Default</button>` : ''}
        </div>
      </div>
    `).join('') + `
      <button onclick="BASE.openAddrModal(null)"
        class="border-[1.5px] border-dashed border-border rounded-[14px] p-4 flex flex-col items-center justify-center gap-3 py-10 hover:border-red transition group">
        <div class="w-10 h-10 rounded-xl bg-cream flex items-center justify-center group-hover:bg-red-pale transition">
          <i class="fa-solid fa-plus text-ink-mid/40 group-hover:text-red transition"></i>
        </div>
        <p class="font-bold text-ink-mid/40 text-sm group-hover:text-red transition">Add New Address</p>
      </button>`;
  }

  function openAddrModal(id) {
    editAddrId = id;
    document.getElementById('addrModalTitle').textContent = id ? 'Edit Address' : 'Add New Address';
    if (id) {
      const a = addresses.find(x => x.id === id);
      if (a) {
        _val('addrLabel',   a.label);
        _val('addrStreet',  a.street);
        _val('addrCity',    a.city);
        _val('addrZip',     a.zip);
        document.getElementById('addrDefault').checked = a.isDefault;
      }
    } else {
      _val('addrLabel',  'home');
      _val('addrStreet', '');
      _val('addrCity',   '');
      _val('addrZip',    '');
      document.getElementById('addrDefault').checked = false;
    }
    _openModal('addrModal');
  }

  function closeAddrModal() { _closeModal('addrModal'); }

  function saveAddress() {
    const street = document.getElementById('addrStreet').value.trim();
    const city   = document.getElementById('addrCity').value.trim();
    if (!street || !city) { showToast('Please fill in required fields ⚠️'); return; }

    const data = {
      label:     document.getElementById('addrLabel').value,
      street, city,
      zip:       document.getElementById('addrZip').value.trim(),
      isDefault: document.getElementById('addrDefault').checked,
    };

    // Django:
    // const method = editAddrId ? 'PUT' : 'POST';
    // const url    = editAddrId ? `/api/addresses/${editAddrId}/` : '/api/addresses/';
    // await fetch(url, { method, body: JSON.stringify(data), headers: { 'Content-Type':'application/json', 'X-CSRFToken': getCookie('csrftoken') } });

    if (editAddrId) {
      const idx = addresses.findIndex(x => x.id === editAddrId);
      addresses[idx] = { ...addresses[idx], ...data };
      if (data.isDefault) addresses.forEach(a => a.isDefault = (a.id === editAddrId));
    } else {
      const newAddr = { id: Date.now(), ...data };
      addresses.push(newAddr);
      if (data.isDefault) addresses.forEach(a => a.isDefault = (a.id === newAddr.id));
    }

    MOCK_ADDRESSES.length = 0;
    MOCK_ADDRESSES.push(...addresses);
    _renderAddresses();
    closeAddrModal();
    showToast(editAddrId ? 'Address updated! ✓' : 'Address added! ✓');
  }

  function deleteAddress(id) {
    if (!confirm('Delete this address?')) return;
    // Django: await fetch(`/api/addresses/${id}/`, { method:'DELETE', headers:{'X-CSRFToken':getCookie('csrftoken')} });
    const idx = MOCK_ADDRESSES.findIndex(a => a.id === id);
    if (idx > -1) MOCK_ADDRESSES.splice(idx, 1);
    _renderAddresses();
    showToast('Address deleted');
  }

  function setDefault(id) {
    // Django: await fetch(`/api/addresses/${id}/set_default/`, { method:'POST', headers:{...} });
    MOCK_ADDRESSES.forEach(a => a.isDefault = (a.id === id));
    _renderAddresses();
    showToast('Default address updated! ✓');
  }

  /* ─────────────────────────────────────
     LOYALTY TIERS
  ───────────────────────────────────── */
  function _renderTiers() {
    const container = document.getElementById('tiersContainer');
    if (!container) return;
    const currentTier = (currentUser?.member || 'Gold').split(' ')[0];
    const pts         = currentUser?.points || 2400;
    const tierOrder   = TIERS.map(t => t.name);
    const currentIdx  = tierOrder.indexOf(currentTier);
    const tierLimits  = { Silver:999, Gold:4999, Platinum:Infinity };

    container.innerHTML = TIERS.map((t, i) => {
      const isCurrent = t.name === currentTier;
      const isDone    = i < currentIdx;
      const remaining = isCurrent ? (tierLimits[t.name] + 1 - pts) : 0;

      return `
        <div class="flex items-center gap-4 p-4 ${isCurrent ? 'bg-red-pale/20' : ''}">
          <div class="w-9 h-9 rounded-full ${t.bg} flex items-center justify-center">
            <i class="fa-solid ${t.icon}" style="color:${t.color}"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-ink text-sm flex items-center gap-2">
              ${t.name}
              ${isCurrent ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-gold/12 text-gold border border-gold/25">Current</span>` : ''}
            </p>
            <p class="text-ink-mid/50 text-xs">${t.range}</p>
          </div>
          <div class="text-right text-[10px] font-bold uppercase tracking-widest">
            ${isDone
              ? `<i class="fa-solid fa-check text-green-500"></i>`
              : isCurrent && remaining > 0
                ? `<span class="text-ink-mid/30">${remaining.toLocaleString()} pts away</span>`
                : `<span class="text-ink-mid/20">Locked</span>`}
          </div>
        </div>
        ${i < TIERS.length - 1 ? '<div class="h-px bg-border mx-4"></div>' : ''}`;
    }).join('');
  }

  /* ─────────────────────────────────────
     NOTIFICATIONS
     Django: PATCH /api/profile/notifications/
  ───────────────────────────────────── */
  function _renderNotifications() {
    const container = document.getElementById('notifList');
    if (!container) return;
    const notifs = currentUser?.notifications || {};

    container.innerHTML = NOTIF_CONFIG.map(n => `
      <div class="flex items-center justify-between p-5">
        <div>
          <p class="font-semibold text-ink text-sm">${n.label}</p>
          <p class="text-ink-mid/50 text-xs mt-0.5">${n.desc}</p>
        </div>
        <label class="toggle-wrap">
          <input type="checkbox" id="notif-${n.key}" ${notifs[n.key] ? 'checked' : ''}
            onchange="BASE.updateNotif('${n.key}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    `).join('');
  }

  function updateNotif(key, val) {
    if (!currentUser.notifications) currentUser.notifications = {};
    currentUser.notifications[key] = val;
    localStorage.setItem('sv_user', JSON.stringify(currentUser));
    // Django: fetch('/api/profile/notifications/', { method:'PATCH', body:JSON.stringify({[key]:val}), headers:{...} });
    showToast(val ? 'Notification enabled' : 'Notification disabled');
  }

  /* ─────────────────────────────────────
     SAVE PROFILE
     Django: PUT /api/profile/
  ───────────────────────────────────── */
  function saveProfile() {
    const first = document.getElementById('settFirst').value.trim();
    const email = document.getElementById('settEmail').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    document.getElementById('errFirst').classList.toggle('hidden', !!first);
    document.getElementById('errEmail').classList.toggle('hidden', emailOk);
    if (!first || !emailOk) { showToast('Please fix the errors above ⚠️'); return; }

    currentUser = {
      ...currentUser,
      name:  (first + ' ' + document.getElementById('settLast').value.trim()).trim(),
      email,
      phone: document.getElementById('settPhone').value.trim(),
      dob:   document.getElementById('settDob').value,
      diet:  document.getElementById('settDiet').value,
    };
    localStorage.setItem('sv_user', JSON.stringify(currentUser));
    _loadUser();

    // Django:
    // await fetch('/api/profile/', {
    //   method:'PUT',
    //   body: JSON.stringify({ first_name:first, last_name:..., email, phone, dob, diet }),
    //   headers: { 'Content-Type':'application/json', 'X-CSRFToken': getCookie('csrftoken') }
    // });
    showToast('Profile updated successfully! ✓');
  }

  /* ─────────────────────────────────────
     DELETE ACCOUNT MODAL
  ───────────────────────────────────── */
  function confirmDelete()  { _openModal('deleteModal');  }
  function closeDeleteModal(){ _closeModal('deleteModal'); }

  /* ─────────────────────────────────────
     LOGOUT
     Django: POST /api/auth/logout/
  ───────────────────────────────────── */
  function logout() {
    localStorage.removeItem('sv_user');
    // Django: await fetch('/api/auth/logout/', { method:'POST', headers:{'X-CSRFToken':getCookie('csrftoken')} });
    location.href = '../../login.html';
  }

  /* ─────────────────────────────────────
     AVATAR CLICK
  ───────────────────────────────────── */
  function avatarClick() {
    showToast('Avatar upload coming soon!');
    // Django: open file picker → POST /api/profile/avatar/
  }

  /* ─────────────────────────────────────
     TOAST
  ───────────────────────────────────── */
  function showToast(msg) {
    const t = document.createElement('div');
    Object.assign(t.style, {
      position:'fixed', bottom:'90px', left:'50%',
      transform:'translateX(-50%) translateY(20px)',
      background:'#1a1210', color:'#fff',
      padding:'10px 20px', borderRadius:'999px',
      fontFamily:"'Jost',sans-serif", fontSize:'12px', fontWeight:'600',
      zIndex:'9999', whiteSpace:'nowrap', pointerEvents:'none',
      boxShadow:'0 8px 32px rgba(0,0,0,.3)',
      opacity:'0', transition:'opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1)',
    });
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity   = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      t.style.opacity   = '0';
      t.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => t.remove(), 300);
    }, 2400);
  }

  /* ─────────────────────────────────────
     MODAL HELPERS
  ───────────────────────────────────── */
  function _openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function _closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─────────────────────────────────────
     DOM HELPERS
  ───────────────────────────────────── */
  function _set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function _val(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  /* ─────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────── */
  return {
    init, showTab,
    openAddrModal, closeAddrModal, saveAddress, deleteAddress, setDefault,
    updateNotif, saveProfile,
    confirmDelete, closeDeleteModal,
    logout, avatarClick, showToast,
    getUser: () => currentUser,
  };

})();
