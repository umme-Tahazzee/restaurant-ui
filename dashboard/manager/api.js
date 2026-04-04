/* ================================================
   SAVORIA MANAGER — API LAYER  (api.js)
   
   Hybrid approach:
   - Tables, Staff, Inventory, Orders, Profile → localStorage (persistent)
   - Customers → JSONPlaceholder (mock AJAX)
   - All CRUD operations flow through this file
================================================ */

const API_BASE = 'https://jsonplaceholder.typicode.com';

/* ─────────────────────────────────────────────
   CORE: fetch wrapper
───────────────────────────────────────────── */
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(API_BASE + endpoint, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API fetch error:', err.message);
    return null;
  }
}


/* ─────────────────────────────────────────────
   MANAGER STORE — localStorage persistence
   All persistent data flows through here
───────────────────────────────────────────── */
const ManagerStore = {

  KEYS: {
    tables:    'savoria_tables',
    inventory: 'savoria_inventory',
    orders:    'savoria_orders',
    staff:     'savoria_staff',
    profile:   'savoria_profile',
    customers: 'db_customers',
  },

  /* ── Generic load/save ── */
  _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn(`ManagerStore._get(${key}) failed:`, err);
      return null;
    }
  },

  _set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`ManagerStore._set(${key}) failed:`, err);
    }
  },

  /* ── Tables ── */
  loadTables() {
    const data = this._get(this.KEYS.tables);
    if (data) return data;
    // First time — use defaults
    const defaults = [
      { num:1,  status:'occupied', guests:2, seated:'52 min', waiter:'Amara', bill:48  },
      { num:2,  status:'occupied', guests:4, seated:'9 min',  waiter:'Luca',  bill:100 },
      { num:3,  status:'occupied', guests:2, seated:'2 min',  waiter:'Amara', bill:46  },
      { num:4,  status:'empty',    guests:0, seated:'',       waiter:'',      bill:0   },
      { num:5,  status:'occupied', guests:3, seated:'38 min', waiter:'Luca',  bill:60  },
      { num:6,  status:'cleaning', guests:0, seated:'',       waiter:'',      bill:0   },
      { num:7,  status:'occupied', guests:4, seated:'14 min', waiter:'Sofia', bill:197 },
      { num:8,  status:'empty',    guests:0, seated:'',       waiter:'',      bill:0   },
      { num:9,  status:'occupied', guests:6, seated:'22 min', waiter:'Kenji', bill:70  },
      { num:10, status:'reserved', guests:4, seated:'8:00pm', waiter:'',      bill:0   },
      { num:11, status:'occupied', guests:2, seated:'1 min',  waiter:'Sofia', bill:197 },
      { num:12, status:'empty',    guests:0, seated:'',       waiter:'',      bill:0   },
      { num:13, status:'reserved', guests:6, seated:'8:30pm', waiter:'',      bill:0   },
      { num:14, status:'empty',    guests:0, seated:'',       waiter:'',      bill:0   },
      { num:15, status:'cleaning', guests:0, seated:'',       waiter:'',      bill:0   },
    ];
    this._set(this.KEYS.tables, defaults);
    return defaults;
  },
  saveTables() { this._set(this.KEYS.tables, DB.tables); },

  /* ── Inventory ── */
  loadInventory() {
    const data = this._get(this.KEYS.inventory);
    if (data) return data;
    const defaults = [
      { id:'i1', name:'Wagyu A5 (Japan)',  cat:'Meat',      qty:2,   unit:'kg',  minQty:5,   cost:165, status:'low' },
      { id:'i2', name:'Black Truffle',     cat:'Pantry',    qty:180, unit:'g',   minQty:200, cost:42,  status:'low' },
      { id:'i3', name:'Burrata (Fresh)',   cat:'Pantry',    qty:8,   unit:'pcs', minQty:10,  cost:18,  status:'low' },
      { id:'i4', name:'Prosecco',          cat:'Beverages', qty:4,   unit:'btl', minQty:10,  cost:12,  status:'low' },
      { id:'i5', name:'Tagliatelle',       cat:'Pasta',     qty:34,  unit:'ptn', minQty:20,  cost:28,  status:'ok'  },
      { id:'i6', name:'Bistecca T-bone',   cat:'Meat',      qty:12,  unit:'kg',  minQty:6,   cost:48,  status:'ok'  },
      { id:'i7', name:'Chianti Classico',  cat:'Beverages', qty:24,  unit:'btl', minQty:12,  cost:16,  status:'ok'  },
      { id:'i8', name:'Fresh Lobster',     cat:'Seafood',   qty:12,  unit:'pcs', minQty:8,   cost:38,  status:'ok'  },
    ];
    this._set(this.KEYS.inventory, defaults);
    return defaults;
  },
  saveInventory() { this._set(this.KEYS.inventory, DB.inventory); },

  /* ── Orders ── */
  loadOrders() {
    const data = this._get(this.KEYS.orders);
    if (!data) return [];
    // Restore Date objects
    return data.map(o => ({ ...o, created: new Date(o.created) }));
  },
  saveOrders() { this._set(this.KEYS.orders, DB.orders); },
  clearOrders() { localStorage.removeItem(this.KEYS.orders); DB.orders = []; },

  /* ── Staff ── */
  loadStaff() {
    const data = this._get(this.KEYS.staff);
    if (data) return data;
    const defaults = [
      { id:'s1', name:'Marco Ferretti', role:'Executive Chef',  status:'on',  avatar:'M', color:'#c0392b', shift:'06:00–14:00', orders:12, rating:5.0 },
      { id:'s2', name:'Sophia Laurent', role:'Pastry Chef',     status:'on',  avatar:'S', color:'#b8963e', shift:'10:00–18:00', orders:8,  rating:4.9 },
      { id:'s3', name:'Kenji Nakamura', role:'Sommelier',       status:'on',  avatar:'K', color:'#1a5276', shift:'16:00–24:00', orders:0,  rating:4.9 },
      { id:'s4', name:'Amara Osei',     role:"Maître d'Hôtel",  status:'on',  avatar:'A', color:'#2d7a47', shift:'14:00–22:00', orders:0,  rating:5.0 },
      { id:'s5', name:'Luca Bianchi',   role:'Sous Chef',       status:'on',  avatar:'L', color:'#96281b', shift:'12:00–20:00', orders:9,  rating:4.8 },
      { id:'s6', name:'Sofia Rossi',    role:'Waitress',        status:'on',  avatar:'S', color:'#c47a1a', shift:'16:00–24:00', orders:5,  rating:4.7 },
      { id:'s7', name:'Tariq Hassan',   role:'Line Cook',       status:'off', avatar:'T', color:'#666666', shift:'14:00–22:00', orders:5,  rating:4.6 },
      { id:'s8', name:'Elena Moretti',  role:'Hostess',         status:'on',  avatar:'E', color:'#6d3b8e', shift:'16:00–24:00', orders:0,  rating:4.9 },
    ];
    this._set(this.KEYS.staff, defaults);
    return defaults;
  },
  saveStaff() { this._set(this.KEYS.staff, DB.staff); },

  /* ── Profile ── */
  loadProfile() {
    const data = this._get(this.KEYS.profile);
    if (data) return data;
    const defaults = {
      id:        'MGR001',
      name:      'Manerger',
      role:      'Restaurant Manager',
      email:     'maneger@savoria.com',
      phone:     '+880 171 000 0010',
      joined:    '2021-06-01',
      shift:     'Full Day (10:00–22:00)',
      avatarColor: '#96281b',
      permissions: ['Staff Management','Inventory','Finance','Reports','Settings'],
    };
    this._set(this.KEYS.profile, defaults);
    return { ...defaults };
  },
  saveProfile() { this._set(this.KEYS.profile, DB.profile); },

  /* ── Customers ── */
  loadCustomers() {
    return this._get(this.KEYS.customers) || [];
  },
  saveCustomers() { this._set(this.KEYS.customers, DB.customers); },
};


/* ─────────────────────────────────────────────
   TRANSFORM: JSONPlaceholder → Savoria format
───────────────────────────────────────────── */
const CUST_STATUSES = ['vip','regular','regular','vip','regular','vip','new','regular'];
const CUST_COLORS   = ['#c0392b','#1a5276','#b8963e','#2d7a47','#6d3b8e','#c47a1a','#96281b','#1a5276'];
const CUST_NOTES    = ['Prefers window table','','Birthday group','Shellfish allergy!','Food blog group','Tasting menu preferred','','Halal preference'];
const CUST_VISITS   = [12,7,3,18,5,22,2,8];
const CUST_SPENT    = [1240,680,540,2100,860,3200,120,920];

function mapUsers(users) {
  return users.map((u, i) => ({
    id:        `c${u.id}`,
    name:      u.name,
    phone:     u.phone,
    email:     u.email,
    visits:    CUST_VISITS[i] ?? Math.floor(Math.random() * 15) + 1,
    spent:     CUST_SPENT[i]  ?? Math.floor(Math.random() * 1500) + 200,
    lastVisit: '2025-03-12',
    status:    CUST_STATUSES[i] || 'regular',
    color:     CUST_COLORS[i]   || '#1a5276',
    note:      CUST_NOTES[i]    || '',
  }));
}


/* ─────────────────────────────────────────────
   PUBLIC API OBJECT
───────────────────────────────────────────── */
const Api = {

  /* ── CUSTOMERS (AJAX + localStorage fallback) ── */
  async getCustomers() {
    // Try localStorage first
    const saved = ManagerStore.loadCustomers();
    if (saved.length) {
      DB.customers = saved;
      return DB.customers;
    }
    // Fetch from mock API
    const data = await apiFetch('/users');
    if (!data) return DB.customers;
    DB.customers = mapUsers(data);
    ManagerStore.saveCustomers();
    return DB.customers;
  },

  /* ── ORDERS (AJAX simulation + localStorage) ── */
  async createOrder(orderData) {
    const data = await apiFetch('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    // Even if AJAX "fails" we still save locally
    DB.orders.unshift(orderData);
    ManagerStore.saveOrders();
    _updatePendingBadge();
    return orderData;
  },

  async updateOrderStatus(orderId, newStatus) {
    await apiFetch('/posts/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const order = DB.orders.find(o => o.id === orderId);
    if (order) order.status = newStatus;
    ManagerStore.saveOrders();
    _updatePendingBadge();
    return { success: true, id: orderId, status: newStatus };
  },

  async cancelOrder(orderId) {
    await apiFetch('/posts/1', { method: 'DELETE' });
    const order = DB.orders.find(o => o.id === orderId);
    if (order) order.status = 'cancelled';
    ManagerStore.saveOrders();
    _updatePendingBadge();
    return { success: true, id: orderId };
  },

  /* ── INIT: Load all persistent data at boot ── */
  init() {
    DB.tables    = ManagerStore.loadTables();
    DB.inventory = ManagerStore.loadInventory();
    DB.staff     = ManagerStore.loadStaff();
    DB.profile   = ManagerStore.loadProfile();

    const savedOrders = ManagerStore.loadOrders();
    if (savedOrders.length) DB.orders = savedOrders;

    console.log(`✅ ${DB.tables.length} tables loaded`);
    console.log(`✅ ${DB.inventory.length} inventory items loaded`);
    console.log(`✅ ${DB.staff.length} staff members loaded`);
    console.log(`✅ Profile loaded: ${DB.profile.name}`);
    console.log(`✅ ${DB.orders.length} orders restored`);
  },
};


/* ── Backward-compatible aliases ── */
const TableStorage     = { save() { ManagerStore.saveTables(); },     load() { return ManagerStore.loadTables(); }     };
const InventoryStorage = { save() { ManagerStore.saveInventory(); },  load() { return ManagerStore.loadInventory(); }  };
const OrderStorage     = { save() { ManagerStore.saveOrders(); },     load() { return ManagerStore.loadOrders(); }, clear() { ManagerStore.clearOrders(); } };
const StaffStorage     = { save() { ManagerStore.saveStaff(); },      load() { return ManagerStore.loadStaff(); }      };
const ProfileStorage   = { save() { ManagerStore.saveProfile(); },    load() { return ManagerStore.loadProfile(); }    };

/* ── Private helper: sidebar pending badge ── */
function _updatePendingBadge() {
  const count = DB.orders.filter(o => o.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  if (badge) badge.textContent = count;
}

/* ── Expose globally ── */
window.Api            = Api;
window.ManagerStore   = ManagerStore;
window.API            = Api;  // backward compat with old code that uses API.getCustomers()
