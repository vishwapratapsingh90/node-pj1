/**
 * Home Module Routes
 * Contains all routes related to the home/landing page functionality
 */

const express = require('express');
const router = express.Router();

/**
 * Homepage route
 * Renders the main landing page with application information
 */
router.get('/', (req, res) => {
    // Get environment variables from app.locals or pass them as parameters
    const { INSTANCE_NAME, ENV_NAME, PROTOCOL, BASE_URL, PORT } = req.app.locals;
    
    const data = {
        title: `Welcome to ${INSTANCE_NAME}`,
        description: `${INSTANCE_NAME} - A modern Node.js application`,
        keywords: 'nodejs, express, web application',
        author: 'Vishwa Pratap Singh',
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        activePage: 'home',
        baseUrl: `${PROTOCOL}://${BASE_URL}:${PORT}`,
        footerDescription: 'Building amazing web applications with Node.js and Express.',
        layout: 'homepage', // Fixed: Remove 'layouts/' prefix
        messages: {
            success: req.query.success || null,
            error: req.query.error || null,
            warning: req.query.warning || null,
            info: req.query.info || null
        }
    };
    
    console.log('Rendering with data:', data); // Debug log
    res.render('index', data);
});

module.exports = router;