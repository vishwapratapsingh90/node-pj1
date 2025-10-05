/**
 * Route Loader Utility
 * Automatically discovers and loads all route modules from the modules directory
 */

const path = require('path');
const fs = require('fs');

/**
 * Automatically discovers and loads all route modules
 * @param {string} modulesPath - Path to the modules directory
 * @returns {Array} Array of loaded route modules
 */
function loadRouteModules(modulesPath) {
    const routes = [];
    
    try {
        if (!fs.existsSync(modulesPath)) {
            console.warn('Modules directory not found:', modulesPath);
            return routes;
        }
        
        const moduleDirectories = fs.readdirSync(modulesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        for (const moduleDir of moduleDirectories) {
            const routePath = path.join(modulesPath, moduleDir, 'routes', 'route.js');
            
            if (fs.existsSync(routePath)) {
                try {
                    const routeModule = require(routePath);
                    routes.push(routeModule);
                    console.log(`✓ Loaded route module: ${moduleDir}`);
                } catch (error) {
                    console.error(`✗ Failed to load route module ${moduleDir}:`, error.message);
                }
            } else {
                console.warn(`⚠ Route file not found for module: ${moduleDir}`);
            }
        }
        
    } catch (error) {
        console.error('Error loading route modules:', error.message);
    }
    
    return routes;
}

module.exports = {
    loadRouteModules
};