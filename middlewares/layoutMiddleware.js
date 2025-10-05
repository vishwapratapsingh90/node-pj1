/**
 * Layout Middleware
 * Handles dynamic layout selection for EJS templates
 */

/**
 * Layout selection helper function
 * @param {Object} availableLayouts - Object containing available layouts
 * @param {string} requestedLayout - The requested layout name
 * @param {string} fallback - Fallback layout name (default: 'homepage')
 * @returns {string|boolean} - Layout path or false for no layout
 */
function selectLayout(availableLayouts, requestedLayout, fallback = 'homepage') {
    // If specific layout requested and exists
    if (requestedLayout && availableLayouts[requestedLayout]) {
        return availableLayouts[requestedLayout];
    }
    
    // If fallback exists
    if (availableLayouts[fallback]) {
        return availableLayouts[fallback];
    }
    
    // Return first available layout or default
    const firstLayout = Object.values(availableLayouts)[0];
    return firstLayout || 'layouts/homepage';
}

/**
 * Creates layout middleware that dynamically sets layouts for each route
 * @param {Object} availableLayouts - Object containing available layouts
 * @returns {Function} Express middleware function
 */
function createLayoutMiddleware(availableLayouts) {
    return (req, res, next) => {
        // Override the render function to handle dynamic layouts
        const originalRender = res.render;
        
        res.render = function(view, options = {}, callback) {
            // Determine layout to use
            let layoutToUse;
            
            if (options.layout === false) {
                // No layout requested
                layoutToUse = false;
            } else if (options.layout) {
                // Specific layout requested
                layoutToUse = selectLayout(availableLayouts, options.layout.replace('layouts/', ''));
            } else {
                // Use default layout
                layoutToUse = selectLayout(availableLayouts);
            }
            
            // Set the layout
            options.layout = layoutToUse;
            
            console.log(`Rendering ${view} with layout: ${layoutToUse || 'none'}`);
            
            // Call original render
            return originalRender.call(this, view, options, callback);
        };
        
        next();
    };
}

module.exports = {
    createLayoutMiddleware,
    selectLayout
};