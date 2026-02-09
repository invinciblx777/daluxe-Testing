const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Malaveeka@20',
    database: 'luxe_beauty'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('Please make sure MySQL is running and credentials are correct');
    } else {
        console.log('✅ Connected to MySQL database');
    }
});

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Configure multer for multiple images
const uploadMultiple = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
}).fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subImages', maxCount: 5 }
]);

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Get product images
        const imageQuery = 'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, display_order ASC';
        db.query(imageQuery, [req.params.id], (imgErr, images) => {
            if (imgErr) {
                return res.status(500).json({ error: imgErr.message });
            }
            
            const product = results[0];
            product.images = images;
            res.json(product);
        });
    });
});

// Get product images
app.get('/api/products/:id/images', (req, res) => {
    const query = 'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, display_order ASC';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add new product
app.post('/api/products', uploadMultiple, (req, res) => {
    const { name, description, price, rating, stock, benefits, sku, category } = req.body;
    
    // Get main image
    const mainImage = req.files && req.files['mainImage'] ? `/uploads/${req.files['mainImage'][0].filename}` : null;
    
    // Determine status based on stock
    let status = 'Active';
    if (stock == 0) {
        status = 'Out of Stock';
    } else if (stock < 10) {
        status = 'Low Stock';
    }
    
    const query = 'INSERT INTO products (name, description, price, rating, stock, benefits, image, sku, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [
        name, 
        description || '', 
        price, 
        rating || 0, 
        stock, 
        benefits || '', 
        mainImage, 
        sku || '', 
        category || 'Face', 
        status
    ], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ error: err.message });
        }
        
        const productId = result.insertId;
        
        // Insert main image into product_images table
        if (mainImage) {
            const mainImageQuery = 'INSERT INTO product_images (product_id, image_path, is_main, display_order) VALUES (?, ?, TRUE, 0)';
            db.query(mainImageQuery, [productId, mainImage], (imgErr) => {
                if (imgErr) console.error('Error saving main image:', imgErr);
            });
        }
        
        // Insert sub images
        if (req.files && req.files['subImages']) {
            req.files['subImages'].forEach((file, index) => {
                const imagePath = `/uploads/${file.filename}`;
                const subImageQuery = 'INSERT INTO product_images (product_id, image_path, is_main, display_order) VALUES (?, ?, FALSE, ?)';
                db.query(subImageQuery, [productId, imagePath, index + 1], (imgErr) => {
                    if (imgErr) console.error('Error saving sub image:', imgErr);
                });
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Product added successfully',
            productId: productId 
        });
    });
});

// Update product
app.put('/api/products/:id', uploadMultiple, (req, res) => {
    const { name, description, price, rating, stock, benefits, sku, category } = req.body;
    const productId = req.params.id;
    
    // Determine status based on stock
    let status = 'Active';
    if (stock == 0) {
        status = 'Out of Stock';
    } else if (stock < 10) {
        status = 'Low Stock';
    }
    
    // Check if new main image was uploaded
    const mainImage = req.files && req.files['mainImage'] ? `/uploads/${req.files['mainImage'][0].filename}` : null;
    
    if (mainImage) {
        const query = 'UPDATE products SET name=?, description=?, price=?, rating=?, stock=?, benefits=?, image=?, sku=?, category=?, status=? WHERE id=?';
        db.query(query, [name, description, price, rating, stock, benefits, mainImage, sku, category, status, productId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Update main image in product_images table
            const updateMainImageQuery = 'UPDATE product_images SET image_path=? WHERE product_id=? AND is_main=TRUE';
            db.query(updateMainImageQuery, [mainImage, productId], (imgErr, imgResult) => {
                if (imgErr) console.error('Error updating main image:', imgErr);
                
                // If no main image existed, insert it
                if (imgResult.affectedRows === 0) {
                    const insertMainImageQuery = 'INSERT INTO product_images (product_id, image_path, is_main, display_order) VALUES (?, ?, TRUE, 0)';
                    db.query(insertMainImageQuery, [productId, mainImage], (insertErr) => {
                        if (insertErr) console.error('Error inserting main image:', insertErr);
                    });
                }
            });
            
            // Add new sub images if provided
            if (req.files && req.files['subImages']) {
                // Get current max display_order
                const maxOrderQuery = 'SELECT MAX(display_order) as maxOrder FROM product_images WHERE product_id=? AND is_main=FALSE';
                db.query(maxOrderQuery, [productId], (orderErr, orderResult) => {
                    const startOrder = orderResult[0].maxOrder ? orderResult[0].maxOrder + 1 : 1;
                    
                    req.files['subImages'].forEach((file, index) => {
                        const imagePath = `/uploads/${file.filename}`;
                        const subImageQuery = 'INSERT INTO product_images (product_id, image_path, is_main, display_order) VALUES (?, ?, FALSE, ?)';
                        db.query(subImageQuery, [productId, imagePath, startOrder + index], (imgErr) => {
                            if (imgErr) console.error('Error saving sub image:', imgErr);
                        });
                    });
                });
            }
            
            res.json({ success: true, message: 'Product updated successfully' });
        });
    } else {
        const query = 'UPDATE products SET name=?, description=?, price=?, rating=?, stock=?, benefits=?, sku=?, category=?, status=? WHERE id=?';
        db.query(query, [name, description, price, rating, stock, benefits, sku, category, status, productId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Add new sub images if provided
            if (req.files && req.files['subImages']) {
                // Get current max display_order
                const maxOrderQuery = 'SELECT MAX(display_order) as maxOrder FROM product_images WHERE product_id=? AND is_main=FALSE';
                db.query(maxOrderQuery, [productId], (orderErr, orderResult) => {
                    const startOrder = orderResult[0].maxOrder ? orderResult[0].maxOrder + 1 : 1;
                    
                    req.files['subImages'].forEach((file, index) => {
                        const imagePath = `/uploads/${file.filename}`;
                        const subImageQuery = 'INSERT INTO product_images (product_id, image_path, is_main, display_order) VALUES (?, ?, FALSE, ?)';
                        db.query(subImageQuery, [productId, imagePath, startOrder + index], (imgErr) => {
                            if (imgErr) console.error('Error saving sub image:', imgErr);
                        });
                    });
                });
            }
            
            res.json({ success: true, message: 'Product updated successfully' });
        });
    }
});

// Delete product image
app.delete('/api/products/:productId/images/:imageId', (req, res) => {
    const { productId, imageId } = req.params;
    
    // Get image path before deleting
    const getImageQuery = 'SELECT image_path, is_main FROM product_images WHERE id=? AND product_id=?';
    db.query(getImageQuery, [imageId, productId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        const isMain = results[0].is_main;
        
        // Don't allow deleting the main image if it's the only image
        if (isMain) {
            const countQuery = 'SELECT COUNT(*) as count FROM product_images WHERE product_id=?';
            db.query(countQuery, [productId], (countErr, countResults) => {
                if (countErr) {
                    return res.status(500).json({ error: countErr.message });
                }
                
                if (countResults[0].count === 1) {
                    return res.status(400).json({ error: 'Cannot delete the only image. Please upload a new main image first.' });
                }
                
                // Delete the image
                const deleteQuery = 'DELETE FROM product_images WHERE id=?';
                db.query(deleteQuery, [imageId], (delErr) => {
                    if (delErr) {
                        return res.status(500).json({ error: delErr.message });
                    }
                    
                    // If main image was deleted, promote the first sub image to main
                    const promoteQuery = 'UPDATE product_images SET is_main=TRUE, display_order=0 WHERE product_id=? ORDER BY display_order ASC LIMIT 1';
                    db.query(promoteQuery, [productId], (promoteErr) => {
                        if (promoteErr) console.error('Error promoting image:', promoteErr);
                        
                        // Update main image in products table
                        const updateProductQuery = 'UPDATE products SET image=(SELECT image_path FROM product_images WHERE product_id=? AND is_main=TRUE LIMIT 1) WHERE id=?';
                        db.query(updateProductQuery, [productId, productId]);
                    });
                    
                    res.json({ success: true, message: 'Image deleted successfully' });
                });
            });
        } else {
            // Delete non-main image
            const deleteQuery = 'DELETE FROM product_images WHERE id=?';
            db.query(deleteQuery, [imageId], (delErr) => {
                if (delErr) {
                    return res.status(500).json({ error: delErr.message });
                }
                res.json({ success: true, message: 'Image deleted successfully' });
            });
        }
    });
});

// Update product offer
app.put('/api/products/:id/offer', (req, res) => {
    const { offer_percentage } = req.body;
    const query = 'UPDATE products SET offer_percentage = ? WHERE id = ?';
    
    db.query(query, [offer_percentage, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Offer updated successfully' });
    });
});

// Update product stock after order
app.put('/api/products/:id/stock', (req, res) => {
    const { quantity } = req.body;
    const query = 'UPDATE products SET stock = stock - ? WHERE id = ?';
    
    db.query(query, [quantity, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Stock updated successfully' });
    });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// Categories API Routes

// Get all categories
app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM categories ORDER BY display_order ASC, name ASC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get single category
app.get('/api/categories/:id', (req, res) => {
    const query = 'SELECT * FROM categories WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(results[0]);
    });
});

// Add new category
app.post('/api/categories', (req, res) => {
    const { name, description, is_active } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Get the next display order automatically
    const getMaxOrderQuery = 'SELECT COALESCE(MAX(display_order), 0) as maxOrder FROM categories';
    
    db.query(getMaxOrderQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const nextOrder = results[0].maxOrder + 1;
        
        const query = 'INSERT INTO categories (name, description, display_order, is_active) VALUES (?, ?, ?, ?)';
        
        db.query(query, [
            name.trim(),
            description || '',
            nextOrder,
            is_active !== undefined ? is_active : true
        ], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Category name already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                success: true, 
                message: 'Category added successfully',
                categoryId: result.insertId 
            });
        });
    });
});

// Update category
app.put('/api/categories/:id', (req, res) => {
    const { name, description, display_order, is_active } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    
    const query = 'UPDATE categories SET name=?, description=?, display_order=?, is_active=? WHERE id=?';
    
    db.query(query, [
        name.trim(),
        description || '',
        display_order || 0,
        is_active !== undefined ? is_active : true,
        req.params.id
    ], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Category name already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated successfully' });
    });
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
    // First check if any products use this category
    const checkQuery = 'SELECT COUNT(*) as count FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)';
    
    db.query(checkQuery, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results[0].count > 0) {
            return res.status(400).json({ 
                error: `Cannot delete category. ${results[0].count} product(s) are using this category.`,
                productsCount: results[0].count
            });
        }
        
        // Delete the category
        const deleteQuery = 'DELETE FROM categories WHERE id = ?';
        db.query(deleteQuery, [req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json({ success: true, message: 'Category deleted successfully' });
        });
    });
});

// Messages API Routes

// Get all messages
app.get('/api/messages', (req, res) => {
    const query = 'SELECT * FROM messages ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Submit contact form message
app.post('/api/messages', (req, res) => {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    const query = 'INSERT INTO messages (name, email, phone, message, status) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [name, email, phone || '', message, 'unread'], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ 
            success: true, 
            message: 'Message sent successfully',
            messageId: result.insertId 
        });
    });
});

// Mark message as read
app.put('/api/messages/:id/read', (req, res) => {
    const query = 'UPDATE messages SET status=?, read_at=NOW() WHERE id=?';
    
    db.query(query, ['read', req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ success: true, message: 'Message marked as read' });
    });
});

// Delete message
app.delete('/api/messages/:id', (req, res) => {
    const query = 'DELETE FROM messages WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ success: true, message: 'Message deleted successfully' });
    });
});

// ==================== COUPON ROUTES ====================

// Get all coupons
app.get('/api/coupons', (req, res) => {
    const query = `
        SELECT c.*, 
               COUNT(cu.id) as total_usage,
               CASE 
                   WHEN c.valid_until < NOW() THEN 'expired'
                   WHEN c.valid_from > NOW() THEN 'scheduled'
                   WHEN c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN 'exhausted'
                   WHEN c.is_active = 0 THEN 'inactive'
                   ELSE 'active'
               END as status
        FROM coupons c
        LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching coupons:', err);
            return res.status(500).json({ error: 'Failed to fetch coupons' });
        }
        res.json(results);
    });
});

// Get coupon by ID
app.get('/api/coupons/:id', (req, res) => {
    const couponId = req.params.id;
    const query = 'SELECT * FROM coupons WHERE id = ?';
    
    db.query(query, [couponId], (err, results) => {
        if (err) {
            console.error('Error fetching coupon:', err);
            return res.status(500).json({ error: 'Failed to fetch coupon' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.json(results[0]);
    });
});

// Create new coupon
app.post('/api/coupons', (req, res) => {
    const {
        code,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        maximum_discount_amount,
        usage_limit,
        valid_from,
        valid_until,
        is_active
    } = req.body;

    // Validate required fields
    if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO coupons (
            code, description, discount_type, discount_value, 
            minimum_order_amount, maximum_discount_amount, usage_limit, 
            valid_from, valid_until, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        minimum_order_amount || 0,
        maximum_discount_amount,
        usage_limit,
        valid_from,
        valid_until,
        is_active !== undefined ? is_active : true
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating coupon:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Coupon code already exists' });
            }
            return res.status(500).json({ error: 'Failed to create coupon' });
        }
        res.json({ success: true, message: 'Coupon created successfully', id: result.insertId });
    });
});

// Update coupon
app.put('/api/coupons/:id', (req, res) => {
    const couponId = req.params.id;
    const {
        code,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        maximum_discount_amount,
        usage_limit,
        valid_from,
        valid_until,
        is_active
    } = req.body;

    const query = `
        UPDATE coupons SET 
            code = ?, description = ?, discount_type = ?, discount_value = ?,
            minimum_order_amount = ?, maximum_discount_amount = ?, usage_limit = ?,
            valid_from = ?, valid_until = ?, is_active = ?
        WHERE id = ?
    `;

    const values = [
        code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        minimum_order_amount || 0,
        maximum_discount_amount,
        usage_limit,
        valid_from,
        valid_until,
        is_active !== undefined ? is_active : true,
        couponId
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating coupon:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Coupon code already exists' });
            }
            return res.status(500).json({ error: 'Failed to update coupon' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.json({ success: true, message: 'Coupon updated successfully' });
    });
});

// Delete coupon
app.delete('/api/coupons/:id', (req, res) => {
    const couponId = req.params.id;
    
    db.query('DELETE FROM coupons WHERE id = ?', [couponId], (err, result) => {
        if (err) {
            console.error('Error deleting coupon:', err);
            return res.status(500).json({ error: 'Failed to delete coupon' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.json({ success: true, message: 'Coupon deleted successfully' });
    });
});

// Validate coupon code
app.post('/api/coupons/validate', (req, res) => {
    const { code, order_amount } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Coupon code is required' });
    }

    const query = `
        SELECT * FROM coupons 
        WHERE code = ? AND is_active = 1 
        AND valid_from <= NOW() AND valid_until >= NOW()
        AND (usage_limit IS NULL OR used_count < usage_limit)
    `;

    db.query(query, [code.toUpperCase()], (err, results) => {
        if (err) {
            console.error('Error validating coupon:', err);
            return res.status(500).json({ error: 'Failed to validate coupon' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired coupon code' });
        }

        const coupon = results[0];
        
        // Check minimum order amount
        if (order_amount < coupon.minimum_order_amount) {
            return res.status(400).json({ 
                error: `Minimum order amount of ₹${coupon.minimum_order_amount} required for this coupon` 
            });
        }

        // Calculate discount
        let discount_amount = 0;
        if (coupon.discount_type === 'percentage') {
            discount_amount = (order_amount * coupon.discount_value) / 100;
            if (coupon.maximum_discount_amount && discount_amount > coupon.maximum_discount_amount) {
                discount_amount = coupon.maximum_discount_amount;
            }
        } else {
            discount_amount = coupon.discount_value;
        }

        res.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discount_amount: discount_amount
            }
        });
    });
});

// Get coupon usage history
app.get('/api/coupons/:id/usage', (req, res) => {
    const couponId = req.params.id;
    
    const query = `
        SELECT cu.*, c.code, c.description
        FROM coupon_usage cu
        JOIN coupons c ON cu.coupon_id = c.id
        WHERE cu.coupon_id = ?
        ORDER BY cu.used_at DESC
    `;
    
    db.query(query, [couponId], (err, results) => {
        if (err) {
            console.error('Error fetching coupon usage:', err);
            return res.status(500).json({ error: 'Failed to fetch coupon usage' });
        }
        res.json(results);
    });
});

// Get all coupon usage with details
app.get('/api/coupon-usage', (req, res) => {
    const query = `
        SELECT cu.*, c.code, c.description, c.discount_type, c.discount_value
        FROM coupon_usage cu
        JOIN coupons c ON cu.coupon_id = c.id
        ORDER BY cu.used_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching coupon usage:', err);
            return res.status(500).json({ error: 'Failed to fetch coupon usage' });
        }
        res.json(results);
    });
});

// Record coupon usage
app.post('/api/coupon-usage', (req, res) => {
    const { coupon_id, order_id, customer_email, customer_name, discount_amount } = req.body;
    
    const query = `
        INSERT INTO coupon_usage (coupon_id, order_id, customer_email, customer_name, discount_amount)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(query, [coupon_id, order_id, customer_email, customer_name, discount_amount], (err, result) => {
        if (err) {
            console.error('Error recording coupon usage:', err);
            return res.status(500).json({ error: 'Failed to record coupon usage' });
        }
        res.json({ success: true, message: 'Coupon usage recorded successfully' });
    });
});

// Update coupon usage count
app.put('/api/coupons/:id/use', (req, res) => {
    const couponId = req.params.id;
    
    const query = 'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?';
    
    db.query(query, [couponId], (err, result) => {
        if (err) {
            console.error('Error updating coupon usage count:', err);
            return res.status(500).json({ error: 'Failed to update coupon usage count' });
        }
        res.json({ success: true, message: 'Coupon usage count updated' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Luxe Beauty API Server');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  🚀 API running at: http://localhost:${PORT}`);
    console.log(`  📦 Database: luxe_beauty`);
    console.log('═══════════════════════════════════════════════════════\n');
});

// Orders API Routes

// Get latest order ID for sequential numbering
app.get('/api/orders/latest', (req, res) => {
    const query = 'SELECT order_id FROM orders ORDER BY id DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const latestOrderId = results.length > 0 ? results[0].order_id : null;
        res.json({ latestOrderId });
    });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    const query = 'SELECT * FROM orders ORDER BY order_date DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Create new order
app.post('/api/orders', (req, res) => {
    console.log('📦 Received order creation request');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        paymentMethod,
        paymentStatus,
        orderStatus,
        items,
        subtotal,
        deliveryCharge,
        tax,
        discount,
        totalAmount,
        orderDate,
        expectedDelivery
    } = req.body;
    
    // Validate required fields
    if (!orderId || !customerName || !customerPhone || !deliveryAddress || !paymentMethod || !items || !totalAmount) {
        console.error('❌ Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Convert items array to JSON string for storage
    const itemsJson = JSON.stringify(items);
    
    console.log('💾 Inserting order into database...');
    
    const query = `INSERT INTO orders 
        (order_id, customer_name, customer_email, customer_phone, delivery_address, 
         payment_method, payment_status, status, items, subtotal, delivery_charge, 
         tax, discount, total_amount, order_date, expected_delivery) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [
        orderId, customerName, customerEmail, customerPhone, deliveryAddress,
        paymentMethod, paymentStatus, orderStatus, itemsJson, subtotal,
        deliveryCharge, tax, discount, totalAmount, orderDate, expectedDelivery
    ], (err, result) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log('✅ Order created successfully with ID:', result.insertId);
        res.json({ 
            success: true, 
            message: 'Order created successfully',
            orderId: result.insertId,
            orderNumber: orderId
        });
    });
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
    const query = 'SELECT * FROM orders WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(results[0]);
    });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const { status, payment_status } = req.body;
    const query = 'UPDATE orders SET status=?, payment_status=? WHERE id=?';
    
    db.query(query, [status, payment_status, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Order status updated successfully' });
    });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    const query = 'DELETE FROM orders WHERE id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Order deleted successfully' });
    });
});

// Get order statistics
app.get('/api/orders/stats/summary', (req, res) => {
    const queries = {
        all: 'SELECT COUNT(*) as count FROM orders',
        pending: 'SELECT COUNT(*) as count FROM orders WHERE status = "Pending"',
        shipped: 'SELECT COUNT(*) as count FROM orders WHERE status = "Shipped"',
        delivered: 'SELECT COUNT(*) as count FROM orders WHERE status = "Delivered"'
    };
    
    const stats = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, results) => {
            if (!err) {
                stats[key] = results[0].count;
            }
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(stats);
            }
        });
    });
});

// Ads API Routes

// Get all ads
app.get('/api/ads', (req, res) => {
    const { location } = req.query;
    let query = 'SELECT * FROM ads';
    let params = [];
    
    if (location) {
        query += ' WHERE location = ?';
        params.push(location);
    }
    
    query += ' ORDER BY display_order ASC, created_at DESC';
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get active ads for specific location
app.get('/api/ads/active/:location', (req, res) => {
    const query = 'SELECT * FROM ads WHERE location = ? AND is_active = TRUE ORDER BY display_order ASC';
    
    db.query(query, [req.params.location], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get single ad
app.get('/api/ads/:id', (req, res) => {
    const query = 'SELECT * FROM ads WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Ad not found' });
        }
        res.json(results[0]);
    });
});

// Add new ad
app.post('/api/ads', upload.single('image'), (req, res) => {
    const { title, location, is_active, display_order } = req.body;
    
    if (!title || !location) {
        return res.status(400).json({ error: 'Title and location are required' });
    }
    
    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }
    
    const imagePath = `/uploads/${req.file.filename}`;
    
    // Convert checkbox value to boolean
    const isActive = is_active === 'on' || is_active === true || is_active === 'true';
    
    // Get next display order if not provided
    if (!display_order) {
        const getMaxOrderQuery = 'SELECT COALESCE(MAX(display_order), 0) as maxOrder FROM ads WHERE location = ?';
        
        db.query(getMaxOrderQuery, [location], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const nextOrder = results[0].maxOrder + 1;
            
            const query = 'INSERT INTO ads (title, image_path, location, is_active, display_order) VALUES (?, ?, ?, ?, ?)';
            
            db.query(query, [
                title,
                imagePath,
                location,
                isActive,
                nextOrder
            ], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ 
                    success: true, 
                    message: 'Ad created successfully',
                    adId: result.insertId 
                });
            });
        });
    } else {
        const query = 'INSERT INTO ads (title, image_path, location, is_active, display_order) VALUES (?, ?, ?, ?, ?)';
        
        db.query(query, [
            title,
            imagePath,
            location,
            isActive,
            display_order
        ], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                success: true, 
                message: 'Ad created successfully',
                adId: result.insertId 
            });
        });
    }
});

// Update ad
app.put('/api/ads/:id', upload.single('image'), (req, res) => {
    const { title, location, is_active, display_order } = req.body;
    const adId = req.params.id;
    
    if (!title || !location) {
        return res.status(400).json({ error: 'Title and location are required' });
    }
    
    // Convert checkbox value to boolean
    const isActive = is_active === 'on' || is_active === true || is_active === 'true';
    
    // Check if new image was uploaded
    const newImage = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (newImage) {
        const query = 'UPDATE ads SET title=?, image_path=?, location=?, is_active=?, display_order=? WHERE id=?';
        db.query(query, [title, newImage, location, isActive, display_order, adId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Ad not found' });
            }
            res.json({ success: true, message: 'Ad updated successfully' });
        });
    } else {
        const query = 'UPDATE ads SET title=?, location=?, is_active=?, display_order=? WHERE id=?';
        db.query(query, [title, location, isActive, display_order, adId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Ad not found' });
            }
            res.json({ success: true, message: 'Ad updated successfully' });
        });
    }
});

// Delete ad
app.delete('/api/ads/:id', (req, res) => {
    // Get image path before deleting to clean up file
    const getImageQuery = 'SELECT image_path FROM ads WHERE id = ?';
    
    db.query(getImageQuery, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Ad not found' });
        }
        
        const imagePath = results[0].image_path;
        
        // Delete from database
        const deleteQuery = 'DELETE FROM ads WHERE id = ?';
        db.query(deleteQuery, [req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Try to delete the image file (optional - don't fail if file doesn't exist)
            if (imagePath && imagePath.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, imagePath);
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.log('Note: Could not delete image file:', unlinkErr.message);
                    }
                });
            }
            
            res.json({ success: true, message: 'Ad deleted successfully' });
        });
    });
});

// Toggle ad status
app.put('/api/ads/:id/toggle', (req, res) => {
    const query = 'UPDATE ads SET is_active = NOT is_active WHERE id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ad not found' });
        }
        res.json({ success: true, message: 'Ad status updated successfully' });
    });
});
