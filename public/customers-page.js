// Customers page functionality
let allCustomers = [];

async function loadCustomers() {
    try {
        console.log('👥 Loading customers from Supabase orders...');
        // Get customers from orders (simple approach) - aligned with legacy logic
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group orders by customer phone (unique identifier)
        const customerMap = new Map();

        orders.forEach(order => {
            const key = order.customer_phone;
            if (customerMap.has(key)) {
                const customer = customerMap.get(key);
                customer.orders.push(order);
                customer.totalSpent += parseFloat(order.total_amount);
                customer.totalOrders++;
                if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
                    customer.lastOrderDate = order.created_at;
                }
            } else {
                customerMap.set(key, {
                    name: order.customer_name,
                    email: order.customer_email || '',
                    phone: order.customer_phone,
                    address: order.delivery_address,
                    orders: [order],
                    totalOrders: 1,
                    totalSpent: parseFloat(order.total_amount),
                    firstOrderDate: order.created_at,
                    lastOrderDate: order.created_at,
                    status: parseFloat(order.total_amount) > 5000 ? 'VIP' : 'Active'
                });
            }
        });

        allCustomers = Array.from(customerMap.values());
        console.log(`✅ Processed ${allCustomers.length} unique customers`);

        renderCustomers(allCustomers);

    } catch (error) {
        console.error('Error loading customers:', error);
        document.getElementById('customersTableBody').innerHTML =
            '<tr><td colspan="7" style="text-align: center; padding: 40px; color: red;">Failed to load customers</td></tr>';
    }
}

function renderCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No customers found</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => {
        const lastOrderDate = new Date(customer.lastOrderDate).toLocaleDateString('en-IN');
        const avatar = customer.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        return `
            <tr>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${avatar}</div>
                        <div class="customer-info">
                            <div class="customer-name">${customer.name}</div>
                            <div class="customer-email">${customer.email || customer.phone}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>${customer.phone}</div>
                    <div style="font-size: 12px; color: #666;">${customer.email || 'No email'}</div>
                </td>
                <td>
                    <span class="orders-count">${customer.totalOrders} orders</span>
                </td>
                <td>
                    <span class="total-spent">₹${customer.totalSpent.toLocaleString('en-IN')}</span>
                </td>
                <td>
                    <span class="last-order">${lastOrderDate}</span>
                </td>
                <td>
                    <span class="customer-status-badge ${customer.status.toLowerCase()}">${customer.status}</span>
                </td>
                <td>
                    <button class="action-btn" onclick="viewCustomerDetails('${customer.phone}')">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const filtered = allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm))
    );
    renderCustomers(filtered);
}

function viewCustomerDetails(phone) {
    const customer = allCustomers.find(c => c.phone === phone);
    if (!customer) return;

    const ordersList = customer.orders.map(order =>
        `• ${order.order_id || 'ID-N/A'} - ₹${parseFloat(order.total_amount).toLocaleString('en-IN')} (${order.status})`
    ).join('\n');

    const details = `
CUSTOMER DETAILS
================
Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || 'Not provided'}
Status: ${customer.status}

STATISTICS:
Total Orders: ${customer.totalOrders}
Total Spent: ₹${customer.totalSpent.toLocaleString('en-IN')}
First Order: ${new Date(customer.firstOrderDate).toLocaleDateString('en-IN')}
Last Order: ${new Date(customer.lastOrderDate).toLocaleDateString('en-IN')}

DELIVERY ADDRESS:
${customer.address}

ORDER HISTORY:
${ordersList}
    `;

    alert(details);
}

function exportCustomers() {
    // Show export options
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.top = '100px';
    menu.style.right = '24px';
    menu.innerHTML = `
        <div class="context-menu-item" onclick="exportCustomersToPDF()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
            </svg>
            Export as PDF
        </div>
        <div class="context-menu-item" onclick="exportCustomersToExcel()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
            </svg>
            Export as Excel
        </div>
    `;

    document.body.appendChild(menu);

    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

function exportCustomersToPDF() {
    // Create PDF-ready HTML content
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Customers Report - DALUXE</title>
            <style>
                @media print {
                    @page { margin: 1cm; }
                    body { margin: 0; }
                }
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                h1 { 
                    color: #d4a574; 
                    text-align: center;
                    margin-bottom: 10px;
                }
                .report-info {
                    text-align: center;
                    color: #666;
                    margin-bottom: 30px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left;
                    font-size: 12px;
                }
                th { 
                    background-color: #d4a574; 
                    color: white;
                    font-weight: 600;
                }
                tr:nth-child(even) { 
                    background-color: #f9f9f9; 
                }
                .total-row {
                    font-weight: bold;
                    background-color: #f0f0f0 !important;
                }
            </style>
        </head>
        <body>
            <h1>DALUXE - Customers Report</h1>
            <div class="report-info">
                <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
                <p>Total Customers: ${allCustomers.length}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Total Orders</th>
                        <th>Total Spent</th>
                        <th>Status</th>
                        <th>Last Order</th>
                    </tr>
                </thead>
                <tbody>
                    ${allCustomers.map(customer => `
                        <tr>
                            <td>${customer.name}</td>
                            <td>${customer.phone}</td>
                            <td>${customer.email || 'N/A'}</td>
                            <td>${customer.totalOrders}</td>
                            <td>₹${customer.totalSpent.toLocaleString('en-IN')}</td>
                            <td>${customer.status}</td>
                            <td>${new Date(customer.lastOrderDate).toLocaleDateString('en-IN')}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="3">TOTAL</td>
                        <td>${allCustomers.reduce((sum, c) => sum + c.totalOrders, 0)}</td>
                        <td>₹${allCustomers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('en-IN')}</td>
                        <td colspan="2">${allCustomers.length} Customers</td>
                    </tr>
                </tbody>
            </table>
            <script>
                // Auto-print when opened
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;

    // Create blob and download as HTML (can be saved as PDF using browser's print to PDF)
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_report_${new Date().toISOString().split('T')[0]}.html`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open in new window for immediate printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();

    showNotification('PDF report downloaded. Use browser Print to PDF option.', 'success');
}

function exportCustomersToExcel() {
    // Create CSV content
    const headers = ['Customer Name', 'Phone', 'Email', 'Total Orders', 'Total Spent', 'Status', 'First Order', 'Last Order'];
    const rows = allCustomers.map(customer => [
        customer.name,
        customer.phone,
        customer.email || '',
        customer.totalOrders,
        customer.totalSpent.toFixed(2),
        customer.status,
        new Date(customer.firstOrderDate).toLocaleDateString('en-IN'),
        new Date(customer.lastOrderDate).toLocaleDateString('en-IN')
    ]);

    // Convert to CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Excel file downloaded successfully', 'success');
}

// Make functions globally available
window.loadCustomers = loadCustomers;
window.searchCustomers = searchCustomers;
window.viewCustomerDetails = viewCustomerDetails;
window.exportCustomers = exportCustomers;
window.exportCustomersToPDF = exportCustomersToPDF;
window.exportCustomersToExcel = exportCustomersToExcel;

// Initialize when customers page loads
if (window.location.hash === '#customers' || document.getElementById('customersTableBody')) {
    loadCustomers();
}