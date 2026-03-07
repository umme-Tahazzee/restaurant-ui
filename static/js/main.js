
        const navbar    = document.getElementById("navbar");
        const mobileMenu= document.getElementById("mobileMenu");
        const cartPanel = document.getElementById("cartPanel");
        const overlay   = document.getElementById("overlay");

        /* ── Navbar scroll ── */
        window.addEventListener("scroll", () => {
            if (window.scrollY > 40) {
                navbar.classList.add("scrolled");
                navbar.style.background = "rgba(255,255,255,0.97)";
            } else {
                navbar.classList.remove("scrolled");
                navbar.style.background = "rgba(255,255,255,0.0)";
            }
        });
        // Always show bg after first load
        setTimeout(() => {
            navbar.style.background = "rgba(255,255,255,0.97)";
        }, 0);

        /* ── Mobile menu ── */
        function toggleMenu() {
            const isHidden = mobileMenu.classList.contains("hidden");
            if (isHidden) {
                mobileMenu.classList.remove("hidden");
                mobileMenu.classList.add("flex");
                setTimeout(() => { mobileMenu.style.transform = "translateX(0)"; }, 10);
                showOverlay();
                document.body.style.overflow = "hidden";
            } else {
                mobileMenu.style.transform = "translateX(100%)";
                hideOverlay();
                document.body.style.overflow = "";
                setTimeout(() => {
                    mobileMenu.classList.add("hidden");
                    mobileMenu.classList.remove("flex");
                }, 500);
            }
        }

        /* ── Cart panel ── */
        function toggleCart() {
            const isOpen = cartPanel.classList.contains("open");
            if (!isOpen) {
                cartPanel.classList.add("open");
                showOverlay();
                document.body.style.overflow = "hidden";
                // Desktop page push
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

        /* ── Overlay helpers ── */
        function showOverlay() {
            overlay.style.pointerEvents = "auto";
            overlay.style.opacity = "1";
        }
        function hideOverlay() {
            overlay.style.opacity = "0";
            overlay.style.pointerEvents = "none";
        }
        function closeAll() {
            // Close mobile menu if open
            if (!mobileMenu.classList.contains("hidden")) toggleMenu();
            // Close cart if open
            if (cartPanel.classList.contains("open")) closeCart();
        }

        /* ── Qty buttons ── */
        function changeQty(btn, delta) {
            const row = btn.closest('.flex.items-center.gap-1');
            const span = row.querySelector('.qty-value');
            let val = parseInt(span.textContent) + delta;
            if (val < 1) val = 1;
            span.textContent = val;
        }

        /* ── Remove item ── */
        function removeItem(btn) {
            const item = btn.closest('.flex.gap-4');
            item.style.transition = "opacity 0.3s, transform 0.3s";
            item.style.opacity = "0";
            item.style.transform = "translateX(20px)";
            setTimeout(() => item.remove(), 300);
        }
   
