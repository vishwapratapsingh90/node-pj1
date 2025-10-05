// Example usage of the database configuration
const db = require('./config/db');

// Example: Get all users
async function getUsers() {
    try {
        const users = await db.query('SELECT * FROM users');
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Example: Get user by ID
async function getUserById(id) {
    try {
        const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return user[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

// Example: Create a new user
async function createUser(userData) {
    try {
        const result = await db.query(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [userData.name, userData.email]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Example: Test database connection
async function testConnection() {
    try {
        await db.query('SELECT 1 as test');
        console.log(`Database connection successful for environment: ${db.ENV_NAME}`);
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    testConnection
};