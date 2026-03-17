/* ================================================
   SAVORIA — DATA STORE  (data/data.js)
   
   This file holds ALL the app's mock data.
   Every view reads from this object.
   To add/edit data, just change it here.
================================================ */

window.DB = {

  /* ── ORDERS ── */
  orders: [
    { id:'#038', table:3,  customer:'Luca B.',    items:['Tagliatelle al Ragù','Chianti Classico'],       status:'pending',   total:46,  created: new Date(Date.now()-2*60000)  },
    { id:'#039', table:7,  customer:'Sofia R.',   items:['Bistecca Fiorentina x2','Still Water'],         status:'preparing', total:100, created: new Date(Date.now()-14*60000) },
    { id:'#040', table:1,  customer:'Kenji N.',   items:['Burrata','Panna Cotta','Aperol Spritz'],        status:'preparing', total:48,  created: new Date(Date.now()-18*60000) },
    { id:'#041', table:9,  customer:'Amara O.',   items:['Truffle Risotto','Confit Duck Leg'],            status:'ready',     total:70,  created: new Date(Date.now()-22*60000) },
    { id:'#042', table:5,  customer:'Elena M.',   items:['Tom Yum Soup','Seared Scallops x2'],           status:'confirmed', total:60,  created: new Date(Date.now()-38*60000) },
    { id:'#043', table:11, customer:'Tariq H.',   items:['Wagyu Tenderloin','Negroni x2'],               status:'pending',   total:197, created: new Date(Date.now()-1*60000)  },
    { id:'#044', table:2,  customer:'Marco F.',   items:['Rack of Lamb','Tiramisu'],                     status:'delivered', total:54,  created: new Date(Date.now()-52*60000) },
    { id:'#045', table:6,  customer:'Alex M.',    items:['Lobster Bisque','Chocolate Soufflé'],          status:'cancelled', total:38,  created: new Date(Date.now()-31*60000) },
    { id:'#046', table:4,  customer:'Sarah K.',   items:['Tuna Tartare','Panna Cotta'],                  status:'confirmed', total:32,  created: new Date(Date.now()-28*60000) },
    { id:'#047', table:8,  customer:'James R.',   items:['Spaghetti Carbonara','Tiramisu','Prosecco'],   status:'ready',     total:44,  created: new Date(Date.now()-19*60000) },
    { id:'#048', table:10, customer:'Brooklyn F.',items:['Bistecca Fiorentina','Chianti'],               status:'delivered', total:86,  created: new Date(Date.now()-65*60000) },
  ],

  /* ── MENU ── */
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

  /* ── CUSTOMERS ── */
  customers: [
    { id:'c1', name:'Alexandra M.',   phone:'+1-555-0101', email:'alex@email.com',     visits:12, spent:1240, lastVisit:'2025-03-10', status:'vip',     color:'#c0392b', note:'Prefers window table'    },
    { id:'c2', name:'James R.',       phone:'+1-555-0102', email:'james@email.com',    visits:7,  spent:680,  lastVisit:'2025-03-08', status:'regular', color:'#1a5276', note:''                        },
    { id:'c3', name:'Nakamura Party', phone:'+1-555-0103', email:'naka@email.com',     visits:3,  spent:540,  lastVisit:'2025-03-05', status:'regular', color:'#b8963e', note:'Birthday group'          },
    { id:'c4', name:'Dr. Sofia Chen', phone:'+1-555-0104', email:'sofia@email.com',    visits:18, spent:2100, lastVisit:'2025-03-12', status:'vip',     color:'#2d7a47', note:'Shellfish allergy!'      },
    { id:'c5', name:'Brooklyn F.',    phone:'+1-555-0105', email:'brooklyn@email.com', visits:5,  spent:860,  lastVisit:'2025-03-01', status:'regular', color:'#6d3b8e', note:'Food blog group'         },
    { id:'c6', name:'Laurent Family', phone:'+1-555-0106', email:'laurent@email.com',  visits:22, spent:3200, lastVisit:'2025-03-13', status:'vip',     color:'#c47a1a', note:'Tasting menu preferred'  },
    { id:'c7', name:'Elena Moretti',  phone:'+1-555-0107', email:'elena@email.com',    visits:2,  spent:120,  lastVisit:'2025-02-28', status:'new',     color:'#96281b', note:''                        },
    { id:'c8', name:'Tariq Hassan',   phone:'+1-555-0108', email:'tariq@email.com',    visits:8,  spent:920,  lastVisit:'2025-03-11', status:'regular', color:'#1a5276', note:'Halal preference'        },
  ],

  /* ── TRANSACTIONS ── */
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

  /* ── EXPENSES ── */
  expenses: [
    { id:'e1', category:'Ingredients', vendor:'Fresh Market Co.',    amount:1240, date:'2025-03-16', note:'Weekly produce order',     icon:'fa-carrot',       color:'#2d7a47' },
    { id:'e2', category:'Staff',        vendor:'Payroll',             amount:3200, date:'2025-03-15', note:'Bi-weekly payroll',         icon:'fa-users',        color:'#1a5276' },
    { id:'e3', category:'Utilities',    vendor:'City Power & Gas',    amount:420,  date:'2025-03-14', note:'Monthly bills',             icon:'fa-bolt',         color:'#c47a1a' },
    { id:'e4', category:'Equipment',    vendor:'Chef Supplies Ltd.',  amount:380,  date:'2025-03-12', note:'Kitchen equipment repair',  icon:'fa-wrench',       color:'#6d3b8e' },
    { id:'e5', category:'Ingredients',  vendor:'Premium Meats Co.',   amount:890,  date:'2025-03-11', note:'Wagyu & lamb order',        icon:'fa-carrot',       color:'#2d7a47' },
    { id:'e6', category:'Marketing',    vendor:'Social Media Agency', amount:200,  date:'2025-03-10', note:'Social media management',  icon:'fa-bullhorn',     color:'#c0392b' },
    { id:'e7', category:'Cleaning',     vendor:'CleanPro Services',   amount:150,  date:'2025-03-09', note:'Deep cleaning service',    icon:'fa-broom',        color:'#9b8c86' },
    { id:'e8', category:'Beverages',    vendor:'Wine Imports Ltd.',   amount:680,  date:'2025-03-08', note:'Monthly wine order',        icon:'fa-wine-bottle',  color:'#96281b' },
  ],

  /* ── TABLES ── */
  tables: [
    { num:1,  status:'occupied', guests:2, seated:'52 min', waiter:'Amara',  bill:48  },
    { num:2,  status:'occupied', guests:4, seated:'9 min',  waiter:'Luca',   bill:100 },
    { num:3,  status:'occupied', guests:2, seated:'2 min',  waiter:'Amara',  bill:46  },
    { num:4,  status:'empty',    guests:0, seated:'',       waiter:'',       bill:0   },
    { num:5,  status:'occupied', guests:3, seated:'38 min', waiter:'Luca',   bill:60  },
    { num:6,  status:'cleaning', guests:0, seated:'',       waiter:'',       bill:0   },
    { num:7,  status:'occupied', guests:4, seated:'14 min', waiter:'Sofia',  bill:197 },
    { num:8,  status:'empty',    guests:0, seated:'',       waiter:'',       bill:0   },
    { num:9,  status:'occupied', guests:6, seated:'22 min', waiter:'Kenji',  bill:70  },
    { num:10, status:'reserved', guests:4, seated:'8:00pm', waiter:'',       bill:0   },
    { num:11, status:'occupied', guests:2, seated:'1 min',  waiter:'Sofia',  bill:197 },
    { num:12, status:'empty',    guests:0, seated:'',       waiter:'',       bill:0   },
    { num:13, status:'reserved', guests:6, seated:'8:30pm', waiter:'',       bill:0   },
    { num:14, status:'empty',    guests:0, seated:'',       waiter:'',       bill:0   },
    { num:15, status:'cleaning', guests:0, seated:'',       waiter:'',       bill:0   },
  ],

  /* ── STAFF ── */
  staff: [
    { id:'s1', name:'Marco Ferretti', role:'Executive Chef',   status:'on',    avatar:'M', color:'#c0392b', shift:'06:00–14:00', orders:12, rating:5.0 },
    { id:'s2', name:'Sophia Laurent', role:'Pastry Chef',      status:'on',    avatar:'S', color:'#b8963e', shift:'10:00–18:00', orders:8,  rating:4.9 },
    { id:'s3', name:'Kenji Nakamura', role:'Sommelier',        status:'on',    avatar:'K', color:'#1a5276', shift:'16:00–24:00', orders:0,  rating:4.9 },
    { id:'s4', name:'Amara Osei',     role:"Maître d'Hôtel",   status:'on',    avatar:'A', color:'#2d7a47', shift:'14:00–22:00', orders:0,  rating:5.0 },
    { id:'s5', name:'Luca Bianchi',   role:'Sous Chef',        status:'on',    avatar:'L', color:'#96281b', shift:'12:00–20:00', orders:9,  rating:4.8 },
    { id:'s6', name:'Sofia Rossi',    role:'Waitress',         status:'on',    avatar:'S', color:'#c47a1a', shift:'16:00–24:00', orders:5,  rating:4.7 },
    { id:'s7', name:'Tariq Hassan',   role:'Line Cook',        status:'break', avatar:'T', color:'#666666', shift:'14:00–22:00', orders:5,  rating:4.6 },
    { id:'s8', name:'Elena Moretti',  role:'Hostess',          status:'on',    avatar:'E', color:'#6d3b8e', shift:'16:00–24:00', orders:0,  rating:4.9 },
  ],

  /* ── INVENTORY (low stock items only shown as alerts) ── */
  inventory: [
    { name:'Wagyu A5 (Japan)',     unit:'kg',  stock:2,   min:5,   status:'critical', color:'#c0392b' },
    { name:'Black Truffle',        unit:'g',   stock:180, min:200, status:'low',      color:'#c47a1a' },
    { name:'Burrata (Fresh)',       unit:'pcs', stock:8,   min:10,  status:'low',      color:'#c47a1a' },
    { name:'Prosecco',             unit:'btl', stock:4,   min:10,  status:'critical', color:'#c0392b' },
    { name:'Tagliatelle',          unit:'ptn', stock:34,  min:20,  status:'ok',       color:'#2d7a47' },
    { name:'Bistecca T-bone',      unit:'kg',  stock:12,  min:6,   status:'ok',       color:'#2d7a47' },
    { name:'Chianti Classico 2018',unit:'btl', stock:24,  min:12,  status:'ok',       color:'#2d7a47' },
    { name:'Parmigiano Reggiano',  unit:'kg',  stock:3.5, min:2,   status:'ok',       color:'#2d7a47' },
  ],

  /* ── RESERVATIONS (today) ── */
  reservations: [
    { name:'Alexandra M.',   time:'7:00 PM', covers:2, table:4,      status:'confirmed', note:'Anniversary dinner 🎉'       },
    { name:'James & Sarah',  time:'7:30 PM', covers:4, table:8,      status:'confirmed', note:''                            },
    { name:'Nakamura Party', time:'8:00 PM', covers:8, table:'10+12',status:'confirmed', note:'Birthday — champagne ready 🍾'},
    { name:'Dr. Sofia Chen', time:'8:30 PM', covers:2, table:13,     status:'pending',   note:'⚠️ Shellfish allergy'         },
    { name:'Brooklyn F.',    time:'9:00 PM', covers:6, table:9,      status:'confirmed', note:'Food blog group'             },
    { name:'Mr. & Mrs. Laurent',time:'9:30 PM',covers:2,table:4,    status:'pending',   note:'Tasting menu requested'      },
  ],

  /* ── APP SETTINGS ── */
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
