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
    
    const sql = fs.readFileSync('create-messages-table.sql', 'utf8');
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error creating messages table:', err.message);
            db.end();
            process.exit(1);
        }
        
        console.log('✅ Messages table created successfully');
        
        db.end();
        console.log('✅ Setup complete!');
    });
});
