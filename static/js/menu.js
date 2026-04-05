/* ═══════════════════════════════════════════════════════════════
   MENU.JS  —  Menu Page: Filter · Sort · Search · Quick View
   Depends on: savoria-app.js  (cart, toast, toggleCart, formatPrice)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────
   FILTER
───────────────────────────────────────────────── */
let activeCategory = 'all';

function filterMenu(cat, btn) {
  activeCategory = cat;

  /* Update active state on all filter buttons */
  document.querySelectorAll('.filter-tab, .m-filter').forEach(b => {
    const onclickAttr = b.getAttribute('onclick') || '';
    b.classList.toggle('active', onclickAttr.includes(`'${cat}'`));
  });

  const query = (document.getElementById('deskSearch') || {}).value || '';
  if (query.trim()) {
    runSearch(query.trim());
    return;
  }

  document.querySelectorAll('.menu-section').forEach(sec => {
    sec.style.display = (cat === 'all' || sec.dataset.category === cat) ? 'block' : 'none';
  });
}

/* ─────────────────────────────────────────────────
   SORT
───────────────────────────────────────────────── */
function sortMenu(val) {
  document.querySelectorAll('.menu-section').forEach(sec => {
    const container = sec.querySelector('.grid');
    if (!container) return;
    const cards = [...container.querySelectorAll('.menu-card')];

    cards.sort((a, b) => {
      const pa = parseFloat(a.dataset.price)  || 0;
      const pb = parseFloat(b.dataset.price)  || 0;
      const ra = parseFloat(a.dataset.rating) || 0;
      const rb = parseFloat(b.dataset.rating) || 0;
      if (val === 'price-asc')  return pa - pb;
      if (val === 'price-desc') return pb - pa;
      if (val === 'rating')     return rb - ra;
      return 0;
    });

    cards.forEach(c => container.appendChild(c));
  });
}

/* ─────────────────────────────────────────────────
   SEARCH
───────────────────────────────────────────────── */
let searchTimer = null;

function handleSearch(val) {
  /* Sync both inputs */
  const deskInput = document.getElementById('deskSearch');
  const mobInput  = document.getElementById('mobSearch');
  if (deskInput) deskInput.value = val;
  if (mobInput)  mobInput.value  = val;

  /* Toggle clear button visibility */
  const deskWrap = document.getElementById('deskSearchWrap');
  const mobBar   = document.getElementById('mobSearchBar');
  deskWrap?.classList.toggle('has-value', !!val.trim());
  mobBar?.classList.toggle('has-value',  !!val.trim());

  clearTimeout(searchTimer);
  if (!val.trim()) {
    clearSearch(true);
    return;
  }
  searchTimer = setTimeout(() => runSearch(val), 180);
}

function runSearch(query) {
  const q = query.trim().toLowerCase();
  let count = 0;

  document.querySelectorAll('.menu-section').forEach(sec => {
    const catOk = activeCategory === 'all' || sec.dataset.category === activeCategory;
    if (!catOk) { sec.style.display = 'none'; return; }

    let sectionHasMatch = false;
    sec.querySelectorAll('.menu-card').forEach(card => {
      const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const tags = (card.dataset.search || '').toLowerCase();
      const match = name.includes(q) || tags.includes(q);
      card.classList.toggle('hidden-search', !match);
      if (match) { sectionHasMatch = true; count++; }
    });

    sec.style.display = sectionHasMatch ? 'block' : 'none';
  });

  const bar     = document.getElementById('searchResultBar');
  const txt     = document.getElementById('searchResultText');
  const noRes   = document.getElementById('noResults');
  const noLabel = document.getElementById('noResultsLabel');

  if (bar) bar.classList.add('visible');
  if (txt) txt.textContent = count > 0
    ? `${count} dish${count !== 1 ? 'es' : ''} found for "${query}"`
    : `No results for "${query}"`;

  if (noRes)   noRes.classList.toggle('visible', count === 0);
  if (noLabel) noLabel.textContent = `No dishes match "${query}"`;
}

function clearSearch(silent) {
  const deskInput = document.getElementById('deskSearch');
  const mobInput  = document.getElementById('mobSearch');
  const deskWrap  = document.getElementById('deskSearchWrap');
  const mobBar    = document.getElementById('mobSearchBar');
  const bar       = document.getElementById('searchResultBar');
  const noRes     = document.getElementById('noResults');

  if (deskInput) deskInput.value = '';
  if (mobInput)  mobInput.value  = '';
  deskWrap?.classList.remove('has-value');
  mobBar?.classList.remove('has-value');
  bar?.classList.remove('visible');
  noRes?.classList.remove('visible');

  document.querySelectorAll('.menu-card').forEach(c => c.classList.remove('hidden-search'));

  if (!silent) {
    activeCategory = 'all';
    document.querySelectorAll('.menu-section').forEach(s => s.style.display = 'block');
    document.querySelectorAll('.filter-tab, .m-filter').forEach(b => {
      b.classList.toggle('active', (b.getAttribute('onclick') || '').includes("'all'"));
    });
  } else {
    document.querySelectorAll('.menu-section').forEach(sec => {
      sec.style.display = (activeCategory === 'all' || sec.dataset.category === activeCategory)
        ? 'block' : 'none';
    });
  }
}

/* ─────────────────────────────────────────────────
   MOBILE SEARCH TOGGLE
───────────────────────────────────────────────── */
function toggleMobSearch() {
  const bar = document.getElementById('mobSearchBar');
  const btn = document.getElementById('mobSearchBtn');
  if (!bar) return;

  const isOpen = bar.classList.contains('open');
  bar.classList.toggle('open', !isOpen);
  btn?.classList.toggle('active', !isOpen);

  if (!isOpen) {
    setTimeout(() => document.getElementById('mobSearch')?.focus(), 330);
  } else {
    clearSearch(true);
  }
}

/* ─────────────────────────────────────────────────
   QUICK VIEW MODAL
───────────────────────────────────────────────── */
function openQuick(card) {
  const name   = card.querySelector('h3')?.textContent || '';
  const desc   = card.querySelector('p.font-cormorant')?.textContent || '';
  const price  = parseFloat(card.dataset.price) || 0;
  const rating = card.dataset.rating || '—';
  const img    = card.querySelector('img')?.src || 'assets/thai.png';

  /* Allergens */
  const allergenEls = [...card.querySelectorAll('.allergen')];
  const allergensHTML = allergenEls.length
    ? `<div class="flex gap-1.5 flex-wrap mt-3">${allergenEls.map(a => a.outerHTML).join('')}</div>`
    : '';

  /* Tags */
  const tagEls = [...card.querySelectorAll('.tag')];
  const tagsHTML = tagEls.length
    ? `<div class="flex gap-2 flex-wrap mb-3">${tagEls.map(t => t.outerHTML).join('')}</div>`
    : '';

  const isWished = (window.wishlist || []).includes(name);

  document.getElementById('quickPanel').innerHTML = `
    <!-- Close button -->
    <button class="qm-close-btn" onclick="closeQuick()" aria-label="Close">
      <i class="fa-solid fa-xmark" style="font-size:13px"></i>
    </button>

    <!-- Drag handle (mobile) -->
    <div class="md:hidden flex justify-center pt-3 pb-2 -mt-1">
      <div style="width:40px;height:4px;border-radius:9px;background:#e8ddd8"></div>
    </div>

    <!-- Image -->
    <div class="relative overflow-hidden h-[240px] bg-cream">
      <img src="${img}" alt="${name}" class="w-full h-full object-cover"/>
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
      <!-- Wishlist -->
      <button class="wish-btn absolute top-3 right-3 ${isWished ? 'liked' : ''}"
              data-wish="${name}"
              onclick="toggleWishlist('${name}', this)"
              aria-label="${isWished ? 'Remove from wishlist' : 'Add to wishlist'}">
        <i class="fa-${isWished ? 'solid' : 'regular'} fa-heart"></i>
      </button>
    </div>

    <div class="p-6">
      <!-- Tags -->
      ${tagsHTML}

      <div class="flex items-start justify-between gap-3 mb-2">
        <h2 class="font-playfair text-2xl font-black text-textDark leading-tight">${name}</h2>
        <div class="rating-badge flex-shrink-0">
          <i class="fa-solid fa-star text-[9px]"></i> ${rating}
        </div>
      </div>

      <p class="font-cormorant italic text-lg text-textMid/70 mb-4">${desc}</p>

      ${allergensHTML}

      <!-- About section -->
      <div class="bg-cream/60 rounded-xl p-4 mt-4 mb-5 border border-borderSoft">
        <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-textMid/40 mb-2">About This Dish</p>
        <p class="text-sm text-textMid/70 leading-relaxed">
          Crafted by Chef Marco using only the finest seasonal ingredients, sourced from trusted local farms.
          Each dish is prepared fresh to order with 20 years of culinary mastery.
        </p>
      </div>

      <!-- Dietary Info -->
      <div class="flex gap-3 mb-5 text-[11px] text-textMid/50">
        <span class="flex items-center gap-1.5"><i class="fa-regular fa-clock text-gold/70"></i> 20–25 min</span>
        <span>·</span>
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-fire-flame-curved text-gold/70"></i> ~${Math.round(price * 8)} cal</span>
        <span>·</span>
        <span class="flex items-center gap-1.5"><i class="fa-regular fa-star text-gold/70"></i> ${rating}</span>
      </div>

      <!-- Add to Order -->
      <div class="flex items-center justify-between">
        <p class="font-playfair text-3xl font-black text-textDark">${formatPrice(price)}</p>
        <button onclick="addToCart('${name}', ${price}, '${img}'); closeQuick();"
                class="book-btn text-white px-8 py-3.5 rounded-xl text-[11px] font-bold tracking-[0.18em] uppercase flex items-center gap-2">
          <i class="fa-solid fa-plus text-[10px]"></i> Add to Order
        </button>
      </div>
    </div>
  `;

  document.getElementById('quickModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuick() {
  const modal = document.getElementById('quickModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────
   ESC KEY
───────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeQuick();
});

/* ─────────────────────────────────────────────────
   STICKY FILTER SHADOW ON SCROLL
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const filter = document.getElementById('stickyFilter');
  if (!filter) return;

  const observer = new IntersectionObserver(
    ([e]) => filter.classList.toggle('is-stuck', e.intersectionRatio < 1),
    { threshold: [1], rootMargin: '-73px 0px 0px 0px' }
  );
  observer.observe(filter);
});
