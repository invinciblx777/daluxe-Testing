const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupCoupons() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Malaveeka@20',
        database: 'luxe_beauty'
    });

    try {
        console.log('🎫 Setting up coupons system...');
        
        // Read and execute the SQL file
        const sql = fs.readFileSync('./create-coupons-table.sql', 'utf8');
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }
        
        console.log('✅ Coupons system setup completed successfully!');
        
        // Verify the setup
        const [coupons] = await connection.execute('SELECT * FROM coupons');
        console.log(`📊 Created ${coupons.length} sample coupons`);
        
    } catch (error) {
        console.error('❌ Error setting up coupons:', error.message);
    } finally {
        await connection.end();
    }
}

setupCoupons();