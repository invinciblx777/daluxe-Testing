// Shopping Cart System with Supabase and Multi-Step Checkout

const CART_KEY = 'luxe_beauty_cart_session';
let cart = [];
let deliveryInfo = {};
let currentCheckoutStep = 1;

// Delivery charge and tax rates
const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_THRESHOLD = 5000;
let TAX_RATE = 0.18; // Default 18% GST
let discountAmount = 0;

// Session Management
let sessionId = localStorage.getItem(CART_KEY);
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(CART_KEY, sessionId);
}

// Load GST rate from localStorage (Legacy/Local Admin support)
function loadGSTRate() {
    const savedGSTRate = localStorage.getItem('gstRate');
    if (savedGSTRate) {
        TAX_RATE = parseFloat(savedGSTRate) / 100;
    }
}

// Initialize cart from Supabase
async function initCart() {
    loadGSTRate();

    // Check for user session (if logged in, use user_id, else use session_id)
    // For now, we stick to session_id for simplicity as per plan "guest cart persistence"

    try {
        const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('session_id', sessionId);

        if (error) throw error;

        // Transform to local cart format
        cart = cartItems.map(item => ({
            id: item.product_id, // Local logic uses product id as item id
            row_id: item.id, // Keep track of the cart_item row id
            name: item.products.name,
            price: item.products.price, // Assuming product has price. Handle offers effectively below.
            originalPrice: item.products.original_price || item.products.price, // Ensure schema match
            offerPercentage: item.products.offer_percentage || 0,
            image: item.products.image || item.products.main_image, // Handle column mismatch if any
            rating: item.products.rating || 0,
            description: item.products.description || '',
            quantity: item.quantity
        }));

        // Recalculate prices based on offers (if not handled by backend)
        cart.forEach(item => {
            const original = parseFloat(item.originalPrice);
            if (item.offerPercentage > 0) {
                item.price = original * (1 - item.offerPercentage / 100);
            } else {
                item.price = original;
            }
        });

    } catch (err) {
        console.error('Error loading cart:', err);
    }

    updateCartBadge();
    renderCart(); // Initial render
}

// Save cart (No-op for Supabase as we save per action, but kept for compatibility if needed)
function saveCart() {
    // updateCartBadge();
}

// Add product to cart
async function addToCart(productId) {
    // We need product details. If allProducts is available, use it.
    // Otherwise fetch it.
    let product = typeof allProducts !== 'undefined' ? allProducts.find(p => p.id === productId) : null;

    if (!product) {
        // Fetch specific product if not found in global list
        const { data } = await supabase.from('products').select('*').eq('id', productId).single();
        product = data;
    }

    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    try {
        // Check if exists in cart
        const { data: existing } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('session_id', sessionId)
            .eq('product_id', productId)
            .single();

        if (existing) {
            const newQty = existing.quantity + 1;
            await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', existing.id);

            showCartNotification(`${product.name} quantity updated!`);
        } else {
            await supabase
                .from('cart_items')
                .insert({
                    session_id: sessionId,
                    product_id: productId,
                    quantity: 1
                });

            showCartNotification(`${product.name} added to cart!`);
        }

        // Refresh cart
        await initCart();
        openCart(); // Optional: open cart when added

    } catch (err) {
        console.error('Error adding to cart:', err);
        showCartNotification('Error adding to cart');
    }
}

// Remove product from cart
async function removeFromCart(productId) {
    // In local cart array, 'id' is productId. 
    // But to delete efficiently, we used product_id in query
    try {
        await supabase
            .from('cart_items')
            .delete()
            .eq('session_id', sessionId)
            .eq('product_id', productId);

        await initCart();
        showCartNotification('Item removed from cart');
    } catch (err) {
        console.error('Error removing from cart:', err);
    }
}

// Update quantity
async function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const newQty = item.quantity + change;

    try {
        if (newQty <= 0) {
            await removeFromCart(productId);
        } else {
            await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('session_id', sessionId)
                .eq('product_id', productId);

            await initCart();
        }
    } catch (err) {
        console.error('Error updating quantity:', err);
    }
}

// Clear cart
async function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        try {
            await supabase
                .from('cart_items')
                .delete()
                .eq('session_id', sessionId);

            cart = [];
            renderCart();
            updateCartBadge();
            showCartNotification('Cart cleared');
        } catch (err) {
            console.error('Error clearing cart:', err);
        }
    }
}

// Calculate cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart badge
function updateCartBadge() {
    const count = getCartCount();
    const badges = document.querySelectorAll('.cart-badge');

    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Render cart items
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const totalAmountElement = document.querySelector('.total-amount');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p>Your cart is empty</p>
                <button class="cta-button" onclick="closeCart()">Continue Shopping</button>
            </div>
        `;
        if (totalAmountElement) {
            totalAmountElement.textContent = '₹0';
        }
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-image" style="background-image: url('${item.image || '/placeholder-product.png'}'); background-size: cover; background-position: center;"></div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-desc">${item.description ? item.description.substring(0, 50) + '...' : 'Premium luxury skincare product'}</p>
                ${item.rating ? `<div class="cart-item-rating">${'★'.repeat(Math.floor(item.rating))}${'☆'.repeat(5 - Math.floor(item.rating))}</div>` : ''}
                ${item.offerPercentage > 0 ? `<div class="cart-offer-info">${item.offerPercentage}% OFF Applied</div>` : ''}
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn minus" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-price">
                ${item.offerPercentage > 0 ? `<div class="cart-original-price">₹${(item.originalPrice * item.quantity).toLocaleString('en-IN')}</div>` : ''}
                <div class="cart-final-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');

    // Update total
    const total = getCartTotal();
    if (totalAmountElement) {
        totalAmountElement.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    updateCartBadge();
    updateOrderSummary();
}

// Open cart modal
function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetCheckoutSteps();
        renderCart();
    }
}

// Close cart modal
function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetCheckoutSteps();
    }
}

// Reset checkout steps to cart view
function resetCheckoutSteps() {
    currentCheckoutStep = 1;

    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show cart step
    document.getElementById('cart-step').classList.add('active');

    // Reset progress indicators
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');
}

// Go to delivery step
function goToDeliveryStep() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    currentCheckoutStep = 2;
    showCheckoutStep(2);
}

// Go to cart step
function goToCartStep() {
    currentCheckoutStep = 1;
    showCheckoutStep(1);
}

// Show specific checkout step
function showCheckoutStep(step) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(s => {
        s.classList.remove('active');
    });

    // Show current step
    const stepMap = {
        1: 'cart-step',
        2: 'delivery-step',
        3: 'payment-step',
        4: 'confirmation-step'
    };

    document.getElementById(stepMap[step]).classList.remove('active');
    setTimeout(() => {
        document.getElementById(stepMap[step]).classList.add('active');
    }, 50);

    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach(s => {
        const stepNum = parseInt(s.getAttribute('data-step'));
        if (stepNum <= step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });

    currentCheckoutStep = step;

    // Update order summary for payment step
    if (step === 3) {
        updateOrderSummary();
        showPaymentDetails();
    }
}

// Handle delivery form submission
function handleDeliverySubmit(e) {
    e.preventDefault();
    console.log('📋 Delivery form submitted');

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

    console.log('📋 Captured delivery info:', deliveryInfo);

    // Validate required fields
    const requiredFields = ['fullName', 'mobile', 'house', 'street', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !deliveryInfo[field]);

    if (missingFields.length > 0) {
        alert('Please fill in all required fields: ' + missingFields.join(', '));
        console.error('❌ Missing required fields:', missingFields);
        return;
    }

    console.log('✅ All delivery info validated, proceeding to payment step');
    showCheckoutStep(3);
}

// Show payment details based on selected method
function showPaymentDetails() {
    const selectedMethod = document.querySelector('input[name="payment"]:checked');
    if (!selectedMethod) return;

    const method = selectedMethod.value;
    const detailsContainer = document.getElementById('paymentDetails');

    if (method === 'card') {
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
    } else if (method === 'upi') {
        detailsContainer.innerHTML = `
            <div class="payment-form">
                <div class="form-group">
                    <label>UPI ID</label>
                    <input type="text" placeholder="yourname@upi">
                </div>
                <p class="payment-note">Or scan QR code with your UPI app</p>
            </div>
        `;
    } else if (method === 'cod') {
        detailsContainer.innerHTML = `
            <div class="payment-note">
                <p>Pay cash when your order is delivered</p>
                <p>Please keep exact change ready</p>
            </div>
        `;
    } else if (method === 'netbanking') {
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

// Update order summary
function updateOrderSummary() {
    // Reload GST rate in case it was updated in admin panel
    loadGSTRate();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + deliveryCharge + tax - discountAmount;

    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDelivery = document.getElementById('summaryDelivery');
    const summaryTax = document.getElementById('summaryTax');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (summaryDelivery) summaryDelivery.textContent = deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`;
    if (summaryTax) summaryTax.textContent = `₹${tax.toLocaleString('en-IN')} (${Math.round(TAX_RATE * 100)}%)`;
    if (summaryDiscount) summaryDiscount.textContent = discountAmount > 0 ? `-₹${discountAmount.toLocaleString('en-IN')}` : '₹0';
    if (summaryTotal) summaryTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Coupon management
let appliedCoupon = null;

// Enhanced apply coupon with better UX
async function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const code = couponInput.value.trim().toUpperCase();

    if (!code) {
        showCouponError('Please enter a coupon code');
        couponInput.focus();
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Get button and store original text before try block
    const applyBtn = document.querySelector('.coupon-section button');
    const originalText = applyBtn.textContent || 'Apply';

    try {
        // Show enhanced loading state
        applyBtn.innerHTML = `
            <div class="coupon-loading">
                <div class="coupon-spinner"></div>
                <span>Validating...</span>
            </div>
        `;
        applyBtn.disabled = true;

        console.log('🔍 Attempting to validate coupon:', code, 'for order amount:', subtotal);

        // Fetch coupon from Supabase
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (error) {
            throw new Error('Invalid coupon code');
        }

        if (!coupon) {
            throw new Error('Invalid coupon code');
        }

        // Validate Expiry
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
            throw new Error('Coupon has expired');
        }

        // Validate Minimum Order Amount
        if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
            throw new Error(`Minimum order amount of ₹${coupon.min_order_amount} required`);
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
            // Cap discount if needed, currently not in schema but common practice
        } else {
            discount = coupon.discount_value;
        }

        // Ensure discount doesn't exceed subtotal
        discount = Math.min(discount, subtotal);

        appliedCoupon = { ...coupon, discount_amount: discount };
        discountAmount = discount;

        // Enhanced success feedback
        showCouponSuccess(`Coupon applied! You saved ₹${discountAmount.toLocaleString()}`);

        // Update UI with enhanced styling
        couponInput.value = code;
        couponInput.disabled = true;
        couponInput.style.background = 'rgba(34, 197, 94, 0.1)';
        couponInput.style.borderColor = '#22c55e';

        applyBtn.innerHTML = `
            <i class="fas fa-times"></i>
            <span>Remove</span>
        `;
        applyBtn.className = 'remove-coupon-btn';
        applyBtn.onclick = removeCoupon;
        applyBtn.disabled = false;

        updateOrderSummary();

        // Add celebration effect
        createCelebrationEffect();

    } catch (error) {
        console.error('Error applying coupon:', error);
        showCouponError(error.message || 'Failed to validate coupon');
    } finally {
        // Reset button state if coupon wasn't applied
        if (!appliedCoupon) {
            applyBtn.innerHTML = originalText;
            applyBtn.disabled = false;
        }
    }
}

// Remove applied coupon
function removeCoupon() {
    appliedCoupon = null;
    discountAmount = 0;

    // Reset UI
    const couponInput = document.getElementById('couponCode');
    const applyBtn = document.querySelector('.coupon-section button');

    couponInput.value = '';
    couponInput.disabled = false;
    applyBtn.textContent = 'Apply';
    applyBtn.onclick = applyCoupon;

    // Clear any messages
    clearCouponMessages();

    updateOrderSummary();
}

// Enhanced coupon success message with better styling
function showCouponSuccess(message) {
    clearCouponMessages();
    const couponSection = document.querySelector('.coupon-section');

    // Create success message with enhanced styling
    const successDiv = document.createElement('div');
    successDiv.className = 'coupon-message success';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        <span>${message}</span>
        <div class="success-animation">✨</div>
    `;
    couponSection.appendChild(successDiv);

    // Add celebration animation
    setTimeout(() => {
        successDiv.style.animation = 'successPulse 0.6s ease';
    }, 100);
}

// Enhanced coupon error message with better styling
function showCouponError(message) {
    clearCouponMessages();
    const couponSection = document.querySelector('.coupon-section');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'coupon-message error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> 
        <span>${message}</span>
    `;
    couponSection.appendChild(errorDiv);

    // Add shake animation for error
    setTimeout(() => {
        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                couponInput.style.animation = '';
            }, 500);
        }
    }, 100);
}

// Clear coupon messages
function clearCouponMessages() {
    const messages = document.querySelectorAll('.coupon-message');
    messages.forEach(msg => msg.remove());
}

// Generate sequential order ID
async function generateOrderId() {
    try {
        // Get the latest order from Supabase
        const { data: latestOrder, error } = await supabase
            .from('orders')
            .select('order_id') // Assuming column is named order_id or id. Using order_id as user-facing ID.
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let nextNumber = 1;
        if (latestOrder && latestOrder.order_id) {
            // Extract number from ORD-2026-001 format
            const match = latestOrder.order_id.match(/ORD-2026-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return `ORD-2026-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating order ID:', error);
        // Fallback to timestamp-based ID
        return 'ORD-2026-' + Date.now().toString().slice(-3);
    }
}

// Place order
async function placeOrder() {
    console.log('🚀 Place order function called');

    const paymentMethodElement = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethodElement) {
        alert('Please select a payment method');
        return;
    }

    // Reload GST rate before calculating totals
    loadGSTRate();

    const paymentMethod = paymentMethodElement.value;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + deliveryCharge + tax - discountAmount;

    console.log('💰 Order totals:', { subtotal, deliveryCharge, tax, total, gstRate: (TAX_RATE * 100) + '%' });

    // Validate delivery info
    if (!deliveryInfo.fullName || !deliveryInfo.mobile || !deliveryInfo.house || !deliveryInfo.street || !deliveryInfo.city || !deliveryInfo.state || !deliveryInfo.pincode) {
        alert('Please fill in all required delivery details');
        console.error('❌ Missing delivery information:', deliveryInfo);
        return;
    }

    // Generate order ID
    const orderId = await generateOrderId();

    // Calculate delivery date
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5);
    const deliveryFormatted = deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    // Prepare order data for Supabase
    const orderData = {
        order_id: orderId, // User facing ID
        customer_name: deliveryInfo.fullName,
        customer_email: deliveryInfo.email || '',
        customer_phone: deliveryInfo.mobile,
        delivery_address: `${deliveryInfo.house}, ${deliveryInfo.street}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`,
        payment_method: paymentMethod.toUpperCase(),
        payment_status: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        order_status: 'Pending',
        subtotal: subtotal,
        delivery_charge: deliveryCharge,
        tax: tax,
        discount: discountAmount,
        total_amount: total,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        coupon_discount: discountAmount, // Correct field name
        session_id: sessionId // Link to session
        // created_at is auto-handled by Supabase
    };

    // Add User ID if logged in (for future proofing, though currently guest mostly)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        orderData.user_id = session.user.id;
    }

    console.log('📦 Sending order data:', orderData);

    try {
        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select() // Select to get the system ID (UUID) if needed
            .single();

        if (orderError) throw orderError;

        console.log('✅ Order created in Supabase:', order);

        // 2. Create Order Items
        const orderItems = cart.map(item => ({
            order_id: order.id, // Using the UUID foreign key
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            product_name: item.name // Redundant but good for snapshot
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 3. Update stock (Optimistic or handled here)
        // Note: Real apps might use a Postgres function or trigger for this to be atomic.
        // We will do it loop-wise here as per previous logic.
        for (const item of cart) {
            // Get current stock first to be safe or use RPC for decrement
            // For simplicity, we just decrement.
            // RPC is better: create a 'decrement_stock' function in Supabase.
            // But we don't have that yet. We'll fetch and update.
            const { data: prod } = await supabase.from('products').select('stock').eq('id', item.id).single();
            if (prod) {
                await supabase.from('products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.id);
            }
        }

        // 4. Clear Cart (DB)
        await supabase.from('cart_items').delete().eq('session_id', sessionId);

        // 5. Track Coupon Usage
        if (appliedCoupon && discountAmount > 0) {
            // We assume there might be a coupon_usages table or we just update the coupon usage count
            // Let's just update the coupon usage count if possible
            // Or log it if we have a table. 'coupon_usage' table.
            /* 
            await supabase.from('coupon_usages').insert({
                coupon_id: appliedCoupon.id,
                order_id: order.id,
                customer_email: deliveryInfo.email,
                discount_amount: discountAmount
            });
            */
            // Currently skipping explicit coupon_usage table unless it exists in schema plan.
            // But we can update the used count on coupons table if it has one.
            // previous code: fetch(`http://localhost:3002/api/coupons/${appliedCoupon.id}/use`, { method: 'PUT' });
            // We'll check if 'times_used' column exists later or skip for now.
        }

        // Show confirmation
        document.getElementById('confirmAddress').textContent = orderData.delivery_address;
        document.getElementById('confirmPayment').textContent = paymentMethod.toUpperCase().replace('_', ' ');
        document.getElementById('confirmDelivery').textContent = deliveryFormatted;
        document.getElementById('confirmTotal').textContent = `₹${total.toLocaleString('en-IN')}`;

        // Clear local state
        cart = [];
        // Keep session ID, but clear cart UI

        // Go to confirmation
        showCheckoutStep(4);

        // Show success notification
        if (typeof showNotification === 'function') {
            showNotification('Order placed successfully! Order ID: ' + orderId);
        }

    } catch (error) {
        console.error('❌ Error placing order:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to place order. ' + error.message);
        } else {
            alert('Failed to place order: ' + error.message + '\nPlease try again.');
        }
    }
}

// Continue shopping
function continueShopping() {
    closeCart();
}

// Proceed to checkout (old function - now redirects to delivery step)
function proceedToCheckout() {
    goToDeliveryStep();
}

// Setup cart event listeners
function setupCartListeners() {
    // Open cart buttons
    const cartButtons = document.querySelectorAll('[id^="openCart"]');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', openCart);
    });

    // Close cart button
    const closeBtn = document.querySelector('#cart-modal .modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCart);
    }

    // Close on backdrop click
    const backdrop = document.querySelector('#cart-modal .modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeCart);
    }

    // Delivery form submission
    const deliveryForm = document.getElementById('deliveryForm');
    if (deliveryForm) {
        deliveryForm.addEventListener('submit', handleDeliverySubmit);
    }

    // Payment method change
    document.addEventListener('change', function (e) {
        if (e.target.name === 'payment') {
            showPaymentDetails();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
}

// Add cart badge to cart icons
function addCartBadges() {
    const cartIcons = document.querySelectorAll('.cart-icon');
    cartIcons.forEach(icon => {
        if (!icon.querySelector('.cart-badge')) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.style.display = 'none';
            icon.style.position = 'relative';
            icon.appendChild(badge);
        }
    });
}

// Initialize cart system
document.addEventListener('DOMContentLoaded', function () {
    initCart();
    addCartBadges();
    setupCartListeners();

    // Wait for products to load, then render cart
    setTimeout(() => {
        if (allProducts && allProducts.length > 0) {
            renderCart();
        }
    }, 1000);
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.proceedToCheckout = proceedToCheckout;
window.goToDeliveryStep = goToDeliveryStep;
window.goToCartStep = goToCartStep;
window.applyCoupon = applyCoupon;
window.placeOrder = placeOrder;
window.continueShopping = continueShopping;

// Show cart notification
function showCartNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Test order creation function for debugging
async function testOrderCreation() {
    console.log('🧪 Testing order creation...');

    // Set dummy delivery info for testing
    deliveryInfo = {
        fullName: 'Test Customer',
        mobile: '9999999999',
        email: 'test@example.com',
        house: '123 Test Street',
        street: 'Test Area',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        landmark: 'Near Test Mall',
        sameBilling: true
    };

    // Add dummy cart items if cart is empty
    if (cart.length === 0) {
        cart = [
            {
                id: 1,
                name: 'Test Product',
                price: 999,
                image: '/uploads/test.jpg',
                rating: 5,
                description: 'Test product for debugging',
                quantity: 2
            }
        ];
    }

    console.log('🛒 Test cart:', cart);
    console.log('📋 Test delivery info:', deliveryInfo);

    // Call the actual place order function
    try {
        await placeOrder();
        console.log('✅ Test order creation completed');
    } catch (error) {
        console.error('❌ Test order creation failed:', error);
    }
}

// Make test function globally available
window.testOrderCreation = testOrderCreation;

// Make functions globally available
window.goToDeliveryStep = goToDeliveryStep;
window.goToCartStep = goToCartStep;
window.continueShopping = continueShopping;
window.placeOrder = placeOrder;
window.proceedToCheckout = proceedToCheckout;
// Create celebration effect for successful coupon application
function createCelebrationEffect() {
    const couponSection = document.querySelector('.coupon-section');

    // Create confetti elements
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: ${['#d4a574', '#22c55e', '#3b82f6', '#f59e0b'][Math.floor(Math.random() * 4)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: confettiFall ${0.8 + Math.random() * 0.4}s ease-out forwards;
            left: ${Math.random() * 100}%;
            top: 0;
        `;

        couponSection.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentElement) {
                confetti.remove();
            }
        }, 1200);
    }

    // Add confetti animation CSS if not exists
    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Enhanced remove coupon function
function removeCoupon() {
    appliedCoupon = null;
    discountAmount = 0;

    // Reset UI with smooth transitions
    const couponInput = document.getElementById('couponCode');
    const applyBtn = document.querySelector('.coupon-section button');

    // Animate removal
    couponInput.style.transition = 'all 0.3s ease';
    couponInput.value = '';
    couponInput.disabled = false;
    couponInput.style.background = '';
    couponInput.style.borderColor = '';

    applyBtn.innerHTML = 'Apply';
    applyBtn.className = 'coupon-apply-btn';
    applyBtn.onclick = applyCoupon;

    // Clear any messages with fade out
    const messages = document.querySelectorAll('.coupon-message');
    messages.forEach(msg => {
        msg.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    });

    updateOrderSummary();

    // Focus input for better UX
    setTimeout(() => {
        couponInput.focus();
    }, 100);
}

// Add fade out animation CSS
if (!document.getElementById('fade-styles')) {
    const style = document.createElement('style');
    style.id = 'fade-styles';
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}