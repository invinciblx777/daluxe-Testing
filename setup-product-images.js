const mysql = require('mysql2');

console.log('Setting up product_images table...\n');

// Create connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Malaveeka@20',
    database: 'luxe_beauty'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Failed to connect to MySQL:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL database');
    
    // Create product_images table
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS product_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            image_path VARCHAR(500) NOT NULL,
            is_main BOOLEAN DEFAULT FALSE,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            INDEX idx_product_id (product_id),
            INDEX idx_is_main (is_main)
        );
    `;
    
    connection.query(createTableSQL, (err, result) => {
        if (err) {
            console.error('❌ Error creating product_images table:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log('✅ Product_images table created successfully');
        
        // Insert main images for existing products
        const insertMainImagesSQL = `
            INSERT INTO product_images (product_id, image_path, is_main, display_order)
            SELECT id, image, TRUE, 0 
            FROM products 
            WHERE image IS NOT NULL AND image != ''
            ON DUPLICATE KEY UPDATE image_path = VALUES(image_path);
        `;
        
        connection.query(insertMainImagesSQL, (err, result) => {
            if (err) {
                console.error('❌ Error inserting main images:', err.message);
            } else {
                console.log('✅ Main images migrated to product_images table');
            }
            
            console.log('✅ Setup complete!');
            connection.end();
        });
    });
});