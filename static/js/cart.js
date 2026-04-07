/* ═══════════════════════════════════════════════════════════════
   CART.JS — Inline +/− Counter for Menu Cards
   Depends on: savoria-app.js (addToCart, cart, saveCart, renderCart, showToast)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

function firstAdd(name, price, counterId, btnId, img) {

  
  if (!img) {
    const btn   = document.getElementById(btnId);
    const card  = btn?.closest('.menu-card, .dish-card, .app-dish-card');
    const imgEl = card?.querySelector('img');
    img = imgEl?.src || 'assets/thai.png';
  }

  const existing = cart.find(i => i.name === name);
  if (!existing) {
    cart.push({ name, price, qty: 1, img });
  }

  saveCart();
  renderCart(); 
}


function changeQty(name, price, delta, counterId) {
  const itemInCart = cart.find(item => item.name === name);

  if (!itemInCart && delta > 0) {
    addToCart(name, price);
    return;
  }

  if (itemInCart) {
    let newQty = itemInCart.qty + delta;

    if (newQty <= 0) {

      const idx = cart.findIndex(i => i.name === name);
      if (idx !== -1) {
        cart.splice(idx, 1);
        saveCart();
        renderCart();
      }
    } else {
      itemInCart.qty = newQty;
      saveCart();
      renderCart();
    }
  }
}
