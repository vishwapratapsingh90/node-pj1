/**
 * Database Initialization Script
 * Creates necessary tables and inserts demo data
 */

const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Initialize the database with required tables and demo data
 */
const initializeDatabase = async () => {
    try {
        console.log('Starting database initialization...');
        
        // Create pj1_credentials table
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS pj1_credentials (
            id int(11) NOT NULL AUTO_INCREMENT,
            username varchar(255) NOT NULL,
            password varchar(255) NOT NULL,
            updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            updated_by int(11) NOT NULL,
            created_at timestamp NOT NULL DEFAULT current_timestamp(),
            created_by int(11) NOT NULL,
            PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `;
        
        await query(createTableSQL);
        console.log('✓ pj1_credentials table created/verified');
        
        // Insert demo users
        const insertDemoUsers = `
            INSERT INTO pj1_credentials (username, password, updated_by, created_by) VALUES 
            ('admin', 'password123', 1, 1),
            ('user', 'user123', 1, 1),
            ('demo', 'demo123', 1, 1)
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `;
        
        await query(insertDemoUsers);
        console.log('✓ Demo users inserted/updated');
        
        // Verify the setup
        const users = await query('SELECT id, username, created_at FROM pj1_credentials');
        console.log('✓ Database initialization completed successfully');
        console.log('Available users:', users.map(u => u.username).join(', '));
        
        return {
            success: true,
            message: 'Database initialized successfully',
            userCount: users.length
        };
        
    } catch (error) {
        console.error('✗ Database initialization failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Check if the database is properly set up
 */
const checkDatabaseSetup = async () => {
    try {
        const users = await query('SELECT COUNT(*) as count FROM pj1_credentials');
        return {
            success: true,
            userCount: users[0].count
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Run initialization if this script is executed directly
if (require.main === module) {
    initializeDatabase()
        .then((result) => {
            if (result.success) {
                console.log('Database setup completed!');
                process.exit(0);
            } else {
                console.error('Database setup failed:', result.error);
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = {
    initializeDatabase,
    checkDatabaseSetup
};