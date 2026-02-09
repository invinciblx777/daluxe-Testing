const mysql = require('mysql2');
const fs = require('fs');

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Malaveeka@20',
    database: 'luxe_beauty'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to MySQL database');
        updateOrdersTable();
    }
});

function updateOrdersTable() {
    console.log('🔄 Updating orders table structure...');
    
    // Drop existing table
    db.query('DROP TABLE IF EXISTS orders', (err) => {
        if (err) {
            console.error('Error dropping table:', err);
            return;
        }
        
        // Create new table structure
        const createTableQuery = `
            CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255),
                customer_phone VARCHAR(20) NOT NULL,
                delivery_address TEXT NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                payment_status VARCHAR(50) DEFAULT 'Pending',
                status VARCHAR(50) DEFAULT 'Pending',
                items JSON NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                delivery_charge DECIMAL(10, 2) DEFAULT 0,
                tax DECIMAL(10, 2) DEFAULT 0,
                discount DECIMAL(10, 2) DEFAULT 0,
                total_amount DECIMAL(10, 2) NOT NULL,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expected_delivery DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        db.query(createTableQuery, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                return;
            }
            
            console.log('✅ Orders table structure updated successfully');
            
            // Insert sample data
            insertSampleOrders();
        });
    });
}

function insertSampleOrders() {
    console.log('📝 Inserting sample orders...');
    
    const sampleOrders = [
        {
            order_id: 'ORD-2024-001',
            customer_name: 'Priya Sharma',
            customer_email: 'priya@email.com',
            customer_phone: '9876543210',
            delivery_address: '123 MG Road, Bangalore, Karnataka - 560001',
            payment_method: 'CARD',
            payment_status: 'Paid',
            status: 'Delivered',
            items: JSON.stringify([{productId:1,productName:"Vitamin C Serum",quantity:2,price:1299,total:2598}]),
            subtotal: 2598,
            delivery_charge: 0,
            tax: 468,
            discount: 0,
            total_amount: 3066,
            order_date: '2026-01-11 10:30:00',
            expected_delivery: '2026-01-16'
        },
        {
            order_id: 'ORD-2024-002',
            customer_name: 'Ananya Patel',
            customer_email: 'ananya@email.com',
            customer_phone: '9876543211',
            delivery_address: '456 Park Street, Mumbai, Maharashtra - 400001',
            payment_method: 'UPI',
            payment_status: 'Paid',
            status: 'Shipped',
            items: JSON.stringify([{productId:2,productName:"Night Cream",quantity:1,price:999,total:999}]),
            subtotal: 999,
            delivery_charge: 50,
            tax: 189,
            discount: 0,
            total_amount: 1238,
            order_date: '2026-01-10 14:20:00',
            expected_delivery: '2026-01-15'
        },
        {
            order_id: 'ORD-2024-003',
            customer_name: 'Kavitha Reddy',
            customer_email: 'kavitha@email.com',
            customer_phone: '9876543212',
            delivery_address: '789 Anna Salai, Chennai, Tamil Nadu - 600002',
            payment_method: 'COD',
            payment_status: 'Pending',
            status: 'Pending',
            items: JSON.stringify([{productId:3,productName:"Face Wash",quantity:3,price:549,total:1647}]),
            subtotal: 1647,
            delivery_charge: 50,
            tax: 306,
            discount: 0,
            total_amount: 2003,
            order_date: '2026-01-10 16:45:00',
            expected_delivery: '2026-01-15'
        }
    ];
    
    const insertQuery = `INSERT INTO orders 
        (order_id, customer_name, customer_email, customer_phone, delivery_address,
         payment_method, payment_status, status, items, subtotal, delivery_charge,
         tax, discount, total_amount, order_date, expected_delivery) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    let completed = 0;
    sampleOrders.forEach(order => {
        db.query(insertQuery, [
            order.order_id, order.customer_name, order.customer_email, order.customer_phone,
            order.delivery_address, order.payment_method, order.payment_status, order.status,
            order.items, order.subtotal, order.delivery_charge, order.tax, order.discount,
            order.total_amount, order.order_date, order.expected_delivery
        ], (err) => {
            if (err) {
                console.error('Error inserting order:', err);
            }
            completed++;
            if (completed === sampleOrders.length) {
                console.log('✅ Sample orders inserted successfully');
                console.log('🎉 Database update completed!');
                db.end();
            }
        });
    });
}