const mysql = require('mysql2');
const fs = require('fs');

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Malaveeka@20',
    database: 'luxe_beauty',
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL database');
    
    // Read and execute the SQL file
    const sql = fs.readFileSync('update-products-images.sql', 'utf8');
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Migration failed:', err.message);
            db.end();
            process.exit(1);
        }
        
        console.log('✅ Migration completed successfully!');
        console.log('📊 Product images table created');
        console.log('📦 Existing images migrated');
        
        db.end();
        process.exit(0);
    });
});
