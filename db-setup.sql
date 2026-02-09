-- Create database
CREATE DATABASE IF NOT EXISTS luxe_beauty;
USE luxe_beauty;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 0,
    stock INT DEFAULT 0,
    benefits TEXT,
    image VARCHAR(500),
    sku VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, price, rating, stock, benefits, sku, category, status) VALUES
('Rose Gold Radiance Serum', 'Luxurious serum with 24K gold and rose extracts', 4599, 4.8, 45, 'Anti-aging, Brightening, Hydrating', 'RGRS-001', 'Face', 'Active'),
('24K Gold Face Oil', 'Premium face oil infused with pure gold', 5999, 4.9, 8, 'Deep nourishment, Glow enhancement', 'GFO-002', 'Oils', 'Low Stock'),
('Luxury Night Cream', 'Rich night cream for deep repair', 3299, 4.7, 67, 'Overnight repair, Anti-aging', 'LNC-003', 'Face', 'Active'),
('Hydrating Face Mask', 'Intensive hydration mask', 2899, 4.6, 0, 'Deep hydration, Soothing', 'HFM-004', 'Face', 'Out of Stock'),
('Vitamin C Serum', 'Brightening vitamin C formula', 3899, 4.8, 32, 'Brightening, Even skin tone', 'VCS-005', 'Face', 'Active'),
('Anti-Aging Cream', 'Advanced anti-aging formula', 5499, 4.7, 28, 'Reduces wrinkles, Firms skin', 'AAC-006', 'Face', 'Active');
