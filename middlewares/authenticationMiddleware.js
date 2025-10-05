/**
 * Authentication Middleware
 * Handles user authentication verification and validation
 */

const { verifyUserCredentials } = require('../modules/login/models/credentials');

/**
 * Verify user credentials against stored user data
 * @param {string} username - The username to verify
 * @param {string} password - The password to verify
 * @returns {Promise<Object>} Authentication result with user info or error
 */
const verifyCredentials = async (username, password) => {
    // Use the credentials model to verify against database
    return await verifyUserCredentials(username, password);
};

/**
 * Authentication middleware for login verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateUser = async (req, res, next) => {
    const { username, password } = req.body;
    
    try {
        // Verify credentials using the model
        const authResult = await verifyCredentials(username, password);
        
        if (authResult.success) {
            // Attach user info to request for use in controller
            req.authenticatedUser = authResult.user;
        } else {
            // Attach authentication error to request
            req.authenticationError = authResult.error;
            console.log('Login failed for:', username, '-', authResult.error);
        }
    } catch (error) {
        console.error('Authentication error:', error.message);
        req.authenticationError = 'Authentication service unavailable';
    }
    
    next(); // Always continue to controller, let controller handle response
};

/**
 * Middleware to check if user is already authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
    // TODO: Check session/JWT token here
    // For now, just pass through
    next();
};

module.exports = {
    verifyCredentials,
    authenticateUser,
    requireAuth
};
