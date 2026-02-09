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
            <div class="kpi-value">Rs 24.5L</div>
            <div class="kpi-change positive">
                <span class="change-arrow">up</span>
                <span>12.5% vs last month</span>
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span class="kpi-title">Total Orders</span>
            </div>
            <div class="kpi-value">1,248</div>
            <div class="kpi-change positive">
                <span class="change-arrow">up</span>
                <span>8.2% vs last month</span>
            </div>
        </div>

        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span class="kpi-title">Conversion Rate</span>
            </div>
            <div class="kpi-value">3.24%</div>
            <div class="kpi-change negative">
                <span class="change-arrow">down</span>
                <span>2.1% vs last month</span>
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span class="kpi-title">Avg Order Value</span>
            </div>
            <div class="kpi-value">Rs 3,890</div>
            <div class="kpi-change positive">
                <span class="change-arrow">up</span>
                <span>5.7% vs last month</span>
            </div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span class="kpi-title">Active Users</span>
            </div>
            <div class="kpi-value">12.4K</div>
            <div class="kpi-change positive">
                <span class="change-arrow">up</span>
                <span>18.3% vs last month</span>
            </div>
        </div>
        
        <div class="kpi-card gold">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                <span class="kpi-title">Returning Rate</span>
            </div>
            <div class="kpi-value">42.8%</div>
            <div class="kpi-change positive">
                <span class="change-arrow">up</span>
                <span>6.4% vs last month</span>
            </div>
        </div>
    </div>

    <div class="charts-row">
        <div class="chart-card sales-chart">
            <div class="card-header">
                <h3 class="card-title">Sales Overview</h3>
                <select class="period-select">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                </select>
            </div>
            <div class="chart-container">
                <canvas id="salesChart"></canvas>
            </div>
        </div>
        
        <div class="quick-actions-card">
            <h3 class="card-title">Quick Actions</h3>
            <div class="quick-actions-grid">
                <button class="quick-action-btn" onclick="navigateToPage('+"'products'"+')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Add Product</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('+"'orders'"+')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>View Orders</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('+"'customers'"+')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>Customers</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('+"'analytics'"+')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <span>Analytics</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('+"'offers'"+')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/><path d="M9 12l6-6"/><path d="M15 6h6v6"/></svg>
                    <span>Offers</span>
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('+"'settings'"+')">
                    <svg class="action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.66-13.66l-4.24 4.24m0 6l-4.24 4.24M23 12h-6m-6 0H1m18.66 5.66l-4.24-4.24m0-6l-4.24-4.24"/></svg>
                    <span>Settings</span>
                </button>
            </div>
        </div>
    </div>

    <div class="products-alerts-row">
        <div class="top-products-card">
            <h3 class="card-title">Top Products</h3>
            <div class="products-list">
                <div class="product-item">
                    <div class="product-info">
                        <div class="product-image"></div>
                        <div>
                            <div class="product-name">Gold Radiance Serum</div>
                            <div class="product-sales">248 sales</div>
                        </div>
                    </div>
                    <div class="product-revenue">Rs 98,400</div>
                </div>
                <div class="product-item">
                    <div class="product-info">
                        <div class="product-image"></div>
                        <div>
                            <div class="product-name">Luxury Night Cream</div>
                            <div class="product-sales">186 sales</div>
                        </div>
                    </div>
                    <div class="product-revenue">Rs 74,400</div>
                </div>
                <div class="product-item">
                    <div class="product-info">
                        <div class="product-image"></div>
                        <div>
                            <div class="product-name">Hydrating Face Mask</div>
                            <div class="product-sales">142 sales</div>
                        </div>
                    </div>
                    <div class="product-revenue">Rs 56,800</div>
                </div>
            </div>
        </div>
        
        <div class="stock-alerts-card">
            <h3 class="card-title">Stock Alerts</h3>
            <div class="alerts-list">
                <div class="alert-item critical">
                    <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div class="alert-content">
                        <div class="alert-product">Gold Serum</div>
                        <div class="alert-stock">Only 5 units left</div>
                    </div>
                </div>
                <div class="alert-item warning">
                    <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div class="alert-content">
                        <div class="alert-product">Night Cream</div>
                        <div class="alert-stock">12 units remaining</div>
                    </div>
                </div>
                <div class="alert-item warning">
                    <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div class="alert-content">
                        <div class="alert-product">Face Mask</div>
                        <div class="alert-stock">18 units remaining</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="recent-orders-card">
        <div class="card-header">
            <h3 class="card-title">Recent Orders</h3>
            <button class="view-all-btn" onclick="navigateToPage('+"'orders'"+')">View All</button>
        </div>
        <div class="orders-table-container">
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#ORD-1248</td>
                        <td>Priya Sharma</td>
                        <td>Gold Radiance Serum</td>
                        <td>Rs 4,599</td>
                        <td><span class="status-badge completed">Completed</span></td>
                        <td>Jan 15, 2026</td>
                    </tr>
                    <tr>
                        <td>#ORD-1247</td>
                        <td>Rahul Verma</td>
                        <td>Luxury Night Cream</td>
                        <td>Rs 3,299</td>
                        <td><span class="status-badge processing">Processing</span></td>
                        <td>Jan 15, 2026</td>
                    </tr>
                    <tr>
                        <td>#ORD-1246</td>
                        <td>Anita Desai</td>
                        <td>Hydrating Face Mask</td>
                        <td>Rs 2,899</td>
                        <td><span class="status-badge completed">Completed</span></td>
                        <td>Jan 14, 2026</td>
                    </tr>
                    <tr>
                        <td>#ORD-1245</td>
                        <td>Vikram Singh</td>
                        <td>Anti-Aging Cream</td>
                        <td>Rs 5,499</td>
                        <td><span class="status-badge pending">Pending</span></td>
                        <td>Jan 14, 2026</td>
                    </tr>
                    <tr>
                        <td>#ORD-1244</td>
                        <td>Meera Patel</td>
                        <td>Vitamin C Serum</td>
                        <td>Rs 3,899</td>
                        <td><span class="status-badge completed">Completed</span></td>
                        <td>Jan 14, 2026</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
`;

adminPages.home = '<div class="page-header"><h1 class="page-title">Home Page</h1></div>';
adminPages.about = '<div class="page-header"><h1 class="page-title">About Us</h1></div>';
adminPages.gallery = '<div class="page-header"><h1 class="page-title">Gallery</h1></div>';
adminPages.products = '<div class="page-header"><h1 class="page-title">Products</h1></div>';
adminPages["product-details"] = '<div class="page-header"><h1 class="page-title">Product Details</h1></div>';
adminPages.inventory = '<div class="page-header"><h1 class="page-title">Inventory</h1></div>';
adminPages.orders = '<div class="page-header"><h1 class="page-title">Orders</h1></div>';
adminPages.payments = '<div class="page-header"><h1 class="page-title">Payments</h1></div>';
adminPages.customers = '<div class="page-header"><h1 class="page-title">Customers</h1></div>';
adminPages.reviews = '<div class="page-header"><h1 class="page-title">Reviews</h1></div>';
adminPages.qna = '<div class="page-header"><h1 class="page-title">Q&A</h1></div>';
adminPages.offers = '<div class="page-header"><h1 class="page-title">Offers & Bundles</h1></div>';
adminPages.marketing = '<div class="page-header"><h1 class="page-title">Marketing</h1></div>';
adminPages.cms = '<div class="page-header"><h1 class="page-title">CMS Pages</h1></div>';
adminPages.seo = '<div class="page-header"><h1 class="page-title">SEO</h1></div>';
adminPages.analytics = '<div class="page-header"><h1 class="page-title">Analytics</h1></div>';
adminPages.settings = '<div class="page-header"><h1 class="page-title">Settings</h1></div>';
adminPages.accessibility = '<div class="page-header"><h1 class="page-title">Accessibility</h1></div>';
adminPages.security = '<div class="page-header"><h1 class="page-title">Security</h1></div>';

window.adminPages = adminPages;
