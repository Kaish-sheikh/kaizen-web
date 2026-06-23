// ============================
// GLOBAL CART SYSTEM
// ============================

function sanitize(str) {
    if (str === null || str === undefined) return '';
    const temp = document.createElement('div');
    temp.textContent = String(str);
    return temp.innerHTML;
}

let cart = safeParseCart();

function safeParseCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem('kaizen_cart')) || [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        localStorage.removeItem('kaizen_cart');
        return [];
    }
}

function buildCartKey(id, size) {
    return `${id}:${size || 'OS'}`;
}

function normalizeCartItem(item) {
    const dbProduct = getProductById(item.id);
    if (!dbProduct || !isProductAvailable(dbProduct)) return null;

    const size = item.size || getDefaultAvailableSize(dbProduct) || 'OS';
    const variant = getProductVariant(dbProduct, size);
    if (variant && Number(variant.stock) <= 0) return null;

    const maxQty = variant ? Number(variant.stock) : Number(dbProduct.inventory);
    const qty = Math.min(Math.max(1, parseInt(item.qty, 10) || 1), maxQty);

    return {
        key: buildCartKey(dbProduct.id, size),
        id: dbProduct.id,
        sku: dbProduct.sku,
        name: dbProduct.name,
        price: dbProduct.price,
        img: dbProduct.img,
        size,
        qty
    };
}

function saveCart() {
    cart = cart.map(normalizeCartItem).filter(Boolean);
    localStorage.setItem('kaizen_cart', JSON.stringify(cart));
}

function addToCart(id, selectedSize) {
    const dbProduct = getProductById(id);
    if (!dbProduct || !isProductAvailable(dbProduct)) {
        showToast('This piece is currently sold out.');
        return;
    }

    const size = selectedSize || getDefaultAvailableSize(dbProduct) || 'OS';
    const variant = getProductVariant(dbProduct, size);
    const maxQty = variant ? Number(variant.stock) : Number(dbProduct.inventory);

    if (variant && maxQty <= 0) {
        showToast(`Size ${sanitize(size)} is sold out.`);
        return;
    }

    const key = buildCartKey(dbProduct.id, size);
    const existing = cart.find(item => item.key === key);

    if (existing) {
        if (existing.qty >= maxQty) {
            showToast('You have reached available stock for this variant.');
            return;
        }
        existing.qty += 1;
    } else {
        cart.push({
            key,
            id: dbProduct.id,
            sku: dbProduct.sku,
            name: dbProduct.name,
            price: dbProduct.price,
            img: dbProduct.img,
            size,
            qty: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`${dbProduct.name} added to bag.`);
    openCart();
}

function removeFromCart(key) {
    cart = cart.filter(item => item.key !== key);
    saveCart();
    updateCartUI();
}

function updateQty(key, delta) {
    const item = cart.find(item => item.key === key);
    if (!item) return;

    const product = getProductById(item.id);
    const variant = getProductVariant(product, item.size);
    const maxQty = variant ? Number(variant.stock) : Number(product.inventory);
    const nextQty = item.qty + delta;

    if (nextQty <= 0) {
        removeFromCart(key);
        return;
    }

    if (nextQty > maxQty) {
        showToast('No more stock available for this variant.');
        return;
    }

    item.qty = nextQty;
    saveCart();
    updateCartUI();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
}

function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');

    if (!cartItemsContainer || !cartCount) return;

    saveCart();

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    cartCount.textContent = totalItems;
    cartCount.classList.toggle('show', totalItems > 0);

    if (cart.length === 0) {
        const shopHref = window.location.pathname.includes('index.html') || window.location.pathname === '/' ? '#products' : 'index.html#products';
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">空</span>
                <p>Your bag is empty</p>
                <a href="${shopHref}" class="btn-primary btn-sm" data-cart-close>START SHOPPING</a>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-cart-key="${sanitize(item.key)}">
                <a class="cart-item-img" href="product.html?id=${sanitize(item.id)}" aria-label="View ${sanitize(item.name)}">
                    <img src="${sanitize(item.img)}" alt="${sanitize(item.name)}">
                </a>
                <div class="cart-item-info">
                    <span class="cart-item-name">${sanitize(item.name)}</span>
                    <span class="cart-item-variant">Size ${sanitize(item.size)} · ${sanitize(item.sku)}</span>
                    <span class="cart-item-price">${formatPrice(item.price)}</span>
                    <div class="cart-item-controls" aria-label="Quantity controls">
                        <button class="qty-btn" data-cart-action="decrease" data-key="${sanitize(item.key)}" aria-label="Decrease quantity">−</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="qty-btn" data-cart-action="increase" data-key="${sanitize(item.key)}" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-cart-action="remove" data-key="${sanitize(item.key)}" aria-label="Remove ${sanitize(item.name)}">×</button>
            </div>
        `).join('');
        if (cartFooter) cartFooter.style.display = 'block';
    }

    if (cartTotalPrice) {
        cartTotalPrice.textContent = formatPrice(totalPrice);
    }

    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.href = 'checkout.html';
        checkoutBtn.textContent = 'PROCEED TO CHECKOUT';
    }
}

window.updateCartUI = updateCartUI;
window.closeCart = closeCart;
window.addToCart = addToCart;

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const cartBtn = document.getElementById('cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    document.body.addEventListener('click', (e) => {
        const addButton = e.target.closest('.btn-add-cart');
        if (addButton) {
            e.stopPropagation();
            e.preventDefault();
            addToCart(addButton.dataset.id, addButton.dataset.size);
            return;
        }

        const cartAction = e.target.closest('[data-cart-action]');
        if (cartAction) {
            const key = cartAction.dataset.key;
            if (cartAction.dataset.cartAction === 'increase') updateQty(key, 1);
            if (cartAction.dataset.cartAction === 'decrease') updateQty(key, -1);
            if (cartAction.dataset.cartAction === 'remove') removeFromCart(key);
            return;
        }

        if (e.target.closest('[data-cart-close]')) {
            closeCart();
        }
    });
});
