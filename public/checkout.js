// Checkout System
const CART_KEY = 'luxe_beauty_cart';
let cart = [];
let deliveryInfo = {};
let currentStep = 1;

// Delivery charge and tax rates
const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_THRESHOLD = 5000;
const TAX_RATE = 0.18; // 18% GST
let discountAmount = 0;

// Initialize checkout
function initCheckout() {
    loadCart();
    renderCartReview();
    updateOrderSummary();
    calculateEstimatedDelivery();
    
    // Setup form submission
    document.getElementById('deliveryForm').addEventListener('submit', handleDeliverySubmit);
    
    // Setup payment method change
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', showPaymentDetails);
    });
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = '/';
    }
}

// Render cart review (Step 1)
function renderCartReview() {
    const container = document.getElementById('cartReview');
    
    container.innerHTML = cart.map(item => `
        <div class="cart-review-item">
            <img src="http://localhost:3002${item.image}" alt="${item.name}" class="review-item-image">
            <div class="review-item-details">
                <h4>${item.name}</h4>
                <p>${item.description || 'Premium luxury skincare'}</p>
                ${item.rating ? `<div class="rating">${'★'.repeat(Math.floor(item.rating))}</div>` : ''}
            </div>
            <div class="review-item-quantity">
                <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="review-item-price">
                <div class="unit-price">₹${item.price.toLocaleString('en-IN')} × ${item.quantity}</div>
                <div class="total-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
            <button class="remove-btn" onclick="removeCartItem(${item.id})">🗑</button>
        </div>
    `).join('');
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeCartItem(productId);
    } else {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartReview();
        updateOrderSummary();
    }
}

// Remove item from cart
function removeCartItem(productId) {
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = '/';
    } else {
        renderCartReview();
        updateOrderSummary();
    }
}

// Update order summary
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + deliveryCharge + tax - discountAmount;
    
    document.getElementById('summarySubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('summaryDelivery').textContent = deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`;
    document.getElementById('summaryTax').textContent = `₹${tax.toLocaleString('en-IN')}`;
    document.getElementById('summaryDiscount').textContent = discountAmount > 0 ? `-₹${discountAmount.toLocaleString('en-IN')}` : '₹0';
    document.getElementById('summaryTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
    
    // Update summary items
    const summaryItems = document.getElementById('summaryItems');
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <img src="http://localhost:3002${item.image}" alt="${item.name}">
            <div class="summary-item-info">
                <span>${item.name}</span>
                <span>Qty: ${item.quantity}</span>
            </div>
            <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </div>
    `).join('');
}

// Calculate estimated delivery
function calculateEstimatedDelivery() {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // 5 days delivery
    
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formatted = deliveryDate.toLocaleDateString('en-IN', options);
    
    document.getElementById('estimatedDelivery').textContent = formatted;
}

// Apply coupon
function applyCoupon() {
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    
    if (code === 'LUXE10') {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        discountAmount = Math.round(subtotal * 0.10); // 10% discount
        alert('Coupon applied! You saved ₹' + discountAmount);
        updateOrderSummary();
    } else if (code === 'FIRST50') {
        discountAmount = 50;
        alert('Coupon applied! You saved ₹50');
        updateOrderSummary();
    } else {
        alert('Invalid coupon code');
    }
}

// Go to step
function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.add('hidden'));
    
    // Show current step
    const stepMap = {
        1: 'step-cart',
        2: 'step-delivery',
        3: 'step-payment',
        4: 'step-confirmation'
    };
    
    document.getElementById(stepMap[step]).classList.remove('hidden');
    
    // Update step indicators
    document.querySelectorAll('.step').forEach(s => {
        const stepNum = parseInt(s.getAttribute('data-step'));
        if (stepNum <= step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
    
    currentStep = step;
    window.scrollTo(0, 0);
}

// Handle delivery form submission
function handleDeliverySubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    deliveryInfo = {
        fullName: formData.get('fullName'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        house: formData.get('house'),
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        landmark: formData.get('landmark'),
        sameBilling: formData.get('sameBilling') === 'on'
    };
    
    goToStep(3);
}

// Show payment details based on selected method
function showPaymentDetails() {
    const selectedMethod = document.querySelector('input[name="payment"]:checked').value;
    const detailsContainer = document.getElementById('paymentDetails');
    
    if (selectedMethod === 'card') {
        detailsContainer.innerHTML = `
            <div class="payment-form">
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="123" maxlength="3">
                    </div>
                </div>
            </div>
        `;
    } else if (selectedMethod === 'upi') {
        detailsContainer.innerHTML = `
            <div class="payment-form">
                <div class="form-group">
                    <label>UPI ID</label>
                    <input type="text" placeholder="yourname@upi">
                </div>
                <p class="payment-note">Or scan QR code with your UPI app</p>
            </div>
        `;
    } else if (selectedMethod === 'cod') {
        detailsContainer.innerHTML = `
            <div class="payment-note">
                <p>✅ Pay cash when your order is delivered</p>
                <p>Please keep exact change ready</p>
            </div>
        `;
    } else if (selectedMethod === 'netbanking') {
        detailsContainer.innerHTML = `
            <div class="payment-form">
                <div class="form-group">
                    <label>Select Bank</label>
                    <select>
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
        `;
    }
}

// Place order
async function placeOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + deliveryCharge + tax - discountAmount;
    
    // Generate order ID
    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Show confirmation
    document.getElementById('confirmAddress').textContent = `${deliveryInfo.house}, ${deliveryInfo.street}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`;
    document.getElementById('confirmPayment').textContent = paymentMethod.toUpperCase();
    document.getElementById('confirmDelivery').textContent = document.getElementById('estimatedDelivery').textContent;
    document.getElementById('confirmTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
    
    // Clear cart
    localStorage.removeItem(CART_KEY);
    
    // Go to confirmation
    goToStep(4);
    
    // Here you would typically send order to backend
    // await fetch('/api/orders', { method: 'POST', body: JSON.stringify(orderData) });
}

}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCheckout);
