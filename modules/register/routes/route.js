/**
 * Register Module Routes
 * Contains all routes related to user registration functionality
 */

const express = require('express');
const router = express.Router();
const RegisterController = require('../controllers/register');

/**
 * Register page route
 * GET /register - Shows the registration form
 */
router.get('/register', RegisterController.showForm);

/**
 * Register form submission
 * POST /register - Processes the registration form data
 */
router.post('/register', RegisterController.processRegistration);

module.exports = router;
