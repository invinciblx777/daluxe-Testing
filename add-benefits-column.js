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

// Add benefits column to products table
function addBenefitsColumn() {
    console.log('🔄 Adding benefits column to products table...');
    
    const alterQuery = `
        ALTER TABLE products 
        ADD COLUMN benefits TEXT AFTER description
    `;
    
    db.query(alterQuery, (err) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✅ benefits column already exists');
            } else {
                console.error('❌ Error adding column:', err);
                return;
            }
        } else {
            console.log('✅ benefits column added successfully');
        }
        
        // Update existing products with sample benefits
        updateProductBenefits();
    });
}

function updateProductBenefits() {
    console.log('🔄 Updating products with sample benefits...');
    
    const sampleBenefits = [
        'Deep hydration for 24 hours, Reduces fine lines and wrinkles, Improves skin texture and tone, 100% natural ingredients, Dermatologically tested',
        'Nourishes and rejuvenates skin, Rich in antioxidants, Repairs skin damage, Suitable for all skin types, Cruelty-free formula',
        'Brightens complexion, Evens skin tone, Reduces dark spots, Provides sun protection, Long-lasting results',
        'Gentle cleansing action, Removes impurities, Maintains skin pH balance, Refreshes and revitalizes, Paraben-free formula'
    ];
    
    const updateQuery = `
        UPDATE products 
        SET benefits = CASE 
            WHEN id % 4 = 1 THEN ?
            WHEN id % 4 = 2 THEN ?
            WHEN id % 4 = 3 THEN ?
            ELSE ?
        END
        WHERE benefits IS NULL OR benefits = ''
    `;
    
    db.query(updateQuery, sampleBenefits, (err) => {
        if (err) {
            console.error('❌ Error updating benefits:', err);
        } else {
            console.log('✅ Product benefits updated successfully');
        }
        
        db.end();
        console.log('✅ Database update completed');
    });
}

addBenefitsColumn();