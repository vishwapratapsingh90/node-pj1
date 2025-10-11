-- Database setup for pj1_credentials table
-- Run this SQL script in your MySQL database

-- Create the user table
CREATE TABLE IF NOT EXISTS `pj1_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `updated_by` int(11) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `user_updated_by` (`updated_by`),
  KEY `user_created_by` (`created_by`),
  CONSTRAINT `user_created_by` FOREIGN KEY (`created_by`) REFERENCES `pj1_users` (`id`),
  CONSTRAINT `user_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `pj1_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `pj1_users` (`first_name`, `last_name`, `email`, `updated_by`, `created_by`) VALUES 
('Adam', 'Gene', 'adam.gene@yopmail.com', '1', '1'),
('Eve', 'Smith', 'eve.smith@yopmail.com', '1', '1'),
('John', 'Doe', 'john.doe@yopmail.com', '1', '1');

-- Create the credentials table
CREATE TABLE IF NOT EXISTS `pj1_credentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `cred_updated_by` (`updated_by`),
  KEY `cred_created_by` (`created_by`),
  KEY `cred_user_id` (`user_id`),
  CONSTRAINT `cred_created_by` FOREIGN KEY (`created_by`) REFERENCES `pj1_users` (`id`),
  CONSTRAINT `cred_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `pj1_users` (`id`),
  CONSTRAINT `cred_user_id` FOREIGN KEY (`user_id`) REFERENCES `pj1_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert some demo users for testing
-- Note: Passwords are now properly hashed with bcrypt (salt rounds: 12)
-- Original passwords for reference:
--   admin: password123
--   user: user123  
--   demo: demo123
INSERT IGNORE INTO pj1_credentials (user_id, username, password, updated_by, created_by) VALUES 
(1, 'admin', '$2b$12$/SxFI3BHEvLapE4p6iFI1ORyxduENnGmyfT9btfYMD/2Jy/zg3Djm', 1, 1),
(2, 'user', '$2b$12$2whI6osJicxkDx9zLQB0Iu28Pq/yXwfzVYzYSLB41P0LQcBPLMFKe', 1, 1),
(3, 'demo', '$2b$12$VYqnLM6jVJCOdWLh.eNb/OzJS5fPFH6JjfMesFJeJMq/ISgaDLZk2', 1, 1)
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Verify the data
SELECT id, username, created_at FROM pj1_credentials;

-- Create the roles table
CREATE TABLE IF NOT EXISTS `pj1_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert initial roles
INSERT IGNORE INTO `pj1_roles` (`role`) VALUES
('admin'),
('user'),
('guest');
