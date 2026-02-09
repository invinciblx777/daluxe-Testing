-- Orders table
USE luxe_beauty;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_avatar VARCHAR(10),
    products_count INT DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample orders
INSERT INTO orders (order_number, customer_name, customer_email, customer_avatar, products_count, total_amount, status, payment_status, order_date) VALUES
('ORD-2024-001', 'Priya Sharma', 'priya@email.com', 'PS', 3, 12599, 'Delivered', 'Paid', '2026-01-11 10:30:00'),
('ORD-2024-002', 'Ananya Patel', 'ananya@email.com', 'AP', 2, 8298, 'Shipped', 'Paid', '2026-01-10 14:20:00'),
('ORD-2024-003', 'Kavitha Reddy', 'kavitha@email.com', 'KR', 1, 5999, 'Pending', 'Pending', '2026-01-10 16:45:00'),
('ORD-2024-004', 'Meera Kumar', 'meera@email.com', 'MK', 4, 15396, 'Confirmed', 'Paid', '2026-01-09 09:15:00'),
('ORD-2024-005', 'Neha Singh', 'neha@email.com', 'NS', 2, 7698, 'Returned', 'Refunded', '2026-01-08 11:00:00'),
('ORD-2024-006', 'Rahul Verma', 'rahul@email.com', 'RV', 1, 4599, 'Processing', 'Paid', '2026-01-15 08:30:00'),
('ORD-2024-007', 'Anjali Desai', 'anjali@email.com', 'AD', 3, 11897, 'Delivered', 'Paid', '2026-01-14 13:20:00'),
('ORD-2024-008', 'Vikram Singh', 'vikram@email.com', 'VS', 2, 9398, 'Shipped', 'Paid', '2026-01-13 15:45:00'),
('ORD-2024-009', 'Divya Nair', 'divya@email.com', 'DN', 1, 3299, 'Cancelled', 'Refunded', '2026-01-12 10:10:00'),
('ORD-2024-010', 'Arjun Mehta', 'arjun@email.com', 'AM', 5, 18995, 'Confirmed', 'Paid', '2026-01-11 16:30:00');
