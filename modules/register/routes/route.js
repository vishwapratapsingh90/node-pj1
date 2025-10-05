/**
 * Register Module Routes
 * Contains all routes related to user registration functionality
 */

const express = require('express');
const router = express.Router();

/**
 * Register page route
 * Renders the registration form
 */
router.get('/register', (req, res) => {
    // Get environment variables from app.locals
    const { INSTANCE_NAME, ENV_NAME, PROTOCOL, BASE_URL, PORT } = req.app.locals;
    
    res.render('register', {
        title: 'Register - ' + INSTANCE_NAME,
        description: 'Create a new account',
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        activePage: 'register',
        layout: 'homepage', // Fixed: Remove 'layouts/' prefix
        messages: {
            success: req.query.success || null,
            error: req.query.error || null,
            warning: req.query.warning || null,
            info: req.query.info || null
        }
    });
});

module.exports = router;
