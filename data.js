const products = [
    {
        id: '1',
        name: 'Jersey Tee #01',
        desc: 'White & black colorblock jersey tee with number "1" print. Premium mesh material with contrast sleeves. A clean, sporty look for everyday wear.',
        price: 549,
        category: 'jerseys',
        tag: 'JERSEY',
        img: 'images/product1.png',
        badge: 'SOLD OUT',
        badgeClass: 'sold-out',
        available: false,
        isNew: false
    },
    {
        id: '2',
        name: 'Basketball Jersey #32',
        desc: 'Black mesh basketball jersey with bold #32 in white. Breathable fabric, oversized fit. Perfect for that court-to-street transition.',
        price: 449,
        category: 'jerseys',
        tag: 'JERSEY',
        img: 'images/product2.png',
        badge: 'NEW',
        badgeClass: 'new',
        available: true,
        isNew: true
    },
    {
        id: '3',
        name: 'Baggy Shaded Jeans',
        desc: 'Dark wash baggy fit jeans with subtle sun-bleach shading effect. Length 42. Available in multiple waist sizes. NOT a thrift product — original stock.',
        price: 900,
        category: 'bottoms',
        tag: 'BOTTOMS',
        img: 'images/product3.png',
        badge: 'HOT',
        badgeClass: 'hot',
        available: true,
        isNew: false,
        sizes: [26, 28, 30, 32, {size: 34, soldOut: true}, 36]
    },
    {
        id: '4',
        name: 'Chicago Bulls Vintage Tee',
        desc: 'Black oversized graphic tee featuring iconic Chicago Bulls Dennis Rodman collage artwork. Vintage style print, heavyweight cotton.',
        price: 500,
        category: 'tees',
        tag: 'GRAPHIC TEE',
        img: 'images/product4.png',
        badge: 'NEW',
        badgeClass: 'new',
        available: true,
        isNew: true
    },
    {
        id: '5',
        name: 'Layered Baggy Tracks',
        desc: 'Cream/beige baggy track pants with black piping detail on both sides. Elastic drawstring waist. Wide-leg silhouette for that clean streetwear vibe.',
        price: 600,
        category: 'bottoms',
        tag: 'TRACKS',
        img: 'images/product5.png',
        badge: 'NEW',
        badgeClass: 'new',
        available: true,
        isNew: true
    },
    {
        id: '6',
        name: 'Suede Utility Jacket',
        desc: 'Premium black suede utility jacket with snap button closure and quilted lining. Multiple cargo pockets, metal zipper. A statement outerwear piece.',
        price: 6000,
        category: 'outerwear',
        tag: 'OUTERWEAR',
        img: 'images/product6.png',
        badge: 'PREMIUM',
        badgeClass: 'premium',
        available: true,
        isNew: false
    }
];

function getProductById(id) {
    return products.find(p => p.id === id);
}

function getAllProducts() {
    return products;
}

function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}
