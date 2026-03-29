/* ═══════════════════════════════════════════════════
   wishlist.js — Savoria Profile Dashboard
   Handles: wishlist render, remove item, add to cart
   Django: replace MOCK_WISHLIST with fetch('/api/wishlist/')
═══════════════════════════════════════════════════ */

const WISHLIST = (() => {

  /* ─────────────────────────────────────
     MOCK DATA
     Django: GET /api/wishlist/
  ───────────────────────────────────── */
  const MOCK_WISHLIST = [
    { id:1, name:'Duck Confit',       cat:'French',   price:42, rating:4.9, img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
    { id:2, name:'Wagyu Gyoza',       cat:'Japanese', price:24, rating:4.8, img:'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80' },
    { id:3, name:'Crème Brûlée',      cat:'French',   price:13, rating:4.8, img:'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80' },
    { id:4, name:'Massaman Lamb',     cat:'Thai',     price:34, rating:4.9, img:'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80' },
    { id:5, name:'Miso Black Cod',    cat:'Japanese', price:46, rating:4.9, img:'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400&q=80' },
    { id:6, name:'Chocolate Fondant', cat:'Desserts', price:16, rating:4.9, img:'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
  ];

  /* ─────────────────────────────────────
     STATE
  ───────────────────────────────────── */
  let items = [];

  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  function init() {
    items = [...MOCK_WISHLIST];
    // Expose for base.js stat count
    window.WISHLIST_DATA = items;
    _render();
  }

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */
  function _render() {
    const grid  = document.getElementById('wishlistGrid');
    const empty = document.getElementById('wishlistEmpty');
    if (!grid) return;

    // Update saved count in hero stats
    const statEl = document.getElementById('statSaved');
    if (statEl) statEl.textContent = items.length;

    if (items.length === 0) {
      grid.classList.add('hidden');
      empty?.classList.remove('hidden');
      return;
    }
    grid.classList.remove('hidden');
    empty?.classList.add('hidden');

    grid.innerHTML = items.map(d => _wishCard(d)).join('');
  }

  /* ─────────────────────────────────────
     WISH CARD TEMPLATE
  ───────────────────────────────────── */
  function _wishCard(d) {
    return `
      <div class="border border-border rounded-[16px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lg bg-white"
        onclick="location.href='dish.html'">

        <!-- Image -->
        <div class="relative overflow-hidden h-[140px] bg-cream">
          <img
            src="${d.img}"
            alt="${d.name}"
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          />
          <!-- Fallback icon -->
          <div class="absolute inset-0 items-center justify-center hidden">
            <i class="fa-solid fa-utensils text-3xl text-border"></i>
          </div>

          <!-- Remove button -->
          <button
            onclick="event.stopPropagation(); WISHLIST.remove(${d.id}, this)"
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-[12px] text-red hover:bg-white transition shadow-sm"
            title="Remove from wishlist">
            <i class="fa-solid fa-heart"></i>
          </button>

          <!-- Category badge -->
          <div class="absolute bottom-2 left-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-[.1em] bg-gold/85 text-white">${d.cat}</span>
          </div>
        </div>

        <!-- Info -->
        <div class="p-3.5">
          <div class="flex items-start justify-between gap-2 mb-2">
            <p class="font-playfair text-[13px] font-bold text-ink leading-tight">${d.name}</p>
            <div class="flex items-center gap-1 flex-shrink-0 bg-cream border border-border rounded-full px-2 py-0.5">
              <i class="fa-solid fa-star text-gold text-[8px]"></i>
              <span class="text-[10px] font-bold text-gold">${d.rating}</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <p class="font-playfair text-base font-black text-ink">$${d.price}</p>
            <button
              onclick="event.stopPropagation(); WISHLIST.addToCart(${d.id})"
              class="text-white text-[9px] font-bold uppercase tracking-[.15em] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition hover:opacity-88"
              style="background:linear-gradient(135deg,#c0392b,#96281b)">
              <i class="fa-solid fa-plus text-[8px]"></i> Add
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ─────────────────────────────────────
     REMOVE ITEM
     Django: DELETE /api/wishlist/{id}/
  ───────────────────────────────────── */
  function remove(id, btn) {
    // Django: fetch(`/api/wishlist/${id}/`, { method:'DELETE', headers:{'X-CSRFToken':getCookie('csrftoken')} });

    const card = btn.closest('.border');
    card.style.transition = 'opacity .25s, transform .25s';
    card.style.opacity    = '0';
    card.style.transform  = 'scale(.92)';

    setTimeout(() => {
      items = items.filter(d => d.id !== id);
      window.WISHLIST_DATA = items;
      _render();
      BASE.showToast('Removed from wishlist');
    }, 260);
  }

  /* ─────────────────────────────────────
     ADD TO CART
     Django: POST /api/cart/  { dish_id: id }
  ───────────────────────────────────── */
  function addToCart(id) {
    const dish = items.find(d => d.id === id);
    if (!dish) return;
    BASE.showToast(`${dish.name} added to cart! 🛒`);
    // Django: fetch('/api/cart/', { method:'POST', body:JSON.stringify({ dish_id: id }), headers:{...} });
  }

  /* ─────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────── */
  return { init, remove, addToCart };

})();
