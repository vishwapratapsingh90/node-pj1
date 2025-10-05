/**
 * Forgot Password Module Routes
 * Contains all routes related to password reset functionality
 */

const express = require('express');
const router = express.Router();

/**
 * Forgot password page route
 * Renders the password reset form
 */
router.get('/forgot-password', (req, res) => {
    // Get environment variables from app.locals
    const { INSTANCE_NAME, ENV_NAME } = req.app.locals;
    
    res.render('forgot-password', {
        title: 'Forgot Password - ' + INSTANCE_NAME,
        description: 'Reset your password',
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        activePage: null,
        layout: 'homepage', // Fixed: Remove 'layouts/' prefix
        messages: {
            success: req.query.success || null,
            error: req.query.error || null,
            warning: req.query.warning || null,
            info: req.query.info || null
        }
    });
});

/**
 * Forgot password form submission handler
 * Processes password reset request
 */
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.redirect('/forgot-password?error=Please enter your email address');
    }
    
    // TODO: Implement password reset logic here
    console.log('Password reset requested for:', email);
    res.redirect('/forgot-password?success=Password reset instructions have been sent to your email');
});

module.exports = router;
