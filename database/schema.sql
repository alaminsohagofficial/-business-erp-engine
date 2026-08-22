-- সাপ্লায়ার টেবিল
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100),
    dealer_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- লেজার ট্রানজেকশন টেবিল
CREATE TABLE IF NOT EXISTS ledger_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    transaction_type ENUM('PURCHASE', 'PAYMENT', 'RETURN', 'DISCOUNT'),
    reference_no VARCHAR(100),
    amount DECIMAL(12, 2),
    transaction_date DATE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
