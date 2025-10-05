/**
 * Blog Module Routes
 * Contains all routes related to the blog functionality
 */

const express = require('express');
const router = express.Router();

/**
 * Blog home page route
 * Renders the blog home page with blog layout
 */
router.get('/blog', (req, res) => {
    // Get environment variables from app.locals
    const { INSTANCE_NAME, ENV_NAME } = req.app.locals;
    
    res.render('blog-home', {
        title: 'My Blog',
        layout: 'blog', // Uses blog.ejs layout
        appName: INSTANCE_NAME,
        envName: ENV_NAME
    });
});

module.exports = router;
