const mysql = require('mysql2');
const fs = require('fs');

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
    
    const sql = fs.readFileSync('create-categories-table.sql', 'utf8');
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error creating categories table:', err.message);
            db.end();
            process.exit(1);
        }
        
        console.log('✅ Categories table created successfully');
        console.log('✅ Default categories inserted');
        
        db.end();
        console.log('✅ Setup complete!');
    });
});
