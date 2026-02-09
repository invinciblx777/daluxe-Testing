// Products Loader - Fetch products from database and display on main website

const API_URL = 'http://localhost:3002';
let allProducts = [];

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        allProducts = await response.json();
        
        // Filter only active products with stock
        allProducts = allProducts.filter(p => p.stock > 0);
        
        loadBestSellers();
        loadAllProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to static products if API fails
    }
}

// Load Best Sellers (first 3 products)
function loadBestSellers() {
    const bestSellersGrid = document.querySelector('#hero-page .products-grid');
    if (!bestSellersGrid) return;
    
    const bestSellers = allProducts.slice(0, 3);
    
    if (bestSellers.length === 0) return;
    
    bestSellersGrid.innerHTML = bestSellers.map(product => {
        const hasOffer = product.offer_percentage && product.offer_percentage > 0;
        const originalPrice = parseFloat(product.price);
        const discountedPrice = hasOffer ? originalPrice * (1 - product.offer_percentage / 100) : originalPrice;
        
        return `
            <div class="product-card" data-product="${product.id}">
                <div class="product-image" style="background-image: url('${API_URL}${product.image}'); background-size: cover; background-position: center;" onclick="showProductDetail(${product.id})">
                    ${hasOffer ? `<div class="offer-badge">${product.offer_percentage}% OFF</div>` : ''}
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="price-display">
                        <div class="current-price">₹${discountedPrice.toLocaleString('en-IN')}</div>
                        ${hasOffer ? `
                            <div class="price-details">
                                <span class="original-price">₹${originalPrice.toLocaleString('en-IN')}</span>
                                <span class="savings-badge">${product.offer_percentage}% OFF</span>
                            </div>
                        ` : ''}
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to cart</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load All Products in Products Page
function loadAllProducts() {
    const productsGrid = document.querySelector('#products-page .products-grid.large');
    if (!productsGrid) return;
    
    if (allProducts.length === 0) return;
    
    renderProducts(allProducts);
}

// Render products with optional filter
function renderProducts(products) {
    const productsGrid = document.querySelector('#products-page .products-grid.large');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = products.map(product => {
        const hasOffer = product.offer_percentage && product.offer_percentage > 0;
        const originalPrice = parseFloat(product.price);
        const discountedPrice = hasOffer ? originalPrice * (1 - product.offer_percentage / 100) : originalPrice;
        
        return `
            <div class="product-card" data-product="${product.id}" data-category="${product.category || 'Face'}">
                <div class="product-image" style="background-image: url('${API_URL}${product.image}'); background-size: cover; background-position: center;" onclick="showProductDetail(${product.id})">
                    ${hasOffer ? `<div class="offer-badge">${product.offer_percentage}% OFF</div>` : ''}
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    ${product.rating ? `<div class="product-rating">★ ${product.rating}</div>` : ''}
                    <div class="price-display">
                        <div class="current-price">₹${discountedPrice.toLocaleString('en-IN')}</div>
                        ${hasOffer ? `
                            <div class="price-details">
                                <span class="original-price">₹${originalPrice.toLocaleString('en-IN')}</span>
                                <span class="savings-badge">${product.offer_percentage}% OFF</span>
                            </div>
                        ` : ''}
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to cart</button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter products by category
function filterProducts(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === category) {
            btn.classList.add('active');
        }
    });
    
    if (category === 'All Products') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => 
            (p.category || 'Face').toLowerCase() === category.toLowerCase()
        );
        renderProducts(filtered);
    }
}

// Show product detail modal
async function showProductDetail(productId) {
    try {
        // Fetch product details with images from API
        const response = await fetch(`${API_URL}/api/products/${productId}`);
        const product = await response.json();
        
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        // Use the updateProductModal function from app.js which handles multiple images
        if (typeof updateProductModal === 'function') {
            updateProductModal(product);
        } else {
            // Fallback to basic modal update if updateProductModal is not available
            updateModalBasic(product);
        }
        
        // Show modal
        const modal = document.getElementById('product-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// Fallback function for basic modal update
function updateModalBasic(product) {
    const modal = document.getElementById('product-modal');
    
    // Calculate pricing with offers
    const hasOffer = product.offer_percentage && product.offer_percentage > 0;
    const originalPrice = parseFloat(product.price);
    const discountedPrice = hasOffer ? originalPrice * (1 - product.offer_percentage / 100) : originalPrice;
    
    const mainImage = modal.querySelector('.main-image');
    const productTitle = modal.querySelector('.product-details h2');
    const productRating = modal.querySelector('.product-rating .stars');
    const ratingText = modal.querySelector('.product-rating span');
    const productPrice = modal.querySelector('.product-price');
    const stockStatus = modal.querySelector('.stock-status');
    const description = modal.querySelector('.product-description p');
    const benefitsList = modal.querySelector('.product-description ul');
    const addToCartBtn = modal.querySelector('.add-to-cart-btn.large');
    
    // Set main image
    if (mainImage) {
        mainImage.style.backgroundImage = `url('${API_URL}${product.image}')`;
        mainImage.style.backgroundSize = 'cover';
        mainImage.style.backgroundPosition = 'center';
    }
    
    // Set product title
    if (productTitle) {
        productTitle.textContent = product.name;
    }
    
    // Set rating
    if (productRating && ratingText) {
        const rating = product.rating || 5;
        productRating.textContent = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        ratingText.textContent = `(${rating}/5)`;
    }
    
    // Set price with offer support
    if (productPrice) {
        if (hasOffer) {
            productPrice.innerHTML = `
                <span class="original-price" style="text-decoration: line-through; color: #999; margin-right: 10px;">₹${originalPrice.toLocaleString('en-IN')}</span>
                <span class="discounted-price">₹${discountedPrice.toLocaleString('en-IN')}</span>
                <span class="offer-text" style="color: #e74c3c; font-size: 14px; margin-left: 10px;">${product.offer_percentage}% OFF</span>
            `;
        } else {
            productPrice.textContent = `₹${discountedPrice.toLocaleString('en-IN')}`;
        }
    }
    
    // Set stock status
    if (stockStatus) {
        if (product.stock === 0) {
            stockStatus.textContent = 'Out of Stock';
            stockStatus.style.color = '#dc3545';
        } else if (product.stock < 10) {
            stockStatus.textContent = 'Low Stock';
            stockStatus.style.color = '#ff9800';
        } else {
            stockStatus.textContent = 'Available';
            stockStatus.style.color = '#28a745';
        }
    }
    
    // Set description
    if (description) {
        description.textContent = product.description || 'Premium luxury skincare product crafted with the finest ingredients for your skin care needs.';
    }
    
    // Set benefits
    if (benefitsList) {
        const benefits = product.benefits ? product.benefits.split(',') : [
            'Deep hydration for 24 hours',
            'Reduces fine lines and wrinkles', 
            'Improves skin texture and tone',
            '100% natural ingredients',
            'Dermatologically tested'
        ];
        
        benefitsList.innerHTML = benefits.map(benefit => `<li>${benefit.trim()}</li>`).join('');
    }
    
    // Update add to cart button
    if (addToCartBtn) {
        addToCartBtn.onclick = () => {
            const quantity = modal.querySelector('.qty-input').value || 1;
            for (let i = 0; i < quantity; i++) {
                addToCart(product.id);
            }
            closeProductModal();
        };
    }
}

// Close product detail modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Show cart notification
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d4a574 0%, #e6c9a8 100%);
        color: #000;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Setup filter buttons
async function setupFilters() {
    const filterTabs = document.getElementById('filterTabs');
    if (!filterTabs) return;
    
    try {
        // Load categories from API
        const response = await fetch(`${API_URL}/api/categories`);
        const allCategories = await response.json();
        
        // Filter only active categories and sort by display order
        const categories = allCategories
            .filter(cat => cat.is_active)
            .sort((a, b) => a.display_order - b.display_order)
            .map(cat => cat.name);
        
        // Clear existing buttons
        filterTabs.innerHTML = '';
        
        // Add "All Products" button
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.textContent = 'All Products';
        allBtn.addEventListener('click', function() {
            filterProducts('All Products');
        });
        filterTabs.appendChild(allBtn);
        
        // Add category buttons
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = category;
            btn.addEventListener('click', function() {
                filterProducts(category);
            });
            filterTabs.appendChild(btn);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if API fails
        const defaultCategories = ['Face', 'Body', 'Hair', 'Oil'];
        
        filterTabs.innerHTML = '';
        
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.textContent = 'All Products';
        allBtn.addEventListener('click', function() {
            filterProducts('All Products');
        });
        filterTabs.appendChild(allBtn);
        
        defaultCategories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = category;
            btn.addEventListener('click', function() {
                filterProducts(category);
            });
            filterTabs.appendChild(btn);
        });
    }
}

// Initialize product modal functionality
function initProductModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    const qtyMinus = modal.querySelector('.qty-btn.minus');
    const qtyPlus = modal.querySelector('.qty-btn.plus');
    const qtyInput = modal.querySelector('.qty-input');
    
    // Close modal handlers
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', closeProductModal);
    }
    
    // Quantity controls
    if (qtyMinus && qtyInput) {
        qtyMinus.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value) || 1;
            if (currentValue > 1) {
                qtyInput.value = currentValue - 1;
            }
        });
    }
    
    if (qtyPlus && qtyInput) {
        qtyPlus.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value) || 1;
            qtyInput.value = currentValue + 1;
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProductModal();
        }
    });
}

// Make functions globally available
window.showProductDetail = showProductDetail;
window.closeProductModal = closeProductModal;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    initProductModal();
    setupFilters();
});

// Refresh products when returning to products page
document.addEventListener('click', function(e) {
    if (e.target.matches('[data-page="products-page"]')) {
        setTimeout(() => {
            if (allProducts.length > 0) {
                loadAllProducts();
            }
        }, 100);
    }
});

// Make functions globally available
window.filterProducts = filterProducts;
