/**
 * Main application entry point for Ice Sheet Visualization System
 * Initializes components and handles application startup
 */

// Global application state
let navigationController;
let statisticsDisplay;
let visualizationEngine;

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize core components
    navigationController = new NavigationController();
    statisticsDisplay = new StatisticsDisplay();
    visualizationEngine = new VisualizationEngine();
    
    // Make components globally available
    window.navigationController = navigationController;
    window.statisticsDisplay = statisticsDisplay;
    window.visualizationEngine = visualizationEngine;
    
    // Handle initial URL routing
    const initialPath = window.location.hash.substring(1);
    if (initialPath) {
        navigationController.navigateFromURL(initialPath);
    } else {
        navigationController.navigateToTitlePage();
    }
    
    console.log('Ice Sheet Visualization System initialized');
}

/**
 * Application startup
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        getNavigationController: () => navigationController,
        getStatisticsDisplay: () => statisticsDisplay,
        getVisualizationEngine: () => visualizationEngine
    };
}