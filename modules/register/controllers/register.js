/**
 * Register Controller
 * Handles user registration logic
 */

const User = require('../models/User');

class RegisterController {
    /**
     * Show registration form
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static showForm(req, res) {
        // Get environment variables from app.locals
        const { INSTANCE_NAME, ENV_NAME, PROTOCOL, BASE_URL, PORT } = req.app.locals;
        
        res.render('register', {
            title: 'Register - ' + INSTANCE_NAME,
            description: 'Create a new account',
            appName: INSTANCE_NAME,
            envName: ENV_NAME,
            activePage: 'register',
            layout: 'homepage',
            messages: {
                success: req.query.success || null,
                error: req.query.error || null,
                warning: req.query.warning || null,
                info: req.query.info || null
            }
        });
    }
    
    /**
     * Process registration form submission
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async processRegistration(req, res) {
        try {
            const { firstName, lastName, email, username, password, confirmPassword, agreeTerms } = req.body;
            
            // Validation
            const errors = await RegisterController.validateInput({
                firstName, lastName, email, username, password, confirmPassword, agreeTerms
            });
            
            if (errors.length > 0) {
                return res.redirect(`/register?error=${encodeURIComponent(errors.join('. '))}`);
            }
            
            // Create the user
            const newUser = await User.create({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                username: username.trim().toLowerCase(),
                password
            });
            
            // Success - redirect to login page
            res.redirect('/login?success=' + encodeURIComponent('Registration successful! Please log in with your credentials.'));
            
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            // Handle specific database errors
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('email')) {
                    errorMessage = 'This email address is already registered.';
                } else if (error.message.includes('username')) {
                    errorMessage = 'This username is already taken.';
                }
            }
            
            res.redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
        }
    }
    
    /**
     * Validate registration input
     * @param {Object} data - Input data to validate
     * @returns {Promise<Array>} Array of error messages
     */
    static async validateInput(data) {
        const errors = [];
        const { firstName, lastName, email, username, password, confirmPassword, agreeTerms } = data;
        
        // Required field validation
        if (!firstName || firstName.trim().length === 0) {
            errors.push('First name is required');
        } else if (firstName.trim().length > 255) {
            errors.push('First name must be less than 255 characters');
        }
        
        if (!lastName || lastName.trim().length === 0) {
            errors.push('Last name is required');
        } else if (lastName.trim().length > 255) {
            errors.push('Last name must be less than 255 characters');
        }
        
        if (!email || email.trim().length === 0) {
            errors.push('Email is required');
        } else {
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                errors.push('Please enter a valid email address');
            } else if (email.trim().length > 255) {
                errors.push('Email must be less than 255 characters');
            } else {
                // Check if email already exists
                const emailExists = await User.emailExists(email.trim().toLowerCase());
                if (emailExists) {
                    errors.push('This email address is already registered');
                }
            }
        }
        
        if (!username || username.trim().length === 0) {
            errors.push('Username is required');
        } else {
            const cleanUsername = username.trim().toLowerCase();
            if (cleanUsername.length < 3) {
                errors.push('Username must be at least 3 characters long');
            } else if (cleanUsername.length > 255) {
                errors.push('Username must be less than 255 characters');
            } else if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
                errors.push('Username can only contain letters, numbers, dots, hyphens, and underscores');
            } else {
                // Check if username already exists
                const usernameExists = await User.usernameExists(cleanUsername);
                if (usernameExists) {
                    errors.push('This username is already taken');
                }
            }
        }
        
        if (!password || password.length === 0) {
            errors.push('Password is required');
        } else {
            if (password.length < 8) {
                errors.push('Password must be at least 8 characters long');
            }
            if (password.length > 255) {
                errors.push('Password must be less than 255 characters');
            }
            // Check for at least one letter and one number
            if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
                errors.push('Password must contain at least one letter and one number');
            }
        }
        
        if (!confirmPassword || confirmPassword.length === 0) {
            errors.push('Password confirmation is required');
        } else if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        // Terms agreement validation
        if (!agreeTerms || agreeTerms !== 'on') {
            errors.push('You must agree to the terms and conditions');
        }
        
        return errors;
    }
}

module.exports = RegisterController;