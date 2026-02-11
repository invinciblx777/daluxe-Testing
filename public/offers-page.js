// Offers page functionality
let offersProducts = [];
let currentGSTRate = 18; // Default GST rate
let filteredProducts = [];
let currentOfferProduct = null;

async function loadOffers() {
    try {
        console.log('🎯 Loading offers and products from Supabase...');

        // Load all products
        const { data, error } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;

        offersProducts = data.map(product => {
            let mainImage = null;
            if (product.image) {
                mainImage = product.image;
            } else if (product.product_images && product.product_images.length > 0) {
                const main = product.product_images.find(img => img.is_main) || product.product_images[0];
                mainImage = main.image_path;
            }
            return {
                ...product,
                image: mainImage
            };
        });

        filteredProducts = [...offersProducts];

        console.log('🎯 Loaded products for offers:', offersProducts.length);

        // Load current GST rate from localStorage
        const savedGSTRate = localStorage.getItem('gstRate');
        if (savedGSTRate) {
            currentGSTRate = parseFloat(savedGSTRate);
            document.getElementById('currentGSTRate').textContent = currentGSTRate + '%';
            document.getElementById(`gst${currentGSTRate}`).checked = true;
        }

        renderOffers();
        updateOfferStats();

    } catch (error) {
        console.error('Error loading offers:', error);
        document.getElementById('offersGrid').innerHTML =
            '<div class="error">Failed to load offers</div>';
    }
}

function renderOffers() {
    const container = document.getElementById('offersGrid');
    if (!container) return;

    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="no-data">No products available for offers</div>';
        return;
    }

    container.innerHTML = filteredProducts.map(product => {
        const hasOffer = product.offer_percentage && product.offer_percentage > 0;
        const originalPrice = parseFloat(product.price);
        const discountedPrice = hasOffer ? originalPrice * (1 - product.offer_percentage / 100) : originalPrice;
        const savings = hasOffer ? originalPrice - discountedPrice : 0;

        return `
            <div class="offer-product-card">
                <div class="offer-product-image">
                    ${product.image ?
                `<img src="${product.image}" alt="${product.name}" onerror="this.src='placeholder-product.png'" />` :
                `<div class="product-placeholder">📦</div>`
            }
                    ${hasOffer ? `<div class="offer-badge">${product.offer_percentage}% OFF</div>` : ''}
                </div>
                
                <div class="offer-product-info">
                    <h3 class="offer-product-name">${product.name}</h3>
                    <div class="offer-product-sku">SKU: ${product.sku || 'N/A'}</div>
                    
                    <div class="offer-pricing">
                        ${hasOffer ? `
                            <div class="pricing-row">
                                <span class="original-price">₹${originalPrice.toLocaleString('en-IN')}</span>
                                <span class="discounted-price">₹${discountedPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div class="savings-info">You save ₹${savings.toLocaleString('en-IN')}</div>
                        ` : `
                            <div class="pricing-row">
                                <span class="current-price">₹${originalPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div class="no-offer-text">No offer applied</div>
                        `}
                    </div>
                    
                    <div class="offer-stock-info">
                        <span class="stock-count">Stock: ${product.stock}</span>
                        <span class="stock-status ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}">
                            ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </div>
                
                <div class="offer-actions">
                    <button class="btn-primary offer-btn" onclick="showOfferModal(${product.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${hasOffer ? 'Edit Offer' : 'Add Offer'}
                    </button>
                    ${hasOffer ? `
                        <button class="btn-secondary remove-offer-btn" onclick="removeOffer(${product.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Remove
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function showOffersTab() {
    document.querySelectorAll('.offer-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById('offersTab').classList.add('active');
}

function showGSTTab() {
    document.querySelectorAll('.offer-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById('gstTab').classList.add('active');
}

// Search and filter functions
function searchOffers() {
    const searchTerm = document.getElementById('offerSearch').value.toLowerCase();
    filteredProducts = offersProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm))
    );
    renderOffers();
    updateOfferStats();
}

function filterOffers() {
    const filterValue = document.getElementById('offerFilter').value;

    switch (filterValue) {
        case 'with-offers':
            filteredProducts = offersProducts.filter(product =>
                product.offer_percentage && product.offer_percentage > 0
            );
            break;
        case 'without-offers':
            filteredProducts = offersProducts.filter(product =>
                !product.offer_percentage || product.offer_percentage === 0
            );
            break;
        default:
            filteredProducts = [...offersProducts];
    }

    renderOffers();
    updateOfferStats();
}

function updateOfferStats() {
    const withOffers = offersProducts.filter(p => p.offer_percentage && p.offer_percentage > 0).length;
    const statsElement = document.getElementById('offerStats');
    if (statsElement) {
        statsElement.textContent = `${withOffers} products with offers`;
    }
}

// Show offer modal
function showOfferModal(productId) {
    const product = offersProducts.find(p => p.id === productId);
    if (!product) return;

    currentOfferProduct = product;

    // Populate modal
    document.getElementById('offerModalTitle').textContent =
        product.offer_percentage > 0 ? 'Edit Offer' : 'Add Offer';

    document.getElementById('offerProductInfo').innerHTML = `
        <div class="offer-modal-product">
            <div class="modal-product-image">
                ${product.image ?
            `<img src="${product.image}" alt="${product.name}" onerror="this.src='placeholder-product.png'" />` :
            `<div class="product-placeholder">📦</div>`
        }
            </div>
            <div class="modal-product-details">
                <h4>${product.name}</h4>
                <p>SKU: ${product.sku || 'N/A'}</p>
                <p>Current Price: ₹${parseFloat(product.price).toLocaleString('en-IN')}</p>
                <p>Stock: ${product.stock}</p>
            </div>
        </div>
    `;

    // Set current offer percentage
    document.getElementById('offerPercentage').value = product.offer_percentage || '';

    // Update price preview
    updatePricePreview();

    // Show modal
    document.getElementById('offerModal').style.display = 'flex';
}

function closeOfferModal() {
    document.getElementById('offerModal').style.display = 'none';
    currentOfferProduct = null;
}

function updatePricePreview() {
    if (!currentOfferProduct) return;

    const percentage = parseFloat(document.getElementById('offerPercentage').value) || 0;
    const originalPrice = parseFloat(currentOfferProduct.price);
    const discountAmount = originalPrice * (percentage / 100);
    const finalPrice = originalPrice - discountAmount;

    document.getElementById('previewOriginalPrice').textContent = `₹${originalPrice.toLocaleString('en-IN')}`;
    document.getElementById('previewDiscountAmount').textContent = `₹${discountAmount.toLocaleString('en-IN')}`;
    document.getElementById('previewFinalPrice').textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
}

// Add event listener for percentage input
document.addEventListener('DOMContentLoaded', function () {
    const percentageInput = document.getElementById('offerPercentage');
    if (percentageInput) {
        percentageInput.addEventListener('input', updatePricePreview);
    }
});

async function saveOffer() {
    if (!currentOfferProduct) return;

    const percentage = parseFloat(document.getElementById('offerPercentage').value);

    if (isNaN(percentage) || percentage < 0 || percentage > 90) {
        alert('Please enter a valid percentage between 0 and 90');
        return;
    }

    try {
        const { error } = await supabase
            .from('products')
            .update({ offer_percentage: percentage })
            .eq('id', currentOfferProduct.id);

        if (error) throw error;

        showNotification('Offer updated successfully', 'success');

        // Update local data
        const productIndex = offersProducts.findIndex(p => p.id === currentOfferProduct.id);
        if (productIndex !== -1) {
            offersProducts[productIndex].offer_percentage = percentage;
        }

        closeOfferModal();
        renderOffers();
        updateOfferStats();

    } catch (error) {
        console.error('Error updating offer:', error);
        showNotification('Failed to update offer', 'error');
    }
}

function editOffer(productId) {
    showOfferModal(productId);
}

async function updateProductOffer(productId, offerPercentage) {
    try {
        const { error } = await supabase
            .from('products')
            .update({ offer_percentage: offerPercentage })
            .eq('id', productId);

        if (error) throw error;

        showNotification('Offer updated successfully', 'success');

        // Update local data
        const productIndex = offersProducts.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            offersProducts[productIndex].offer_percentage = offerPercentage;
        }

        renderOffers();
        updateOfferStats();

    } catch (error) {
        console.error('Error updating offer:', error);
        showNotification('Failed to update offer', 'error');
    }
}

async function removeOffer(productId) {
    if (confirm('Are you sure you want to remove this offer?')) {
        await updateProductOffer(productId, 0);
    }
}

// GST Management Functions
function selectGSTRate(rate) {
    document.querySelectorAll('input[name="gstRate"]').forEach(input => {
        input.checked = false;
    });
    document.getElementById(`gst${rate}`).checked = true;
    currentGSTRate = rate;

    // Update display
    document.getElementById('currentGSTRate').textContent = rate + '%';

    // Update calculator if price is entered
    calculateGSTImpact();
}

function updateGSTRate() {
    const selectedRate = document.querySelector('input[name="gstRate"]:checked');
    if (!selectedRate) {
        alert('Please select a GST rate');
        return;
    }

    const rate = parseInt(selectedRate.value);
    currentGSTRate = rate;

    // Save to localStorage for cart calculations
    localStorage.setItem('gstRate', rate);

    // Update display
    document.getElementById('currentGSTRate').textContent = rate + '%';

    showNotification(`GST rate updated to ${rate}%`, 'success');
    console.log('GST rate updated to:', rate + '%');
}

function calculateGSTImpact() {
    const priceInput = document.getElementById('calcPrice');
    const price = parseFloat(priceInput.value) || 0;

    if (price <= 0) {
        document.getElementById('calcBasePrice').textContent = '₹0';
        document.getElementById('calcGSTAmount').textContent = '₹0';
        document.getElementById('calcTotalPrice').textContent = '₹0';
        return;
    }

    const gstAmount = Math.round(price * (currentGSTRate / 100));
    const totalPrice = price + gstAmount;

    document.getElementById('calcBasePrice').textContent = `₹${price.toLocaleString('en-IN')}`;
    document.getElementById('calcGSTAmount').textContent = `₹${gstAmount.toLocaleString('en-IN')}`;
    document.getElementById('calcTotalPrice').textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
}

function showBulkOfferModal() {
    const percentage = prompt('Enter offer percentage to apply to all products (0-90):');

    if (percentage !== null) {
        const offerPercentage = parseFloat(percentage);
        if (isNaN(offerPercentage) || offerPercentage < 0 || offerPercentage > 90) {
            alert('Please enter a valid percentage between 0 and 90');
            return;
        }

        if (confirm(`Apply ${offerPercentage}% offer to all products?`)) {
            applyBulkOffer(offerPercentage);
        }
    }
}

async function applyBulkOffer(percentage) {
    let successCount = 0;
    let errorCount = 0;

    // Use Promise.all for better performance if list isn't huge, or chunk it.
    // For now simple loop
    for (const product of offersProducts) {
        try {
            await updateProductOffer(product.id, percentage);
            successCount++;
        } catch (error) {
            errorCount++;
            console.error(`Failed to update offer for product ${product.id}:`, error);
        }
    }

    showNotification(`Bulk offer applied: ${successCount} success, ${errorCount} errors`,
        errorCount === 0 ? 'success' : 'warning');

    // Reload offers
    loadOffers();
}

// Notification function
function showNotification(message, type = 'info') {
    // Check if global showNotification exists
    if (window.showNotification && window.showNotification !== showNotification) {
        window.showNotification(message, type);
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        color: white;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Make functions globally available
window.loadOffers = loadOffers;
window.showOffersTab = showOffersTab;
window.showGSTTab = showGSTTab;
window.searchOffers = searchOffers;
window.filterOffers = filterOffers;
window.showOfferModal = showOfferModal;
window.closeOfferModal = closeOfferModal;
window.saveOffer = saveOffer;
window.editOffer = editOffer;
window.removeOffer = removeOffer;
window.selectGSTRate = selectGSTRate;
window.updateGSTRate = updateGSTRate;
window.calculateGSTImpact = calculateGSTImpact;
window.showBulkOfferModal = showBulkOfferModal;

// Initialize when offers page loads
if (window.location.hash === '#offers' || document.getElementById('offersGrid')) {
    console.log('🎯 Offers page detected, loading offers...');
    loadOffers();
}