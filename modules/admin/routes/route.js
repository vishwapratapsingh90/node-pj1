/**
 * Admin Module Routes
 * Contains all routes related to the admin dashboard functionality
 */

const express = require('express');
const { requireAuth, requireRole } = require('../../../middlewares/sessionMiddleware');
const router = express.Router();

/**
 * Admin dashboard route (protected - requires admin role)
 * Renders the admin dashboard with admin layout
 */
router.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
    // Get environment variables from app.locals
    const { INSTANCE_NAME, ENV_NAME } = req.app.locals;
    
    res.render('admin-dashboard', {
        title: 'Admin Dashboard',
        layout: 'admin', // Uses admin.ejs layout
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        availableLayouts: req.app.get('availableLayouts') || {}
    });
});

module.exports = router;
