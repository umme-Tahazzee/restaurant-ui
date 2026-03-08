
// ══ CART STATE ══
let cart = [];

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty++;
  else cart.push({ name, price, qty: 1 });
  updateCartUI();
  showToast(name);
}
function addToCartById(id) {
  if (id === 'special') addToCart('Wagyu Tenderloin with Truffle Jus', 165);
}
function removeFromCart(idx) { cart.splice(idx, 1); updateCartUI(); }
function changeQtyCart(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartUI();
}
function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  const mbadge = document.getElementById('mobileBadge');
  if (count > 0) {
    badge.textContent = count; badge.style.display = 'flex';
    mbadge.textContent = count; mbadge.style.display = 'flex';
  } else {
    badge.style.display = 'none'; mbadge.style.display = 'none';
  }
  const body = document.getElementById('cartBody');
  if (cart.length === 0) {
    body.innerHTML = `<div class="text-center py-16"><div class="text-6xl mb-4">🛒</div><p class="font-playfair text-xl font-bold text-textDark mb-2">Your cart is empty</p><p class="font-cormorant italic text-textMid/60">Add dishes from the menu to get started</p></div>`;
    document.getElementById('cartTotals').innerHTML = '';
    return;
  }
  body.innerHTML = cart.map((item, idx) => `
    <div class="px-6 py-4 border-b border-borderSoft/50">
      <div class="flex gap-4">
        <div class="w-[60px] h-[60px] rounded-xl flex-shrink-0 bg-cream overflow-hidden border border-borderSoft">
          <img src="./assests/thai.png" class="w-full h-full object-cover"/>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <p class="font-playfair font-bold text-textDark text-[13px] leading-tight">${item.name}</p>
            <button class="text-textMid/25 hover:text-redPrimary transition ml-2" onclick="removeFromCart(${idx})">
              <i class="fa-solid fa-trash-can text-[11px]"></i>
            </button>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center border border-borderSoft rounded-xl overflow-hidden">
              <button class="w-7 h-7 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center" onclick="changeQtyCart(${idx},-1)">−</button>
              <span class="w-7 text-center text-sm font-bold text-textDark">${item.qty}</span>
              <button class="w-7 h-7 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center" onclick="changeQtyCart(${idx},1)">+</button>
            </div>
            <span class="font-playfair font-bold text-textDark text-sm">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>`).join('');
  const service = total * 0.1, tax = total * 0.08875, grand = total + service + tax;
  document.getElementById('cartTotals').innerHTML = `
    <div class="flex justify-between text-[12px] text-textMid/55"><span>Subtotal (${count} items)</span><span>$${total.toFixed(2)}</span></div>
    <div class="flex justify-between text-[12px] text-textMid/55"><span>Service (10%)</span><span>$${service.toFixed(2)}</span></div>
    <div class="flex justify-between text-[12px] text-textMid/55"><span>Tax (8.875%)</span><span>$${tax.toFixed(2)}</span></div>
    <div class="border-t border-borderSoft pt-2.5 mt-1 flex justify-between items-center">
      <span class="font-playfair text-base font-black text-textDark">Total</span>
      <span class="font-playfair text-xl font-black text-textDark">$${grand.toFixed(2)}</span>
    </div>`;
}

// ══ TOAST ══
function showToast(name) {
  const ex = document.getElementById('toast'); if (ex) ex.remove();
  const t = document.createElement('div'); t.id = 'toast';
  t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:2000;background:#1a1210;color:white;padding:12px 20px;border-radius:100px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 8px 30px rgba(0,0,0,0.2);animation:fadeSlideUp 0.3s ease both;white-space:nowrap';
  t.innerHTML = `<i class="fa-solid fa-check" style="color:#b8963e;font-size:10px"></i> Added to order`;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 2000);
}

// ══ CART PANEL ══
function toggleCart() {
  const modal = document.getElementById('cartModal');
  const panel = document.getElementById('cartPanel');
  const backdrop = document.getElementById('cartBackdrop');
  const overlay = document.getElementById('overlay');
  const isMobile = window.innerWidth < 768;
  const isOpen = modal.dataset.open === 'true';
  if (isOpen) {
    panel.style.transform = isMobile ? 'translateY(100%)' : 'translateX(100%)';
    if (backdrop) backdrop.style.opacity = '0';
    overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none';
    modal.style.pointerEvents = 'none'; document.body.style.overflow = '';
    modal.dataset.open = 'false';
  } else {
    modal.style.pointerEvents = 'all'; document.body.style.overflow = 'hidden';
    panel.style.transform = isMobile ? 'translateY(0%)' : 'translateX(0%)';
    if (backdrop) backdrop.style.opacity = '1';
    overlay.style.opacity = '1'; overlay.style.pointerEvents = 'all';
    modal.dataset.open = 'true';
  }
}
function closeAll() { if (document.getElementById('cartModal').dataset.open === 'true') toggleCart(); }

// ══ MOBILE MENU ══
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  if (m.classList.contains('hidden')) {
    m.classList.remove('hidden'); m.style.display = 'flex';
    requestAnimationFrame(() => m.style.transform = 'translateX(0)');
  } else {
    m.style.transform = 'translateX(100%)';
    setTimeout(() => m.classList.add('hidden'), 500);
  }
}

// ══ FILTER ══
let activeCategory = 'all';
function filterMenu(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.filter-tab, .m-filter').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.filter-tab, .m-filter').forEach(b => {
    if (b.getAttribute('onclick')?.includes(`'${cat}'`)) b.classList.add('active');
  });
  const q = document.getElementById('deskSearch').value.trim();
  if (q) { runSearch(q); return; }
  document.querySelectorAll('.menu-section').forEach(sec => {
    sec.style.display = (cat === 'all' || sec.dataset.category === cat) ? 'block' : 'none';
  });
}

// ══ SORT ══
function sortMenu(val) {
  document.querySelectorAll('.menu-section').forEach(sec => {
    const container = sec.querySelector('.grid');
    if (!container) return;
    const cards = [...container.querySelectorAll('.menu-card')];
    cards.sort((a, b) => {
      const pa = +a.dataset.price, pb = +b.dataset.price;
      const ra = +a.dataset.rating, rb = +b.dataset.rating;
      if (val === 'price-asc') return pa - pb;
      if (val === 'price-desc') return pb - pa;
      if (val === 'rating') return rb - ra;
      return 0;
    });
    cards.forEach(c => container.appendChild(c));
  });
}

// ══ SEARCH ══
let searchTimer = null;

function handleSearch(val) {
  // sync both inputs
  document.getElementById('deskSearch').value = val;
  document.getElementById('mobSearch').value = val;
  // toggle clear button
  const dw = document.getElementById('deskSearchWrap');
  const mb = document.getElementById('mobSearchBar');
  val.trim() ? dw.classList.add('has-value') : dw.classList.remove('has-value');
  val.trim() ? mb.classList.add('has-value') : mb.classList.remove('has-value');

  clearTimeout(searchTimer);
  if (!val.trim()) { clearSearch(true); return; }
  searchTimer = setTimeout(() => runSearch(val), 160);
}

function runSearch(query) {
  const q = query.trim().toLowerCase();
  let count = 0;

  document.querySelectorAll('.menu-section').forEach(sec => {
    const catOk = activeCategory === 'all' || sec.dataset.category === activeCategory;
    if (!catOk) { sec.style.display = 'none'; return; }
    let secHas = false;
    sec.querySelectorAll('.menu-card').forEach(card => {
      const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const tags = (card.dataset.search || '').toLowerCase();
      const match = name.includes(q) || tags.includes(q);
      card.classList.toggle('hidden-search', !match);
      if (match) { secHas = true; count++; }
    });
    sec.style.display = secHas ? 'block' : 'none';
  });

  const bar = document.getElementById('searchResultBar');
  const txt = document.getElementById('searchResultText');
  bar.classList.add('visible');
  txt.textContent = count > 0
    ? `${count} dish${count !== 1 ? 'es' : ''} found for "${query}"`
    : `No results for "${query}"`;

  const noRes = document.getElementById('noResults');
  if (count === 0) {
    noRes.classList.add('visible');
    document.getElementById('noResultsLabel').textContent = `No dishes match "${query}"`;
  } else {
    noRes.classList.remove('visible');
  }
}

function clearSearch(silent) {
  document.getElementById('deskSearch').value = '';
  document.getElementById('mobSearch').value = '';
  document.getElementById('deskSearchWrap').classList.remove('has-value');
  document.getElementById('mobSearchBar').classList.remove('has-value');
  document.getElementById('searchResultBar').classList.remove('visible');
  document.getElementById('noResults').classList.remove('visible');
  document.querySelectorAll('.menu-card').forEach(c => c.classList.remove('hidden-search'));
  document.querySelectorAll('.menu-section').forEach(sec => {
    sec.style.display = (activeCategory === 'all' || sec.dataset.category === activeCategory) ? 'block' : 'none';
  });
  if (!silent) {
    activeCategory = 'all';
    document.querySelectorAll('.menu-section').forEach(s => s.style.display = 'block');
    document.querySelectorAll('.filter-tab, .m-filter').forEach(b => {
      b.classList.toggle('active', b.getAttribute('onclick')?.includes("'all'"));
    });
  }
}

// ══ MOBILE SEARCH TOGGLE ══
function toggleMobSearch() {
  const bar = document.getElementById('mobSearchBar');
  const btn = document.getElementById('mobSearchBtn');
  const isOpen = bar.classList.contains('open');
  if (isOpen) {
    bar.classList.remove('open');
    btn.classList.remove('active');
    clearSearch(true);
  } else {
    bar.classList.add('open');
    btn.classList.add('active');
    setTimeout(() => document.getElementById('mobSearch').focus(), 320);
  }
}

// ══ QUICK VIEW — fixed close button via sticky ══
function openQuick(card) {
  const name   = card.querySelector('h3').textContent;
  const desc   = card.querySelector('p.font-cormorant').textContent;
  const price  = card.dataset.price;
  const rating = card.dataset.rating;

  document.getElementById('quickPanel').innerHTML = `
    <!-- sticky close btn floated right; appears above image -->
    <button class="qm-close-btn" onclick="closeQuick()">
      <i class="fa-solid fa-xmark" style="font-size:13px"></i>
    </button>

    <!-- drag handle (mobile) -->
    <div class="md:hidden flex justify-center pt-3 pb-2 -mt-1">
      <div style="width:40px;height:4px;border-radius:9px;background:#e8ddd8"></div>
    </div>

    <img src="./assests/thai.png" alt="${name}" class="w-full h-[220px] object-cover"/>

    <div class="p-6">
      <div class="flex items-start justify-between gap-3 mb-3">
        <h2 class="font-playfair text-2xl font-black text-textDark leading-tight">${name}</h2>
        <div class="rating-badge flex-shrink-0"><i class="fa-solid fa-star text-[9px]"></i> ${rating}</div>
      </div>
      <p class="font-cormorant italic text-lg text-textMid/70 mb-4">${desc}</p>
      <div class="bg-cream/60 rounded-xl p-4 mb-5 border border-borderSoft">
        <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-textMid/40 mb-2">About This Dish</p>
        <p class="text-sm text-textMid/70 leading-relaxed">Crafted by Chef Marco using only the finest seasonal ingredients sourced from local farms and trusted suppliers. Each dish is prepared fresh to order.</p>
      </div>
      <div class="flex items-center justify-between">
        <p class="font-playfair text-3xl font-black text-textDark">$${price}</p>
        <button onclick="addToCart('${name}', ${price}); closeQuick();" class="book-btn text-white px-8 py-3.5 rounded-xl text-[11px] font-bold tracking-[0.18em] uppercase flex items-center gap-2">
          <i class="fa-solid fa-plus text-[10px]"></i> Add to Order
        </button>
      </div>
    </div>`;

  document.getElementById('quickModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuick() {
  document.getElementById('quickModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ESC key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeQuick();
    if (document.getElementById('cartModal').dataset.open === 'true') toggleCart();
  }
});

// ══ NAVBAR SCROLL ══
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.background = 'rgba(255,255,255,0.98)';
    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
  } else {
    navbar.style.background = 'rgba(255,255,255,0)';
    navbar.style.boxShadow = 'none';
  }
});
