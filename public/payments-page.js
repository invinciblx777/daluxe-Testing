// Payments page functionality
let allPayments = [];

async function loadPayments() {
    try {
        console.log('💳 Loading payments from Supabase (orders)...');

        // Fetch all orders from Supabase
        const { data: orders, error } = await supabase
            .from('orders')
            .select('order_id, customer_name, payment_method, total_amount, payment_status, created_at, order_date')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform orders into payment records
        allPayments = orders.map(order => ({
            orderId: order.order_id,
            customerName: order.customer_name,
            paymentMethod: order.payment_method,
            amount: parseFloat(order.total_amount),
            status: order.payment_status,
            date: order.created_at || order.order_date
        }));

        console.log('💳 Loaded payments:', allPayments.length);
        renderPayments(allPayments);

    } catch (error) {
        console.error('Error loading payments:', error);
        document.getElementById('paymentsTableBody').innerHTML =
            '<tr><td colspan="6" style="text-align: center; padding: 40px; color: red;">Failed to load payments</td></tr>';
    }
}

function renderPayments(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No payments found</td></tr>';
        return;
    }

    tbody.innerHTML = payments.map(payment => {
        const date = new Date(payment.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const statusClass = (payment.status || 'pending').toLowerCase();
        const paymentMethod = payment.paymentMethod || 'N/A';

        return `
            <tr>
                <td>${payment.orderId || 'N/A'}</td>
                <td>${payment.customerName || 'N/A'}</td>
                <td>
                    <span class="payment-method-badge ${paymentMethod.toLowerCase()}">
                        ${paymentMethod.toUpperCase()}
                    </span>
                </td>
                <td>₹${(payment.amount || 0).toLocaleString('en-IN')}</td>
                <td>
                    <span class="payment-status-badge ${statusClass}">${payment.status || 'Pending'}</span>
                </td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');
}

function filterPayments(method) {
    // Update active tab
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    if (method === 'all') {
        renderPayments(allPayments);
    } else {
        const filtered = allPayments.filter(payment =>
            (payment.paymentMethod || '').toLowerCase() === method.toLowerCase()
        );
        renderPayments(filtered);
    }
}

// Make functions globally available
window.loadPayments = loadPayments;
window.filterPayments = filterPayments;

// Initialize when payments page loads
if (window.location.hash === '#payments' || document.getElementById('paymentsTableBody')) {
    console.log('💳 Payments page detected, loading payments...');
    loadPayments();
}