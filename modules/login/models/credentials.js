/**
 * Credentials Model
 * Handles database operations for user credentials
 */

const { query } = require('../../../config/db');

/**
 * Find user by username from the database
 * @param {string} username - The username to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findUserByUsername = async (username) => {
    try {
        const sql = 'SELECT username, password FROM pj1_credentials WHERE username = ? LIMIT 1';
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
        
        // Verify password
        // TODO: Replace with bcrypt hash comparison in production
        if (user.password !== password) {
            return {
                success: false,
                error: 'Invalid password'
            };
        }
        
        // Return user info (excluding password)
        return {
            success: true,
            user: {
                username: user.username,
                role: 'user', // Default role, can be added to database later
                name: user.username // Using username as name for now, can add name field later
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
 * @param {string} password - The password (should be hashed before calling this)
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
        
        const sql = 'INSERT INTO pj1_credentials (username, password) VALUES (?, ?)';
        const result = await query(sql, [username, password]);
        
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
 * @param {string} newPassword - The new password (should be hashed)
 * @returns {Promise<Object>} Result of password update
 */
const updateUserPassword = async (username, newPassword) => {
    try {
        const sql = 'UPDATE pj1_credentials SET password = ? WHERE username = ?';
        const result = await query(sql, [newPassword, username]);
        
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
