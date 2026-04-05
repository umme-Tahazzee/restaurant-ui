

/* ──────────────────────────────────────────────
   CART STATE
   cart একটা array — প্রতিটা item হলো: { name, price, qty }
   ────────────────────────────────────────────── */
let cart = [];
let orderType = 'dine'; // 'dine' বা 'take'


/* ──────────────────────────────────────────────
   CART ACTIONS — Add, Remove, Update Quantity
   ────────────────────────────────────────────── */

// Cart-এ item যোগ করো
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty++; // Already আছে? qty বাড়াও
  } else {
    cart.push({ name, price, qty: 1 }); // নতুন item যোগ করো
  }

  renderCart();
  showToast(`${name} added to cart`);
}

// Cart থেকে item সরাও
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// Quantity বাড়াও বা কমাও (delta = +1 বা -1)
function updateQuantity(index, delta) {
  cart[index].qty += delta;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1); // qty 0 হলে সরিয়ে দাও
  }

  renderCart();
}

// Dine In / Takeout toggle
function setOrderType(type) {
  orderType = type;

  const dineBtn  = document.getElementById('dine-btn');
  const takeBtn  = document.getElementById('take-btn');
  const subtitle = document.getElementById('cart-subtitle');

  if (!dineBtn || !takeBtn) return;

  if (type === 'dine') {
    dineBtn.classList.add('bg-white', 'text-textDark', 'shadow-sm');
    dineBtn.classList.remove('text-textMid/50');
    takeBtn.classList.remove('bg-white', 'text-textDark', 'shadow-sm');
    takeBtn.classList.add('text-textMid/50');
    if (subtitle) subtitle.textContent = 'Table 7 · Dine In';
  } else {
    takeBtn.classList.add('bg-white', 'text-textDark', 'shadow-sm');
    takeBtn.classList.remove('text-textMid/50');
    dineBtn.classList.remove('bg-white', 'text-textDark', 'shadow-sm');
    dineBtn.classList.add('text-textMid/50');
    if (subtitle) subtitle.textContent = 'Takeout · Pickup';
  }
}


/* ──────────────────────────────────────────────
   CART RENDER — UI আপডেট করো
   ────────────────────────────────────────────── */
function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal   = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  updateCartBadges(totalItems);

  if (cart.length === 0) {
    renderEmptyCart();
  } else {
    renderCartItems(subtotal, totalItems);
  }
}

// Navbar ও mobile nav-এ cart badge আপডেট করো
function updateCartBadges(totalItems) {
  const desktopBadge = document.getElementById('cart-badge');
  const mobileBadge  = document.getElementById('mobile-cart-badge');

  [desktopBadge, mobileBadge].forEach(badge => {
    if (!badge) return;
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });

  const itemCountEl = document.getElementById('cart-item-count');
  if (itemCountEl) {
    itemCountEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  }
}

// Empty cart দেখাও
function renderEmptyCart() {
  const container = document.getElementById('cart-items');
  if (container) {
    container.innerHTML = `
      <div class="text-center py-16 px-6">
        <div class="text-5xl mb-4">🛒</div>
        <p class="font-playfair text-lg font-bold text-textDark mb-1">Your cart is empty</p>
        <p class="font-cormorant italic text-textMid/50">Add dishes from the menu to get started</p>
        <a href="menu.html" onclick="toggleCart()"
           class="mt-4 inline-block btn-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest">
          Browse Menu
        </a>
      </div>
    `;
  }

  // Footer লুকাও
  const footer = document.getElementById('cart-footer');
  if (footer) footer.classList.add('hidden');

  const confirmBtn = document.getElementById('cart-confirm-btn');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// Cart items এবং totals দেখাও
function renderCartItems(subtotal, totalItems) {
  const container = document.getElementById('cart-items');
  if (!container) return;

  // প্রতিটা cart item-এর HTML বানাও
  container.innerHTML = cart.map((item, index) => buildCartItemHTML(item, index)).join('');

  // Footer ও totals দেখাও
  const footer = document.getElementById('cart-footer');
  if (footer) footer.classList.remove('hidden');

  renderCartTotals(subtotal, totalItems);

  const confirmBtn = document.getElementById('cart-confirm-btn');
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

// একটা cart item-এর HTML তৈরি করো
function buildCartItemHTML(item, index) {
  return `
    <div class="flex gap-4 px-6 py-4 border-b border-borderSoft/50">

      <!-- Item thumbnail -->
      <div class="w-16 h-16 rounded-xl bg-cream border border-borderSoft flex-shrink-0 overflow-hidden">
        <img src="./assets/thai.png" alt="${item.name}" class="w-full h-full object-cover"/>
      </div>

      <!-- Item details -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start gap-2">
          <div>
            <p class="font-playfair font-bold text-textDark text-sm leading-tight">${item.name}</p>
            <p class="text-xs text-textMid/50 mt-0.5 font-cormorant italic">${formatPrice(item.price)} each</p>
          </div>

          <!-- Remove button -->
          <button onclick="removeFromCart(${index})"
                  class="text-textMid/25 hover:text-red-500 transition flex-shrink-0 ml-1 p-1">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <!-- Quantity controls + line total -->
        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center border border-borderSoft rounded-xl overflow-hidden">
            <button onclick="updateQuantity(${index}, -1)"
                    class="w-8 h-8 text-sm hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center">
              −
            </button>
            <span class="w-8 text-center text-sm font-bold text-textDark">${item.qty}</span>
            <button onclick="updateQuantity(${index}, 1)"
                    class="w-8 h-8 text-sm hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center">
              +
            </button>
          </div>
          <p class="font-playfair font-bold text-textDark">${formatPrice(item.price * item.qty)}</p>
        </div>
      </div>
    </div>
  `;
}

// Cart total breakdown দেখাও
function renderCartTotals(subtotal, totalItems) {
  const totalsEl = document.getElementById('cart-totals');
  if (!totalsEl) return;

  const service    = subtotal * 0.10;
  const tax        = subtotal * 0.08875;
  const grandTotal = subtotal + service + tax;

  totalsEl.innerHTML = `
    <div class="space-y-2">
      <div class="flex justify-between text-xs text-textMid/60">
        <span>Subtotal (${totalItems} items)</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      <div class="flex justify-between text-xs text-textMid/60">
        <span>Service (10%)</span>
        <span>${formatPrice(service)}</span>
      </div>
      <div class="flex justify-between text-xs text-textMid/60">
        <span>Tax (8.875%)</span>
        <span>${formatPrice(tax)}</span>
      </div>
      <div class="border-t border-borderSoft pt-2 flex justify-between items-center">
        <span class="font-playfair font-black text-textDark">Total</span>
        <span class="font-playfair text-xl font-black text-textDark">${formatPrice(grandTotal)}</span>
      </div>
    </div>
  `;
}


/* ──────────────────────────────────────────────
   CART PANEL TOGGLE — Open / Close
   ────────────────────────────────────────────── */
function toggleCart() {
  const modal    = document.getElementById('cart-modal');
  const panel    = document.getElementById('cart-panel');
  const overlay  = document.getElementById('overlay');
  const isMobile = window.innerWidth < 768;
  const isOpen   = modal.dataset.open === 'true';

  if (isOpen) {
    // Close করো
    panel.style.transform = isMobile ? 'translateY(100%)' : 'translateX(100%)';
    if (overlay) {
      overlay.style.opacity       = '0';
      overlay.style.pointerEvents = 'none';
    }
    document.body.style.overflow = '';
    modal.dataset.open = 'false';
    modal.style.pointerEvents = 'none';
  } else {
    // Open করো
    modal.dataset.open = 'true';
    modal.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';

    // Desktop-এ right থেকে slide in, mobile-এ bottom থেকে
    if (!isMobile) panel.style.transform = 'translateX(100%)';

    requestAnimationFrame(() => {
      panel.style.transform = isMobile ? 'translateY(0%)' : 'translateX(0%)';
    });

    if (overlay) {
      overlay.style.opacity       = '1';
      overlay.style.pointerEvents = 'all';
    }
  }
}

// সব panel বন্ধ করো (overlay click-এ)
function closeAll() {
  if (document.getElementById('cart-modal')?.dataset.open === 'true') {
    toggleCart();
  }
  closeMobileMenu();
}


/* ──────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderCart(); // Page load হলে cart render করো
});
