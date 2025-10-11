/**
 * Login Controller
 * Handles authentication logic and business rules
 */

/**
 * Handle login form submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleLogin = (req, res) => {
    // Check for validation errors first
    if (req.validationError) {
        return res.redirect('/login?error=' + encodeURIComponent(req.validationError));
    }
    
    // Check for authentication errors
    if (req.authenticationError) {
        return res.redirect('/login?error=Invalid username or password');
    }
    
    // At this point, validation passed and authentication succeeded
    const user = req.authenticatedUser;
    
    // Successful login
    // TODO: Set session/JWT token here
    console.log('Login successful for:', user.username);
    res.redirect('/?success=' + encodeURIComponent('Welcome back, ' + user.username + '!'));
};

module.exports = {
    handleLogin
};
