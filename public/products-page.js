// Products page functionality
let allProducts = [];

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3002/api/products');
        allProducts = await response.json();
        
        // Populate category filter
        populateCategoryFilter();
        
        renderProducts(allProducts);
        applyFilters(); // Apply any active filters
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Get unique categories from products
    const categories = [...new Set(allProducts.map(p => p.category || 'Face'))];
    
    // Clear and repopulate
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.toLowerCase();
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const stockFilter = document.getElementById('stockFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    
    let filtered = allProducts;
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply stock filter
    if (stockFilter !== 'all') {
        filtered = filtered.filter(p => {
            if (stockFilter === 'active') return p.stock > 10;
            if (stockFilter === 'low') return p.stock > 0 && p.stock <= 10;
            if (stockFilter === 'out') return p.stock === 0;
            return true;
        });
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => 
            (p.category || 'Face').toLowerCase() === categoryFilter
        );
    }
    
    renderProducts(filtered);
}

function renderProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div class="no-products"><p>No products found</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        // Determine stock status
        let stockStatus = 'active';
        let stockBadge = 'Active';
        
        if (product.stock === 0) {
            stockStatus = 'out-of-stock';
            stockBadge = 'Out of Stock';
        } else if (product.stock <= 5) {
            stockStatus = 'low-stock';
            stockBadge = 'Low Stock';
        }
        
        const hasOffer = product.offer_percentage && product.offer_percentage > 0;
        const originalPrice = parseFloat(product.price);
        const discountedPrice = hasOffer ? originalPrice * (1 - product.offer_percentage / 100) : originalPrice;
        
        return `
            <div class="product-card">
                <div class="product-status-badge ${stockStatus}">${stockBadge}</div>
                ${hasOffer ? `<div class="offer-badge">${product.offer_percentage}% OFF</div>` : ''}
                
                <div class="product-image-container">
                    ${product.image ? 
                        `<img src="http://localhost:3002${product.image}" alt="${product.name}" class="product-img">` :
                        `<div class="product-placeholder">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                        </div>`
                    }
                </div>
                
                <div class="product-info-section">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-sku">${product.sku || ''} • ${product.category || 'Face'}</p>
                    <div class="product-footer">
                        <div class="product-price">
                            ${hasOffer ? `<span class="original-price">₹${originalPrice.toLocaleString('en-IN')}</span>` : ''}
                            <span class="current-price">₹${discountedPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="product-meta">
                            <span class="product-rating">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                ${product.rating || 0}
                            </span>
                            <span class="product-stock">Stock<br>${product.stock} units</span>
                        </div>
                    </div>
                </div>
                
                <div class="product-actions">
                    <button class="product-action-btn edit" onclick="editProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="product-action-btn delete" onclick="deleteProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('productCount').textContent = `${products.length} Products`;
}

function searchProducts() {
    applyFilters();
}

async function showAddProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('modalTitle').textContent = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        
        // Hide current images
        const currentMainImage = document.getElementById('currentMainImage');
        if (currentMainImage) currentMainImage.style.display = 'none';
        
        const currentSubImages = document.getElementById('currentSubImages');
        if (currentSubImages) currentSubImages.style.display = 'none';
        
        // Hide all sub image previews
        for (let i = 1; i <= 5; i++) {
            const preview = document.getElementById(`previewSubImage${i}`);
            if (preview) preview.style.display = 'none';
        }
        
        const newCategoryInput = document.getElementById('newCategoryInput');
        if (newCategoryInput) newCategoryInput.style.display = 'none';
        
        // Update category dropdown with saved categories - await to ensure it completes
        await updateCategoryDropdown();
        
        modal.classList.add('active');
        
        // Add preview listeners
        setupImagePreviews();
    }
}

function setupImagePreviews() {
    // Main image preview
    const mainImageInput = document.getElementById('productMainImage');
    if (mainImageInput) {
        // Remove existing listener to avoid duplicates
        mainImageInput.removeEventListener('change', handleMainImageChange);
        mainImageInput.addEventListener('change', handleMainImageChange);
    }
    
    // Sub images preview - 5 separate fields
    for (let i = 1; i <= 5; i++) {
        const subImageInput = document.getElementById(`productSubImage${i}`);
        if (subImageInput) {
            // Remove existing listener to avoid duplicates
            subImageInput.removeEventListener('change', handleSubImageChange);
            subImageInput.addEventListener('change', handleSubImageChange);
        }
    }
}

function handleMainImageChange(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('currentMainImagePreview');
    const container = document.getElementById('currentMainImage');
    
    if (file && preview && container) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result;
            container.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function handleSubImageChange(e) {
    const inputId = e.target.id;
    const imageNumber = inputId.replace('productSubImage', '');
    const file = e.target.files[0];
    const previewContainer = document.getElementById(`previewSubImage${imageNumber}`);
    
    if (previewContainer) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = previewContainer.querySelector('img');
                if (img) {
                    img.src = event.target.result;
                    previewContainer.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.style.display = 'none';
        }
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function showProductFilters() {
    // Simple filter implementation
    const filterOptions = ['All', 'Active', 'Low Stock', 'Out of Stock'];
    const selectedFilter = prompt('Select filter:\n' + filterOptions.map((f, i) => `${i + 1}. ${f}`).join('\n'));
    
    if (selectedFilter) {
        const filterIndex = parseInt(selectedFilter) - 1;
        if (filterIndex >= 0 && filterIndex < filterOptions.length) {
            applyProductFilter(filterOptions[filterIndex]);
        }
    }
}

function applyProductFilter(filter) {
    let filtered = allProducts;
    
    switch (filter) {
        case 'Active':
            filtered = allProducts.filter(p => p.stock > 5);
            break;
        case 'Low Stock':
            filtered = allProducts.filter(p => p.stock > 0 && p.stock <= 5);
            break;
        case 'Out of Stock':
            filtered = allProducts.filter(p => p.stock === 0);
            break;
        default:
            filtered = allProducts;
    }
    
    renderProducts(filtered);
    showNotification(`Filter applied: ${filter}`, 'info');
}

async function saveProduct(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const productId = document.getElementById('productId').value;
    
    const price = parseFloat(document.getElementById('productPrice').value);
    
    // Validate price
    if (price < 0) {
        showNotification('Price cannot be negative', 'error');
        return;
    }
    
    if (price > 99999999.99) {
        showNotification('Price cannot exceed ₹99,999,999.99', 'error');
        return;
    }
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('price', price);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('rating', document.getElementById('productRating').value || 0);
    formData.append('benefits', document.getElementById('productBenefits').value || '');
    formData.append('category', document.getElementById('productCategory').value || 'Face');
    
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const url = productId ? 
            `http://localhost:3002/api/products/${productId}` : 
            'http://localhost:3002/api/products';
        
        const method = productId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        if (response.ok) {
            showNotification(productId ? 'Product updated successfully' : 'Product added successfully', 'success');
            closeProductModal();
            loadProducts();
        } else {
            showNotification('Failed to save product', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to save product', 'error');
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(`http://localhost:3002/api/products/${id}`);
        const product = await response.json();
        
        // Update category dropdown first and wait for it to complete
        await updateCategoryDropdown();
        
        const modal = document.getElementById('productModal');
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productRating').value = product.rating || 0;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productBenefits').value = product.benefits || '';
        
        const newCategoryInput = document.getElementById('newCategoryInput');
        if (newCategoryInput) newCategoryInput.style.display = 'none';
        
        // Set category value after dropdown is updated
        document.getElementById('productCategory').value = product.category || 'Face';
        
        // Display current images
        if (product.images && product.images.length > 0) {
            const mainImage = product.images.find(img => img.is_main);
            const subImages = product.images.filter(img => !img.is_main);
            
            // Display main image
            if (mainImage) {
                document.getElementById('currentMainImage').style.display = 'block';
                document.getElementById('currentMainImagePreview').src = `http://localhost:3002${mainImage.image_path}`;
            }
            
            // Display sub images
            if (subImages.length > 0) {
                const subImagesContainer = document.getElementById('currentSubImages');
                const subImagesGrid = document.getElementById('currentSubImagesGrid');
                subImagesContainer.style.display = 'block';
                subImagesGrid.innerHTML = '';
                
                subImages.forEach(img => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.cssText = 'position: relative; width: 80px; height: 80px;';
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = `http://localhost:3002${img.image_path}`;
                    imgElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);';
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '×';
                    deleteBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; background: var(--danger); color: white; border: none; cursor: pointer; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center;';
                    deleteBtn.onclick = () => deleteProductImage(product.id, img.id, imgWrapper);
                    
                    imgWrapper.appendChild(imgElement);
                    imgWrapper.appendChild(deleteBtn);
                    subImagesGrid.appendChild(imgWrapper);
                });
            }
        }
        
        // Setup image previews
        setupImagePreviews();
        
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Failed to load product', 'error');
    }
}

async function deleteProductImage(productId, imageId, element) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3002/api/products/${productId}/images/${imageId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            element.remove();
            showNotification('Image deleted successfully', 'success');
        } else {
            showNotification(result.error || 'Failed to delete image', 'error');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showNotification('Failed to delete image', 'error');
    }
}

// Make function globally available
window.deleteProductImage = deleteProductImage;

async function saveProduct(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const productId = document.getElementById('productId').value;
    const categorySelect = document.getElementById('productCategory');
    
    // Get category value - if "Add New" is selected, use the input value
    let categoryValue = categorySelect.value;
    if (categoryValue === '__add_new__') {
        const newCategoryInput = document.getElementById('newCategoryInput');
        if (!newCategoryInput.value.trim()) {
            showNotification('Please enter a category name or select an existing one', 'error');
            return;
        }
        categoryValue = newCategoryInput.value.trim();
    }
    
    const price = parseFloat(document.getElementById('productPrice').value);
    
    // Validate price
    if (price < 0) {
        showNotification('Price cannot be negative', 'error');
        return;
    }
    
    if (price > 99999999.99) {
        showNotification('Price cannot exceed ₹99,999,999.99', 'error');
        return;
    }
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', price);
    formData.append('rating', document.getElementById('productRating').value || 0);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('benefits', document.getElementById('productBenefits').value || '');
    formData.append('category', categoryValue);
    
    // Handle main image
    const mainImageInput = document.getElementById('productMainImage');
    if (mainImageInput && mainImageInput.files[0]) {
        formData.append('mainImage', mainImageInput.files[0]);
    }
    
    // Handle sub images from 5 separate fields
    for (let i = 1; i <= 5; i++) {
        const subImageInput = document.getElementById(`productSubImage${i}`);
        if (subImageInput && subImageInput.files[0]) {
            formData.append('subImages', subImageInput.files[0]);
        }
    }
    
    try {
        const url = productId ? 
            `http://localhost:3002/api/products/${productId}` : 
            'http://localhost:3002/api/products';
        const method = productId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            closeProductModal();
            loadProducts();
        } else {
            showNotification('Failed to save product', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to save product', 'error');
    }
}

async function deleteProduct(id) {
    // Show custom confirmation modal
    showConfirmModal(
        'Delete Product',
        'Are you sure you want to delete this product?',
        'This action cannot be undone. The product will be permanently removed from your catalog.',
        async () => {
            try {
                const response = await fetch(`http://localhost:3002/api/products/${id}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Product deleted successfully', 'success');
                    loadProducts();
                } else {
                    showNotification('Failed to delete product', 'error');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Failed to delete product', 'error');
            }
        }
    );
}

// Make functions globally available
window.loadProducts = loadProducts;
window.searchProducts = searchProducts;
window.showAddProductModal = showAddProductModal;
window.closeProductModal = closeProductModal;
window.applyFilters = applyFilters;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Initialize when products page loads
if (window.location.hash === '#products' || document.getElementById('productsGrid')) {
    loadProducts();
}


// Category Management Functions
function loadCategories() {
    const savedCategories = localStorage.getItem('productCategories');
    if (savedCategories) {
        return JSON.parse(savedCategories);
    }
    return ['Face', 'Body', 'Hair', 'Oil']; // Default categories
}

function saveCategories(categories) {
    localStorage.setItem('productCategories', JSON.stringify(categories));
}

async function updateCategoryDropdown() {
    try {
        const response = await fetch('http://localhost:3002/api/categories');
        const categories = await response.json();
        
        const select = document.getElementById('productCategory');
        if (!select) return;
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add all active categories
        categories
            .filter(cat => cat.is_active)
            .forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name;
                select.appendChild(option);
            });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Make functions globally available
window.updateCategoryDropdown = updateCategoryDropdown;


// Confirmation Modal Functions
let confirmCallback = null;

function showConfirmModal(title, message, details, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const detailsEl = document.getElementById('confirmDetails');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (!modal) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    detailsEl.textContent = details || '';
    
    // Store callback
    confirmCallback = onConfirm;
    
    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    // Set up confirm button click
    confirmBtn.onclick = () => {
        if (confirmCallback) {
            confirmCallback();
            confirmCallback = null;
        }
        closeConfirmModal();
    };
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    confirmCallback = null;
}

// Make functions globally available
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;
