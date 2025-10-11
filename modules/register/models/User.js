/**
 * User Model
 * Handles database operations for user registration
 */

const db = require('../../../config/db');
const bcrypt = require('bcrypt');

class User {
    /**
     * Create a new user with credentials
     * @param {Object} userData - User data object
     * @param {string} userData.firstName - User's first name
     * @param {string} userData.lastName - User's last name
     * @param {string} userData.email - User's email address
     * @param {string} userData.username - User's username
     * @param {string} userData.password - User's password (will be hashed)
     * @returns {Promise<Object>} Created user data
     */
    static async create(userData) {
        const pool = db.getPool();
        const connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) reject(err);
                else resolve(connection);
            });
        });
        
        try {
            await new Promise((resolve, reject) => {
                connection.beginTransaction((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            // Hash the password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            // Insert into pj1_users table
            const userResult = await new Promise((resolve, reject) => {
                connection.query(
                    `INSERT INTO pj1_users (first_name, last_name, email, created_by, updated_by) 
                     VALUES (?, ?, ?, 1, 1)`,
                    [userData.firstName, userData.lastName, userData.email],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            
            const userId = userResult.insertId;
            
            // Insert into pj1_credentials table
            await new Promise((resolve, reject) => {
                connection.query(
                    `INSERT INTO pj1_credentials (user_id, username, password, created_by, updated_by) 
                     VALUES (?, ?, ?, 1, 1)`,
                    [userId, userData.username, hashedPassword],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            
            await new Promise((resolve, reject) => {
                connection.commit((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            return {
                id: userId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                username: userData.username
            };
            
        } catch (error) {
            await new Promise((resolve) => {
                connection.rollback(() => resolve());
            });
            throw error;
        } finally {
            connection.release();
        }
    }
    
    /**
     * Check if email already exists
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} True if email exists
     */
    static async emailExists(email) {
        try {
            const results = await db.query(
                'SELECT id FROM pj1_users WHERE email = ?',
                [email]
            );
            return results.length > 0;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Check if username already exists
     * @param {string} username - Username to check
     * @returns {Promise<boolean>} True if username exists
     */
    static async usernameExists(username) {
        try {
            const results = await db.query(
                'SELECT id FROM pj1_credentials WHERE username = ?',
                [username]
            );
            return results.length > 0;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Find user by email
     * @param {string} email - Email to search for
     * @returns {Promise<Object|null>} User data or null
     */
    static async findByEmail(email) {
        try {
            const results = await db.query(
                `SELECT u.id, u.first_name, u.last_name, u.email, c.username 
                 FROM pj1_users u 
                 LEFT JOIN pj1_credentials c ON u.id = c.user_id 
                 WHERE u.email = ?`,
                [email]
            );
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Find user by username
     * @param {string} username - Username to search for
     * @returns {Promise<Object|null>} User data or null
     */
    static async findByUsername(username) {
        try {
            const results = await db.query(
                `SELECT u.id, u.first_name, u.last_name, u.email, c.username 
                 FROM pj1_users u 
                 JOIN pj1_credentials c ON u.id = c.user_id 
                 WHERE c.username = ?`,
                [username]
            );
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;