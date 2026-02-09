// Dashboard Real Data Loader
let dashboardData = {
    revenue: 0,
    orders: 0,
    totalProducts: 0,
    activeUsers: 0,
    topProducts: [],
    stockAlerts: [],
    recentOrders: [],
    salesData: []
};

async function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');
        
        // Load orders data
        const ordersResponse = await fetch('http://localhost:3002/api/orders');
        const orders = await ordersResponse.json();
        
        // Load products data
        const productsResponse = await fetch('http://localhost:3002/api/products');
        const products = await productsResponse.json();
        
        // Calculate real metrics
        calculateMetrics(orders, products);
        
        // Update dashboard display
        updateDashboardDisplay();
        
        // Load sales chart
        loadSalesChart(orders);
        
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

function calculateMetrics(orders, products) {
    // Calculate total revenue
    dashboardData.revenue = orders.reduce((total, order) => total + parseFloat(order.total_amount), 0);
    
    // Total orders
    dashboardData.orders = orders.length;
    
    // Total products
    dashboardData.totalProducts = products.length;
    
    // Active users (unique customers)
    const uniqueCustomers = new Set(orders.map(order => order.customer_phone));
    dashboardData.activeUsers = uniqueCustomers.size;
    
    // Calculate top products from orders
    const productSales = {};
    orders.forEach(order => {
        try {
            // Skip orders without items
            if (!order.items) {
                return;
            }
            
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            
            // Check if items is an array and not null/undefined
            if (!Array.isArray(items)) {
                return;
            }
            
            items.forEach(item => {
                // Ensure item has required properties
                if (!item || !item.productId || !item.productName) {
                    return;
                }
                
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        id: item.productId,
                        name: item.productName,
                        sales: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].sales += parseInt(item.quantity) || 0;
                productSales[item.productId].revenue += parseFloat(item.total) || 0;
            });
        } catch (e) {
            console.error('Error parsing order items:', e);
        }
    });
    
    // Sort by revenue and get top 5
    dashboardData.topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    // Calculate stock alerts
    dashboardData.stockAlerts = products
        .filter(product => product.stock <= 20) // Low stock threshold
        .map(product => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
            status: product.stock === 0 ? 'out-of-stock' : product.stock <= 5 ? 'critical' : 'warning'
        }))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
    
    // Recent orders (last 5)
    dashboardData.recentOrders = orders
        .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
        .slice(0, 5);
    
    // Sales data for chart (last 7 days)
    const salesByDate = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr);
        salesByDate[dateStr] = 0;
    }
    
    orders.forEach(order => {
        const orderDate = new Date(order.order_date).toISOString().split('T')[0];
        if (salesByDate.hasOwnProperty(orderDate)) {
            salesByDate[orderDate] += parseFloat(order.total_amount);
        }
    });
    
    dashboardData.salesData = last7Days.map(date => ({
        date: date,
        sales: salesByDate[date]
    }));
}

function updateDashboardDisplay() {
    // Update KPI cards
    const revenueElement = document.getElementById('totalRevenue');
    if (revenueElement) {
        revenueElement.textContent = `₹${dashboardData.revenue.toLocaleString('en-IN')}`;
    }
    
    const ordersElement = document.getElementById('totalOrders');
    if (ordersElement) {
        ordersElement.textContent = dashboardData.orders.toLocaleString('en-IN');
    }
    
    const productsElement = document.getElementById('totalProducts');
    if (productsElement) {
        productsElement.textContent = dashboardData.totalProducts.toLocaleString('en-IN');
    }
    
    const activeUsersElement = document.getElementById('activeUsers');
    if (activeUsersElement) {
        activeUsersElement.textContent = dashboardData.activeUsers.toLocaleString('en-IN');
    }
    
    // Update top products
    updateTopProducts();
    
    // Load product images for top products
    loadTopProductsWithImages();
    
    // Update stock alerts
    updateStockAlerts();
    
    // Update recent orders
    updateRecentOrders();
}

async function loadTopProductsWithImages() {
    try {
        // Load all products to get images
        const productsResponse = await fetch('http://localhost:3002/api/products');
        const allProducts = await productsResponse.json();
        
        // Create a map of product ID to product data
        const productMap = {};
        allProducts.forEach(product => {
            productMap[product.id] = product;
        });
        
        // Update top products with image data
        dashboardData.topProducts = dashboardData.topProducts.map(topProduct => {
            const fullProduct = productMap[topProduct.id];
            return {
                ...topProduct,
                image: fullProduct ? fullProduct.image : null
            };
        });
        
        // Re-render top products with images
        updateTopProducts();
        
    } catch (error) {
        console.error('Error loading product images:', error);
    }
}

function updateTopProducts() {
    const container = document.getElementById('topProductsList');
    if (!container) return;
    
    if (dashboardData.topProducts.length === 0) {
        container.innerHTML = '<div class="no-data">No product sales data available</div>';
        return;
    }
    
    container.innerHTML = dashboardData.topProducts.map(product => `
        <div class="product-item">
            <div class="product-info">
                <div class="product-image" style="${product.image ? `background-image: url('http://localhost:3002${product.image}'); background-size: cover; background-position: center;` : 'background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);'}">
                    ${!product.image ? '<span style="font-size: 20px; opacity: 0.5;">📦</span>' : ''}
                </div>
                <div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-sales">${product.sales} sales</div>
                </div>
            </div>
            <div class="product-revenue">₹${product.revenue.toLocaleString('en-IN')}</div>
        </div>
    `).join('');
}

function updateStockAlerts() {
    const container = document.getElementById('stockAlertsList');
    if (!container) return;
    
    if (dashboardData.stockAlerts.length === 0) {
        container.innerHTML = '<div class="no-alerts">All products are well stocked</div>';
        return;
    }
    
    container.innerHTML = dashboardData.stockAlerts.map(alert => `
        <div class="alert-item ${alert.status}">
            <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${alert.status === 'critical' ? 
                    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
                    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
                }
            </svg>
            <div class="alert-content">
                <div class="alert-product">${alert.name}</div>
                <div class="alert-stock">${alert.stock === 0 ? 'Out of stock' : `${alert.stock} units left`}</div>
            </div>
        </div>
    `).join('');
}

function updateRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    if (!container) return;
    
    if (dashboardData.recentOrders.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No recent orders</td></tr>';
        return;
    }
    
    container.innerHTML = dashboardData.recentOrders.map(order => {
        const date = new Date(order.order_date).toLocaleDateString('en-IN');
        return `
            <tr>
                <td>${order.order_id}</td>
                <td>${order.customer_name}</td>
                <td>₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</td>
                <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');
}

function loadSalesChart(orders) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get chart data
    const chartData = dashboardData.salesData;
    const maxSales = Math.max(...chartData.map(d => d.sales), 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 350;
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / chartData.length * 0.7; // 70% width for bars
    const barSpacing = chartWidth / chartData.length * 0.3; // 30% spacing
    
    // Draw axes
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#2d2d2d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw bars
    const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#d4a574';
    const goldLightColor = getComputedStyle(document.documentElement).getPropertyValue('--gold-light').trim() || '#e6c9a8';
    
    chartData.forEach((point, index) => {
        const barHeight = (point.sales / maxSales) * chartHeight;
        const x = padding + (index * chartWidth / chartData.length) + (barSpacing / 2);
        const y = canvas.height - padding - barHeight;
        
        // Create gradient for bar
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding);
        gradient.addColorStop(0, goldColor);
        gradient.addColorStop(1, goldLightColor);
        
        // Draw bar
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw bar border
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw value on top of bar if there's space
        if (point.sales > 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#f2f2f2';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            const valueText = '₹' + (point.sales >= 1000 ? (point.sales / 1000).toFixed(1) + 'k' : point.sales.toFixed(0));
            ctx.fillText(valueText, x + barWidth / 2, y - 8);
        }
    });
    
    // Add date labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#707070';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
    
    chartData.forEach((point, index) => {
        const x = padding + (index * chartWidth / chartData.length) + (barSpacing / 2) + (barWidth / 2);
        const date = new Date(point.date);
        const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        ctx.fillText(label, x, canvas.height - 15);
    });
    
    // Add Y-axis labels
    ctx.textAlign = 'right';
    ctx.font = '13px Inter';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#707070';
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
        const value = (maxSales / steps) * i;
        const y = canvas.height - padding - (chartHeight / steps) * i;
        const label = '₹' + (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0));
        ctx.fillText(label, padding - 10, y + 4);
        
        // Draw grid line
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#2d2d2d';
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

function changeSalesPeriod(period) {
    console.log('📊 Changing sales period to:', period);
    // Reload data based on period
    loadDashboardData();
}

// Make functions globally available
window.loadDashboardData = loadDashboardData;
window.changeSalesPeriod = changeSalesPeriod;