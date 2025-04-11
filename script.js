// Данные товаров
const products = [
    {
        id: 1,
        title: "Керамическая плошка",
        price: 1200,
        image: "https://via.placeholder.com/100"
    },
    {
        id: 2,
        title: "Стеклянная плошка",
        price: 1500,
        image: "https://via.placeholder.com/100"
    },
    {
        id: 3,
        title: "Деревянная плошка",
        price: 1800,
        image: "https://via.placeholder.com/100"
    },
    {
        id: 4,
        title: "Металлическая плошка",
        price: 2000,
        image: "https://via.placeholder.com/100"
    },
    {
        id: 5,
        title: "Фарфоровая плошка",
        price: 2500,
        image: "https://via.placeholder.com/100"
    },
    {
        id: 6,
        title: "Пластиковая плошка",
        price: 800,
        image: "https://via.placeholder.com/100"
    }
];

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM элементы
const productsContainer = document.getElementById('products-container');
const cartContainer = document.getElementById('cart-container');
const cartSection = document.getElementById('cart-section');
const productsSection = document.getElementById('products-section');
const cartLink = document.getElementById('cart-link');
const cartCount = document.getElementById('cart-count');
const totalPriceElement = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const notification = document.getElementById('notification');

// Инициализация
function init() {
    renderProducts();
    renderCart();
    updateCartCount();
    calculateTotal();
    
    // Обработчики событий
    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        productsSection.classList.add('hidden');
        cartSection.classList.remove('hidden');
    });
    
    document.querySelector('nav a:first-child').addEventListener('click', (e) => {
        e.preventDefault();
        productsSection.classList.remove('hidden');
        cartSection.classList.add('hidden');
    });
    
    checkoutBtn.addEventListener('click', checkout);
}

// Рендер товаров
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${product.price} руб.</p>
                <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
            </div>
        `;
        
        productsContainer.appendChild(productElement);
    });
    
    // Добавляем обработчики для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Рендер корзины
function renderCart() {
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Корзина пуста</p>';
        return;
    }
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${product.title}</h3>
                <p class="cart-item-price">${product.price} руб. × ${item.quantity} = ${product.price * item.quantity} руб.</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-id="${product.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${product.id}">
                    <button class="quantity-btn plus" data-id="${product.id}">+</button>
                </div>
                <button class="remove-item" data-id="${product.id}">Удалить</button>
            </div>
        `;
        
        cartContainer.appendChild(cartItemElement);
    });
    
    // Добавляем обработчики для кнопок в корзине
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', updateQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
}

// Добавление товара в корзину
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    calculateTotal();
    showNotification('Товар добавлен в корзину');
}

// Удаление товара из корзины
function removeFromCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    
    saveCart();
    renderCart();
    updateCartCount();
    calculateTotal();
    showNotification('Товар удален из корзины');
}

// Увеличение количества товара
function increaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += 1;
        saveCart();
        renderCart();
        calculateTotal();
    }
}

// Уменьшение количества товара
function decreaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCart();
        renderCart();
        calculateTotal();
    }
}

// Обновление количества товара через input
function updateQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const newQuantity = parseInt(e.target.value);
    const item = cart.find(item => item.id === productId);
    
    if (item && newQuantity >= 1) {
        item.quantity = newQuantity;
        saveCart();
        renderCart();
        calculateTotal();
    }
}

// Расчет общей суммы
function calculateTotal() {
    let total = 0;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        total += product.price * item.quantity;
    });
    
    totalPriceElement.textContent = total;
}

// Обновление счетчика корзины
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    // Здесь можно добавить логику отправки заказа на сервер
    cart = [];
    saveCart();
    renderCart();
    updateCartCount();
    calculateTotal();
    showNotification('Заказ оформлен! Спасибо за покупку!');
    
    // Возвращаемся в каталог
    productsSection.classList.remove('hidden');
    cartSection.classList.add('hidden');
}

// Показ уведомления
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);