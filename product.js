import { getProductById, getAllProducts, isProductAvailable, getDefaultAvailableSize, formatPrice } from './data.js';
import { sanitize, updateCartUI } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const root = document.getElementById('product-root');

    function renderNotFound() {
        root.innerHTML = '<div class="not-found"><h1>404</h1><p>Product not found.</p><a href="index.html#products" class="btn-primary" style="margin-top:2rem">RETURN TO SHOP</a></div>';
    }

    if (!productId || typeof getProductById !== 'function') {
        renderNotFound();
        return;
    }

    const product = getProductById(productId);
    if (!product) {
        renderNotFound();
        return;
    }

    const available = isProductAvailable(product);
    const defaultSize = getDefaultAvailableSize(product);
    document.title = `KAIZEN 改善 - ${product.name}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', product.desc);

    const badgeHtml = product.badge
        ? `<span class="product-badge ${sanitize(product.badgeClass)} pdp-badge">${sanitize(product.badge)}</span>`
        : '';

    const sizesHtml = Array.isArray(product.sizes)
        ? product.sizes.map(size => {
            const disabled = Number(size.stock) <= 0 ? 'disabled' : '';
            const active = String(size.size) === String(defaultSize) ? 'active' : '';
            return `<button class="size-btn ${active}" ${disabled} data-size="${sanitize(size.size)}" data-stock="${Number(size.stock)}">${sanitize(size.size)}</button>`;
        }).join('')
        : '<button class="size-btn active" data-size="OS" data-stock="99">OS</button>';

    const addToCartBtnState = available
        ? `<button class="btn-primary btn-add-cart" id="pdp-add-cart" data-id="${sanitize(product.id)}" data-size="${sanitize(defaultSize)}">ADD TO BAG</button>`
        : '<button class="btn-primary" disabled style="opacity: 0.5; cursor: not-allowed;">SOLD OUT</button>';

    const related = getAllProducts()
        .filter(item => item.id !== product.id && (item.category === product.category || item.collection === product.collection))
        .slice(0, 3);

    // Build related section HTML separately to avoid nested template literal issues
    let relatedHtml = '';
    if (related.length) {
        const cards = related.map(item => {
            const badgeTag = item.badge
                ? `<span class="product-badge ${sanitize(item.badgeClass)}">${sanitize(item.badge)}</span>`
                : '';
            return `<a class="product-card" href="product.html?id=${sanitize(item.id)}">
                <div class="product-img-wrapper">
                    <img src="${sanitize(item.img)}" alt="${sanitize(item.name)}" loading="lazy" decoding="async">
                    ${badgeTag}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${sanitize(item.name)}</h3>
                    <div class="product-meta">
                        <span class="product-price">${formatPrice(item.price)}</span>
                        <span class="product-tag">${sanitize(item.tag)}</span>
                    </div>
                </div>
            </a>`;
        }).join('');

        relatedHtml = `<section class="related-section">
            <h2>RELATED PIECES</h2>
            <div class="related-grid">${cards}</div>
        </section>`;
    }

    // Build JSON-LD separately
    const schemaData = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.img,
        description: product.desc,
        sku: product.sku,
        brand: { '@type': 'Brand', name: product.brand },
        offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price,
            availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount
        }
    });

    root.innerHTML = `
        <div class="breadcrumb"><a href="index.html#products">Shop</a> / ${sanitize(product.category)} / ${sanitize(product.name)}</div>
        <div class="pdp-container">
            <div class="pdp-image-container">
                ${badgeHtml}
                <img src="${sanitize(product.img)}" alt="${sanitize(product.name)}" decoding="async">
            </div>
            <div class="pdp-details">
                <span class="pdp-tag">${sanitize(product.collection)} / ${sanitize(product.tag)}</span>
                <h1 class="pdp-title">${sanitize(product.name)}</h1>
                <div class="pdp-price">${formatPrice(product.price)}</div>
                <div class="pdp-rating">
                    <span>★ ${product.rating.toFixed(1)}</span>
                    <span>${product.reviewCount} reviews</span>
                </div>
                <div class="pdp-desc">${sanitize(product.desc)}</div>
                <div class="pdp-meta-grid">
                    <div class="pdp-meta-item"><span>SKU</span><strong>${sanitize(product.sku)}</strong></div>
                    <div class="pdp-meta-item"><span>Material</span><strong>${sanitize(product.material)}</strong></div>
                    <div class="pdp-meta-item"><span>Inventory</span><strong>${available ? product.inventory + ' available' : 'Sold out'}</strong></div>
                    <div class="pdp-meta-item"><span>Color</span><strong>${sanitize(product.colors.join(', '))}</strong></div>
                </div>
                <div class="pdp-sizes">
                    <h4>SELECT SIZE</h4>
                    <div class="size-options">${sizesHtml}</div>
                    <p class="variant-note" id="variant-note">${available ? 'Choose your size before adding to bag.' : 'This piece is sold out.'}</p>
                </div>
                <div class="pdp-actions">${addToCartBtnState}</div>
                <div class="pdp-info-panels">
                    <div class="pdp-info-panel">Free shipping support over WhatsApp. Orders are confirmed before dispatch.</div>
                    <div class="pdp-info-panel">Need fit help? DM us your height and preferred silhouette.</div>
                </div>
            </div>
        </div>
        ${relatedHtml}
    `;

    // Inject JSON-LD schema into head
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = schemaData;
    document.head.appendChild(schemaScript);

    const note = document.getElementById('variant-note');
    const addButton = document.getElementById('pdp-add-cart');
    const sizeBtns = root.querySelectorAll('.size-btn:not(:disabled)');

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(button => button.classList.remove('active'));
            btn.classList.add('active');
            if (addButton) addButton.dataset.size = btn.dataset.size;
            if (note) note.textContent = `${btn.dataset.stock} in stock for size ${btn.dataset.size}.`;
        });
    });

    if (defaultSize && note) {
        const selected = root.querySelector(`.size-btn[data-size="${CSS.escape(defaultSize)}"]`);
        if (selected) note.textContent = `${selected.dataset.stock} in stock for size ${defaultSize}.`;
    }

    if (typeof updateCartUI === 'function') updateCartUI();
});
