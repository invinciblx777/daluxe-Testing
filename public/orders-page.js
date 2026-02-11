// Orders page functionality
let allOrders = [];
let orderStats = { all: 0, pending: 0, shipped: 0, delivered: 0 };

async function loadOrders() {
    console.log('📦 Loading orders from Supabase...');
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allOrders = orders.map(order => ({
            ...order,
            items: order.order_items || []
        }));

        console.log('📋 Loaded orders:', allOrders.length);

        calculateOrderStats();
        updateOrderStats();
        renderOrders(allOrders);

    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

function calculateOrderStats() {
    orderStats = {
        all: allOrders.length,
        pending: allOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
        shipped: allOrders.filter(o => o.status === 'Shipped').length,
        delivered: allOrders.filter(o => o.status === 'Delivered').length
    };
}

function updateOrderStats() {
    document.getElementById('allOrdersCount').textContent = orderStats.all || 0;
    document.getElementById('pendingOrdersCount').textContent = orderStats.pending || 0;
    document.getElementById('shippedOrdersCount').textContent = orderStats.shipped || 0;
    document.getElementById('deliveredOrdersCount').textContent = orderStats.delivered || 0;
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const statusClass = (order.status || 'Pending').toLowerCase().replace(' ', '-');
        const paymentClass = (order.payment_status || 'Pending').toLowerCase();

        // Handle dates: Supabase uses created_at
        const dateVal = order.created_at || order.order_date;
        const date = new Date(dateVal);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let itemsCount = 0;
        if (order.items && Array.isArray(order.items)) {
            itemsCount = order.items.reduce((total, item) => total + (item.quantity || 0), 0);
        }

        // Generate customer avatar from name
        const customerName = order.customer_name || 'Guest';
        const customerAvatar = customerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        return `
            <tr class="order-row">
                <td>
                    <div class="order-id">${order.order_id}</div>
                </td>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${customerAvatar}</div>
                        <div class="customer-info">
                            <div class="customer-name">${customerName}</div>
                            <div class="customer-email">${order.customer_email || order.customer_phone}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="products-count">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        ${itemsCount} item${itemsCount > 1 ? 's' : ''}
                    </div>
                </td>
                <td>
                    <div class="order-total">
                        ₹${parseFloat(order.total_amount).toLocaleString('en-IN')}
                        ${order.coupon_code ? `<div class="coupon-used"><i class="fas fa-ticket-alt"></i> ${order.coupon_code} (-₹${order.coupon_discount || 0})</div>` : ''}
                    </div>
                </td>
                <td>
                    <span class="order-status-badge ${statusClass}">${order.status || 'Pending'}</span>
                </td>
                <td>
                    <span class="payment-badge ${paymentClass}">${order.payment_status || 'Pending'}</span>
                </td>
                <td>
                    <div class="order-date">${formattedDate}</div>
                </td>
                <td>
                    <div class="order-actions-cell">
                        <button class="action-icon-btn" onclick="viewOrder(${order.id})" title="View Details">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="action-icon-btn" onclick="showOrderMenu(${order.id}, event)" title="More Actions">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterOrders(status) {
    // Update active tab
    document.querySelectorAll('.order-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    if (status === 'all') {
        renderOrders(allOrders);
    } else {
        const filtered = allOrders.filter(order => (order.status || '').toLowerCase() === status.toLowerCase());
        renderOrders(filtered);
    }
}

function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const filtered = allOrders.filter(order =>
        (order.order_id && order.order_id.toLowerCase().includes(searchTerm)) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm)) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm)) ||
        (order.customer_phone && order.customer_phone.toLowerCase().includes(searchTerm))
    );
    renderOrders(filtered);
}

function viewOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    // Items are already parsed and attached in loadOrders
    const items = order.items || [];

    const itemsHtml = items.map(item => `
        <div class="order-item-row">
            <div class="item-info">
                <div class="item-name">${item.product_name}</div>
                <div class="item-id">Product ID: #${item.product_id}</div>
            </div>
            <div class="item-quantity">Qty: ${item.quantity}</div>
            <div class="item-price">₹${parseFloat(item.price).toLocaleString('en-IN')}</div>
            <div class="item-total">₹${(item.quantity * parseFloat(item.price)).toLocaleString('en-IN')}</div>
        </div>
    `).join('');

    const orderDate = new Date(order.created_at || order.order_date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content order-details-modal">
            <div class="modal-header">
                <h2>Order Details</h2>
                <div class="order-id-badge">${order.order_id}</div>
                <button class="modal-close">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="order-details-grid">
                    <!-- Customer Information -->
                    <div class="detail-section">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            Customer Information
                        </h3>
                        <div class="customer-card">
                            <div class="customer-avatar">${order.customer_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}</div>
                            <div class="customer-details">
                                <div class="customer-name">${order.customer_name}</div>
                                <div class="customer-contact">
                                    <div>Phone: ${order.customer_phone}</div>
                                    <div>Email: ${order.customer_email || 'Not provided'}</div>
                                </div>
                                <div class="customer-address">
                                    <strong>Delivery Address:</strong><br>
                                    ${order.shipping_address || order.delivery_address || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Information -->
                    <div class="detail-section">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            Order Information
                        </h3>
                        <div class="order-info-grid">
                            <div class="info-item">
                                <span class="info-label">Order Date:</span>
                                <span class="info-value">${orderDate}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Order Status:</span>
                                <span class="order-status-badge ${order.status.toLowerCase()}">${order.status}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Payment Method:</span>
                                <span class="info-value">${order.payment_method}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Payment Status:</span>
                                <span class="payment-badge ${order.payment_status.toLowerCase()}">${order.payment_status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="detail-section full-width">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Order Items (${items.length} item${items.length > 1 ? 's' : ''})
                    </h3>
                    <div class="order-items-table">
                        <div class="items-header">
                            <div>Product</div>
                            <div>Quantity</div>
                            <div>Price</div>
                            <div>Total</div>
                        </div>
                        ${itemsHtml}
                    </div>
                </div>

                <!-- Billing Summary -->
                <div class="detail-section full-width">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        Billing Summary
                    </h3>
                    <div class="billing-card">
                        <div class="billing-row">
                            <span>Total Amount:</span>
                            <span>₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-secondary" onclick="printOrder(${order.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 6,2 18,2 18,9"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Print Order
                </button>
                <button class="btn-primary" onclick="updateOrderStatus(${order.id}, 'Processing')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Update Status
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
}

function printOrder(orderId) {
    showNotification('Print functionality - Coming soon', 'info');
}

function showOrderMenu(orderId, event) {
    event.stopPropagation();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
        <div class="context-menu-item" onclick="updateOrderStatus(${orderId}, 'Processing')">Mark as Processing</div>
        <div class="context-menu-item" onclick="updateOrderStatus(${orderId}, 'Shipped')">Mark as Shipped</div>
        <div class="context-menu-item" onclick="updateOrderStatus(${orderId}, 'Delivered')">Mark as Delivered</div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item danger" onclick="deleteOrder(${orderId})">Delete Order</div>
    `;

    // Position menu
    const rect = event.target.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = rect.bottom + 5 + 'px';
    menu.style.left = rect.left - 150 + 'px';

    document.body.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        // If order is delivered and payment method is COD, mark as Completed
        const order = allOrders.find(o => o.id === orderId);
        let paymentStatus = order.payment_status;

        if (newStatus === 'Delivered' && order.payment_method.toLowerCase() === 'cod') {
            paymentStatus = 'Completed'; // or Paid
        }

        const { error } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                payment_status: paymentStatus
            })
            .eq('id', orderId);

        if (error) throw error;

        showNotification('Order status updated successfully', 'success');
        loadOrders(); // Reload to refresh UI and calculations

    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Failed to update order status', 'error');
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) throw error;

        showNotification('Order deleted successfully', 'success');
        loadOrders();

    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Failed to delete order', 'error');
    }
}

function exportOrders() {
    showNotification('Export functionality - Coming soon with Supabase', 'info');
    // Implement standard CSV export from allOrders array
}

// Payment Filter Function
function filterOrdersByPayment() {
    const paymentFilter = document.getElementById('paymentFilter')?.value || 'all';

    let filtered = allOrders;

    if (paymentFilter !== 'all') {
        filtered = allOrders.filter(order =>
            order.payment_method.toLowerCase() === paymentFilter.toLowerCase()
        );
    }

    renderOrders(filtered);
}

// Make functions globally available
window.loadOrders = loadOrders;
window.filterOrders = filterOrders;
window.searchOrders = searchOrders;
window.viewOrder = viewOrder;
window.showOrderMenu = showOrderMenu;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.exportOrders = exportOrders;
window.filterOrdersByPayment = filterOrdersByPayment;
window.printOrder = printOrder;

// Initialize when orders page loads
if (window.location.hash === '#orders' || document.getElementById('ordersTableBody')) {
    console.log('🔄 Orders page detected, loading orders...');
    loadOrders();
}
