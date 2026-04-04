/* ================================================
   SAVORIA — DATA STORE  (data.js)

   Static data only. All persistence logic is in api.js.
   - DB.orders → localStorage (via api.js)
   - DB.customers → AJAX (via api.js)
   - DB.tables, DB.staff, DB.inventory, DB.profile → localStorage (via api.js)
================================================ */

window.DB = {

  /* ── ORDERS — localStorage থেকে আসবে ── */
  orders: [],

  /* ── PROFILE — localStorage থেকে আসবে ── */
  profile: {},

  /* ── CUSTOMERS — AJAX থেকে আসে ── */
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

  /* ── TABLES — localStorage থেকে আসবে ── */
  tables: [],

  /* ── STAFF — localStorage থেকে আসবে ── */
  staff: [],

  /* ── INVENTORY — localStorage থেকে আসবে ── */
  inventory: [],

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