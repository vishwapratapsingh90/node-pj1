/**
 * Session Middleware
 * Handles user session management and authentication state
 */

const session = require('express-session');
const { getCurrentConfig } = require('../config/db');

// Try to use MySQL session store, fallback to memory store
let MySQLStore;
try {
    MySQLStore = require('express-mysql-session')(session);
} catch (error) {
    console.warn('express-mysql-session not found, using memory store for sessions');
    console.warn('Install express-mysql-session for production use: npm install express-mysql-session');
}

/**
 * Create session store using MySQL or fallback to memory
 */
const createSessionStore = () => {
    if (MySQLStore) {
        const dbConfig = getCurrentConfig();
        
        const sessionStoreOptions = {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            checkExpirationInterval: 900000, // 15 minutes
            expiration: 86400000, // 24 hours
            createDatabaseTable: true,
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            }
        };
        
        console.log('✓ Using MySQL session store');
        return new MySQLStore(sessionStoreOptions);
    } else {
        console.warn('⚠ Using memory session store (not recommended for production)');
        return null; // Use default memory store
    }
};

/**
 * Configure session middleware
 * @param {Object} app - Express app instance
 */
const configureSession = (app) => {
    const sessionStore = createSessionStore();
    
    const sessionConfig = {
        key: 'pj1_session',
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        rolling: true, // Reset expiration on activity
        cookie: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            httpOnly: true, // Prevent XSS
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax' // CSRF protection
        }
    };
    
    // Only add store if MySQL store is available
    if (sessionStore) {
        sessionConfig.store = sessionStore;
        console.log('✓ Session middleware configured with MySQL store');
    } else {
        console.log('✓ Session middleware configured with memory store');
    }
    
    app.use(session(sessionConfig));
};

/**
 * Middleware to create user session after successful login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createUserSession = (req, res, next) => {
    if (req.authenticatedUser) {
        // Create session data
        req.session.user = {
            id: req.authenticatedUser.id || null,
            username: req.authenticatedUser.username,
            role: req.authenticatedUser.role,
            name: req.authenticatedUser.name,
            loginTime: new Date().toISOString()
        };
        
        req.session.isAuthenticated = true;
        
        console.log('Session created for user:', req.authenticatedUser.username);
    }
    
    next();
};

/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        // Attach user info to request for use in routes
        req.user = req.session.user;
        next();
    } else {
        res.redirect('/login?error=Please log in to access this page');
    }
};

/**
 * Middleware to check if user is already logged in (for login/register pages)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return res.redirect('/?info=You are already logged in');
    }
    next();
};

/**
 * Logout user and destroy session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logoutUser = (req, res) => {
    const username = req.session?.user?.username || 'Unknown';
    
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/?error=Error logging out');
        }
        
        res.clearCookie('pj1_session');
        console.log('User logged out:', username);
        res.redirect('/login?success=Successfully logged out');
    });
};

/**
 * Get current user info from session
 * @param {Object} req - Express request object
 * @returns {Object|null} User info or null if not authenticated
 */
const getCurrentUser = (req) => {
    return req.session?.user || null;
};

/**
 * Check if user has specific role
 * @param {string} role - Required role
 * @returns {Function} Middleware function
 */
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session?.isAuthenticated) {
            return res.redirect('/login?error=Authentication required');
        }
        
        if (req.session.user.role !== role) {
            return res.status(403).render('error', {
                title: 'Access Denied',
                error: 'You do not have permission to access this page',
                layout: 'homepage'
            });
        }
        
        next();
    };
};

module.exports = {
    configureSession,
    createUserSession,
    requireAuth,
    redirectIfAuthenticated,
    logoutUser,
    getCurrentUser,
    requireRole
};