const fetch = require('node-fetch');

async function testCreateOrder() {
    const testOrder = {
        orderId: 'ORD-TEST-' + Date.now(),
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '9999999999',
        deliveryAddress: 'Test Address, Test City, Test State - 123456',
        paymentMethod: 'CARD',
        paymentStatus: 'Paid',
        orderStatus: 'Pending',
        items: [
            {
                productId: 1,
                productName: 'Test Product',
                quantity: 2,
                price: 999,
                total: 1998
            }
        ],
        subtotal: 1998,
        deliveryCharge: 50,
        tax: 369,
        discount: 0,
        totalAmount: 2417,
        orderDate: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
        console.log('🚀 Creating test order...');
        console.log('📦 Order data:', JSON.stringify(testOrder, null, 2));
        
        const response = await fetch('http://localhost:3002/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testOrder)
        });

        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Order created successfully:', result);
        } else {
            const error = await response.text();
            console.error('❌ Error:', error);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testCreateOrder();