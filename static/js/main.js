

/* ═══════════════════════════════════════════════════
   CART STATE
   ═══════════════════════════════════════════════════ */
let cart = [];

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty++; }
  else { cart.push({ name, price, qty: 1 }); }
  renderCart();
  showToast(name);
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  renderCart();
}

function changeQtyCart(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
}


/* ═══════════════════════════════════════════════════
   RENDER CART
   ═══════════════════════════════════════════════════ */
function renderCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);

  /* ── Badges ── */
  const badge  = document.getElementById('cartBadge');
  const mbadge = document.getElementById('mobileBadge');
  if (badge) {
    if (totalItems > 0) { badge.textContent = totalItems; badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  }
  if (mbadge) {
    if (totalItems > 0) { mbadge.textContent = totalItems; mbadge.style.display = 'flex'; }
    else { mbadge.style.display = 'none'; }
  }

  /* ── Item count badge inside panel ── */
  const itemCountBadge = document.getElementById('itemCountBadge');
  if (itemCountBadge) {
    itemCountBadge.textContent = totalItems + ' item' + (totalItems !== 1 ? 's' : '');
  }

  /* ── Empty / filled state ── */
  const empty      = document.getElementById('cartEmpty');
  const upsell     = document.getElementById('cartUpsell');
  const note       = document.getElementById('cartNote');
  const meta       = document.getElementById('cartMeta');
  const payment    = document.getElementById('cartPayment');
  const confirmBtn = document.getElementById('cartConfirmBtn');
  const container  = document.getElementById('cartItemsContainer');
  const totalsBlock = document.getElementById('cartTotalsBlock');

  /* Fallback for simpler cart (menu.html / about.html) */
  const cartBody   = document.getElementById('cartBody');
  const cartTotals = document.getElementById('cartTotals');

  if (cart.length === 0) {
    if (empty)      empty.style.display = 'block';
    if (upsell)     upsell.classList.add('hidden');
    if (note)       note.classList.add('hidden');
    if (meta)       meta.classList.add('hidden');
    if (payment)    payment.classList.add('hidden');
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.classList.add('opacity-50','cursor-not-allowed'); }
    if (container)  container.innerHTML = '';
    if (totalsBlock) totalsBlock.innerHTML = '';
    if (cartBody)   cartBody.innerHTML = _emptyCartHTML();
    if (cartTotals) cartTotals.innerHTML = '';
    return;
  }

  if (empty)      empty.style.display = 'none';
  if (upsell)     upsell.classList.remove('hidden');
  if (note)       note.classList.remove('hidden');
  if (meta)       meta.classList.remove('hidden');
  if (payment)    { payment.style.display = 'flex'; payment.classList.remove('hidden'); }
  if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.classList.remove('opacity-50','cursor-not-allowed'); }

  const itemsHTML = cart.map((item, idx) => `
    <div class="px-6 py-4 border-b border-borderSoft/50">
      <div class="flex gap-4">
        <div class="w-[68px] h-[68px] rounded-2xl flex-shrink-0 bg-cream overflow-hidden border border-borderSoft">
          <img src="./assets/thai.png" alt="${item.name}" class="w-full h-full object-cover"/>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-playfair font-bold text-textDark text-[14px] leading-tight">${item.name}</p>
              <p class="text-[10px] text-textMid/50 mt-0.5 font-cormorant italic">$${item.price.toFixed(2)} each</p>
            </div>
            <button class="text-textMid/25 hover:text-redPrimary transition ml-2 flex-shrink-0"
                    onclick="removeFromCart(${idx})">
              <i class="fa-solid fa-trash-can text-[11px]"></i>
            </button>
          </div>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center border border-borderSoft rounded-xl overflow-hidden">
              <button class="w-8 h-8 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center"
                      onclick="changeQtyCart(${idx},-1)">−</button>
              <span class="w-8 text-center text-sm font-bold text-textDark">${item.qty}</span>
              <button class="w-8 h-8 text-sm text-textMid hover:bg-redPale hover:text-redPrimary transition flex items-center justify-center"
                      onclick="changeQtyCart(${idx},1)">+</button>
            </div>
            <span class="font-playfair font-bold text-textDark text-base">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  /* Full cart (index.html) */
  if (container) container.innerHTML = itemsHTML;

  /* Simpler cart (menu.html / about.html) */
  if (cartBody) cartBody.innerHTML = itemsHTML;

  /* ── Totals ── */
  const service    = subtotal * 0.10;
  const tax        = subtotal * 0.08875;
  const grandTotal = subtotal + service + tax;

  const totalsHTML = `
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Service charge (10%)</span>
      <span>$${service.toFixed(2)}</span>
    </div>
    <div class="flex justify-between text-[12px] text-textMid/55">
      <span>Tax (8.875%)</span>
      <span>$${tax.toFixed(2)}</span>
    </div>
    <div class="border-t border-borderSoft pt-2.5 mt-1 flex justify-between items-center">
      <span class="font-playfair text-base font-black text-textDark">Total</span>
      <span class="font-playfair text-xl font-black text-textDark">$${grandTotal.toFixed(2)}</span>
    </div>
  `;

  if (totalsBlock) totalsBlock.innerHTML = totalsHTML;
  if (cartTotals)  cartTotals.innerHTML  = totalsHTML;
}

function _emptyCartHTML() {
  return `
    <div class="text-center py-16">
      <div class="text-6xl mb-4">🛒</div>
      <p class="font-playfair text-xl font-bold text-textDark mb-2">Your cart is empty</p>
      <p class="font-cormorant italic text-textMid/60">Add dishes from the menu to get started</p>
    </div>`;
}


/* ═══════════════════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════════════════ */
function showToast(name) {
  const existing = document.getElementById('savoriaToast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'savoriaToast';
  t.className = 'toast';
  t.style.cssText = [
    'position:fixed', 'bottom:96px', 'left:50%', 'transform:translateX(-50%)',
    'z-index:2000', 'background:#1a1210', 'color:white',
    'padding:11px 20px', 'border-radius:100px',
    'font-size:12px', 'font-weight:600',
    'display:flex', 'align-items:center', 'gap:8px',
    'box-shadow:0 8px 30px rgba(0,0,0,0.25)',
    'white-space:nowrap', 'font-family:Jost,sans-serif'
  ].join(';');
  t.innerHTML = `<i class="fa-solid fa-check" style="color:#b8963e;font-size:10px"></i>
                 <strong style="font-family:Playfair Display,serif">${name}</strong>&nbsp;added to order`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.3s';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 2200);
}


/* ═══════════════════════════════════════════════════
   CART PANEL TOGGLE
   ═══════════════════════════════════════════════════ */
function toggleCart() {
  const modal    = document.getElementById('cartModal');
  const panel    = document.getElementById('cartPanel');
  const backdrop = document.getElementById('cartBackdrop');
  const overlay  = document.getElementById('overlay');
  const isMobile = window.innerWidth < 768;
  const isOpen   = modal.dataset.open === 'true';

  if (isOpen) {
    panel.style.transform = isMobile ? 'translateY(100%)' : 'translateX(100%)';
    if (backdrop) backdrop.style.opacity = '0';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    modal.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    modal.dataset.open = 'false';
  } else {
    modal.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';
    if (!isMobile) panel.style.transform = 'translateX(100%)';
    requestAnimationFrame(() => {
      panel.style.transform = isMobile ? 'translateY(0%)' : 'translateX(0%)';
    });
    if (backdrop) backdrop.style.opacity = '1';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    modal.dataset.open = 'true';
  }
}

function closeAll() {
  if (document.getElementById('cartModal').dataset.open === 'true') toggleCart();
  const m = document.getElementById('mobileMenu');
  if (m && !m.classList.contains('hidden')) toggleMenu();
}


/* ═══════════════════════════════════════════════════
   ORDER TYPE (Dine In / Takeout)
   ═══════════════════════════════════════════════════ */
function setOrderType(type) {
  const dineBtn  = document.getElementById('dineBtn');
  const takeBtn  = document.getElementById('takeBtn');
  const subtitle = document.getElementById('cartSubtitle');
  if (!dineBtn || !takeBtn) return;

  if (type === 'dine') {
    dineBtn.classList.add('bg-white','text-textDark','shadow-sm');
    dineBtn.classList.remove('text-textMid/50');
    takeBtn.classList.remove('bg-white','text-textDark','shadow-sm');
    takeBtn.classList.add('text-textMid/50');
    if (subtitle) subtitle.textContent = 'Table 7 · Dine In';
  } else {
    takeBtn.classList.add('bg-white','text-textDark','shadow-sm');
    takeBtn.classList.remove('text-textMid/50');
    dineBtn.classList.remove('bg-white','text-textDark','shadow-sm');
    dineBtn.classList.add('text-textMid/50');
    if (subtitle) subtitle.textContent = 'Takeout · Pickup';
  }
}


/* ═══════════════════════════════════════════════════
   MOBILE MENU TOGGLE
   ═══════════════════════════════════════════════════ */
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  if (!m) return;
  if (m.classList.contains('hidden')) {
    m.classList.remove('hidden');
    m.style.display = 'flex';
    requestAnimationFrame(() => m.style.transform = 'translateX(0)');
  } else {
    m.style.transform = 'translateX(100%)';
    setTimeout(() => { m.classList.add('hidden'); m.style.display = ''; }, 500);
  }
}


/* ═══════════════════════════════════════════════════
   MOBILE NAV — SET ACTIVE TAB
   ═══════════════════════════════════════════════════ */
function setActive(el) {
  document.querySelectorAll('.mobile-bottom-nav .nav-item')
    .forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}


/* ═══════════════════════════════════════════════════
   CATEGORY PILLS ACTIVE STATE
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
});


/* ═══════════════════════════════════════════════════
   NAVBAR SCROLL EFFECT
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(255,255,255,0.98)';
      navbar.style.boxShadow  = '0 2px 20px rgba(0,0,0,0.06)';
    } else {
      navbar.style.background = 'rgba(255,255,255,0)';
      navbar.style.boxShadow  = 'none';
    }
  });
});


/* ═══════════════════════════════════════════════════
   SCROLL REVEAL (for about.html sections)
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  reveals.forEach(r => observer.observe(r));
});


/* ═══════════════════════════════════════════════════
   TOUCH MOMENTUM SCROLL (Mobile dish cards)
  
   ═══════════════════════════════════════════════════ */
function initMomentumScroll(el) {
  if (!el) return;
  let isDown = false, startX = 0, scrollStart = 0, velX = 0, lastX = 0, momentum;
  el.addEventListener('touchstart', e => {
    isDown = true;
    startX = e.touches[0].clientX;
    scrollStart = el.scrollLeft;
    velX = 0;
    cancelAnimationFrame(momentum);
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    if (!isDown) return;
    const x = e.touches[0].clientX;
    velX = x - lastX; lastX = x;
    el.scrollLeft = scrollStart - (x - startX);
  }, { passive: true });
  el.addEventListener('touchend', () => {
    isDown = false;
    let v = -velX * 1.5;
    function glide() {
      if (Math.abs(v) < 0.5) return;
      el.scrollLeft += v; v *= 0.92;
      momentum = requestAnimationFrame(glide);
    }
    glide();
  });
}


/* ═══════════════════════════════════════════════════
   INIT — runs after DOM is ready
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initMomentumScroll(document.getElementById('dishScroll'));
});