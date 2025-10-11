/**
 * View Helper Middleware
 * Makes user session and helper functions available to all views
 */

const { getCurrentUser } = require('../middlewares/sessionMiddleware');

/**
 * Middleware to inject user data and helper functions into all views
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const injectViewHelpers = (req, res, next) => {
    // Make user info available to all views
    res.locals.user = getCurrentUser(req);
    res.locals.isAuthenticated = req.session?.isAuthenticated || false;
    
    // Helper functions for views
    res.locals.helpers = {
        // Check if user has specific role
        hasRole: (role) => {
            return res.locals.user && res.locals.user.role === role;
        },
        
        // Check if user is admin
        isAdmin: () => {
            return res.locals.user && res.locals.user.role === 'admin';
        },
        
        // Get user display name
        getUserDisplayName: () => {
            return res.locals.user ? (res.locals.user.name || res.locals.user.username) : 'Guest';
        },
        
        // Format login time
        getLoginTime: () => {
            return res.locals.user ? new Date(res.locals.user.loginTime).toLocaleString() : null;
        },
        
        // Generate logout URL with CSRF protection
        getLogoutUrl: () => {
            return '/logout';
        }
    };
    
    next();
};

module.exports = {
    injectViewHelpers
};