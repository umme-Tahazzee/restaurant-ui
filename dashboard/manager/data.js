/* ================================================
   SAVORIA — DATA STORE  (data/data.js)

   - DB.orders → localStorage থেকে load হয়
   - DB.customers → AJAX থেকে আসে
   - বাকি সব static
================================================ */

window.DB = {

  /* ── ORDERS — localStorage থেকে আসবে ── */
  orders: [],

  /* ── CUSTOMERS — AJAX থেকে আসবে ── */
  customers: [],

  /* ── MENU (static) ── */
  menu: [
    { cat:'Starters', emoji:'🥗', items: [
      { id:'m1', name:'Burrata & Tomatoes', price:18, emoji:'🧀' },
      { id:'m2', name:'Tuna Tartare',       price:24, emoji:'🐟' },
      { id:'m3', name:'Tom Yum Soup',       price:16, emoji:'🍜' },
      { id:'m4', name:'Lobster Bisque',     price:22, emoji:'🦞' },
    ]},
    { cat:'Pasta & Risotto', emoji:'🍝', items: [
      { id:'m5', name:'Tagliatelle al Ragù', price:28, emoji:'🍝' },
      { id:'m6', name:'Truffle Risotto',     price:32, emoji:'🍄' },
      { id:'m7', name:'Spaghetti Carbonara', price:26, emoji:'🍝' },
    ]},
    { cat:'Main Courses', emoji:'🥩', items: [
      { id:'m8',  name:'Bistecca Fiorentina', price:48,  emoji:'🥩' },
      { id:'m9',  name:'Wagyu Tenderloin',    price:165, emoji:'🥩' },
      { id:'m10', name:'Confit Duck Leg',     price:38,  emoji:'🦆' },
      { id:'m11', name:'Rack of Lamb',        price:42,  emoji:'🍖' },
      { id:'m12', name:'Seared Scallops',     price:34,  emoji:'🦪' },
    ]},
    { cat:'Desserts', emoji:'🍮', items: [
      { id:'m13', name:'Panna Cotta',       price:14, emoji:'🍮' },
      { id:'m14', name:'Tiramisu',          price:12, emoji:'🍰' },
      { id:'m15', name:'Chocolate Soufflé', price:16, emoji:'🍫' },
    ]},
    { cat:'Drinks', emoji:'🍷', items: [
      { id:'m16', name:'Chianti Classico', price:16, emoji:'🍷' },
      { id:'m17', name:'Aperol Spritz',    price:14, emoji:'🍊' },
      { id:'m18', name:'Negroni',          price:18, emoji:'🍸' },
      { id:'m19', name:'Prosecco',         price:12, emoji:'🥂' },
      { id:'m20', name:'Still Water',      price:4,  emoji:'💧' },
    ]},
  ],

  /* ── TRANSACTIONS (static) ── */
  transactions: [
    { id:'T-1001', orderId:'#048', customer:'Brooklyn F.', method:'card', amount:86,  date:'2025-03-16', time:'20:15', status:'completed' },
    { id:'T-1002', orderId:'#047', customer:'James R.',    method:'cash', amount:44,  date:'2025-03-16', time:'19:58', status:'completed' },
    { id:'T-1003', orderId:'#046', customer:'Sarah K.',    method:'card', amount:32,  date:'2025-03-16', time:'19:42', status:'completed' },
    { id:'T-1004', orderId:'#045', customer:'Alex M.',     method:'card', amount:0,   date:'2025-03-16', time:'19:30', status:'refunded'  },
    { id:'T-1005', orderId:'#044', customer:'Marco F.',    method:'cash', amount:54,  date:'2025-03-16', time:'19:10', status:'completed' },
    { id:'T-1006', orderId:'#043', customer:'Tariq H.',    method:'card', amount:197, date:'2025-03-16', time:'21:05', status:'pending'   },
    { id:'T-1007', orderId:'#042', customer:'Elena M.',    method:'card', amount:60,  date:'2025-03-16', time:'20:45', status:'pending'   },
    { id:'T-0998', orderId:'#037', customer:'Laurent F.',  method:'card', amount:145, date:'2025-03-15', time:'21:30', status:'completed' },
    { id:'T-0997', orderId:'#036', customer:'Dr. Chen',    method:'card', amount:98,  date:'2025-03-15', time:'20:10', status:'completed' },
    { id:'T-0996', orderId:'#035', customer:'Alex M.',     method:'cash', amount:72,  date:'2025-03-15', time:'19:45', status:'completed' },
  ],

  /* ── EXPENSES (static) ── */
  expenses: [
    { id:'e1', category:'Ingredients', vendor:'Fresh Market Co.',    amount:1240, date:'2025-03-16', note:'Weekly produce order',    icon:'fa-carrot',      color:'#2d7a47' },
    { id:'e2', category:'Staff',       vendor:'Payroll',             amount:3200, date:'2025-03-15', note:'Bi-weekly payroll',        icon:'fa-users',       color:'#1a5276' },
    { id:'e3', category:'Utilities',   vendor:'City Power & Gas',    amount:420,  date:'2025-03-14', note:'Monthly bills',            icon:'fa-bolt',        color:'#c47a1a' },
    { id:'e4', category:'Equipment',   vendor:'Chef Supplies Ltd.',  amount:380,  date:'2025-03-12', note:'Kitchen equipment repair', icon:'fa-wrench',      color:'#6d3b8e' },
    { id:'e5', category:'Ingredients', vendor:'Premium Meats Co.',   amount:890,  date:'2025-03-11', note:'Wagyu & lamb order',       icon:'fa-carrot',      color:'#2d7a47' },
    { id:'e6', category:'Marketing',   vendor:'Social Media Agency', amount:200,  date:'2025-03-10', note:'Social media management', icon:'fa-bullhorn',    color:'#c0392b' },
    { id:'e7', category:'Cleaning',    vendor:'CleanPro Services',   amount:150,  date:'2025-03-09', note:'Deep cleaning service',   icon:'fa-broom',       color:'#9b8c86' },
    { id:'e8', category:'Beverages',   vendor:'Wine Imports Ltd.',   amount:680,  date:'2025-03-08', note:'Monthly wine order',       icon:'fa-wine-bottle', color:'#96281b' },
  ],

  /* ── TABLES (static) ── */
  tables: [],

  /* ── STAFF (static) ── */
  staff: [
    { id:'s1', name:'Marco Ferretti', role:'Executive Chef',  status:'on',    avatar:'M', color:'#c0392b', shift:'06:00–14:00', orders:12, rating:5.0 },
    { id:'s2', name:'Sophia Laurent', role:'Pastry Chef',     status:'on',    avatar:'S', color:'#b8963e', shift:'10:00–18:00', orders:8,  rating:4.9 },
    { id:'s3', name:'Kenji Nakamura', role:'Sommelier',       status:'on',    avatar:'K', color:'#1a5276', shift:'16:00–24:00', orders:0,  rating:4.9 },
    { id:'s4', name:'Amara Osei',     role:"Maître d'Hôtel",  status:'on',    avatar:'A', color:'#2d7a47', shift:'14:00–22:00', orders:0,  rating:5.0 },
    { id:'s5', name:'Luca Bianchi',   role:'Sous Chef',       status:'on',    avatar:'L', color:'#96281b', shift:'12:00–20:00', orders:9,  rating:4.8 },
    { id:'s6', name:'Sofia Rossi',    role:'Waitress',        status:'on',    avatar:'S', color:'#c47a1a', shift:'16:00–24:00', orders:5,  rating:4.7 },
    { id:'s7', name:'Tariq Hassan',   role:'Line Cook',       status:'off',   avatar:'T', color:'#666666', shift:'14:00–22:00', orders:5,  rating:4.6 },
    { id:'s8', name:'Elena Moretti',  role:'Hostess',         status:'on',    avatar:'E', color:'#6d3b8e', shift:'16:00–24:00', orders:0,  rating:4.9 },
  ],

  /* ── INVENTORY (static) ── */
  inventory: [
    { name:'Wagyu A5 (Japan)',      unit:'kg',  stock:2,   min:5,   status:'critical', color:'#c0392b' },
    { name:'Black Truffle',         unit:'g',   stock:180, min:200, status:'low',      color:'#c47a1a' },
    { name:'Burrata (Fresh)',        unit:'pcs', stock:8,   min:10,  status:'low',      color:'#c47a1a' },
    { name:'Prosecco',              unit:'btl', stock:4,   min:10,  status:'critical', color:'#c0392b' },
    { name:'Tagliatelle',           unit:'ptn', stock:34,  min:20,  status:'ok',       color:'#2d7a47' },
    { name:'Bistecca T-bone',       unit:'kg',  stock:12,  min:6,   status:'ok',       color:'#2d7a47' },
    { name:'Chianti Classico 2018', unit:'btl', stock:24,  min:12,  status:'ok',       color:'#2d7a47' },
    { name:'Parmigiano Reggiano',   unit:'kg',  stock:3.5, min:2,   status:'ok',       color:'#2d7a47' },
  ],

  /* ── RESERVATIONS (static) ── */
  reservations: [
    { name:'Alexandra M.',       time:'7:00 PM', covers:2, table:4,       status:'confirmed', note:'Anniversary dinner 🎉'        },
    { name:'James & Sarah',      time:'7:30 PM', covers:4, table:8,       status:'confirmed', note:''                             },
    { name:'Nakamura Party',     time:'8:00 PM', covers:8, table:'10+12', status:'confirmed', note:'Birthday — champagne ready 🍾' },
    { name:'Dr. Sofia Chen',     time:'8:30 PM', covers:2, table:13,      status:'pending',   note:'⚠️ Shellfish allergy'          },
    { name:'Brooklyn F.',        time:'9:00 PM', covers:6, table:9,       status:'confirmed', note:'Food blog group'              },
    { name:'Mr. & Mrs. Laurent', time:'9:30 PM', covers:2, table:4,       status:'pending',   note:'Tasting menu requested'       },
  ],

  /* ── APP SETTINGS (static) ── */
  settings: {
    restaurantName: 'Savoria Fine Dining',
    address:        '123 Gourmet Ave, New York, NY 10001',
    phone:          '+1-555-SAVORIA',
    email:          'info@savoria.com',
    currency:       '$',
    taxRate:        8.5,
    serviceCharge:  10,
    autoAccept:     false,
    soundAlerts:    true,
    emailNotif:     true,
    smsNotif:       false,
    darkMode:       false,
    language:       'English',
  },
};


/* ================================================
   TABLE STORAGE
   localStorage এ tables save/load করার সব logic
================================================ */

const TableStorage = {

  KEY: 'savoria_tables',

  /* ── Default tables (যখন localStorage ফাঁকা) ── */
  defaults: [
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
  ],

  /* ── localStorage থেকে tables load করো ── */
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        // প্রথম বার defaults save করো
        const data = this.defaults;
        this.saveData(data);
        return data;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn('TableStorage.load failed:', err);
      return this.defaults;
    }
  },

  /* ── DB.tables পুরোটা localStorage এ save করো ── */
  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(DB.tables));
    } catch (err) {
      console.warn('TableStorage.save failed:', err);
    }
  },

  /* ── সরাসরি data save করার helper ── */
  saveData(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('TableStorage.saveData failed:', err);
    }
  },

  /* ── সব tables মুছে defaults এ ফেরাও ── */
  reset() {
    localStorage.removeItem(this.KEY);
    DB.tables = [...this.defaults];
    this.save();
  },
};


/* ================================================
   ORDER STORAGE
   localStorage এ orders save/load করার সব logic
================================================ */

const OrderStorage = {

  KEY: 'savoria_orders',

  /* ── localStorage থেকে orders load করো ── */
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];

      const orders = JSON.parse(raw);

      // created field string হয়ে save হয়, Date object বানাও
      return orders.map(o => ({
        ...o,
        created: new Date(o.created),
      }));
    } catch (err) {
      console.warn('OrderStorage.load failed:', err);
      return [];
    }
  },

  /* ── DB.orders পুরোটা localStorage এ save করো ── */
  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(DB.orders));
    } catch (err) {
      console.warn('OrderStorage.save failed:', err);
    }
  },

  /* ── সব orders মুছে ফেলো ── */
  clear() {
    localStorage.removeItem(this.KEY);
    DB.orders = [];
  },
};


/* ================================================
   API — সব AJAX call এখানে
   JSONPlaceholder dummy API।
   Real backend হলে শুধু BASE_URL বদলাবে।
================================================ */

window.API = {

  BASE_URL: 'https://jsonplaceholder.typicode.com',

  /* ────────────────────────────────────────────
     GET CUSTOMERS — boot এ একবার call হয়
  ──────────────────────────────────────────── */
  async getCustomers() {
    const res = await fetch(`${this.BASE_URL}/users`);
    if (!res.ok) throw new Error('Customers fetch failed');
    const data = await res.json();

    const statuses = ['vip','regular','regular','vip','regular','vip','new','regular'];
    const colors   = ['#c0392b','#1a5276','#b8963e','#2d7a47','#6d3b8e','#c47a1a','#96281b','#1a5276'];
    const notes    = ['Prefers window table','','Birthday group','Shellfish allergy!','Food blog group','Tasting menu preferred','','Halal preference'];
    const visits   = [12,7,3,18,5,22,2,8];
    const spent    = [1240,680,540,2100,860,3200,120,920];

    DB.customers = data.map((u, i) => ({
      id:        `c${u.id}`,
      name:      u.name,
      phone:     u.phone,
      email:     u.email,
      visits:    visits[i] ?? Math.floor(Math.random() * 15) + 1,
      spent:     spent[i]  ?? Math.floor(Math.random() * 1500) + 200,
      lastVisit: '2025-03-12',
      status:    statuses[i] || 'regular',
      color:     colors[i]   || '#1a5276',
      note:      notes[i]    || '',
    }));

    return DB.customers;
  },

  /* ────────────────────────────────────────────
     CREATE ORDER
     getorder.js → placeOrder() থেকে call হয়।
     AJAX POST → success হলে localStorage এ save।
  ──────────────────────────────────────────── */
  async createOrder(orderData) {
    const res = await fetch(`${this.BASE_URL}/posts`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Create order failed');

    // DB তে যোগ করো
    DB.orders.unshift(orderData);

    // localStorage এ save করো
    OrderStorage.save();

    // Sidebar badge update
    _updatePendingBadge();

    return orderData;
  },

  /* ────────────────────────────────────────────
     UPDATE ORDER STATUS
     orders.js → advance() থেকে call হয়।
     AJAX PATCH → success হলে localStorage update।
  ──────────────────────────────────────────── */
  async updateOrderStatus(orderId, newStatus) {
    const res = await fetch(`${this.BASE_URL}/posts/1`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error('Update order failed');

    // Local DB update
    const order = DB.orders.find(o => o.id === orderId);
    if (order) order.status = newStatus;

    // localStorage sync
    OrderStorage.save();

    _updatePendingBadge();
    return { success: true, id: orderId, status: newStatus };
  },

  /* ────────────────────────────────────────────
     CANCEL ORDER
     orders.js → cancel() থেকে call হয়।
     AJAX DELETE → success হলে localStorage update।
  ──────────────────────────────────────────── */
  async cancelOrder(orderId) {
    const res = await fetch(`${this.BASE_URL}/posts/1`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Cancel order failed');

    // Local DB update
    const order = DB.orders.find(o => o.id === orderId);
    if (order) order.status = 'cancelled';

    // localStorage sync
    OrderStorage.save();

    _updatePendingBadge();
    return { success: true, id: orderId };
  },
};


/* ── Private helper: sidebar pending badge ── */
function _updatePendingBadge() {
  const count = DB.orders.filter(o => o.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  if (badge) badge.textContent = count;
}