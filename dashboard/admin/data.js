/* ================================================
   SAVORIA ADMIN — DATA STORE
   All mock data for the admin dashboard
================================================ */

window.DB = {

  /* ── BRANCHES ── */
  branches: [
    { id: 'b1', name: 'Downtown Branch',   city: 'New York',    revenue: 128400, expense: 42800, income: 85600,  orders: 1240, customers: 890,  rating: 4.8 },
    { id: 'b2', name: 'Midtown Branch',     city: 'New York',    revenue: 98200,  expense: 35600, income: 62600,  orders: 980,  customers: 720,  rating: 4.7 },
    { id: 'b3', name: 'Brooklyn Branch',    city: 'New York',    revenue: 76500,  expense: 28400, income: 48100,  orders: 760,  customers: 580,  rating: 4.6 },
    { id: 'b4', name: 'Queens Branch',      city: 'New York',    revenue: 64800,  expense: 24200, income: 40600,  orders: 620,  customers: 480,  rating: 4.5 },
  ],

  /* ── YEARLY REVENUE DATA ── */
  yearlyData: {
    2024: { months: [42000,45000,48000,52000,54000,58000,62000,60000,65000,68000,72000,78000] },
    2025: { months: [75000,78000,82000,86000,88000,92000,96000,94000,98000,102000,106000,110000] },
    2026: { months: [108000,112000,118000,0,0,0,0,0,0,0,0,0] },
  },

  /* ── WEEKLY/MONTHLY INCOME DATA ── */
  incomeData: {
    weekly: [12400, 14200, 11800, 15600, 13900, 16200, 14800],
    weekLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    monthly: [28400, 32100, 29800, 34500, 31200, 35800, 33400, 36200, 30800, 38400, 35600, 42000],
    monthLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  },

  /* ── EXPENSE APPROVAL REQUESTS ── */
  expenseApprovals: [
    { id:'ea1', branch:'Downtown Branch',  category:'Equipment',   amount:2400, requestedBy:'Marco Ferretti',  date:'2026-03-18', note:'New oven repair parts',       status:'pending' },
    { id:'ea2', branch:'Midtown Branch',   category:'Marketing',   amount:800,  requestedBy:'Sarah Kim',       date:'2026-03-17', note:'Social media campaign Q2',    status:'pending' },
    { id:'ea3', branch:'Brooklyn Branch',  category:'Ingredients', amount:1560, requestedBy:'Luca Bianchi',    date:'2026-03-17', note:'Premium truffle order',       status:'pending' },
    { id:'ea4', branch:'Queens Branch',    category:'Maintenance', amount:620,  requestedBy:'Elena Moretti',   date:'2026-03-16', note:'HVAC system maintenance',     status:'approved' },
    { id:'ea5', branch:'Downtown Branch',  category:'Staff',       amount:3200, requestedBy:'Amara Osei',      date:'2026-03-15', note:'Overtime pay March 1st half', status:'approved' },
  ],

  /* ── PEAK HOURS DATA ── */
  peakHours: {
    labels: ['8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm'],
    data:   [5,8,15,28,52,48,32,18,12,20,35,58,72,65,42,18],
  },

  /* ── SALES DATA ── */
  salesData: {
    today:  { total: 14820, orders: 187, avgTicket: 79.25 },
    week:   { total: 98400, orders: 1240, avgTicket: 79.35 },
    month:  { total: 368200, orders: 4620, avgTicket: 79.70 },
    year:   { total: 4218000, orders: 52800, avgTicket: 79.89 },
  },

  /* ── TOP SELLING ITEMS ── */
  topItemsToday: [
    { name:'Bistecca Fiorentina', qty:42, revenue:2016, emoji:'🥩', pct:100 },
    { name:'Truffle Risotto',     qty:38, revenue:1216, emoji:'🍄', pct:90 },
    { name:'Tagliatelle al Ragù', qty:35, revenue:980,  emoji:'🍝', pct:83 },
    { name:'Wagyu Tenderloin',    qty:12, revenue:1980, emoji:'🥩', pct:29 },
    { name:'Panna Cotta',         qty:28, revenue:392,  emoji:'🍮', pct:67 },
  ],
  topItemsMonth: [
    { name:'Bistecca Fiorentina', qty:520, revenue:24960, emoji:'🥩', pct:100 },
    { name:'Truffle Risotto',     qty:480, revenue:15360, emoji:'🍄', pct:92 },
    { name:'Tagliatelle al Ragù', qty:460, revenue:12880, emoji:'🍝', pct:88 },
    { name:'Wagyu Tenderloin',    qty:180, revenue:29700, emoji:'🥩', pct:35 },
    { name:'Seared Scallops',     qty:340, revenue:11560, emoji:'🦪', pct:65 },
    { name:'Panna Cotta',         qty:380, revenue:5320,  emoji:'🍮', pct:73 },
    { name:'Tiramisu',            qty:360, revenue:4320,  emoji:'🍰', pct:69 },
    { name:'Chianti Classico',    qty:420, revenue:6720,  emoji:'🍷', pct:81 },
  ],

  /* ── REPORTS — branch sales data ── */
  branchSales: {
    today: [
      { branch:'Downtown',  sales:4820, orders:62 },
      { branch:'Midtown',   sales:3640, orders:48 },
      { branch:'Brooklyn',  sales:3280, orders:42 },
      { branch:'Queens',    sales:3080, orders:35 },
    ],
    weekly: [
      { branch:'Downtown',  sales:32400, orders:408 },
      { branch:'Midtown',   sales:26800, orders:340 },
      { branch:'Brooklyn',  sales:21200, orders:268 },
      { branch:'Queens',    sales:18000, orders:224 },
    ],
    monthly: [
      { branch:'Downtown',  sales:128400, orders:1620 },
      { branch:'Midtown',   sales:98200,  orders:1240 },
      { branch:'Brooklyn',  sales:76500,  orders:960 },
      { branch:'Queens',    sales:64800,  orders:800 },
    ],
    yearly: [
      { branch:'Downtown',  sales:1540000, orders:19400 },
      { branch:'Midtown',   sales:1178000, orders:14880 },
      { branch:'Brooklyn',  sales:918000,  orders:11520 },
      { branch:'Queens',    sales:777600,  orders:9600 },
    ],
  },

  /* ── INGREDIENT REPORT ── */
  ingredients: [
    { name:'Wagyu A5 (Japan)',      unit:'kg',  stock:8,   used:12,  cost:1200, supplier:'Premium Meats Co.',   status:'low' },
    { name:'Black Truffle',         unit:'g',   stock:450, used:680, cost:820,  supplier:'Italian Imports Ltd.', status:'ok' },
    { name:'Burrata (Fresh)',       unit:'pcs', stock:24,  used:48,  cost:180,  supplier:'Fresh Market Co.',     status:'ok' },
    { name:'Tagliatelle (House)',   unit:'ptn', stock:120, used:180, cost:240,  supplier:'In-house',             status:'ok' },
    { name:'Bistecca T-bone',      unit:'kg',  stock:18,  used:32,  cost:640,  supplier:'Premium Meats Co.',    status:'ok' },
    { name:'Lobster (Maine)',       unit:'kg',  stock:4,   used:8,   cost:520,  supplier:'Seafood Express',      status:'low' },
    { name:'Chianti Classico 2018',unit:'btl', stock:48,  used:72,  cost:580,  supplier:'Wine Imports Ltd.',    status:'ok' },
    { name:'Parmigiano Reggiano',  unit:'kg',  stock:6,   used:12,  cost:280,  supplier:'Italian Imports Ltd.', status:'ok' },
  ],

  /* ── CUSTOMERS ── */
  customers: [
    { id:'c1',  name:'karia',  phone:'+1-555-0101', email:'alex@email.com',      visits:32, spent:4240, lastVisit:'2026-03-18', status:'vip',     color:'#c0392b', note:'Prefers corner table, anniversary dinner monthly' },
    { id:'c2',  name:'James Rodriguez',     phone:'+1-555-0102', email:'james.r@email.com',   visits:18, spent:2180, lastVisit:'2026-03-17', status:'regular', color:'#1a5276', note:'Wine enthusiast' },
    { id:'c3',  name:'Kenji Nakamura',      phone:'+1-555-0103', email:'kenji@email.com',     visits:8,  spent:1540, lastVisit:'2026-03-15', status:'regular', color:'#b8963e', note:'Birthday celebration group' },
    { id:'c4',  name:'Dr. Sofia Chen',      phone:'+1-555-0104', email:'sofia.c@email.com',   visits:45, spent:6800, lastVisit:'2026-03-19', status:'vip',     color:'#2d7a47', note:'⚠️ Shellfish allergy! Loyal since opening' },
    { id:'c5',  name:'Brooklyn Foodies',    phone:'+1-555-0105', email:'brooklyn@email.com',  visits:12, spent:2860, lastVisit:'2026-03-12', status:'regular', color:'#6d3b8e', note:'Food blog group, Instagram reviews' },
    { id:'c6',  name:'Laurent Family',      phone:'+1-555-0106', email:'laurent@email.com',   visits:56, spent:8920, lastVisit:'2026-03-18', status:'vip',     color:'#c47a1a', note:'Tasting menu preferred, 20+ year customer' },
    { id:'c7',  name:'Elena Moretti',       phone:'+1-555-0107', email:'elena.m@email.com',   visits:4,  spent:320,  lastVisit:'2026-03-08', status:'new',     color:'#96281b', note:'New customer, referred by Dr. Chen' },
    { id:'c8',  name:'Tariq Hassan',        phone:'+1-555-0108', email:'tariq.h@email.com',   visits:22, spent:3420, lastVisit:'2026-03-16', status:'regular', color:'#1a5276', note:'Halal preference, business dinners' },
    { id:'c9',  name:'Maria Gonzalez',      phone:'+1-555-0109', email:'maria.g@email.com',   visits:15, spent:1980, lastVisit:'2026-03-14', status:'regular', color:'#2d7a47', note:'Large family gatherings' },
    { id:'c10', name:'David Park',          phone:'+1-555-0110', email:'david.p@email.com',   visits:38, spent:5640, lastVisit:'2026-03-19', status:'vip',     color:'#c0392b', note:'CEO client, private dining room preferred' },
  ],

  /* ── REVIEWS ── */
  reviews: [
    { id:'r1',  customer:'Alexandra Mitchell', rating:5, date:'2026-03-18', comment:'Absolutely exquisite! The Bistecca Fiorentina was cooked to perfection. Marco truly outdid himself tonight.', branch:'Downtown', reply:'Thank you Alexandra! We always look forward to seeing you.' },
    { id:'r2',  customer:'James Rodriguez',    rating:4, date:'2026-03-17', comment:'Great wine selection as always. The truffle risotto could use a bit more seasoning though.',                   branch:'Midtown',  reply:'' },
    { id:'r3',  customer:'Dr. Sofia Chen',     rating:5, date:'2026-03-16', comment:'They always remember my shellfish allergy without me having to mention it. That level of care is rare.',       branch:'Downtown', reply:'Your safety and comfort are our top priority, Dr. Chen!' },
    { id:'r4',  customer:'Brooklyn Foodies',   rating:4, date:'2026-03-15', comment:'Instagram-worthy plating! The panna cotta was divine. Would love to see more vegan options.',                  branch:'Brooklyn', reply:'Thank you! We are working on expanding our vegan menu.' },
    { id:'r5',  customer:'Tariq Hassan',       rating:5, date:'2026-03-14', comment:'Perfect spot for business dinners. The private dining room is elegant and the service is impeccable.',         branch:'Downtown', reply:'' },
    { id:'r6',  customer:'Laurent Family',     rating:5, date:'2026-03-13', comment:'Our 20th anniversary dinner here was magical. The tasting menu with wine pairing was outstanding.',            branch:'Downtown', reply:'Happy anniversary! We are honored to be part of your celebration.' },
    { id:'r7',  customer:'Maria Gonzalez',     rating:3, date:'2026-03-12', comment:'Food was good but waited 40 minutes for our main course. Expected better from a premium restaurant.',          branch:'Queens',   reply:'We sincerely apologize for the delay, Maria. We are addressing this.' },
    { id:'r8',  customer:'David Park',         rating:5, date:'2026-03-11', comment:'The wagyu was absolutely incredible. Best fine dining experience in NYC, hands down.',                         branch:'Downtown', reply:'Thank you David! Your continued patronage means the world to us.' },
    { id:'r9',  customer:'Elena Moretti',      rating:4, date:'2026-03-10', comment:'Beautiful ambiance and delicious food. First time here and definitely coming back!',                           branch:'Midtown',  reply:'' },
    { id:'r10', customer:'Kenji Nakamura',     rating:5, date:'2026-03-09', comment:'Birthday dinner was arranged perfectly. The champagne surprise was a wonderful touch!',                        branch:'Brooklyn', reply:'Happy birthday Kenji! Glad we could make it special.' },
  ],

  /* ── TRANSACTIONS ── */
  transactions: [
    { id:'T-2001', orderId:'#148', customer:'Alexandra Mitchell', method:'card',   amount:186,  date:'2026-03-19', time:'13:15', status:'completed', branch:'Downtown' },
    { id:'T-2002', orderId:'#147', customer:'David Park',         method:'card',   amount:245,  date:'2026-03-19', time:'12:40', status:'completed', branch:'Downtown' },
    { id:'T-2003', orderId:'#146', customer:'James Rodriguez',    method:'cash',   amount:98,   date:'2026-03-19', time:'12:20', status:'completed', branch:'Midtown' },
    { id:'T-2004', orderId:'#145', customer:'Tariq Hassan',       method:'card',   amount:164,  date:'2026-03-18', time:'21:10', status:'completed', branch:'Downtown' },
    { id:'T-2005', orderId:'#144', customer:'Laurent Family',     method:'card',   amount:420,  date:'2026-03-18', time:'20:30', status:'completed', branch:'Downtown' },
    { id:'T-2006', orderId:'#143', customer:'Maria Gonzalez',     method:'cash',   amount:132,  date:'2026-03-18', time:'19:45', status:'completed', branch:'Queens' },
    { id:'T-2007', orderId:'#142', customer:'Brooklyn Foodies',   method:'card',   amount:286,  date:'2026-03-17', time:'20:15', status:'completed', branch:'Brooklyn' },
    { id:'T-2008', orderId:'#141', customer:'Elena Moretti',      method:'card',   amount:76,   date:'2026-03-17', time:'19:30', status:'completed', branch:'Midtown' },
    { id:'T-2009', orderId:'#140', customer:'Dr. Sofia Chen',     method:'card',   amount:198,  date:'2026-03-17', time:'21:00', status:'completed', branch:'Downtown' },
    { id:'T-2010', orderId:'#139', customer:'Kenji Nakamura',     method:'card',   amount:342,  date:'2026-03-16', time:'20:45', status:'completed', branch:'Brooklyn' },
    { id:'T-2011', orderId:'#138', customer:'Walk-in Guest',      method:'cash',   amount:54,   date:'2026-03-16', time:'13:20', status:'refunded',  branch:'Queens' },
    { id:'T-2012', orderId:'#137', customer:'Walk-in Guest',      method:'card',   amount:88,   date:'2026-03-15', time:'19:55', status:'completed', branch:'Midtown' },
    { id:'T-2013', orderId:'#136', customer:'Walk-in Guest',      method:'online', amount:124,  date:'2026-03-15', time:'12:30', status:'pending',   branch:'Brooklyn' },
    { id:'T-2014', orderId:'#135', customer:'Walk-in Guest',      method:'card',   amount:210,  date:'2026-03-14', time:'20:10', status:'completed', branch:'Downtown' },
  ],

  /* ── EXPENSES ── */
  expenses: [
    { id:'e1',  category:'Ingredients',  vendor:'Fresh Market Co.',      amount:4240, date:'2026-03-18', note:'Weekly produce order — all branches', icon:'fa-carrot',       color:'#2d7a47', branch:'All' },
    { id:'e2',  category:'Staff',        vendor:'Payroll',               amount:18200,date:'2026-03-15', note:'Bi-weekly payroll — all staff',       icon:'fa-users',        color:'#1a5276', branch:'All' },
    { id:'e3',  category:'Utilities',    vendor:'City Power & Gas',      amount:1680, date:'2026-03-14', note:'Monthly electricity & gas',           icon:'fa-bolt',         color:'#c47a1a', branch:'Downtown' },
    { id:'e4',  category:'Equipment',    vendor:'Chef Supplies Ltd.',    amount:2380, date:'2026-03-12', note:'Kitchen equipment repair + new pans', icon:'fa-wrench',       color:'#6d3b8e', branch:'Midtown' },
    { id:'e5',  category:'Ingredients',  vendor:'Premium Meats Co.',     amount:3890, date:'2026-03-11', note:'Wagyu, lamb & beef bulk order',       icon:'fa-carrot',       color:'#2d7a47', branch:'All' },
    { id:'e6',  category:'Marketing',    vendor:'Social Media Agency',   amount:1200, date:'2026-03-10', note:'March social campaign + photos',      icon:'fa-bullhorn',     color:'#c0392b', branch:'All' },
    { id:'e7',  category:'Cleaning',     vendor:'CleanPro Services',     amount:850,  date:'2026-03-09', note:'Deep cleaning — all branches',        icon:'fa-broom',        color:'#9b8c86', branch:'All' },
    { id:'e8',  category:'Beverages',    vendor:'Wine Imports Ltd.',     amount:2680, date:'2026-03-08', note:'Monthly wine & spirits order',        icon:'fa-wine-bottle',  color:'#96281b', branch:'All' },
    { id:'e9',  category:'Rent',         vendor:'NYC Properties LLC',    amount:12000,date:'2026-03-01', note:'March rent — Downtown location',      icon:'fa-building',     color:'#1a5276', branch:'Downtown' },
    { id:'e10', category:'Insurance',    vendor:'SafeGuard Insurance',   amount:1800, date:'2026-03-01', note:'Monthly business insurance',          icon:'fa-shield-halved',color:'#b8963e', branch:'All' },
  ],

  /* ── PRODUCTS ── */
  products: [
    { id:'p1',  name:'Bistecca Fiorentina',   price:48,  category:'Main Courses',    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',     status:'active', emoji:'🥩', description:'32oz T-bone grilled over Italian oak' },
    { id:'p2',  name:'Wagyu Tenderloin',      price:165, category:'Main Courses',    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',    status:'active', emoji:'🥩', description:'A5 Japanese wagyu, 8oz, pan-seared' },
    { id:'p3',  name:'Truffle Risotto',       price:32,  category:'Pasta & Risotto', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',  status:'active', emoji:'🍄', description:'Arborio rice with black truffle shavings' },
    { id:'p4',  name:'Tagliatelle al Ragù',   price:28,  category:'Pasta & Risotto', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',  status:'active', emoji:'🍝', description:'House-made pasta with slow-cooked Bolognese' },
    
  ],

  /* ── CATEGORIES ── */
  categories: [
    { id:'cat1', name:'Starters',         count:4, icon:'🥗', color:'#2d7a47' },
    { id:'cat2', name:'Pasta & Risotto',  count:3, icon:'🍝', color:'#b8963e' },
    { id:'cat3', name:'Main Courses',     count:5, icon:'🥩', color:'#c0392b' },
    { id:'cat4', name:'Desserts',         count:3, icon:'🍮', color:'#6d3b8e' },
    { id:'cat5', name:'Drinks',           count:3, icon:'🍷', color:'#96281b' },
  ],

  /* ── BLOG POSTS ── */
  blog: [
    { id:'bl1', title:'The Art of Wagyu: From Japan to Your Plate', excerpt:'Discover the centuries-old tradition behind A5 wagyu beef and why we source ours directly from Miyazaki prefecture...', date:'2026-03-18', status:'published', author:'Marco Ferretti', category:'Culinary',   views:1240, emoji:'🥩' },
    { id:'bl2', title:'Spring Menu 2026: A Celebration of Fresh Flavors', excerpt:'This spring we are introducing 6 new dishes that celebrate seasonal ingredients from local farms...', date:'2026-03-15', status:'published', author:'Sophia Laurent', category:'Menu Updates', views:890,  emoji:'🌸' },
    { id:'bl3', title:'Wine Pairing Guide: Matching Bold Reds with Italian Cuisine', excerpt:'Our sommelier Kenji shares his expert tips on pairing Chianti, Barolo, and Brunello with our signature dishes...', date:'2026-03-12', status:'published', author:'Kenji Nakamura', category:'Wine',         views:1560,  emoji:'🍷' },
    { id:'bl4', title:'Behind the Scenes: A Day in Savoria Kitchen', excerpt:'From 6am prep to midnight cleanup — follow our team through a typical Saturday service...', date:'2026-03-10', status:'draft', author:'Marco Ferretti', category:'Behind Scenes', views:0,    emoji:'👨‍🍳' },
    { id:'bl5', title:'Sustainable Dining: Our Commitment to Zero-Waste', excerpt:'Learn about our partnership with local composting facilities and how we have reduced food waste by 40%...', date:'2026-03-08', status:'published', author:'Amara Osei', category:'Sustainability', views:2100, emoji:'🌿' },
    { id:'bl6', title:'Celebrating 5 Years of Savoria Fine Dining', excerpt:'A look back at our journey from a small Brooklyn trattoria to four thriving locations across New York...', date:'2026-03-05', status:'draft', author:'Marco Ferretti', category:'News', views:0, emoji:'🎉' },
  ],

  /* ── PROFILE ── */
  profile: {
    name: 'Umme Tahazzee',
    role: 'Admin',
    email: 'admin@savoria.com',
    phone: '+1-555-ADMIN',
    avatar: 'UT',
    joinDate: '2021-06-15',
    branches: 'All Branches',
    address: '123 Gourmet Ave, New York, NY 10001',
  },

  /* ── SETTINGS ── */
  settings: {
    restaurantName: 'Savoria Fine Dining',
    address: '123 Gourmet Ave, New York, NY 10001',
    phone: '+1-555-SAVORIA',
    email: 'info@savoria.com',
    currency: '$',
    taxRate: 8.5,
    serviceCharge: 10,
    autoAccept: false,
    soundAlerts: true,
    emailNotif: true,
    smsNotif: false,
    darkMode: false,
    language: 'English',
    timezone: 'America/New_York',
  },

};
