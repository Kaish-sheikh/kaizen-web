const products = [
    {
        id: '1',
        sku: 'KZN-JRS-001',
        name: 'Jersey Tee #01',
        desc: 'White and black colorblock jersey tee with number "1" print. Premium mesh material with contrast sleeves. A clean, sporty look for everyday wear.',
        price: 549,
        compareAtPrice: 699,
        category: 'jerseys',
        collection: 'Summer Drop',
        brand: 'KAIZEN',
        tag: 'JERSEY',
        tags: ['jersey', 'mesh', 'colorblock'],
        material: 'Breathable poly mesh',
        img: 'images/product1.png',
        badge: 'SOLD OUT',
        badgeClass: 'sold-out',
        available: false,
        inventory: 0,
        rating: 4.7,
        reviewCount: 18,
        isNew: false,
        isBestSeller: true,
        colors: ['White', 'Black'],
        sizes: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }]
    },
    {
        id: '2',
        sku: 'KZN-JRS-032',
        name: 'Basketball Jersey #32',
        desc: 'Black mesh basketball jersey with bold #32 in white. Breathable fabric, oversized fit. Perfect for that court-to-street transition.',
        price: 449,
        category: 'jerseys',
        collection: 'Summer Drop',
        brand: 'KAIZEN',
        tag: 'JERSEY',
        tags: ['jersey', 'basketball', 'mesh'],
        material: 'Lightweight sports mesh',
        img: 'images/product2.png',
        badge: 'NEW',
        badgeClass: 'new',
        available: true,
        inventory: 9,
        rating: 4.8,
        reviewCount: 24,
        isNew: true,
        isBestSeller: true,
        colors: ['Black', 'White'],
        sizes: [{ size: 'S', stock: 2 }, { size: 'M', stock: 3 }, { size: 'L', stock: 3 }, { size: 'XL', stock: 1 }]
    },
    {
        id: '3',
        sku: 'KZN-BTM-042',
        name: 'Baggy Shaded Jeans',
        desc: 'Dark wash baggy fit jeans with subtle sun-bleach shading effect. Length 42. Available in multiple waist sizes. Original stock, not thrift.',
        price: 900,
        category: 'bottoms',
        collection: 'Core Street',
        brand: 'KAIZEN',
        tag: 'BOTTOMS',
        tags: ['denim', 'baggy', 'wide-leg'],
        material: 'Heavy cotton denim',
        img: 'images/product3.png',
        badge: 'HOT',
        badgeClass: 'hot',
        available: true,
        inventory: 11,
        rating: 4.9,
        reviewCount: 31,
        isNew: false,
        isBestSeller: true,
        colors: ['Dark Wash'],
        sizes: [{ size: '26', stock: 1 }, { size: '28', stock: 2 }, { size: '30', stock: 3 }, { size: '32', stock: 3 }, { size: '34', stock: 0 }, { size: '36', stock: 2 }]
    },
    {
        id: '4',
        sku: 'KZN-TEE-BUL',
        name: 'Chicago Bulls Vintage Tee',
        desc: 'Black oversized graphic tee featuring iconic Chicago Bulls Dennis Rodman collage artwork. Vintage-style print on heavyweight cotton.',
        price: 500,
        category: 'tees',
        collection: 'Graphic Rotation',
        brand: 'KAIZEN',
        tag: 'GRAPHIC TEE',
        tags: ['graphic', 'oversized', 'cotton'],
        material: 'Heavyweight cotton',
        img: 'images/product4.png',
        badge: 'NEW',
        badgeClass: 'new',
        available: true,
        inventory: 7,
        rating: 4.6,
        reviewCount: 16,
        isNew: true,
        isBestSeller: false,
        colors: ['Black'],
        sizes: [{ size: 'S', stock: 1 }, { size: 'M', stock: 2 }, { size: 'L', stock: 3 }, { size: 'XL', stock: 1 }]
    },
    {
        id: '5',
        sku: 'KZN-BTM-TRK',
        name: 'Layered Baggy Tracks',
        desc: 'Cream baggy track pants with black piping detail on both sides. Elastic drawstring waist and a wide-leg silhouette for clean streetwear styling.',
        price: 600,
        category: 'bottoms',
        collection: 'Core Street',
        brand: 'KAIZEN',
        tag: 'TRACKS',
        tags: ['tracks', 'baggy', 'piping'],
        material: 'Soft poly-cotton blend',
        img: 'images/product5.png',
        badge: 'NEW',
        badgeClass: 'new',
        available: true,
        inventory: 8,
        rating: 4.7,
        reviewCount: 19,
        isNew: true,
        isBestSeller: false,
        colors: ['Cream', 'Black'],
        sizes: [{ size: 'S', stock: 2 }, { size: 'M', stock: 2 }, { size: 'L', stock: 3 }, { size: 'XL', stock: 1 }]
    },
    {
        id: '6',
        sku: 'KZN-OUT-SUE',
        name: 'Suede Utility Jacket',
        desc: 'Premium black suede utility jacket with snap button closure and quilted lining. Multiple cargo pockets, metal zipper, and a structured outerwear shape.',
        price: 6000,
        category: 'outerwear',
        collection: 'Premium Edit',
        brand: 'KAIZEN',
        tag: 'OUTERWEAR',
        tags: ['jacket', 'suede', 'premium'],
        material: 'Faux suede with quilted lining',
        img: 'images/product6.png',
        badge: 'PREMIUM',
        badgeClass: 'premium',
        available: true,
        inventory: 2,
        rating: 5,
        reviewCount: 8,
        isNew: false,
        isBestSeller: false,
        colors: ['Black'],
        sizes: [{ size: 'M', stock: 1 }, { size: 'L', stock: 1 }, { size: 'XL', stock: 0 }]
    }
];

function getProductById(id) {
    return products.find(p => p.id === String(id));
}

function getAllProducts() {
    return products;
}

function getProductVariant(product, size) {
    if (!product || !Array.isArray(product.sizes)) return null;
    return product.sizes.find(variant => String(variant.size) === String(size));
}

function isProductAvailable(product) {
    if (!product) return false;
    return product.available && Number(product.inventory) > 0;
}

function getDefaultAvailableSize(product) {
    if (!product || !Array.isArray(product.sizes)) return null;
    const variant = product.sizes.find(size => Number(size.stock) > 0);
    return variant ? String(variant.size) : null;
}

function formatPrice(price) {
    return '₹' + Number(price || 0).toLocaleString('en-IN');
}
