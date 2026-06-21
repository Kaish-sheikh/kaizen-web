// ============================
// KAIZEN 改善 — INTERACTIVITY
// ============================

// A simple global sanitize function to avoid XSS
window.sanitize = window.sanitize || function (str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

document.addEventListener('DOMContentLoaded', () => {
    // ============================
    // PRELOADER
    // ============================
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 2200);
        });
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 4000);
    }

    // ============================
    // CUSTOM CURSOR
    // ============================
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;

    if (cursor && follower && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX - 4 + 'px';
            cursor.style.top = mouseY - 4 + 'px';
            follower.style.left = mouseX + 'px';
            follower.style.top = mouseY + 'px';
        });

        const setupHoverTargets = () => {
            const hoverTargets = document.querySelectorAll('a, button, .product-card, .drop-card');
            hoverTargets.forEach(el => {
                el.addEventListener('mouseenter', () => follower.classList.add('hover'));
                el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
            });
        };
        setupHoverTargets();
        // Re-run after dynamic content loading
        window.addEventListener('productsLoaded', setupHoverTargets);
    }

    // ============================
    // NAVBAR SCROLL BEHAVIOR
    // ============================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    if (navbar) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        });
    }

    // ============================
    // MOBILE MENU
    // ============================
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================
    // SMOOTH SCROLL FOR ANCHORS
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================
    // DYNAMIC PRODUCT RENDERING
    // ============================
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid && typeof getAllProducts === 'function') {
        const products = getAllProducts();

        productsGrid.innerHTML = products.map((product, index) => {
            let badgeHtml = '';
            if (product.badge) {
                badgeHtml = `<span class="product-badge ${sanitize(product.badgeClass)}">${sanitize(product.badge)}</span>`;
            }

            return `
                <div class="product-card" data-category="${sanitize(product.category)}" data-animation="reveal" style="--delay: ${index * 0.05}s">
                    <div class="product-img-wrapper">
                        <img src="${sanitize(product.img)}" alt="${sanitize(product.name)}" loading="lazy">
                        <div class="product-overlay">
                            <a href="product.html?id=${sanitize(product.id)}" class="btn-quick-view" style="text-align:center; text-decoration:none; display:flex; justify-content:center; align-items:center;">VIEW PRODUCT</a>
                            <button class="btn-add-cart" data-id="${sanitize(product.id)}" data-name="${sanitize(product.name)}" data-price="${product.price}" data-img="${sanitize(product.img)}">ADD TO BAG</button>
                        </div>
                        ${badgeHtml}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${sanitize(product.name)}</h3>
                        <p class="product-desc">${sanitize(product.desc).substring(0, 40)}...</p>
                        <div class="product-meta">
                            <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
                            <span class="product-tag">${sanitize(product.tag)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        window.dispatchEvent(new Event('productsLoaded'));

        // Make entire product card clickable
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-add-cart')) {
                    const link = card.querySelector('.btn-quick-view');
                    if (link && link.href) {
                        window.location.href = link.href;
                    }
                }
            });
        });
    }

    // ============================
    // PRODUCT FILTER
    // ============================
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                const productCards = document.querySelectorAll('.product-card');

                productCards.forEach((card, index) => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.classList.remove('hidden');
                        card.style.animation = `fadeUp 0.4s ease ${index * 0.05}s forwards`;
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // ============================
    // SCROLL ANIMATIONS
    // ============================
    const setupScrollAnimations = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-animation="reveal"]').forEach(el => {
            revealObserver.observe(el);
        });
    };
    setupScrollAnimations();
    window.addEventListener('productsLoaded', setupScrollAnimations);

    // ============================
    // COUNTER ANIMATION
    // ============================
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                const numberEl = entry.target.querySelector('.stat-number');
                if (!numberEl || isNaN(target)) return;

                animateCounter(numberEl, 0, target, 2000);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-animation="counter"]').forEach(el => {
        counterObserver.observe(el);
    });

    function animateCounter(el, start, end, duration) {
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            const current = Math.floor(start + (end - start) * easeProgress);

            el.textContent = current + '+';

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // ============================
    // PARALLAX ON HERO (subtle)
    // ============================
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
                heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
            }
        });
    }

    // ============================
    // NAV LINK ACTIVE STATE
    // ============================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 200;
                if (window.pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === `#${ current } `) {
                    link.style.color = 'var(--accent-warm)';
                }
            });
        });
    }
});
