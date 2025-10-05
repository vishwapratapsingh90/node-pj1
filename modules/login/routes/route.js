/**
 * Login Module Routes
 * Contains all routes related to user authentication functionality
 */

const express = require('express');
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
 * Processes login authentication
 */
router.post('/login', (req, res) => {
    const { username, password, rememberMe } = req.body;
    
    // Basic validation
    if (!username || !password) {
        return res.redirect('/login?error=Please fill in all fields');
    }
    
    // TODO: Implement actual authentication logic here
    // For demo purposes, we'll use simple credentials
    if (username === 'admin' && password === 'password123') {
        // Successful login
        // TODO: Set session/JWT token here
        console.log('Login successful for:', username);
        res.redirect('/?success=Welcome back, ' + username + '!');
    } else {
        // Failed login
        console.log('Login failed for:', username);
        res.redirect('/login?error=Invalid username or password');
    }
});

module.exports = router;
