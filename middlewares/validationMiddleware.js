/**
 * Validation Middleware
 * Handles form validation and input sanitization
 */

/**
 * Validate login form data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateLoginForm = (req, res, next) => {
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
        req.validationError = 'Please fill in all fields';
        return next();
    }
    
    // Trim whitespace
    req.body.username = username.trim();
    req.body.password = password.trim();
    
    // Additional validation rules
    if (req.body.username.length < 3) {
        req.validationError = 'Username must be at least 3 characters';
        return next();
    }
    
    if (req.body.password.length < 6) {
        req.validationError = 'Password must be at least 6 characters';
        return next();
    }
    
    next(); // Validation passed, continue to next middleware
};

/**
 * Validate registration form data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRegistrationForm = (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
        req.validationError = 'Please fill in all fields';
        return next();
    }
    
    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.validationError = 'Please enter a valid email address';
        return next();
    }
    
    // Password confirmation
    if (password !== confirmPassword) {
        req.validationError = 'Passwords do not match';
        return next();
    }
    
    next(); // Validation passed
};

module.exports = {
    validateLoginForm,
    validateRegistrationForm
};