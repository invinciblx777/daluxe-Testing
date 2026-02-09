-- Update orders table structure for new checkout system
USE luxe_beauty;

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pending',
    status VARCHAR(50) DEFAULT 'Pending',
    items JSON NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_charge DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample orders with new structure
INSERT INTO orders (
    order_id, customer_name, customer_email, customer_phone, delivery_address,
    payment_method, payment_status, status, items, subtotal, delivery_charge,
    tax, discount, total_amount, order_date, expected_delivery
) VALUES
(
    'ORD-2024-001', 'Priya Sharma', 'priya@email.com', '9876543210',
    '123 MG Road, Bangalore, Karnataka - 560001',
    'CARD', 'Paid', 'Delivered',
    '[{"productId":1,"productName":"Vitamin C Serum","quantity":2,"price":1299,"total":2598}]',
    2598, 0, 468, 0, 3066, '2026-01-11 10:30:00', '2026-01-16'
),
(
    'ORD-2024-002', 'Ananya Patel', 'ananya@email.com', '9876543211',
    '456 Park Street, Mumbai, Maharashtra - 400001',
    'UPI', 'Paid', 'Shipped',
    '[{"productId":2,"productName":"Night Cream","quantity":1,"price":999,"total":999}]',
    999, 50, 189, 0, 1238, '2026-01-10 14:20:00', '2026-01-15'
),
(
    'ORD-2024-003', 'Kavitha Reddy', 'kavitha@email.com', '9876543212',
    '789 Anna Salai, Chennai, Tamil Nadu - 600002',
    'COD', 'Pending', 'Pending',
    '[{"productId":3,"productName":"Face Wash","quantity":3,"price":549,"total":1647}]',
    1647, 50, 306, 0, 2003, '2026-01-10 16:45:00', '2026-01-15'
),
(
    'ORD-2024-004', 'Meera Kumar', 'meera@email.com', '9876543213',
    '321 Sector 18, Noida, Uttar Pradesh - 201301',
    'NETBANKING', 'Paid', 'Confirmed',
    '[{"productId":1,"productName":"Vitamin C Serum","quantity":1,"price":1299,"total":1299},{"productId":4,"productName":"Moisturizer","quantity":2,"price":799,"total":1598}]',
    2897, 0, 521, 0, 3418, '2026-01-09 09:15:00', '2026-01-14'
),
(
    'ORD-2024-005', 'Neha Singh', 'neha@email.com', '9876543214',
    '654 Civil Lines, Delhi - 110054',
    'CARD', 'Refunded', 'Returned',
    '[{"productId":5,"productName":"Cleanser","quantity":2,"price":699,"total":1398}]',
    1398, 50, 261, 0, 1709, '2026-01-08 11:00:00', '2026-01-13'
),
(
    'ORD-2024-006', 'Rahul Verma', 'rahul@email.com', '9876543215',
    '987 Banjara Hills, Hyderabad, Telangana - 500034',
    'UPI', 'Paid', 'Processing',
    '[{"productId":6,"productName":"Toner","quantity":1,"price":599,"total":599}]',
    599, 50, 117, 0, 766, '2026-01-15 08:30:00', '2026-01-20'
),
(
    'ORD-2024-007', 'Anjali Desai', 'anjali@email.com', '9876543216',
    '147 SG Highway, Ahmedabad, Gujarat - 380015',
    'CARD', 'Paid', 'Delivered',
    '[{"productId":7,"productName":"Face Mask","quantity":1,"price":1199,"total":1199}]',
    1199, 0, 216, 0, 1415, '2026-01-14 13:20:00', '2026-01-19'
),
(
    'ORD-2024-008', 'Vikram Singh', 'vikram@email.com', '9876543217',
    '258 Mall Road, Shimla, Himachal Pradesh - 171001',
    'COD', 'Paid', 'Shipped',
    '[{"productId":8,"productName":"Eye Cream","quantity":1,"price":1499,"total":1499}]',
    1499, 50, 279, 0, 1828, '2026-01-13 15:45:00', '2026-01-18'
),
(
    'ORD-2024-009', 'Divya Nair', 'divya@email.com', '9876543218',
    '369 MG Road, Kochi, Kerala - 682016',
    'UPI', 'Refunded', 'Cancelled',
    '[{"productId":9,"productName":"Body Lotion","quantity":1,"price":999,"total":999}]',
    999, 50, 189, 0, 1238, '2026-01-12 10:10:00', '2026-01-17'
),
(
    'ORD-2024-010', 'Arjun Mehta', 'arjun@email.com', '9876543219',
    '741 Residency Road, Pune, Maharashtra - 411001',
    'NETBANKING', 'Paid', 'Confirmed',
    '[{"productId":10,"productName":"Hair Oil","quantity":2,"price":799,"total":1598},{"productId":11,"productName":"Shampoo","quantity":1,"price":649,"total":649}]',
    2247, 0, 404, 0, 2651, '2026-01-11 16:30:00', '2026-01-16'
);