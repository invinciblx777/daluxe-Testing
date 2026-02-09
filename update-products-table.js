const mysql = require('mysql2');

// Database connection
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
    }
});

// Add offer_percentage column to products table
function updateProductsTable() {
    console.log('🔄 Adding offer_percentage column to products table...');
    
    const alterQuery = `
        ALTER TABLE products 
        ADD COLUMN offer_percentage DECIMAL(5,2) DEFAULT 0.00 AFTER price
    `;
    
    db.query(alterQuery, (err) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✅ offer_percentage column already exists');
            } else {
                console.error('❌ Error adding column:', err);
                return;
            }
        } else {
            console.log('✅ offer_percentage column added successfully');
        }
        
        db.end();
        console.log('✅ Database update completed');
    });
}

updateProductsTable();