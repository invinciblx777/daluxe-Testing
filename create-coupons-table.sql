-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2) NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create coupon_usage table to track who used which coupon
CREATE TABLE IF NOT EXISTS coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    order_id INT NOT NULL,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
);

-- Add coupon fields to orders table
ALTER TABLE orders 
ADD COLUMN coupon_code VARCHAR(50) NULL,
ADD COLUMN coupon_discount DECIMAL(10, 2) DEFAULT 0;

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, valid_from, valid_until) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500.00, 200.00, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE50', 'Flat ₹50 off on orders above ₹1000', 'fixed', 50.00, 1000.00, NULL, 50, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY)),
('LUXURY20', '20% off on luxury products', 'percentage', 20.00, 2000.00, 500.00, 25, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));