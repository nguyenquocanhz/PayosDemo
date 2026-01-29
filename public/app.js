// ===== Product Data =====
const products = [
    { id: 1, name: 'Mì tôm Hảo Hảo ly', price: 5000, emoji: '🍜', category: 'Mì' },
    { id: 2, name: 'Phở bò ăn liền', price: 8000, emoji: '🍲', category: 'Mì' },
    { id: 3, name: 'Coca Cola lon', price: 10000, emoji: '🥤', category: 'Nước' },
    { id: 4, name: 'Pepsi lon', price: 10000, emoji: '🥤', category: 'Nước' },
    { id: 5, name: 'Nước suối Aquafina', price: 5000, emoji: '💧', category: 'Nước' },
    { id: 6, name: 'Bánh mì sandwich', price: 15000, emoji: '🥪', category: 'Bánh' },
    { id: 7, name: 'Bánh bao nhân thịt', price: 12000, emoji: '🥟', category: 'Bánh' },
    { id: 8, name: 'Snack khoai tây', price: 8000, emoji: '🍟', category: 'Snack' },
    { id: 9, name: 'Kẹo dẻo Haribo', price: 15000, emoji: '🍬', category: 'Snack' },
    { id: 10, name: 'Trà sữa trân châu', price: 25000, emoji: '🧋', category: 'Nước' },
    { id: 11, name: 'Cà phê sữa đá', price: 20000, emoji: '☕', category: 'Nước' },
    { id: 12, name: 'Xúc xích nướng', price: 10000, emoji: '🌭', category: 'Đồ ăn' },
];

// ===== Cart State =====
let cart = [];

// ===== Format Currency =====
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

// ===== Render Products =====
function renderProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = products.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <div class="product-price">${formatPrice(product.price)}</div>
            </div>
            <button class="add-btn" type="button" title="Thêm vào giỏ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// ===== Add to Cart =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    renderCart();
    showNotification(`Đã thêm ${product.name}`);
}

// ===== Remove from Cart =====
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

// ===== Update Quantity =====
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        renderCart();
    }
}

// ===== Clear Cart =====
function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
        cart = [];
        renderCart();
        showNotification('Đã xóa giỏ hàng');
    }
}

// ===== Calculate Total =====
function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ===== Calculate Total Items =====
function calculateTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ===== Render Cart =====
function renderCart() {
    const cartEmpty = document.getElementById('cart-empty');
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const cartCount = document.getElementById('cart-count');
    const subtotal = document.getElementById('subtotal');
    const total = document.getElementById('total');

    const totalItems = calculateTotalItems();
    const totalPrice = calculateTotal();

    // Update cart count badge
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
        cartEmpty.style.display = 'flex';
        cartItems.style.display = 'none';
        cartSummary.style.display = 'none';
        return;
    }

    cartEmpty.style.display = 'none';
    cartItems.style.display = 'block';
    cartSummary.style.display = 'block';

    // Render cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-emoji">${item.emoji}</div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-price">${formatPrice(item.price)}</span>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)" title="Giảm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
                    </svg>
                </button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)" title="Tăng">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                </button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Xóa">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');

    // Update totals
    subtotal.textContent = formatPrice(totalPrice);
    total.textContent = formatPrice(totalPrice);
}

// ===== Process Checkout =====
function processCheckout() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }

    // Prepare data for checkout
    const checkoutData = {
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: calculateTotal()
    };

    // Set form values
    document.getElementById('checkout-items').value = JSON.stringify(checkoutData.items);
    document.getElementById('checkout-total').value = checkoutData.total;

    // Submit form
    document.getElementById('checkout-form').submit();
}

// ===== Show Notification =====
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            ${type === 'success'
            ? '<path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>'
            : '<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>'}
        </svg>
        ${message}
    `;
    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
});
