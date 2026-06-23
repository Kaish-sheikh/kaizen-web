// ============================
// KAIZEN 改善 - INTERACTIVITY
// ============================

window.sanitize = window.sanitize || function (str) {
    if (str === null || str === undefined) return '';
    const temp = document.createElement('div');
    temp.textContent = String(str);
    return temp.innerHTML;
};

document.addEventListener('DOMContentLoaded', () => {
    const productState = {
        category: 'all',
        query: '',
        sort: 'featured',
        inStockOnly: false
    };

    // ============================
    // PRELOADER
    // ============================
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 900);
        });
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 2500);
    }

    // ============================
    // THEME TOGGLE
    // ============================
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('kaizen_theme');
    if (savedTheme === 'light') document.documentElement.classList.add('theme-light');

    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', document.documentElement.classList.contains('theme-light'));
        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.classList.toggle('theme-light');
            localStorage.setItem('kaizen_theme', isLight ? 'light' : 'dark');
            themeToggle.setAttribute('aria-pressed', String(isLight));
        });
    }

    // ============================
    // CUSTOM CURSOR
    // ============================
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (cursor && follower && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 4 + 'px';
            cursor.style.top = e.clientY - 4 + 'px';
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        });

        const setupHoverTargets = () => {
            const hoverTargets = document.querySelectorAll('a, button, .product-card, .drop-card, select, input');
            hoverTargets.forEach(el => {
                el.addEventListener('mouseenter', () => follower.classList.add('hover'));
                el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
            });
        };
        setupHoverTargets();
        window.addEventListener('productsLoaded', setupHoverTargets);
    }

    // ============================
    // NAVBAR SCROLL BEHAVIOR
    // ============================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.pageYOffset > 50);
        });
    }

    // ============================
    // MOBILE MENU
    // ============================
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const bottomCartBtn = document.getElementById('bottom-cart-btn');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    if (bottomCartBtn) {
        bottomCartBtn.addEventListener('click', () => {
            const cartBtn = document.getElementById('cart-btn');
            if (cartBtn) cartBtn.click();
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
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    // ============================
    // DYNAMIC PRODUCT RENDERING
    // ============================
    const productsGrid = document.getElementById('products-grid');
    const productCount = document.getElementById('product-count');
    const searchInput = document.getElementById('product-search');
    const sortSelect = document.getElementById('product-sort');
    const stockToggle = document.getElementById('stock-toggle');

    function productMatches(product) {
        const searchable = [
            product.name,
            product.desc,
            product.category,
            product.collection,
            product.tag,
            product.material,
            ...(product.tags || [])
        ].join(' ').toLowerCase();

        const matchesCategory = productState.category === 'all' || product.category === productState.category;
        const matchesSearch = !productState.query || searchable.includes(productState.query.toLowerCase());
        const matchesStock = !productState.inStockOnly || isProductAvailable(product);

        return matchesCategory && matchesSearch && matchesStock;
    }

    function sortProducts(list) {
        return [...list].sort((a, b) => {
            if (productState.sort === 'price-asc') return a.price - b.price;
            if (productState.sort === 'price-desc') return b.price - a.price;
            if (productState.sort === 'new') return Number(b.isNew) - Number(a.isNew);
            if (productState.sort === 'rating') return b.rating - a.rating;
            return Number(b.isBestSeller) - Number(a.isBestSeller) || Number(b.isNew) - Number(a.isNew);
        });
    }

    function renderProductCard(product, index) {
        const available = isProductAvailable(product);
        const defaultSize = getDefaultAvailableSize(product);
        const badgeHtml = product.badge
            ? `<span class="product-badge ${sanitize(product.badgeClass)}">${sanitize(product.badge)}</span>`
            : '';

        const sizeHtml = Array.isArray(product.sizes)
            ? `<div class="product-sizes" aria-label="Available sizes">
                ${product.sizes.map(size => `<span class="size ${Number(size.stock) > 0 ? 'available' : 'sold-out-size'}">${sanitize(size.size)}</span>`).join('')}
              </div>`
            : '';

        const actionHtml = available
            ? `<button class="btn-add-cart" data-id="${sanitize(product.id)}" data-size="${sanitize(defaultSize)}">ADD TO BAG</button>`
            : `<button class="btn-add-cart is-disabled" disabled>SOLD OUT</button>`;

        const stockLabel = available
            ? `<span class="product-stock ${product.inventory <= 3 ? 'low' : ''}">${product.inventory <= 3 ? `Only ${product.inventory} left` : 'In stock'}</span>`
            : '<span class="product-stock sold">Sold out</span>';

        return `
            <article class="product-card" data-category="${sanitize(product.category)}" data-animation="reveal" style="--delay: ${index * 0.05}s">
                <div class="product-img-wrapper">
                    <img src="${sanitize(product.img)}" alt="${sanitize(product.name)}" loading="lazy" decoding="async">
                    <div class="product-overlay">
                        <a href="product.html?id=${sanitize(product.id)}" class="btn-quick-view">VIEW PRODUCT</a>
                        ${actionHtml}
                    </div>
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <div class="product-kicker">
                        <span>${sanitize(product.collection)}</span>
                        ${stockLabel}
                    </div>
                    <h3 class="product-name">${sanitize(product.name)}</h3>
                    <p class="product-desc">${sanitize(product.desc).slice(0, 72)}${product.desc.length > 72 ? '...' : ''}</p>
                    <div class="product-rating" aria-label="${product.rating} out of 5 stars">
                        <span>★ ${product.rating.toFixed(1)}</span>
                        <span>${product.reviewCount} reviews</span>
                    </div>
                    <div class="product-meta">
                        <span class="product-price">${formatPrice(product.price)}</span>
                        <span class="product-tag">${sanitize(product.tag)}</span>
                    </div>
                    ${sizeHtml}
                </div>
            </article>
        `;
    }

    function renderProducts() {
        if (!productsGrid || typeof getAllProducts !== 'function') return;

        productsGrid.classList.add('is-loading');
        productsGrid.innerHTML = Array.from({ length: 4 }, () => '<div class="product-skeleton"></div>').join('');

        window.setTimeout(() => {
            const visibleProducts = sortProducts(getAllProducts().filter(productMatches));

            if (productCount) {
                productCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'piece' : 'pieces'}`;
            }

            productsGrid.classList.remove('is-loading');
            productsGrid.innerHTML = visibleProducts.length
                ? visibleProducts.map(renderProductCard).join('')
                : `<div class="products-empty">
                    <span>空</span>
                    <h3>No pieces found</h3>
                    <p>Try a different search, category, or stock filter.</p>
                  </div>`;

            window.dispatchEvent(new Event('productsLoaded'));
            setupProductCards();
            setupScrollAnimations();
        }, 180);
    }

    function setupProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('a, button')) {
                    const link = card.querySelector('.btn-quick-view');
                    if (link && link.href) window.location.href = link.href;
                }
            });
        });
    }

    if (productsGrid) {
        renderProducts();
    }

    // ============================
    // PRODUCT FILTERS
    // ============================
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            productState.category = btn.dataset.filter;
            renderProducts();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            productState.query = searchInput.value.trim();
            renderProducts();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            productState.sort = sortSelect.value;
            renderProducts();
        });
    }

    if (stockToggle) {
        stockToggle.addEventListener('change', () => {
            productState.inStockOnly = stockToggle.checked;
            renderProducts();
        });
    }

    // ============================
    // SCROLL ANIMATIONS
    // ============================
    let revealObserver;
    function setupScrollAnimations() {
        if (revealObserver) revealObserver.disconnect();

        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

        document.querySelectorAll('[data-animation="reveal"]').forEach(el => revealObserver.observe(el));
    }
    setupScrollAnimations();

    // ============================
    // COUNTER ANIMATION
    // ============================
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target, 10);
                const numberEl = entry.target.querySelector('.stat-number');
                if (!numberEl || Number.isNaN(target)) return;

                animateCounter(numberEl, 0, target, 2000);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-animation="counter"]').forEach(el => counterObserver.observe(el));

    function animateCounter(el, start, end, duration) {
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(start + (end - start) * easeProgress) + '+';
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ============================
    // PARALLAX ON HERO
    // ============================
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    const navLinks = document.querySelectorAll('.nav-links a, .bottom-nav a');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                if (window.pageYOffset >= section.offsetTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                const href = link.getAttribute('href') || '';
                link.classList.toggle('active', href === `#${current}` || href.endsWith(`#${current}`));
            });
        });
    }
});
