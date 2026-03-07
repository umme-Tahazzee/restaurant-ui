document.addEventListener("DOMContentLoaded", () => {

const navbar     = document.getElementById("navbar");
const mobileMenu = document.getElementById("mobileMenu");
const cartPanel  = document.getElementById("cartPanel");
const overlay    = document.getElementById("overlay");

/* ─────────────────────────
   Navbar Scroll Effect
───────────────────────── */
window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});

/* ─────────────────────────
   Mobile Menu Toggle
───────────────────────── */
window.toggleMenu = function () {

    const isHidden = mobileMenu.classList.contains("hidden");

    if (isHidden) {

        mobileMenu.classList.remove("hidden");
        mobileMenu.classList.add("flex");

        requestAnimationFrame(() => {
            mobileMenu.style.transform = "translateX(0)";
        });

        showOverlay();
        document.body.style.overflow = "hidden";

    } else {

        mobileMenu.style.transform = "translateX(100%)";

        setTimeout(() => {
            mobileMenu.classList.add("hidden");
            mobileMenu.classList.remove("flex");
        }, 400);

        hideOverlay();
        document.body.style.overflow = "";

    }

}

/* ─────────────────────────
   Cart Panel Toggle
───────────────────────── */
window.toggleCart = function () {

    const isOpen = cartPanel.classList.contains("open");

    if (!isOpen) {

        cartPanel.classList.add("open");
        showOverlay();
        document.body.style.overflow = "hidden";

        if (window.innerWidth >= 768) {
            document.body.classList.add("cart-open");
        }

    } else {

        closeCart();

    }

}

function closeCart() {

    cartPanel.classList.remove("open");
    hideOverlay();

    document.body.style.overflow = "";
    document.body.classList.remove("cart-open");

}

/* ─────────────────────────
   Overlay Control
───────────────────────── */
function showOverlay() {

    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";

}

function hideOverlay() {

    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";

}

overlay.addEventListener("click", closeAll);

/* ─────────────────────────
   Close Everything
───────────────────────── */
function closeAll() {

    if (!mobileMenu.classList.contains("hidden")) {
        mobileMenu.style.transform = "translateX(100%)";

        setTimeout(() => {
            mobileMenu.classList.add("hidden");
            mobileMenu.classList.remove("flex");
        }, 400);
    }

    if (cartPanel.classList.contains("open")) {
        closeCart();
    }

}

/* ─────────────────────────
   ESC Key Close
───────────────────────── */
document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
        closeAll();
    }

});

/* ─────────────────────────
   Window Resize Fix
───────────────────────── */
window.addEventListener("resize", () => {

    if (window.innerWidth >= 768) {

        mobileMenu.classList.add("hidden");
        mobileMenu.classList.remove("flex");
        mobileMenu.style.transform = "translateX(100%)";

        document.body.style.overflow = "";

    }

});

/* ─────────────────────────
   Quantity Buttons
───────────────────────── */
window.changeQty = function (btn, delta) {

    const row  = btn.closest('.flex.items-center.gap-1');
    const span = row.querySelector('.qty-value');

    let val = parseInt(span.textContent) + delta;

    if (val < 1) val = 1;

    span.textContent = val;

}

/* ─────────────────────────
   Remove Cart Item
───────────────────────── */
window.removeItem = function (btn) {

    const item = btn.closest('.flex.gap-4');

    item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    item.style.opacity = "0";
    item.style.transform = "translateX(30px)";

    setTimeout(() => {
        item.remove();
    }, 300);

}

});