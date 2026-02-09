// Test script to verify orders API is working
const https = require('https');
const http = require('http');

async function testOrdersAPI() {
    try {
        console.log('🧪 Testing Orders API...');
        
        // Test GET orders using http module
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: '/api/orders',
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📊 API Response Status:', res.statusCode);
                
                try {
                    const orders = JSON.parse(data);
                    console.log('📋 Number of orders:', orders.length);
                    
                    if (orders.length > 0) {
                        console.log('✅ Sample order:', {
                            id: orders[0].id,
                            order_id: orders[0].order_id,
                            customer_name: orders[0].customer_name,
                            status: orders[0].status,
                            total_amount: orders[0].total_amount
                        });
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing response:', parseError.message);
                    console.log('Raw response:', data);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request error:', error.message);
        });
        
        req.end();
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testOrdersAPI();