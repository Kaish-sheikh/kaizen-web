// ============================
// GLOBAL CART SYSTEM
// ============================

// Basic XSS sanitizer
function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

let cart = JSON.parse(localStorage.getItem('kaizen_cart')) || [];

function saveCart() {
    // SECURITY: Revalidate cart items against the database before saving to ensure prices aren't tampered with
    const validatedCart = cart.map(item => {
        const dbProduct = getProductById(item.id);
        if (dbProduct) {
            return { ...item, price: dbProduct.price, name: dbProduct.name }; // enforce DB price and name
        }
        return item;
    }).filter(item => getProductById(item.id)); // remove items that don't exist in DB anymore

    localStorage.setItem('kaizen_cart', JSON.stringify(validatedCart));
}

function addToCart(id, name, price, img) {
    const dbProduct = getProductById(id);
    if (!dbProduct) return; // SECURITY: Prevent adding non-existent products

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        // SECURITY: ignore the `price` passed from frontend and use dbProduct.price
        cart.push({ id, name: dbProduct.name, price: dbProduct.price, img: dbProduct.img, qty: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`${sanitize(dbProduct.name)} added to bag!`);
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateQty(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
            return;
        }
    }
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

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update cart count badge
    cartCount.textContent = totalItems;
    if (totalItems > 0) {
        cartCount.classList.add('show');
    } else {
        cartCount.classList.remove('show');
    }

    // Update cart items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">空</span>
                <p>Your bag is empty</p>
                <a href="${window.location.pathname.includes('index.html') || window.location.pathname === '/' ? '#products' : 'index.html#products'}" class="btn-primary btn-sm" onclick="closeCart()">START SHOPPING</a>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${sanitize(item.img)}" alt="${sanitize(item.name)}">
                </div>
                <div class="cart-item-info">
                    <span class="cart-item-name">${sanitize(item.name)}</span>
                    <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</span>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateQty('${sanitize(item.id)}', -1)">−</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty('${sanitize(item.id)}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${sanitize(item.id)}')">×</button>
            </div>
        `).join('');
        if (cartFooter) cartFooter.style.display = 'block';
    }

    // Update total price
    if (cartTotalPrice) {
        cartTotalPrice.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }

    // Update WhatsApp checkout link (fallback) and checkout page link
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        // Change checkout link to our mock checkout page instead of WhatsApp directly
        checkoutBtn.href = "checkout.html";
        checkoutBtn.textContent = "PROCEED TO CHECKOUT";
        // Ensure SVG is kept or add it manually if needed, but simple text is fine.
    }
}

// Global scope for inline onclicks
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
window.closeCart = closeCart;

// Init UI on load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    // Setup Cart Listeners
    const cartBtn = document.getElementById('cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    
    if(cartBtn) cartBtn.addEventListener('click', openCart);
    if(cartClose) cartClose.addEventListener('click', closeCart);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCart);
    
    // Add to cart listeners for any buttons already in DOM
    document.body.addEventListener('click', (e) => {
        if(e.target.closest('.btn-add-cart')) {
            const btn = e.target.closest('.btn-add-cart');
            e.stopPropagation();
            e.preventDefault();
            const { id, name, price, img } = btn.dataset;
            addToCart(id, name, price, img);
        }
    });
});
