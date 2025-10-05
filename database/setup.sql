-- Database setup for pj1_credentials table
-- Run this SQL script in your MySQL database

CREATE TABLE IF NOT EXISTS `pj1_credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert some demo users for testing
-- Note: In production, passwords should be hashed with bcrypt
INSERT INTO pj1_credentials (username, password) VALUES 
('admin', 'password123'),
('user', 'user123'),
('demo', 'demo123')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Verify the data
SELECT id, username, created_at FROM pj1_credentials;