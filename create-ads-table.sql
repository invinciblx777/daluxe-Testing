-- Create ads table
USE luxe_beauty;

CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    location ENUM('home', 'products') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample ads
INSERT INTO ads (title, image_path, location, is_active, display_order) VALUES
('Home Banner 1', '/uploads/ad-home-1.jpg', 'home', TRUE, 1),
('Products Banner 1', '/uploads/ad-products-1.jpg', 'products', TRUE, 1);