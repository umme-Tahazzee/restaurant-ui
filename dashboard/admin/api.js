/* ================================================
   SAVORIA ADMIN — SIMULATED API SERVICE
   Wraps mock data (DB) in asynchronous Promises
   to simulate real network requests (AJAX/Fetch).
================================================ */

const API_DELAY = 400; // Simulated network delay in ms

/**
 * Helper function to simulate a network request delay
 * @param {any} data The data to return after the delay
 * @returns {Promise<any>}
 */
function mockRequest(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      // Return a deep copy to prevent direct accidental mutations
      resolve(JSON.parse(JSON.stringify(data)));
    }, API_DELAY);
  });
}

window.API = {
  // Dashboard
  async getDashboardData() {
    return mockRequest({
      branches: DB.branches,
      yearlyData: DB.yearlyData,
      incomeData: DB.incomeData,
      expenseApprovals: DB.expenseApprovals,
      peakHours: DB.peakHours,
      salesData: DB.salesData,
      topItemsToday: DB.topItemsToday,
      topItemsMonth: DB.topItemsMonth
    });
  },

  async approveExpense(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        const item = DB.expenseApprovals.find(x => x.id === id);
        if (item) item.status = 'approved';
        resolve({ success: true, message: 'Expense approved' });
      }, 300);
    });
  },

  async rejectExpense(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        const item = DB.expenseApprovals.find(x => x.id === id);
        if (item) item.status = 'rejected';
        resolve({ success: true, message: 'Expense rejected' });
      }, 300);
    });
  },

  // Reports
  async getReportsData() {
    return mockRequest({
      branchSales: DB.branchSales,
      ingredients: DB.ingredients,
      salesData: DB.salesData,
      branches: DB.branches
    });
  },

  // Customers
  async getCustomers() {
    return mockRequest(DB.customers);
  },

  // Reviews
  async getReviews() {
    return mockRequest(DB.reviews);
  },
  
  async replyToReview(id, replyText) {
    return new Promise(resolve => {
      setTimeout(() => {
        const rev = DB.reviews.find(r => r.id === id);
        if (rev) rev.reply = replyText;
        resolve({ success: true });
      }, 400);
    });
  },

  // Transactions
  async getTransactions() {
    return mockRequest(DB.transactions);
  },

  // Expenses
  async getExpensesData() {
    return mockRequest({
      expenses: DB.expenses,
      branches: DB.branches
    });
  },

  // Products
  async getProductsData() {
    return mockRequest({
      products: DB.products,
      categories: DB.categories
    });
  },

  // Blog
  async getBlogPosts() {
    return mockRequest(DB.blog);
  },

  // Profile
  async getProfile() {
    return mockRequest(DB.profile);
  },

  // Settings
  async getSettings() {
    return mockRequest(DB.settings);
  },
  
  async updateSettings(newSettings) {
    return new Promise(resolve => {
      setTimeout(() => {
        DB.settings = { ...DB.settings, ...newSettings };
        resolve({ success: true, settings: DB.settings });
      }, 500);
    });
  }
};
