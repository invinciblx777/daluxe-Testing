const mysql = require('mysql2');
const fs = require('fs');

console.log('Setting up orders table...\n');

// Create connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Malaveeka@20',
    database: 'luxe_beauty',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Failed to connect to MySQL:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL database');
    
    // Read and execute SQL file
    const sql = fs.readFileSync('db-orders.sql', 'utf8');
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error setting up orders table:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log('✅ Orders table created successfully');
        console.log('✅ Sample orders inserted');
        console.log('✅ Setup complete!');
        
        connection.end();
    });
});