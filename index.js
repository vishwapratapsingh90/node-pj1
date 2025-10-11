//import the required package
const express = require('express');
const http = require('http');
const dotenv = require('dotenv'); // Load environment variables from .env file
const path = require('path');
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');
const { createLayoutMiddleware, selectLayout } = require('./middlewares/layoutMiddleware');
const { loadRouteModules } = require('./utils/routeLoader');
const { configureSession } = require('./middlewares/sessionMiddleware');
const { injectViewHelpers } = require('./helpers/viewHelpers');
const app = express();

// Auto-load all route modules
const routeModules = loadRouteModules(path.join(__dirname, 'modules'));

// dot env config
dotenv.config();
const BASE_URL = process.env.BASE_URL || 'localhost';
const ENV_NAME = process.env.ENV_NAME || 'dev';
const INSTANCE_NAME = process.env.INSTANCE_NAME || 'World';
const PORT = process.env.PORT || 8001;
const PROTOCOL = process.env.PROTOCOL || 'http';

// Auto-discover layout files
function discoverLayouts() {
    const layoutsDir = path.join(__dirname, 'views', 'layouts');
    const layouts = {};
    
    try {
        if (fs.existsSync(layoutsDir)) {
            const files = fs.readdirSync(layoutsDir);
            files.forEach(file => {
                if (path.extname(file) === '.ejs') {
                    const layoutName = path.basename(file, '.ejs');
                    layouts[layoutName] = `layouts/${layoutName}`;
                    console.log(`✓ Discovered layout: ${layoutName} -> layouts/${layoutName}`);
                }
            });
        }
    } catch (error) {
        console.error('Error discovering layouts:', error.message);
    }
    
    return layouts;
}

// Get available layouts
const availableLayouts = discoverLayouts();
console.log('Available layouts:', Object.keys(availableLayouts));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Enable express-ejs-layouts
app.use(expressLayouts);
// Don't set a default layout - we'll set it per route
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Use the layout middleware
app.use(createLayoutMiddleware(availableLayouts));

// Make environment variables available to all routes
app.locals.INSTANCE_NAME = INSTANCE_NAME;
app.locals.ENV_NAME = ENV_NAME;
app.locals.PROTOCOL = PROTOCOL;
app.locals.BASE_URL = BASE_URL;
app.locals.PORT = PORT;

// Make availableLayouts accessible to routes
app.set('availableLayouts', availableLayouts);

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session management
configureSession(app);

// Inject view helpers (user info, etc.)
app.use(injectViewHelpers);

// Route to list all available layouts
app.get('/layouts', (req, res) => {
    res.json({
        availableLayouts: availableLayouts,
        totalLayouts: Object.keys(availableLayouts).length,
        layoutNames: Object.keys(availableLayouts)
    });
});

// Mount route modules
app.use('/', ...routeModules);

// Test route without layout
app.get('/test', (req, res) => {
    res.render('test', { 
        description: 'Test description',
        layout: false // No layout for this route
    });
});

// API route for health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: ENV_NAME,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 Error handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        activePage: null,
        layout: 'homepage' // Added layout for consistency
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        appName: INSTANCE_NAME,
        envName: ENV_NAME,
        activePage: null,
        layout: 'homepage', // Added layout for consistency
        error: ENV_NAME === 'dev' ? err : null
    });
});

app.listen(PORT, () => {
    console.log(`Server running at "${PROTOCOL}://${BASE_URL}:${PORT}/"`);
    console.log(`Environment: ${ENV_NAME}`);
});
