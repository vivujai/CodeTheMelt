/**
 * Error Handler Utility for Ice Sheet Visualization System
 * Provides centralized error handling, retry logic, and user notifications
 * Requirements: 7.5
 */

class ErrorHandler {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second base delay
        this.errorContainer = null;
        this.initializeErrorContainer();
    }

    /**
     * Initialize error notification container
     */
    initializeErrorContainer() {
        // Create error container if it doesn't exist
        let container = document.getElementById('error-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'error-notifications';
            container.className = 'error-notifications-container';
            document.body.appendChild(container);
        }
        this.errorContainer = container;
    }

    /**
     * Execute API request with retry logic and error handling
     * @param {Function} apiCall - Function that returns a Promise for the API call
     * @param {Object} options - Configuration options
     * @param {number} options.maxRetries - Maximum number of retry attempts
     * @param {number} options.retryDelay - Base delay between retries in milliseconds
     * @param {string} options.operation - Description of the operation for error messages
     * @param {Function} options.fallbackHandler - Optional fallback function to call on failure
     * @returns {Promise} - Promise that resolves with API response or rejects with error
     */
    async executeWithRetry(apiCall, options = {}) {
        const {
            maxRetries = this.maxRetries,
            retryDelay = this.retryDelay,
            operation = 'API request',
            fallbackHandler = null
        } = options;

        let lastError = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Show loading indicator for first attempt
                if (attempt === 0) {
                    this.showLoadingMessage(operation);
                }

                const result = await apiCall();
                
                // Clear any error messages on success
                this.clearErrorMessages();
                return result;
                
            } catch (error) {
                lastError = error;
                console.warn(`${operation} attempt ${attempt + 1} failed:`, error);

                // If this is not the last attempt, wait before retrying
                if (attempt < maxRetries) {
                    const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
                    this.showRetryMessage(operation, attempt + 1, maxRetries, delay);
                    await this.sleep(delay);
                } else {
                    // All attempts failed
                    this.handleFinalError(lastError, operation, fallbackHandler);
                }
            }
        }

        // If we get here, all retries failed
        throw lastError;
    }

    /**
     * Handle final error after all retries failed
     * @param {Error} error - The final error
     * @param {string} operation - Description of the operation
     * @param {Function} fallbackHandler - Optional fallback function
     */
    handleFinalError(error, operation, fallbackHandler) {
        console.error(`${operation} failed after all retries:`, error);
        
        // Determine error type and show appropriate message
        const errorType = this.categorizeError(error);
        const userMessage = this.getUserFriendlyMessage(errorType, operation);
        
        this.showErrorMessage(userMessage, errorType);
        
        // Execute fallback handler if provided
        if (fallbackHandler && typeof fallbackHandler === 'function') {
            try {
                fallbackHandler(error);
            } catch (fallbackError) {
                console.error('Fallback handler failed:', fallbackError);
            }
        }
    }

    /**
     * Categorize error type for appropriate handling
     * @param {Error} error - The error to categorize
     * @returns {string} - Error category
     */
    categorizeError(error) {
        if (!navigator.onLine) {
            return 'offline';
        }
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'network';
        }
        
        if (error.message.includes('HTTP error')) {
            const status = error.message.match(/status: (\d+)/);
            if (status) {
                const statusCode = parseInt(status[1]);
                if (statusCode >= 500) return 'server';
                if (statusCode === 404) return 'notfound';
                if (statusCode >= 400) return 'client';
            }
            return 'http';
        }
        
        if (error.message.includes('timeout')) {
            return 'timeout';
        }
        
        return 'unknown';
    }

    /**
     * Get user-friendly error message based on error type
     * @param {string} errorType - The categorized error type
     * @param {string} operation - Description of the operation
     * @returns {string} - User-friendly error message
     */
    getUserFriendlyMessage(errorType, operation) {
        const messages = {
            offline: 'You appear to be offline. Please check your internet connection and try again.',
            network: 'Unable to connect to the server. Please check your internet connection.',
            server: 'The server is experiencing issues. Please try again in a few moments.',
            timeout: 'The request timed out. The server may be busy, please try again.',
            notfound: 'The requested data could not be found. Please try refreshing the page.',
            client: 'There was an issue with your request. Please try refreshing the page.',
            http: 'There was a communication error with the server. Please try again.',
            unknown: 'An unexpected error occurred. Please try refreshing the page.'
        };
        
        return messages[errorType] || messages.unknown;
    }

    /**
     * Show loading message to user
     * @param {string} operation - Description of the operation
     */
    showLoadingMessage(operation) {
        this.clearErrorMessages();
        const message = document.createElement('div');
        message.className = 'error-notification loading';
        message.innerHTML = `
            <div class="notification-content">
                <div class="loading-spinner"></div>
                <span>Loading ${operation.toLowerCase()}...</span>
            </div>
        `;
        this.errorContainer.appendChild(message);
    }

    /**
     * Show retry message to user
     * @param {string} operation - Description of the operation
     * @param {number} attempt - Current attempt number
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} delay - Delay before next retry
     */
    showRetryMessage(operation, attempt, maxRetries, delay) {
        this.clearErrorMessages();
        const message = document.createElement('div');
        message.className = 'error-notification retry';
        message.innerHTML = `
            <div class="notification-content">
                <div class="retry-spinner"></div>
                <span>Retrying ${operation.toLowerCase()}... (${attempt}/${maxRetries})</span>
                <div class="retry-countdown">Next attempt in ${Math.ceil(delay / 1000)}s</div>
            </div>
        `;
        this.errorContainer.appendChild(message);
    }

    /**
     * Show error message to user
     * @param {string} message - User-friendly error message
     * @param {string} errorType - Error type for styling
     */
    showErrorMessage(message, errorType = 'unknown') {
        this.clearErrorMessages();
        
        const errorElement = document.createElement('div');
        errorElement.className = `error-notification error ${errorType}`;
        errorElement.innerHTML = `
            <div class="notification-content">
                <div class="error-icon">⚠️</div>
                <div class="error-text">
                    <div class="error-title">Connection Error</div>
                    <div class="error-message">${message}</div>
                </div>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        this.errorContainer.appendChild(errorElement);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 10000);
    }

    /**
     * Show success message to user
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        this.clearErrorMessages();
        
        const successElement = document.createElement('div');
        successElement.className = 'error-notification success';
        successElement.innerHTML = `
            <div class="notification-content">
                <div class="success-icon">✓</div>
                <div class="success-text">${message}</div>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        this.errorContainer.appendChild(successElement);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successElement.parentNode) {
                successElement.remove();
            }
        }, 3000);
    }

    /**
     * Clear all error messages
     */
    clearErrorMessages() {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = '';
        }
    }

    /**
     * Sleep for specified duration
     * @param {number} ms - Duration in milliseconds
     * @returns {Promise} - Promise that resolves after the delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create a wrapped fetch function with timeout support
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options
     * @param {number} timeout - Timeout in milliseconds (default: 10000)
     * @returns {Promise} - Promise that resolves with fetch response
     */
    async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }
}

// Create global instance
window.errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}