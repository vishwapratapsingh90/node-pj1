/**
 * About Module Routes
 * Contains all routes related to the about page functionality
 */

const express = require('express');
const router = express.Router();

/**
 * About page route
 * Renders the about page with application information
 */
router.get('/about', (req, res) => {
    // Get environment variables from app.locals
    const { INSTANCE_NAME, ENV_NAME, PROTOCOL, BASE_URL, PORT } = req.app.locals;
    
    const data = {
        title: `About - ${INSTANCE_NAME}`,
        description: `Learn more about ${INSTANCE_NAME}`,
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        activePage: 'about',
        baseUrl: `${PROTOCOL}://${BASE_URL}:${PORT}`,
        layout: 'homepage' // Fixed: Remove 'layouts/' prefix
    };
    
    res.render('about', data);
});

module.exports = router;
