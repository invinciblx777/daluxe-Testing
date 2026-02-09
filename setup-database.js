const mysql = require('mysql2');
const fs = require('fs');

console.log('Setting up Luxe Beauty database...\n');

// Create connection without database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Malaveeka@20',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Failed to connect to MySQL:', err.message);
        console.log('\nPlease make sure:');
        console.log('1. MySQL is installed and running');
        console.log('2. Password is correct: Malaveeka@20');
        console.log('3. MySQL is accessible on localhost');
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL');
    
    // Read and execute SQL file
    const sql = fs.readFileSync('db-setup.sql', 'utf8');
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error setting up database:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log('✅ Database created: luxe_beauty');
        console.log('✅ Products table created');
        console.log('✅ Sample products inserted');
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  Database setup complete!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  You can now start the API server with:');
        console.log('  node api-server.js');
        console.log('═══════════════════════════════════════════════════════\n');
        
        connection.end();
    });
});
