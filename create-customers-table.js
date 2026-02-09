const mysql = require('mysql2');

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
        createCustomersTable();
    }
});

function createCustomersTable() {
    console.log('🔄 Creating customers table...');
    
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255),
            customer_phone VARCHAR(20) NOT NULL,
            delivery_addresses JSON,
            total_orders INT DEFAULT 0,
            total_spent DECIMAL(10, 2) DEFAULT 0,
            last_order_date TIMESTAMP NULL,
            first_order_date TIMESTAMP NULL,
            customer_status ENUM('Active', 'Inactive', 'VIP') DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_phone (customer_phone),
            KEY idx_email (customer_email),
            KEY idx_status (customer_status)
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('❌ Error creating customers table:', err);
            return;
        }
        
        console.log('✅ Customers table created successfully');
        
        // Create function to sync customers from orders
        syncCustomersFromOrders();
    });
}

function syncCustomersFromOrders() {
    console.log('🔄 Syncing customers from orders...');
    
    // Get all unique customers from orders
    const getCustomersQuery = `
        SELECT 
            customer_name,
            customer_email,
            customer_phone,
            delivery_address,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_spent,
            MIN(order_date) as first_order_date,
            MAX(order_date) as last_order_date
        FROM orders 
        GROUP BY customer_phone, customer_name
    `;
    
    db.query(getCustomersQuery, (err, results) => {
        if (err) {
            console.error('❌ Error fetching customers from orders:', err);
            return;
        }
        
        console.log(`📊 Found ${results.length} unique customers from orders`);
        
        // Insert or update customers
        results.forEach(customer => {
            const customerStatus = customer.total_spent > 10000 ? 'VIP' : 'Active';
            
            const insertQuery = `
                INSERT INTO customers 
                (customer_name, customer_email, customer_phone, delivery_addresses, 
                 total_orders, total_spent, first_order_date, last_order_date, customer_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                customer_name = VALUES(customer_name),
                customer_email = VALUES(customer_email),
                delivery_addresses = JSON_ARRAY_APPEND(
                    COALESCE(delivery_addresses, JSON_ARRAY()), 
                    '$', VALUES(delivery_addresses)
                ),
                total_orders = VALUES(total_orders),
                total_spent = VALUES(total_spent),
                first_order_date = VALUES(first_order_date),
                last_order_date = VALUES(last_order_date),
                customer_status = VALUES(customer_status)
            `;
            
            db.query(insertQuery, [
                customer.customer_name,
                customer.customer_email,
                customer.customer_phone,
                JSON.stringify([customer.delivery_address]),
                customer.total_orders,
                customer.total_spent,
                customer.first_order_date,
                customer.last_order_date,
                customerStatus
            ], (err) => {
                if (err) {
                    console.error('❌ Error inserting customer:', err);
                }
            });
        });
        
        setTimeout(() => {
            console.log('✅ Customers sync completed');
            console.log('🎉 Customers table setup completed!');
            db.end();
        }, 2000);
    });
}