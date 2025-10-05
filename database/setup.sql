-- Database setup for pj1_credentials table
-- Run this SQL script in your MySQL database

CREATE TABLE IF NOT EXISTS pj1_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
);

-- Insert some demo users for testing
-- Note: In production, passwords should be hashed with bcrypt
INSERT INTO pj1_credentials (username, password) VALUES 
('admin', 'password123'),
('user', 'user123'),
('demo', 'demo123')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Verify the data
SELECT id, username, created_at FROM pj1_credentials;