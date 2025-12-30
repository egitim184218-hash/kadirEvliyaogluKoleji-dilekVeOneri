-- Database Schema for Kadir Evliyaoğlu Koleji
-- This SQL script creates the necessary database and tables for the "Dilek ve Öneri" system.

-- 1. Create Database (Optional, if not exists)
CREATE DATABASE IF NOT EXISTS dilek_oneri_db;
USE dilek_oneri_db;

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'İsimsiz',
    grade VARCHAR(255),
    type ENUM('dilek', 'oneri', 'sikayet') NOT NULL,
    text TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_liked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Users Table (For Admin) - Optional but recommended for security
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, not plain text!
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Initial Seed Data (Optional)
INSERT INTO messages (name, grade, type, text, date) VALUES 
('Ahmet Yılmaz', '5-A', 'dilek', 'Okul kütüphanesine daha fazla bilim kurgu kitabı alınmasını istiyorum.', NOW()),
('Ayşe Demir', '8-C', 'oneri', 'Tenefüs süreleri biraz daha uzatılabilir.', NOW());

-- Admin User Seed (Password: 1842 - Note: In production use bcrypt hash!)
-- This is just for demonstration.
INSERT INTO users (username, password_hash, role) VALUES ('admin', '1842', 'admin');
