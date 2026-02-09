-- Add support for multiple product images
USE luxe_beauty;

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_main (is_main)
);

-- Migrate existing product images to the new table
INSERT INTO product_images (product_id, image_path, is_main, display_order)
SELECT id, image, TRUE, 0
FROM products
WHERE image IS NOT NULL AND image != '';

-- Note: We'll keep the 'image' column in products table for backward compatibility
-- It will store the main image path
