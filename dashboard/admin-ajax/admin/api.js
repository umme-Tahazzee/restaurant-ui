/* ================================================
   SAVORIA ADMIN — API LAYER
   সব AJAX call এখানে centralize করা হয়েছে।
   JSONPlaceholder থেকে real HTTP request যাচ্ছে,
   তারপর সেই response কে Savoria-র DB structure এ
   map/transform করা হচ্ছে।

   Base URL: https://jsonplaceholder.typicode.com
   Endpoints ব্যবহার:
     /users        → customers + profile
     /posts        → blog posts
     /comments     → reviews
     /todos        → transactions + expense approvals
     /albums       → products + categories
     /photos       → expense items
================================================ */

const API_BASE = 'https://jsonplaceholder.typicode.com';

/* ─────────────────────────────────────────────
   CORE: fetch wrapper
   সব request এর জন্য একটাই helper।
   - loading toast দেখায়
   - error হলে error toast দেখায়
   - সবসময় JSON return করে
───────────────────────────────────────────── */
async function apiFetch(endpoint) {
  try {
    const res = await fetch(API_BASE + endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    Toast.show('API error: ' + err.message, 'error');
    return null;
  }
}

/* ─────────────────────────────────────────────
   TRANSFORM HELPERS
   JSONPlaceholder এর generic data কে
   Savoria-র নির্দিষ্ট structure এ রূপান্তর
───────────────────────────────────────────── */

const STATUSES   = ['vip', 'regular', 'new', 'regular', 'vip'];
const COLORS     = ['#c0392b','#1a5276','#c47a1a','#6d3b8e','#2d7a47','#96281b','#b8963e','#9b8c86'];
const BRANCHES   = ['Downtown', 'Midtown', 'Brooklyn', 'Queens'];
const METHODS    = ['card', 'cash', 'online', 'card', 'card'];
const TX_STATUS  = ['completed', 'completed', 'completed', 'pending', 'refunded'];
const CATEGORIES = ['Main Courses', 'Starters', 'Pasta & Risotto', 'Desserts', 'Drinks'];
const EMOJIS     = ['🥩','🍄','🍝','🧀','🍮','🍷','🦪','🦆','🍸','🐟'];
const EXP_CATS   = ['Ingredients','Staff','Utilities','Equipment','Marketing','Cleaning','Beverages','Rent'];
const EXP_ICONS  = ['fa-carrot','fa-users','fa-bolt','fa-wrench','fa-bullhorn','fa-broom','fa-wine-bottle','fa-building'];

// /users → customers list
function mapUsers(users) {
  return users.slice(0, 10).map((u, i) => ({
    id:        'c' + u.id,
    name:      u.name,
    email:     u.email,
    phone:     u.phone,
    visits:    10 + (u.id * 3) % 40,
    spent:     500 + (u.id * 347) % 8000,
    lastVisit: `2026-03-${String(1 + (u.id % 19)).padStart(2,'0')}`,
    status:    STATUSES[i % STATUSES.length],
    color:     COLORS[i % COLORS.length],
    note:      u.company?.catchPhrase || '',
  }));
}

// /users/1 → profile
function mapProfile(user) {
  return {
    name:     user.name,
    role:     'Admin',
    email:    user.email,
    phone:    user.phone,
    avatar:   user.name.charAt(0) + (user.name.split(' ')[1]?.charAt(0) || ''),
    joinDate: '2021-06-15',
    branches: 'All Branches',
    address:  `${user.address?.suite}, ${user.address?.street}, ${user.address?.city}`,
  };
}

// /posts → blog posts
function mapPosts(posts) {
  const statuses = ['published','published','draft','published','draft','published'];
  const authors  = ['Marco Ferretti','Sophia Laurent','Kenji Nakamura','Amara Osei','Marco Ferretti','Sophia Laurent'];
  const cats     = ['Culinary','Menu Updates','Wine','Behind Scenes','Sustainability','News'];
  return posts.slice(0, 6).map((p, i) => ({
    id:      'bl' + p.id,
    title:   p.title.charAt(0).toUpperCase() + p.title.slice(1),
    excerpt: p.body.replace(/\n/g, ' ').substring(0, 120) + '...',
    date:    `2026-03-${String(5 + i * 2).padStart(2,'0')}`,
    status:  statuses[i % statuses.length],
    author:  authors[i % authors.length],
    category:cats[i % cats.length],
    views:   statuses[i % statuses.length] === 'draft' ? 0 : 200 + (p.id * 173) % 2000,
    emoji:   EMOJIS[i % EMOJIS.length],
  }));
}

// /comments → reviews
function mapComments(comments) {
  const names    = ['Alexandra Mitchell','James Rodriguez','Dr. Sofia Chen','Brooklyn Foodies','Tariq Hassan','Laurent Family','Maria Gonzalez','David Park','Elena Moretti','Kenji Nakamura'];
  const ratings  = [5, 4, 5, 4, 5, 5, 3, 5, 4, 5];
  const replies  = ['Thank you!', '', 'Your safety is our priority!', 'Working on vegan options.', '', 'Happy anniversary!', 'We apologize for the delay.', 'Thank you David!', '', 'Happy birthday!'];
  return comments.slice(0, 10).map((c, i) => ({
    id:       'r' + c.id,
    customer: names[i % names.length],
    rating:   ratings[i % ratings.length],
    date:     `2026-03-${String(9 + i).padStart(2,'0')}`,
    comment:  c.body.replace(/\n/g, ' ').substring(0, 140),
    branch:   BRANCHES[i % BRANCHES.length],
    reply:    replies[i % replies.length],
  }));
}

// /todos → transactions
function mapTodosToTransactions(todos) {
  return todos.slice(0, 14).map((t, i) => ({
    id:       'T-' + (2000 + t.id),
    orderId:  '#' + (135 + i),
    customer: i < 3 ? ['Alexandra Mitchell','David Park','James Rodriguez'][i] : 'Walk-in Guest',
    method:   METHODS[i % METHODS.length],
    amount:   50 + (t.id * 37) % 400,
    date:     `2026-03-${String(14 + (i % 6)).padStart(2,'0')}`,
    time:     `${12 + (i % 10)}:${String((i * 17) % 60).padStart(2,'0')}`,
    status:   TX_STATUS[i % TX_STATUS.length],
    branch:   BRANCHES[i % BRANCHES.length],
  }));
}

// /todos → expense approvals
function mapTodosToApprovals(todos) {
  const reqNames = ['Marco Ferretti','Sarah Kim','Luca Bianchi','Elena Moretti','Amara Osei'];
  const expCats  = ['Equipment','Marketing','Ingredients','Maintenance','Staff'];
  const notes    = ['New oven repair parts','Social media campaign Q2','Premium truffle order','HVAC system maintenance','Overtime pay'];
  const appStats = ['pending','pending','pending','approved','approved'];
  return todos.slice(0, 5).map((t, i) => ({
    id:          'ea' + t.id,
    branch:      BRANCHES[i % BRANCHES.length] + ' Branch',
    category:    expCats[i],
    amount:      300 + (t.id * 123) % 3000,
    requestedBy: reqNames[i],
    date:        `2026-03-${String(15 + i).padStart(2,'0')}`,
    note:        notes[i],
    status:      appStats[i],
  }));
}

// /albums → products
function mapAlbumsToProducts(albums) {
  const prices = [48,165,32,28,26,18,24,16,38,42,34,14,12,16,16,14,18,22];
  return albums.slice(0, 18).map((a, i) => ({
    id:          'p' + a.id,
    name:        a.title.split(' ').slice(0,3).map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' '),
    price:       prices[i] || (15 + (a.id * 7) % 150),
    category:    CATEGORIES[i % CATEGORIES.length],
    status:      i === 17 ? 'inactive' : 'active',
    emoji:       EMOJIS[i % EMOJIS.length],
    description: 'House specialty — freshly prepared daily.',
  }));
}

// /photos → expenses
function mapPhotosToExpenses(photos) {
  const vendors = ['Fresh Market Co.','Payroll','City Power & Gas','Chef Supplies Ltd.','Premium Meats Co.','Social Media Agency','CleanPro Services','Wine Imports Ltd.','NYC Properties LLC','SafeGuard Insurance'];
  const notes   = ['Weekly produce order','Bi-weekly payroll','Monthly electricity','Kitchen equipment repair','Wagyu beef order','March social campaign','Deep cleaning','Monthly wine order','March rent','Business insurance'];
  const amounts = [4240,18200,1680,2380,3890,1200,850,2680,12000,1800];
  return photos.slice(0, 10).map((p, i) => ({
    id:       'e' + p.id,
    category: EXP_CATS[i % EXP_CATS.length],
    vendor:   vendors[i],
    amount:   amounts[i],
    date:     `2026-03-${String(1 + i * 2).padStart(2,'0')}`,
    note:     notes[i],
    icon:     EXP_ICONS[i % EXP_ICONS.length],
    color:    COLORS[i % COLORS.length],
    branch:   i % 3 === 0 ? 'Downtown' : 'All',
  }));
}

/* ─────────────────────────────────────────────
   PUBLIC API OBJECT
   প্রতিটা method:
   1. fetch() দিয়ে JSONPlaceholder hit করে
   2. response transform করে
   3. DB.* আপডেট করে (cache হিসেবে)
   4. transformed data return করে
───────────────────────────────────────────── */
const Api = {

  // Customers লোড করে DB.customers আপডেট করে
  async getCustomers() {
    const data = await apiFetch('/users');
    if (!data) return DB.customers; // fallback to mock
    DB.customers = mapUsers(data);
    return DB.customers;
  },

  // Profile লোড করে
  async getProfile() {
    const data = await apiFetch('/users/1');
    if (!data) return DB.profile;
    DB.profile = mapProfile(data);
    return DB.profile;
  },

  // Blog posts লোড করে
  async getPosts() {
    const data = await apiFetch('/posts?_limit=6');
    if (!data) return DB.blog;
    DB.blog = mapPosts(data);
    return DB.blog;
  },

  // Reviews (comments) লোড করে
  async getReviews() {
    const data = await apiFetch('/comments?_limit=10');
    if (!data) return DB.reviews;
    DB.reviews = mapComments(data);
    return DB.reviews;
  },

  // Transactions লোড করে
  async getTransactions() {
    const data = await apiFetch('/todos?_limit=14');
    if (!data) return DB.transactions;
    DB.transactions = mapTodosToTransactions(data);
    return DB.transactions;
  },

  // Expense approvals লোড করে
  async getExpenseApprovals() {
    const data = await apiFetch('/todos?_limit=5');
    if (!data) return DB.expenseApprovals;
    DB.expenseApprovals = mapTodosToApprovals(data);
    return DB.expenseApprovals;
  },

  // Products লোড করে
  async getProducts() {
    const data = await apiFetch('/albums?_limit=18');
    if (!data) return DB.products;
    DB.products = mapAlbumsToProducts(data);
    return DB.products;
  },

  // Expenses লোড করে
  async getExpenses() {
    const data = await apiFetch('/photos?_limit=10');
    if (!data) return DB.expenses;
    DB.expenses = mapPhotosToExpenses(data);
    return DB.expenses;
  },

  // Dashboard এর জন্য সব critical data একসাথে লোড
  async getDashboardData() {
    Toast.show('Loading dashboard data…', 'info');
    const [customers, approvals] = await Promise.all([
      this.getCustomers(),
      this.getExpenseApprovals(),
    ]);
    return { customers, approvals };
  },
};

window.Api = Api;
