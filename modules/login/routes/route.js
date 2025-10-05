/**
 * Login Module Routes
 * Contains all routes related to user authentication functionality
 */

const express = require('express');
const { handleLogin } = require('../controllers/login');
const { authenticateUser } = require('../../../middlewares/authenticationMiddleware');
const { validateLoginForm } = require('../../../middlewares/validationMiddleware');
const router = express.Router();

/**
 * Login page route
 * Renders the login form
 */
router.get('/login', (req, res) => {
    // Get environment variables from app.locals
    const { INSTANCE_NAME, ENV_NAME, PROTOCOL, BASE_URL, PORT } = req.app.locals;
    
    const data = {
        title: 'Login - ' + INSTANCE_NAME,
        description: 'Sign in to your account',
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        activePage: 'login',
        layout: 'homepage', // Fixed: Remove 'layouts/' prefix
        baseUrl: `${PROTOCOL}://${BASE_URL}:${PORT}`,
        messages: {
            success: req.query.success || null,
            error: req.query.error || null,
            warning: req.query.warning || null,
            info: req.query.info || null
        }
    };
    
    res.render('login', data);
});

/**
 * Login form submission handler
 * Processes login authentication with validation and authentication middlewares
 */
router.post('/login', validateLoginForm, authenticateUser, handleLogin);

module.exports = router;
