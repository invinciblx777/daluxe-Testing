const mysql = require('mysql2');

console.log('Cleaning up sample ads...\n');

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
    
    // Delete sample ads that don't have actual images
    const query = "DELETE FROM ads WHERE image_path LIKE '/uploads/ad-%'";
    
    connection.query(query, (err, result) => {
        if (err) {
            console.error('❌ Error cleaning up sample ads:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log(`✅ Removed ${result.affectedRows} sample ads`);
        console.log('✅ Cleanup complete!');
        
        connection.end();
    });
});