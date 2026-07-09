import { getProductById, isProductAvailable, getDefaultAvailableSize, getProductVariant, formatPrice } from './data.js';

const sanitize = (str) => {
    if (str === null || str === undefined) return '';
    const temp = document.createElement('div');
    temp.textContent = String(str);
    return temp.innerHTML;
};

function parseCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem('kaizen_cart')) || [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizeCheckoutCart(rawCart) {
    return rawCart.map(item => {
        const dbProduct = getProductById(item.id);
        if (!dbProduct || !isProductAvailable(dbProduct)) return null;

        const size = item.size || getDefaultAvailableSize(dbProduct) || 'OS';
        const variant = getProductVariant(dbProduct, size);
        if (variant && Number(variant.stock) <= 0) return null;

        const maxQty = variant ? Number(variant.stock) : Number(dbProduct.inventory);
        const qty = Math.min(Math.max(1, parseInt(item.qty, 10) || 1), maxQty);

        return {
            key: `${dbProduct.id}:${size}`,
            id: dbProduct.id,
            sku: dbProduct.sku,
            name: dbProduct.name,
            price: dbProduct.price,
            img: dbProduct.img,
            size,
            qty
        };
    }).filter(Boolean);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('kaizen_theme');
    const themeToggle = document.getElementById('theme-toggle');
    if (savedTheme === 'light') document.documentElement.classList.add('theme-light');
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', document.documentElement.classList.contains('theme-light'));
        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.classList.toggle('theme-light');
            localStorage.setItem('kaizen_theme', isLight ? 'light' : 'dark');
            themeToggle.setAttribute('aria-pressed', String(isLight));
        });
    }

    const secureCart = normalizeCheckoutCart(parseCart());
    localStorage.setItem('kaizen_cart', JSON.stringify(secureCart));

    if (secureCart.length === 0) {
        document.querySelector('.checkout-page').innerHTML = `
            <div style="text-align:center; padding: 100px 20px;">
                <h2>YOUR BAG IS EMPTY</h2>
                <p style="color: var(--text-secondary); margin-top: 1rem;">Add a piece before starting checkout.</p>
                <a href="index.html#products" class="btn-primary" style="margin-top:2rem">RETURN TO SHOP</a>
            </div>
        `;
        return;
    }

    const itemsContainer = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const form = document.getElementById('checkout-form');
    const errorMsg = document.getElementById('form-error');
    let total = 0;

    itemsContainer.innerHTML = secureCart.map(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
            <div class="checkout-summary-item">
                <img src="${sanitize(item.img)}" alt="${sanitize(item.name)}" class="summary-img">
                <div class="summary-details">
                    <span class="summary-name">${sanitize(item.name)}</span>
                    <span class="summary-qty">Size ${sanitize(item.size)} · Qty ${item.qty} · ${sanitize(item.sku)}</span>
                </div>
                <span class="summary-price">${formatPrice(itemTotal)}</span>
            </div>
        `;
    }).join('');

    subtotalEl.textContent = formatPrice(total);
    totalEl.textContent = formatPrice(total);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            errorMsg.style.display = 'block';
            form.reportValidity();
            return;
        }

        errorMsg.style.display = 'none';

        const formData = new FormData(form);
        const orderId = `KZN-${Date.now().toString().slice(-8)}`;
        const order = {
            id: orderId,
            createdAt: new Date().toISOString(),
            items: secureCart,
            total,
            customer: Object.fromEntries(formData.entries())
        };

        localStorage.setItem('kaizen_last_order', JSON.stringify(order));
        localStorage.removeItem('kaizen_cart');

        const btn = form.querySelector('.btn-submit');
        btn.innerHTML = 'PROCESSING...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        setTimeout(() => {
            document.getElementById('success-copy').textContent = `Order ${orderId} is confirmed. KAIZEN will contact you shortly for final dispatch details.`;
            document.getElementById('success-screen').classList.add('active');
        }, 900);
    });
});
