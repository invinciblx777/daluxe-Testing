// Wishlist Management
let wishlistItems = [];

// Load wishlist from localStorage
function loadWishlist() {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
        wishlistItems = JSON.parse(saved);
    }
    updateWishlistCount();
}

// Save wishlist to localStorage
function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    updateWishlistCount();
}

// Update wishlist count badge
function updateWishlistCount() {
    const countElements = document.querySelectorAll('.wishlist-count');
    countElements.forEach(countElement => {
        if (countElement) {
            countElement.textContent = wishlistItems.length;
            if (wishlistItems.length === 0) {
                countElement.style.display = 'none';
            } else {
                countElement.style.display = 'block';
            }
        }
    });
}

// Check if product is in wishlist
function isInWishlist(productId) {
    return wishlistItems.some(item => item.id === productId);
}

// Add product to wishlist
function addToWishlist(product) {
    if (!isInWishlist(product.id)) {
        wishlistItems.push(product);
        saveWishlist();
        showNotification('Added to wishlist!');
        updateWishlistButton(product.id);
        return true;
    }
    return false;
}

// Remove product from wishlist
function removeFromWishlist(productId) {
    wishlistItems = wishlistItems.filter(item => item.id !== productId);
    saveWishlist();
    renderWishlist();
    showNotification('Removed from wishlist');
    updateWishlistButton(productId);
}

// Update wishlist button state in modal
function updateWishlistButton(productId) {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (wishlistBtn) {
        if (isInWishlist(productId)) {
            wishlistBtn.innerHTML = '♥ In Wishlist';
            wishlistBtn.classList.add('in-wishlist');
        } else {
            wishlistBtn.innerHTML = '♡ Add to Wishlist';
            wishlistBtn.classList.remove('in-wishlist');
        }
    }
}

// Render wishlist items
function renderWishlist() {
    const wishlistContainer = document.getElementById('wishlistItems');
    const emptyWishlist = document.getElementById('emptyWishlist');
    
    if (!wishlistContainer) return;
    
    if (wishlistItems.length === 0) {
        wishlistContainer.innerHTML = '';
        if (emptyWishlist) {
            emptyWishlist.style.display = 'block';
        }
        return;
    }
    
    if (emptyWishlist) {
        emptyWishlist.style.display = 'none';
    }
    
    wishlistContainer.innerHTML = wishlistItems.map(product => {
        const hasOffer = product.offer_percentage && product.offer_percentage > 0;
        const originalPrice = parseFloat(product.price);
        const discountedPrice = hasOffer ? originalPrice * (1 - product.offer_percentage / 100) : originalPrice;
        
        return `
            <div class="wishlist-item" data-product-id="${product.id}">
                <div class="wishlist-item-image" style="background-image: url('http://localhost:3002${product.image}')"></div>
                <div class="wishlist-item-details">
                    <div>
                        <div class="wishlist-item-name">${product.name}</div>
                        <div class="wishlist-item-price">
                            ${hasOffer ? `
                                <span style="text-decoration: line-through; color: #999; font-size: 16px; margin-right: 8px;">₹${originalPrice.toLocaleString('en-IN')}</span>
                                <span>₹${discountedPrice.toLocaleString('en-IN')}</span>
                                <span style="color: #e74c3c; font-size: 14px; margin-left: 8px;">${product.offer_percentage}% OFF</span>
                            ` : `₹${discountedPrice.toLocaleString('en-IN')}`}
                        </div>
                    </div>
                    <div class="wishlist-item-actions">
                        <button class="wishlist-add-to-cart" onclick="addToCartFromWishlist(${product.id})">
                            Add to Cart
                        </button>
                        <button class="wishlist-remove" onclick="removeFromWishlist(${product.id})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add to cart from wishlist
function addToCartFromWishlist(productId) {
    const product = wishlistItems.find(p => p.id === productId);
    if (product && typeof addToCart === 'function') {
        addToCart(productId);
        showNotification(`${product.name} added to cart!`);
    }
}

// Open wishlist modal
function openWishlistModal() {
    renderWishlist();
    const modal = document.getElementById('wishlist-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close wishlist modal
function closeWishlistModal() {
    const modal = document.getElementById('wishlist-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Handle wishlist button click in product modal
function handleWishlistButtonClick(product) {
    if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
    } else {
        addToWishlist(product);
    }
}

// Initialize wishlist
document.addEventListener('DOMContentLoaded', function() {
    loadWishlist();
    
    // Open wishlist modal buttons (all pages)
    const wishlistButtons = ['openWishlist', 'openWishlist2', 'openWishlist3', 'openWishlist4'];
    wishlistButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', openWishlistModal);
        }
    });
    
    // Close wishlist modal
    const wishlistModal = document.getElementById('wishlist-modal');
    if (wishlistModal) {
        const closeBtn = wishlistModal.querySelector('.modal-close');
        const backdrop = wishlistModal.querySelector('.modal-backdrop');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeWishlistModal);
        }
        
        if (backdrop) {
            backdrop.addEventListener('click', closeWishlistModal);
        }
    }
});

// Make functions globally available
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.isInWishlist = isInWishlist;
window.updateWishlistButton = updateWishlistButton;
window.handleWishlistButtonClick = handleWishlistButtonClick;
window.addToCartFromWishlist = addToCartFromWishlist;
window.openWishlistModal = openWishlistModal;
window.closeWishlistModal = closeWishlistModal;
