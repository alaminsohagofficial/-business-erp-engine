-- ====================================================================
-- BUSINESS ERP ENGINE - DATABASE SCHEMA (Production Ready)
-- Full SQL Blueprint for MySQL / MariaDB / PostgreSQL
-- ====================================================================

-- Database Creation (যদি তৈরি করা না থাকে)
CREATE DATABASE IF NOT EXISTS business_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE business_erp;

-- ১. ডিলার ও পার্টনারস টেবিল (Dealers & Partners)
CREATE TABLE IF NOT EXISTS dealers (
    dealer_id VARCHAR(30) PRIMARY KEY, -- e.g. 'DEAL002905'
    business_name VARCHAR(255) NOT NULL,
    proprietor_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    credit_limit DECIMAL(15, 2) DEFAULT 0.00,
    current_balance DECIMAL(15, 2) DEFAULT 0.00, -- Dynamic Real-Time Balance
    status ENUM('ACTIVE', 'SUSPENDED', 'HOLD') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ২. ব্যাংক অ্যাকাউন্ট ও ট্রেজারি কনফিগারেশন টেবিল
CREATE TABLE IF NOT EXISTS company_bank_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL, -- e.g. 'IBBL', 'Sonali Bank', 'DBBL'
    branch_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. '20503910100020103'
    routing_number VARCHAR(20) NOT NULL,       -- e.g. '125260433'
    currency VARCHAR(10) DEFAULT 'BDT',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ৩. রিয়েল-টাইম ব্যাংক লেনদেন ট্র্যাকিং (Bank Transactions)
CREATE TABLE IF NOT EXISTS bank_transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    dealer_id VARCHAR(30),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('PAYMENT_IN', 'INVOICE_BILL', 'CREDIT_ADJUSTMENT', 'REMITTANCE') NOT NULL,
    payment_channel ENUM('RTGS', 'NPSB', 'EFTN', 'CASH', 'CHEQUE', 'WIRE') NOT NULL,
    bank_account_no VARCHAR(50),
    routing_no VARCHAR(20),
    utr_ref_no VARCHAR(100) UNIQUE, -- Unique Payment Reference
    status ENUM('PENDING', 'SETTLED', 'REJECTED') DEFAULT 'SETTLED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id) REFERENCES dealers(dealer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ৪. রিয়েল-টাইম ডাবল-এন্ট্রি ডিলার লেজার (Double-Entry Ledger)
CREATE TABLE IF NOT EXISTS dealer_ledger (
    ledger_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dealer_id VARCHAR(30) NOT NULL,
    transaction_id VARCHAR(50),
    debit DECIMAL(15, 2) DEFAULT 0.00,   -- ইনভয়েস চার্জ / পণ্য কেনাকাটা
    credit DECIMAL(15, 2) DEFAULT 0.00,  -- পেমেন্ট / RTGS জমা
    balance DECIMAL(15, 2) NOT NULL,     -- কারেন্ট লেজার অবশিষ্টাংশ
    description TEXT,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id) REFERENCES dealers(dealer_id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES bank_transactions(transaction_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ৫. ইনভেন্টরি ও প্রোডাক্ট ট্র্যাকিং (Inventory with Serial/IMEI)
CREATE TABLE IF NOT EXISTS inventory (
    item_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) UNIQUE, -- Serial / IMEI / Barcode
    category VARCHAR(100),              -- e.g. Refrigerator, Smart TV
    cost_price DECIMAL(15, 2) NOT NULL,
    selling_price DECIMAL(15, 2) NOT NULL,
    stock_status ENUM('IN_STOCK', 'SOLD', 'IN_TRANSIT') DEFAULT 'IN_STOCK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- INITIAL DEMO DATA INSERTION (প্রাথমিক টেস্ট ডাটা)
-- ====================================================================

-- ১. কোম্পানি ব্যাংক ডাইরেক্টরি যুক্ত করা
INSERT INTO company_bank_accounts (bank_name, branch_name, account_number, routing_number) 
VALUES 
('Islami Bank Bangladesh PLC', 'Banani Branch', '20503910100020103', '125260433'),
('Sonali Bank PLC', 'Corporate Branch', 'SB-CC-0012984', '200260111'),
('Dutch-Bangla Bank PLC', 'Gulshan Branch', 'DBBL-CC-9908123', '090261144')
ON DUPLICATE KEY UPDATE account_number=account_number;

-- ২. ডিলার এন্ট্রি যুক্ত করা
INSERT INTO dealers (dealer_id, business_name, proprietor_name, phone, credit_limit, current_balance)
VALUES 
('DEAL002905', 'Hatboalia Bazar SR Electronics', 'S. R. Electronics Park', '01700000000', 5000000.00, 0.00)
ON DUPLICATE KEY UPDATE dealer_id=dealer_id;
