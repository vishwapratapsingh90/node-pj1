/**
 * Credentials Model
 * Handles database operations for user credentials
 */

const { query } = require('../../../config/db');
const bcrypt = require('bcrypt');

/**
 * Find user by username from the database with complete user information
 * @param {string} username - The username to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findUserByUsername = async (username) => {
    try {
        const sql = `
            SELECT 
                c.id as credential_id,
                c.username, 
                c.password,
                c.user_id,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email
            FROM pj1_credentials c
            JOIN pj1_users u ON c.user_id = u.id
            WHERE c.username = ? 
            LIMIT 1
        `;
        const results = await query(sql, [username]);
        
        if (results && results.length > 0) {
            return results[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error finding user by username:', error.message);
        throw error;
    }
};

/**
 * Verify user credentials against database
 * @param {string} username - The username to verify
 * @param {string} password - The password to verify
 * @returns {Promise<Object>} Authentication result with user info or error
 */
const verifyUserCredentials = async (username, password) => {
    try {
        // Find user in database
        const user = await findUserByUsername(username);
        
        if (!user) {
            return {
                success: false,
                error: 'User not found'
            };
        }
        
        // Verify password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return {
                success: false,
                error: 'Invalid password'
            };
        }
        
        // Return user info (excluding password)
        return {
            success: true,
            user: {
                id: user.user_id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                fullName: `${user.first_name} ${user.last_name}`,
                role: 'user' // Default role, can be enhanced with roles table later
            }
        };
        
    } catch (error) {
        console.error('Error verifying credentials:', error.message);
        return {
            success: false,
            error: 'Database error occurred'
        };
    }
};

/**
 * Create a new user in the database
 * @param {string} username - The username
 * @param {string} password - The password (will be hashed automatically)
 * @returns {Promise<Object>} Result of user creation
 */
const createUser = async (username, password) => {
    try {
        // Check if user already exists
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return {
                success: false,
                error: 'Username already exists'
            };
        }
        
        // Hash the password with bcrypt (same salt rounds as registration)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const sql = 'INSERT INTO pj1_credentials (username, password) VALUES (?, ?)';
        const result = await query(sql, [username, hashedPassword]);
        
        return {
            success: true,
            userId: result.insertId
        };
        
    } catch (error) {
        console.error('Error creating user:', error.message);
        return {
            success: false,
            error: 'Failed to create user'
        };
    }
};

/**
 * Update user password
 * @param {string} username - The username
 * @param {string} newPassword - The new password (will be hashed automatically)
 * @returns {Promise<Object>} Result of password update
 */
const updateUserPassword = async (username, newPassword) => {
    try {
        // Hash the new password with bcrypt (same salt rounds as registration)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        const sql = 'UPDATE pj1_credentials SET password = ? WHERE username = ?';
        const result = await query(sql, [hashedPassword, username]);
        
        if (result.affectedRows > 0) {
            return {
                success: true,
                message: 'Password updated successfully'
            };
        } else {
            return {
                success: false,
                error: 'User not found'
            };
        }
        
    } catch (error) {
        console.error('Error updating password:', error.message);
        return {
            success: false,
            error: 'Failed to update password'
        };
    }
};

module.exports = {
    findUserByUsername,
    verifyUserCredentials,
    createUser,
    updateUserPassword
};
