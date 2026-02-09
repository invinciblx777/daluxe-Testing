const adminPages = {};

adminPages.dashboard = `
    <div class="dashboard-header">
        <div>
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Welcome back! Here is what is happening with your store today.</p>
        </div>
        <div class="last-updated">
            <p class="update-label">Last updated</p>
            <p class="update-time" id="lastUpdated"></p>
        </div>
    </div>
    
    <div class="kpi-grid">
        <div class="kpi-card gold">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span class="kpi-title">Total Revenue</span>
            </div>
            <div class="kpi-value" id="totalRevenue">₹0</div>
            <div class="kpi-change positive">
                <span class="change-arrow">↗</span>
                <span>From all orders</span>
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span class="kpi-title">Total Orders</span>
            </div>
            <div class="kpi-value" id="totalOrders">0</div>
            <div class="kpi-change positive">
                <span class="change-arrow">↗</span>
                <span>All time orders</span>
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span class="kpi-title">Total Products</span>
            </div>
            <div class="kpi-value" id="totalProducts">0</div>
            <div class="kpi-change positive">
                <span class="change-arrow">↗</span>
                <span>In catalog</span>
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span class="kpi-title">Total Customers</span>
            </div>
            <div class="kpi-value" id="activeUsers">0</div>
            <div class="kpi-change positive">
                <span class="change-arrow">↗</span>
                <span>Unique customers</span>
            </div>
        </div>
    </div>

    <div class="charts-row">
        <div class="chart-card sales-chart">
            <div class="card-header">
                <h3 class="card-title">Sales Overview</h3>
                <select class="period-select" onchange="changeSalesPeriod(this.value)">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>
            <div class="chart-container">
                <canvas id="salesChart" width="800" height="350"></canvas>
            </div>
        </div>
        
        <div class="quick-actions-card">
            <h3 class="card-title">Quick Actions</h3>
            <div class="quick-actions-grid">
                <button class="quick-action-btn" onclick="navigateToPage('products')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Add Product</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('orders')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>View Orders</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('customers')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    <span>Add Customer</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('offers')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span>Manage Offers</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('payments')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span>Payments</span>
                </button>
            </div>
        </div>
    </div>

    <div class="products-alerts-row">
        <div class="top-products-card">
            <h3 class="card-title">Top Products</h3>
            <div class="products-list" id="topProductsList">
                <div class="loading">Loading top products...</div>
            </div>
        </div>
        
        <div class="stock-alerts-card">
            <h3 class="card-title">Stock Alerts</h3>
            <div class="alerts-list" id="stockAlertsList">
                <div class="loading">Loading stock alerts...</div>
            </div>
        </div>
    </div>

    <div class="recent-orders-card">
        <div class="card-header">
            <h3 class="card-title">Recent Orders</h3>
            <button class="view-all-btn" onclick="navigateToPage('orders')">View All</button>
        </div>
        <div class="orders-table-container">
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                    </tr>
                </thead>
                <tbody id="recentOrdersList">
                    <tr><td colspan="5" style="text-align: center; padding: 20px;">Loading recent orders...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
`;

adminPages.products = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Products</h1>
            <p class="page-subtitle">Manage your product catalog</p>
        </div>
        <button class="primary-btn" onclick="showAddProductModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
        </button>
    </div>
    
    <div class="products-header-bar">
        <div class="search-filter-group">
            <input type="search" id="productSearch" class="search-input" placeholder="Search products..." onkeyup="searchProducts()">
            <select id="stockFilter" class="filter-select" onchange="applyFilters()">
                <option value="all">All Stock Status</option>
                <option value="active">Active</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
            </select>
            <select id="categoryFilter" class="filter-select" onchange="applyFilters()">
                <option value="all">All Categories</option>
            </select>
        </div>
        <div class="product-count" id="productCount">0 products</div>
    </div>
    
    <div class="products-grid" id="productsGrid">
        <div class="loading">Loading products...</div>
    </div>
    
    <!-- Product Modal -->
    <div id="productModal" class="modal">
        <div class="modal-backdrop" onclick="closeProductModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Add Product</h2>
                <button class="modal-close" onclick="closeProductModal()">&times;</button>
            </div>
            <form id="productForm" onsubmit="saveProduct(event)">
                <div class="modal-body">
                    <input type="hidden" id="productId">
                    
                    <div class="form-group">
                        <label for="productName">Product Name *</label>
                        <input type="text" id="productName" name="name" class="form-input" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productPrice">Price *</label>
                            <input type="number" id="productPrice" name="price" class="form-input" step="0.01" min="0" max="99999999.99" required>
                            <small style="color: #666; font-size: 12px;">Maximum price: ₹99,999,999.99</small>
                        </div>
                        <div class="form-group">
                            <label for="productStock">Stock *</label>
                            <input type="number" id="productStock" name="stock" class="form-input" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productRating">Rating (1-5)</label>
                            <input type="number" id="productRating" name="rating" class="form-input" min="1" max="5" step="0.1" placeholder="4.5">
                        </div>
                        <div class="form-group">
                            <label for="productCategory">Category</label>
                            <select id="productCategory" name="category" class="form-input">
                                <option value="Face">Face</option>
                                <option value="Body">Body</option>
                                <option value="Hair">Hair</option>
                                <option value="Oil">Oil</option>
                            </select>
                            <small style="color: var(--text-secondary); font-size: 12px; margin-top: 5px; display: block;">
                                Manage categories in the Categories section
                            </small>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="productDescription">Description</label>
                        <textarea id="productDescription" name="description" class="form-textarea" rows="3" placeholder="Enter product description..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="productBenefits">Benefits (comma-separated)</label>
                        <textarea id="productBenefits" name="benefits" class="form-textarea" rows="3" placeholder="Deep hydration, Reduces wrinkles, Improves skin texture"></textarea>
                        <small style="color: var(--text-muted); font-size: 12px;">Separate each benefit with a comma</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="productImage">Product Images</label>
                        <div class="image-upload-section">
                            <div class="main-image-upload">
                                <label class="upload-label">Main Image *</label>
                                <input type="file" id="productMainImage" name="mainImage" accept="image/*" class="form-input">
                                <div id="currentMainImage" style="display: none; margin-top: 10px;">
                                    <img id="currentMainImagePreview" style="max-width: 150px; max-height: 150px; border-radius: 8px; border: 2px solid var(--gold);">
                                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">Current Main Image</p>
                                </div>
                            </div>
                            
                            <div class="sub-images-upload" style="margin-top: 20px;">
                                <label class="upload-label">Additional Images (up to 5)</label>
                                
                                <div class="sub-images-grid">
                                    <div class="sub-image-item">
                                        <label style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px; display: block;">Image 1</label>
                                        <input type="file" id="productSubImage1" name="subImage1" accept="image/*" class="form-input">
                                        <div id="previewSubImage1" style="display: none; margin-top: 8px;">
                                            <img style="max-width: 80px; max-height: 80px; border-radius: 4px; border: 1px solid var(--border);">
                                        </div>
                                    </div>
                                    
                                    <div class="sub-image-item">
                                        <label style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px; display: block;">Image 2</label>
                                        <input type="file" id="productSubImage2" name="subImage2" accept="image/*" class="form-input">
                                        <div id="previewSubImage2" style="display: none; margin-top: 8px;">
                                            <img style="max-width: 80px; max-height: 80px; border-radius: 4px; border: 1px solid var(--border);">
                                        </div>
                                    </div>
                                    
                                    <div class="sub-image-item">
                                        <label style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px; display: block;">Image 3</label>
                                        <input type="file" id="productSubImage3" name="subImage3" accept="image/*" class="form-input">
                                        <div id="previewSubImage3" style="display: none; margin-top: 8px;">
                                            <img style="max-width: 80px; max-height: 80px; border-radius: 4px; border: 1px solid var(--border);">
                                        </div>
                                    </div>
                                    
                                    <div class="sub-image-item">
                                        <label style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px; display: block;">Image 4</label>
                                        <input type="file" id="productSubImage4" name="subImage4" accept="image/*" class="form-input">
                                        <div id="previewSubImage4" style="display: none; margin-top: 8px;">
                                            <img style="max-width: 80px; max-height: 80px; border-radius: 4px; border: 1px solid var(--border);">
                                        </div>
                                    </div>
                                    
                                    <div class="sub-image-item">
                                        <label style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px; display: block;">Image 5</label>
                                        <input type="file" id="productSubImage5" name="subImage5" accept="image/*" class="form-input">
                                        <div id="previewSubImage5" style="display: none; margin-top: 8px;">
                                            <img style="max-width: 80px; max-height: 80px; border-radius: 4px; border: 1px solid var(--border);">
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="currentSubImages" style="display: none; margin-top: 15px;">
                                    <p style="font-size: 13px; font-weight: 500; margin-bottom: 10px;">Current Additional Images:</p>
                                    <div id="currentSubImagesGrid" style="display: flex; flex-wrap: wrap; gap: 10px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeProductModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Product</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div id="confirmModal" class="modal">
        <div class="modal-backdrop" onclick="closeConfirmModal()"></div>
        <div class="modal-content confirm-modal-content">
            <div class="confirm-modal-header">
                <svg class="confirm-icon warning" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h2 id="confirmTitle">Confirm Action</h2>
                <p id="confirmMessage">Are you sure you want to proceed?</p>
            </div>
            <div class="confirm-modal-body">
                <p id="confirmDetails" style="color: #666; font-size: 14px; text-align: center;"></p>
            </div>
            <div class="confirm-modal-footer">
                <button type="button" class="btn-secondary" onclick="closeConfirmModal()">Cancel</button>
                <button type="button" class="btn-danger" id="confirmActionBtn">Delete</button>
            </div>
        </div>
    </div>
`;

adminPages.categories = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Categories</h1>
            <p class="page-subtitle">Manage product categories</p>
        </div>
        <button class="primary-btn" onclick="showAddCategoryModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Category
        </button>
    </div>
    
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Display Order</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="categoriesTableBody">
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        Loading categories...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <!-- Category Modal -->
    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Add New Category</h2>
                <button class="modal-close" onclick="closeCategoryModal()">&times;</button>
            </div>
            <form onsubmit="saveCategory(event)" class="modal-form">
                <input type="hidden" id="categoryId">
                
                <div class="form-group">
                    <label for="categoryName">Category Name *</label>
                    <input type="text" id="categoryName" class="form-input" required placeholder="e.g., Face, Body, Hair">
                </div>
                
                <div class="form-group">
                    <label for="categoryDescription">Description</label>
                    <textarea id="categoryDescription" class="form-input" rows="3" placeholder="Brief description of this category"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group" id="displayOrderGroup" style="display: none;">
                        <label for="categoryOrder">Display Order</label>
                        <input type="number" id="categoryOrder" class="form-input" min="0" value="0" placeholder="0">
                        <small style="color: var(--text-secondary); font-size: 12px;">Lower numbers appear first</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="categoryActive" checked>
                            <span>Active</span>
                        </label>
                        <small style="color: var(--text-secondary); font-size: 12px; display: block; margin-top: 5px;">
                            Inactive categories won't appear in product filters
                        </small>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="secondary-btn" onclick="closeCategoryModal()">Cancel</button>
                    <button type="submit" class="primary-btn">Save Category</button>
                </div>
            </form>
        </div>
    </div>
`;

adminPages.orders = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Orders</h1>
            <p class="page-subtitle">Manage and track customer orders</p>
        </div>
        <button class="primary-btn" onclick="exportOrders()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
        </button>
    </div>
    
    <div class="orders-tabs">
        <button class="order-tab active" onclick="filterOrders('all')">
            All Orders <span class="tab-count" id="allOrdersCount">0</span>
        </button>
        <button class="order-tab" onclick="filterOrders('pending')">
            Pending <span class="tab-count" id="pendingOrdersCount">0</span>
        </button>
        <button class="order-tab" onclick="filterOrders('shipped')">
            Shipped <span class="tab-count" id="shippedOrdersCount">0</span>
        </button>
        <button class="order-tab" onclick="filterOrders('delivered')">
            Delivered <span class="tab-count" id="deliveredOrdersCount">0</span>
        </button>
    </div>
    
    <div class="orders-toolbar">
        <input type="search" id="orderSearch" class="search-input" placeholder="Search orders..." onkeyup="searchOrders()">
        <select id="paymentFilter" class="filter-select" onchange="filterOrdersByPayment()">
            <option value="all">All Payment Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="cod">Cash on Delivery</option>
            <option value="netbanking">Net Banking</option>
        </select>
    </div>
    
    <div class="orders-table-wrapper">
        <table class="orders-data-table">
            <thead>
                <tr>
                    <th>ORDER</th>
                    <th>CUSTOMER</th>
                    <th>PRODUCTS</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>PAYMENT</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody id="ordersTableBody">
                <tr><td colspan="8" style="text-align: center; padding: 40px;">Loading orders...</td></tr>
            </tbody>
        </table>
    </div>
`;

adminPages.payments = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Payments</h1>
            <p class="page-subtitle">Track payment methods and transactions</p>
        </div>
    </div>
    
    <div class="payment-tabs">
        <button class="payment-tab active" onclick="filterPayments('all')">All Payments</button>
        <button class="payment-tab" onclick="filterPayments('card')">Card Payments</button>
        <button class="payment-tab" onclick="filterPayments('upi')">UPI Payments</button>
        <button class="payment-tab" onclick="filterPayments('cod')">Cash on Delivery</button>
        <button class="payment-tab" onclick="filterPayments('netbanking')">Net Banking</button>
    </div>
    
    <div class="payments-table-wrapper">
        <table class="payments-data-table">
            <thead>
                <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>PAYMENT METHOD</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                </tr>
            </thead>
            <tbody id="paymentsTableBody">
                <tr><td colspan="6" style="text-align: center; padding: 40px;">Loading payments...</td></tr>
            </tbody>
        </table>
    </div>
`;

adminPages.customers = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Customers</h1>
            <p class="page-subtitle">Manage customer information and order history</p>
        </div>
        <button class="primary-btn" onclick="exportCustomers()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
        </button>
    </div>

    <div class="customers-table-container">
        <div class="table-header">
            <div class="search-container">
                <input type="text" id="customerSearch" placeholder="Search customers..." onkeyup="searchCustomers()">
            </div>
        </div>
        
        <table class="customers-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="customersTableBody">
                <tr><td colspan="7" style="text-align: center; padding: 40px;">Loading customers...</td></tr>
            </tbody>
        </table>
    </div>
`;

adminPages.messages = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Messages</h1>
            <p class="page-subtitle">Contact form submissions from customers</p>
        </div>
        <div class="stats-row">
            <div class="stat-box">
                <span class="stat-label">Total Messages</span>
                <span class="stat-value" id="totalMessages">0</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Unread</span>
                <span class="stat-value unread" id="unreadMessages">0</span>
            </div>
        </div>
    </div>
    
    <div class="filter-bar">
        <button class="filter-btn active" onclick="filterMessages('all')">All Messages</button>
        <button class="filter-btn" onclick="filterMessages('unread')">Unread</button>
        <button class="filter-btn" onclick="filterMessages('read')">Read</button>
    </div>
    
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>From</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="messagesTableBody">
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        Loading messages...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <!-- Message View Modal -->
    <div id="messageModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Message Details</h2>
                <button class="modal-close" onclick="closeMessageModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="message-detail-row">
                    <strong>From:</strong>
                    <span id="viewMessageName"></span>
                </div>
                <div class="message-detail-row">
                    <strong>Email:</strong>
                    <span id="viewMessageEmail"></span>
                </div>
                <div class="message-detail-row">
                    <strong>Phone:</strong>
                    <span id="viewMessagePhone"></span>
                </div>
                <div class="message-detail-row">
                    <strong>Date:</strong>
                    <span id="viewMessageDate"></span>
                </div>
                <div class="message-detail-content">
                    <strong>Message:</strong>
                    <p id="viewMessageContent"></p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary-btn" onclick="closeMessageModal()">Close</button>
            </div>
        </div>
    </div>
`;

adminPages.offers = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Offers & Bundles</h1>
            <p class="page-subtitle">Manage product offers, discounts and GST settings</p>
        </div>
        <button class="primary-btn" onclick="showBulkOfferModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Bulk Offer
        </button>
    </div>
    
    <div class="offers-tabs">
        <button class="offer-tab active" onclick="showOffersTab()">Product Offers</button>
        <button class="offer-tab" onclick="showGSTTab()">GST Settings</button>
    </div>
    
    <div id="offersTab" class="tab-content active">
        <div class="offers-toolbar">
            <div class="search-filter-group">
                <input type="search" id="offerSearch" class="search-input" placeholder="Search products..." onkeyup="searchOffers()">
                <select id="offerFilter" class="filter-select" onchange="filterOffers()">
                    <option value="all">All Products</option>
                    <option value="with-offers">With Offers</option>
                    <option value="without-offers">Without Offers</option>
                </select>
            </div>
            <div class="offer-stats">
                <span id="offerStats">0 products with offers</span>
            </div>
        </div>
        
        <div class="offers-grid" id="offersGrid">
            <div class="loading">Loading products...</div>
        </div>
    </div>
    
    <div id="gstTab" class="tab-content">
        <div class="gst-settings-container">
            <div class="gst-settings-card">
                <h3>Current GST Rate</h3>
                <div class="current-gst-display">
                    <span class="gst-rate-value" id="currentGSTRate">18%</span>
                    <span class="gst-rate-label">GST</span>
                </div>
                <p class="gst-description">This rate applies to all new orders and cart calculations</p>
            </div>
            
            <div class="gst-options-card">
                <h3>Update GST Rate</h3>
                <div class="gst-options">
                    <div class="gst-option" onclick="selectGSTRate(0)">
                        <input type="radio" id="gst0" name="gstRate" value="0">
                        <div class="gst-option-content">
                            <div class="gst-percentage">0%</div>
                            <div class="gst-category">Essential Items</div>
                            <div class="gst-examples">Basic food items, medicines</div>
                        </div>
                    </div>
                    
                    <div class="gst-option" onclick="selectGSTRate(5)">
                        <input type="radio" id="gst5" name="gstRate" value="5">
                        <div class="gst-option-content">
                            <div class="gst-percentage">5%</div>
                            <div class="gst-category">Basic Necessities</div>
                            <div class="gst-examples">Household items, basic cosmetics</div>
                        </div>
                    </div>
                    
                    <div class="gst-option" onclick="selectGSTRate(18)">
                        <input type="radio" id="gst18" name="gstRate" value="18" checked>
                        <div class="gst-option-content">
                            <div class="gst-percentage">18%</div>
                            <div class="gst-category">Standard Rate</div>
                            <div class="gst-examples">Most goods and services</div>
                        </div>
                    </div>
                    
                    <div class="gst-option" onclick="selectGSTRate(28)">
                        <input type="radio" id="gst28" name="gstRate" value="28">
                        <div class="gst-option-content">
                            <div class="gst-percentage">28%</div>
                            <div class="gst-category">Luxury Items</div>
                            <div class="gst-examples">Premium cosmetics, luxury goods</div>
                        </div>
                    </div>
                </div>
                
                <button class="primary-btn" onclick="updateGSTRate()" style="margin-top: 20px;">
                    Update GST Rate
                </button>
            </div>
            
            <div class="gst-impact-card">
                <h3>GST Impact Calculator</h3>
                <div class="calculator-row">
                    <label>Product Price:</label>
                    <input type="number" id="calcPrice" placeholder="Enter price" onkeyup="calculateGSTImpact()">
                </div>
                <div class="calculator-results" id="gstCalculatorResults">
                    <div class="calc-row">
                        <span>Base Price:</span>
                        <span id="calcBasePrice">₹0</span>
                    </div>
                    <div class="calc-row">
                        <span>GST Amount:</span>
                        <span id="calcGSTAmount">₹0</span>
                    </div>
                    <div class="calc-row total">
                        <span>Total Price:</span>
                        <span id="calcTotalPrice">₹0</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Offer Modal -->
    <div id="offerModal" class="modal">
        <div class="modal-backdrop" onclick="closeOfferModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="offerModalTitle">Add Offer</h2>
                <button class="modal-close" onclick="closeOfferModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="offer-product-info" id="offerProductInfo">
                    <!-- Product info will be populated here -->
                </div>
                
                <div class="form-group">
                    <label for="offerPercentage">Offer Percentage *</label>
                    <div class="percentage-input-group">
                        <input type="number" id="offerPercentage" min="0" max="90" step="1" class="form-input" placeholder="Enter percentage" oninput="updatePricePreview()">
                        <span class="percentage-symbol">%</span>
                    </div>
                    <small class="form-help">Enter a value between 0-90%</small>
                </div>
                
                <div class="price-preview" id="pricePreview">
                    <div class="preview-row">
                        <span>Original Price:</span>
                        <span id="previewOriginalPrice">₹0</span>
                    </div>
                    <div class="preview-row">
                        <span>Discount Amount:</span>
                        <span id="previewDiscountAmount">₹0</span>
                    </div>
                    <div class="preview-row final">
                        <span>Final Price:</span>
                        <span id="previewFinalPrice">₹0</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeOfferModal()">Cancel</button>
                <button type="button" class="btn-primary" onclick="saveOffer()">Save Offer</button>
            </div>
        </div>
    </div>
`;

adminPages.coupons = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Coupon Management</h1>
            <p class="page-subtitle">Create and manage discount coupons for your customers</p>
        </div>
        <button class="primary-btn" onclick="showAddCouponModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Coupon
        </button>
    </div>
    
    <!-- Coupon Statistics -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12c0 1.66-1.34 3-3 3H6c-1.66 0-3-1.34-3-3s1.34-3 3-3h12c1.66 0 3 1.34 3 3z"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="totalCoupons">0</div>
                <div class="stat-label">Total Coupons</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="activeCoupons">0</div>
                <div class="stat-label">Active Coupons</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <path d="M20 8v6M23 11h-6"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="totalUsage">0</div>
                <div class="stat-label">Total Usage</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="totalDiscount">₹0</div>
                <div class="stat-label">Total Discount Given</div>
            </div>
        </div>
    </div>
    
    <!-- Filters and Search -->
    <div class="table-controls">
        <div class="search-filter-group">
            <input type="search" id="couponSearch" class="search-input" placeholder="Search coupons..." onkeyup="filterCoupons()">
            <select id="couponFilter" class="filter-select" onchange="filterCoupons()">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="scheduled">Scheduled</option>
                <option value="exhausted">Exhausted</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
        <button class="secondary-btn" onclick="loadCoupons()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6m16-4a9 9 0 1 1-9-9 9 9 0 0 1 9 9z"/>
            </svg>
            Refresh
        </button>
    </div>
    
    <!-- Coupons Table -->
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Coupon Code</th>
                    <th>Discount</th>
                    <th>Min. Order</th>
                    <th>Usage</th>
                    <th>Valid Period</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="couponsTableBody">
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="loading">Loading coupons...</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <!-- Enhanced Professional Coupon Modal -->
    <div id="couponModal" class="modal">
        <div class="modal-backdrop" onclick="closeCouponModal()"></div>
        <div class="modal-content coupon-modal-professional">
            <div class="modal-header">
                <div class="modal-title-section">
                    <div class="modal-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12c0 1.66-1.34 3-3 3H6c-1.66 0-3-1.34-3-3s1.34-3 3-3h12c1.66 0 3 1.34 3 3z"/>
                            <path d="M7 12h.01M17 12h.01"/>
                        </svg>
                    </div>
                    <div>
                        <h2 id="couponModalTitle">Create New Coupon</h2>
                        <p class="modal-subtitle">Configure promotional discount offers for your customers</p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeCouponModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <form id="couponForm" onsubmit="event.preventDefault(); saveCoupon();">
                <div class="modal-body">
                    <!-- Professional Step Indicator -->
                    <div class="form-steps-professional">
                        <div class="step-professional active" data-step="1">
                            <div class="step-number-professional">1</div>
                            <div class="step-content-professional">
                                <span class="step-title">Basic Information</span>
                                <span class="step-description">Code and description</span>
                            </div>
                        </div>
                        <div class="step-divider-professional"></div>
                        <div class="step-professional" data-step="2">
                            <div class="step-number-professional">2</div>
                            <div class="step-content-professional">
                                <span class="step-title">Discount Configuration</span>
                                <span class="step-description">Type and value settings</span>
                            </div>
                        </div>
                        <div class="step-divider-professional"></div>
                        <div class="step-professional" data-step="3">
                            <div class="step-content-professional">
                                <span class="step-title">Terms & Conditions</span>
                                <span class="step-description">Limits and validity period</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step 1: Basic Information -->
                    <div class="form-step-professional active" data-step="1">
                        <div class="step-header-professional">
                            <h3>Basic Information</h3>
                            <p>Define the fundamental properties of your promotional coupon</p>
                        </div>
                        
                        <div class="form-grid-professional">
                            <div class="form-group-professional">
                                <label for="couponCode" class="form-label-professional required">Coupon Code</label>
                                <div class="input-container-professional">
                                    <input type="text" id="couponCode" name="code" required maxlength="50" 
                                           class="form-input-professional" 
                                           placeholder="Enter unique coupon code (e.g., SAVE20, WELCOME10)" 
                                           style="text-transform: uppercase;">
                                    <div class="input-icon-professional">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 12c0 1.66-1.34 3-3 3H6c-1.66 0-3-1.34-3-3s1.34-3 3-3h12c1.66 0 3 1.34 3 3z"/>
                                            <path d="M7 12h.01M17 12h.01"/>
                                        </svg>
                                    </div>
                                </div>
                                <small class="form-help-professional">Enter a unique, memorable code between 3-50 characters</small>
                            </div>
                            
                            <div class="form-group-professional">
                                <label for="couponDescription" class="form-label-professional">Description</label>
                                <div class="input-container-professional">
                                    <input type="text" id="couponDescription" name="description" maxlength="255" 
                                           class="form-input-professional"
                                           placeholder="Brief description of the promotional offer">
                                    <div class="input-icon-professional">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14,2 14,8 20,8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10,9 9,9 8,9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <small class="form-help-professional">Optional description to help identify this coupon (max 255 characters)</small>
                            </div>
                        </div>
                        
                        <div class="form-navigation-professional">
                            <button type="button" class="nav-btn-professional next-btn-professional" onclick="nextStep()">
                                Continue to Discount Settings
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: Discount Settings -->
                    <div class="form-step-professional" data-step="2">
                        <div class="step-header-professional">
                            <h3>Discount Configuration</h3>
                            <p>Set the discount type, value, and applicable constraints</p>
                        </div>
                        
                        <div class="discount-selector-professional">
                            <div class="discount-card-professional" data-type="percentage">
                                <input type="radio" id="percentageType" name="discount_type" value="percentage" checked>
                                <label for="percentageType" class="discount-label-professional">
                                    <div class="discount-icon-professional">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="19" y1="5" x2="5" y2="19"></line>
                                            <circle cx="6.5" cy="6.5" r="2.5"></circle>
                                            <circle cx="17.5" cy="17.5" r="2.5"></circle>
                                        </svg>
                                    </div>
                                    <div class="discount-content-professional">
                                        <h4>Percentage Discount</h4>
                                        <p>Apply discount as percentage of order total</p>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="discount-card-professional" data-type="fixed">
                                <input type="radio" id="fixedType" name="discount_type" value="fixed">
                                <label for="fixedType" class="discount-label-professional">
                                    <div class="discount-icon-professional">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="12" y1="1" x2="12" y2="23"></line>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                    </div>
                                    <div class="discount-content-professional">
                                        <h4>Fixed Amount Discount</h4>
                                        <p>Apply fixed discount amount in rupees</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-grid-professional">
                            <div class="form-group-professional">
                                <label for="discountValue" class="form-label-professional required">Discount Value</label>
                                <div class="input-with-unit-professional">
                                    <input type="number" id="discountValue" name="discount_value" required min="0" step="0.01" 
                                           class="form-input-professional" placeholder="10">
                                    <div class="input-unit-professional" id="discountUnit">%</div>
                                </div>
                                <small class="form-help-professional" id="discountHelp">Enter the percentage value between 1-100</small>
                            </div>
                            
                            <div class="form-group-professional" id="maxDiscountGroup">
                                <label for="maximumDiscount" class="form-label-professional">Maximum Discount Cap</label>
                                <div class="input-with-unit-professional">
                                    <input type="number" id="maximumDiscount" name="maximum_discount_amount" min="0" step="0.01" 
                                           class="form-input-professional" placeholder="500">
                                    <div class="input-unit-professional">₹</div>
                                </div>
                                <small class="form-help-professional">Maximum discount amount for percentage-based discounts</small>
                            </div>
                        </div>
                        
                        <div class="form-navigation-professional">
                            <button type="button" class="nav-btn-professional prev-btn-professional" onclick="prevStep()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                                Back to Basic Info
                            </button>
                            <button type="button" class="nav-btn-professional next-btn-professional" onclick="nextStep()">
                                Continue to Terms & Conditions
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Step 3: Terms & Conditions -->
                    <div class="form-step-professional" data-step="3">
                        <div class="step-header-professional">
                            <h3>Terms & Conditions</h3>
                            <p>Define usage limitations and validity period for the coupon</p>
                        </div>
                        
                        <div class="form-grid-professional">
                            <div class="form-group-professional">
                                <label for="minimumAmount" class="form-label-professional">Minimum Order Amount</label>
                                <div class="input-with-unit-professional">
                                    <input type="number" id="minimumAmount" name="minimum_order_amount" min="0" step="0.01" 
                                           class="form-input-professional" value="0" placeholder="500">
                                    <div class="input-unit-professional">₹</div>
                                </div>
                                <small class="form-help-professional">Minimum cart value required to apply this coupon</small>
                            </div>
                            
                            <div class="form-group-professional">
                                <label for="usageLimit" class="form-label-professional">Usage Limit</label>
                                <div class="input-container-professional">
                                    <input type="number" id="usageLimit" name="usage_limit" min="1" 
                                           class="form-input-professional" placeholder="100">
                                    <div class="input-icon-professional">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    </div>
                                </div>
                                <small class="form-help-professional">Maximum number of times this coupon can be used (leave empty for unlimited)</small>
                            </div>
                        </div>
                        
                        <div class="form-grid-professional">
                            <div class="form-group-professional">
                                <label for="validFrom" class="form-label-professional required">Valid From</label>
                                <div class="input-container-professional">
                                    <input type="datetime-local" id="validFrom" name="valid_from" required class="form-input-professional">
                                    <div class="input-icon-professional">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </div>
                                </div>
                                <small class="form-help-professional">Date and time when the coupon becomes active</small>
                            </div>
                            
                            <div class="form-group-professional">
                                <label for="validUntil" class="form-label-professional required">Valid Until</label>
                                <div class="input-container-professional">
                                    <input type="datetime-local" id="validUntil" name="valid_until" required class="form-input-professional">
                                    <div class="input-icon-professional">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12,6 12,12 16,14"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <small class="form-help-professional">Date and time when the coupon expires</small>
                            </div>
                        </div>
                        
                        <div class="form-group-professional">
                            <div class="checkbox-container-professional">
                                <div class="custom-checkbox-professional">
                                    <input type="checkbox" id="isActive" name="is_active" checked>
                                    <label for="isActive" class="checkbox-label-professional">
                                        <div class="checkbox-box-professional"></div>
                                        <span class="checkbox-text-professional">Activate coupon immediately upon creation</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-navigation-professional">
                            <button type="button" class="nav-btn-professional prev-btn-professional" onclick="prevStep()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                                Back to Discount Settings
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer-professional">
                    <button type="button" class="btn-secondary-professional" onclick="closeCouponModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary-professional">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17,21 17,13 7,13 7,21"></polyline>
                            <polyline points="7,3 7,8 15,8"></polyline>
                        </svg>
                        Create Coupon
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Coupon Usage Modal -->
    <div id="couponUsageModal" class="modal">
        <div class="modal-backdrop" onclick="closeCouponUsageModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Coupon Usage History</h2>
                <button class="modal-close" onclick="closeCouponUsageModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Order ID</th>
                                <th>Discount Amount</th>
                                <th>Used At</th>
                            </tr>
                        </thead>
                        <tbody id="couponUsageTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
`;

adminPages.ads = `
    <div class="page-header">
        <div>
            <h1 class="page-title">Ad Banners</h1>
            <p class="page-subtitle">Manage promotional banners for home and product pages</p>
        </div>
        <button class="primary-btn" onclick="showAddAdModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Ad Banner
        </button>
    </div>
    
    <!-- Stats Cards -->
    <div class="ads-stats-grid">
        <div class="stat-card">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="totalAdsCount">0</div>
                <div class="stat-label">Total Ads</div>
            </div>
        </div>
        
        <div class="stat-card active">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="activeAdsCount">0</div>
                <div class="stat-label">Active Ads</div>
            </div>
        </div>
        
        <div class="stat-card home">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="homeAdsCount">0</div>
                <div class="stat-label">Home Page</div>
            </div>
        </div>
        
        <div class="stat-card products">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
            </div>
            <div class="stat-content">
                <div class="stat-value" id="productAdsCount">0</div>
                <div class="stat-label">Products Page</div>
            </div>
        </div>
    </div>
    
    <!-- Filters -->
    <div class="ads-toolbar">
        <div class="search-filter-group">
            <input type="search" id="adSearch" class="search-input" placeholder="Search ads..." onkeyup="filterAds()">
            <select id="locationFilter" class="filter-select" onchange="filterAds()">
                <option value="">All Locations</option>
                <option value="home">Home Page</option>
                <option value="products">Products Page</option>
            </select>
            <select id="statusFilter" class="filter-select" onchange="filterAds()">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
    </div>
    
    <!-- Ads Table -->
    <div class="ads-table-container">
        <table class="ads-table">
            <thead>
                <tr>
                    <th>Ad Banner</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Order</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="adsTableBody">
                <tr><td colspan="6" style="text-align: center; padding: 40px;">Loading ads...</td></tr>
            </tbody>
        </table>
    </div>
    
    <!-- Ad Modal -->
    <div id="adModal" class="modal">
        <div class="modal-backdrop" onclick="closeAdModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Add New Ad Banner</h2>
                <button class="modal-close" onclick="closeAdModal()">&times;</button>
            </div>
            <form id="adForm" onsubmit="handleAdSubmit(event)">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="adTitle">Ad Title *</label>
                        <input type="text" id="adTitle" name="title" class="form-input" required placeholder="Enter ad title">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="adLocation">Display Location *</label>
                            <select id="adLocation" name="location" class="form-input" required>
                                <option value="">Select Location</option>
                                <option value="home">Home Page</option>
                                <option value="products">Products Page</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="adDisplayOrder">Display Order</label>
                            <input type="number" id="adDisplayOrder" name="display_order" class="form-input" min="0" placeholder="0">
                            <small class="form-help">Lower numbers appear first</small>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="adIsActive" name="is_active" checked>
                            <span>Active</span>
                        </label>
                        <small class="form-help">Inactive ads won't be displayed on the website</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="adImage">Ad Image *</label>
                        <div id="imageUpload" class="image-upload-area">
                            <input type="file" id="adImage" name="image" accept="image/*" class="form-input" onchange="handleImageUpload(event)" required>
                            <div class="upload-placeholder">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21,15 16,10 5,21"/>
                                </svg>
                                <p>Click to upload image or drag and drop</p>
                                <small>Recommended: 1200x400px, Max size: 5MB</small>
                            </div>
                        </div>
                        
                        <div id="imagePreview" class="image-preview" style="display: none;">
                            <img id="currentImage" alt="Ad preview">
                            <button type="button" class="remove-image-btn" onclick="removeImagePreview()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeAdModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Ad Banner</button>
                </div>
            </form>
        </div>
    </div>
`;

adminPages.settings = `
    <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your store settings</p>
    </div>
    
    <div class="settings-grid">
        <div class="settings-card">
            <h3>Store Information</h3>
            <div class="form-group">
                <label>Store Name</label>
                <input type="text" class="form-input" value="DALUXE" readonly>
            </div>
            <div class="form-group">
                <label>Store Email</label>
                <input type="email" class="form-input" value="daluxe@gmail.com" readonly>
            </div>
        </div>
        
        <div class="settings-card">
            <h3>Order Settings</h3>
            <div class="form-group">
                <label>Order ID Format</label>
                <input type="text" class="form-input" value="ORD-2026-XXXX" readonly>
            </div>
            <div class="form-group">
                <label>Free Delivery Threshold</label>
                <input type="number" class="form-input" value="5000">
            </div>
        </div>
    </div>
`;

// Add other placeholder pages
adminPages.reviews = '<div class="page-header"><h1 class="page-title">Reviews</h1></div>';
adminPages.qna = '<div class="page-header"><h1 class="page-title">Q&A</h1></div>';
adminPages.marketing = '<div class="page-header"><h1 class="page-title">Marketing</h1></div>';
adminPages.cms = '<div class="page-header"><h1 class="page-title">CMS Pages</h1></div>';
adminPages.seo = '<div class="page-header"><h1 class="page-title">SEO</h1></div>';
adminPages.analytics = '<div class="page-header"><h1 class="page-title">Analytics</h1></div>';
adminPages.accessibility = '<div class="page-header"><h1 class="page-title">Accessibility</h1></div>';
adminPages.security = '<div class="page-header"><h1 class="page-title">Security</h1></div>';

window.adminPages = adminPages;