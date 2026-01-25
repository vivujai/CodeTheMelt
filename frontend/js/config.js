/**
 * Configuration for API endpoints
 * Switch between local Java backend and PythonAnywhere Python backend
 */

const API_CONFIG = {
    // Local development (Java backend)
    LOCAL: 'http://localhost:8080',
    
    // PythonAnywhere deployment (Python backend)
    // Replace 'yourusername' with your actual PythonAnywhere username
    PYTHONANYWHERE: 'https://yourusername.pythonanywhere.com',
    
    // Current active configuration
    // Change this to switch between backends
    ACTIVE: 'LOCAL'  // Change to 'PYTHONANYWHERE' when deployed
};

// Get the current API base URL
function getAPIBaseURL() {
    return API_CONFIG[API_CONFIG.ACTIVE];
}

// API endpoint builders
const API_ENDPOINTS = {
    details: (iceSheet) => `${getAPIBaseURL()}/api/icesheet/${iceSheet}/details`,
    visualization: (iceSheet, period) => `${getAPIBaseURL()}/api/icesheet/${iceSheet}/visualization?period=${period}`,
    health: () => `${getAPIBaseURL()}/api/icesheet/health`
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.getAPIBaseURL = getAPIBaseURL;
    window.API_ENDPOINTS = API_ENDPOINTS;
}