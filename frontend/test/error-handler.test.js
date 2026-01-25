/**
 * Unit Tests for Error Handler
 * Tests error handling, retry logic, and user notifications
 * Requirements: 7.5
 */

// Mock DOM elements for testing
const mockDOM = {
    createElement: (tag) => ({
        id: '',
        className: '',
        innerHTML: '',
        appendChild: () => {},
        remove: () => {},
        parentNode: { removeChild: () => {} }
    }),
    getElementById: (id) => ({
        appendChild: () => {},
        innerHTML: '',
        scrollTop: 0,
        scrollHeight: 100
    }),
    body: {
        appendChild: () => {}
    }
};

// Mock global objects for Node.js environment
global.document = mockDOM;
global.window = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
};
global.navigator = { onLine: true };

// Import the ErrorHandler class
const ErrorHandler = require('../js/utils/ErrorHandler.js');

describe('ErrorHandler', () => {
    let errorHandler;
    
    beforeEach(() => {
        errorHandler = new ErrorHandler();
        // Reset navigator online status
        global.navigator.onLine = true;
    });
    
    describe('Error Categorization', () => {
        test('should categorize network errors correctly', () => {
            const networkError = new TypeError('Failed to fetch');
            const category = errorHandler.categorizeError(networkError);
            expect(category).toBe('network');
        });
        
        test('should categorize HTTP errors correctly', () => {
            const serverError = new Error('HTTP error! status: 500');
            const category = errorHandler.categorizeError(serverError);
            expect(category).toBe('server');
            
            const notFoundError = new Error('HTTP error! status: 404');
            const notFoundCategory = errorHandler.categorizeError(notFoundError);
            expect(notFoundCategory).toBe('notfound');
            
            const clientError = new Error('HTTP error! status: 400');
            const clientCategory = errorHandler.categorizeError(clientError);
            expect(clientCategory).toBe('client');
        });
        
        test('should categorize timeout errors correctly', () => {
            const timeoutError = new Error('Request timeout');
            const category = errorHandler.categorizeError(timeoutError);
            expect(category).toBe('timeout');
        });
        
        test('should categorize offline errors correctly', () => {
            global.navigator.onLine = false;
            const anyError = new Error('Any error');
            const category = errorHandler.categorizeError(anyError);
            expect(category).toBe('offline');
        });
        
        test('should categorize unknown errors correctly', () => {
            const unknownError = new Error('Some random error');
            const category = errorHandler.categorizeError(unknownError);
            expect(category).toBe('unknown');
        });
    });
    
    describe('User-Friendly Messages', () => {
        test('should provide appropriate messages for each error type', () => {
            const messages = {
                offline: errorHandler.getUserFriendlyMessage('offline', 'test'),
                network: errorHandler.getUserFriendlyMessage('network', 'test'),
                server: errorHandler.getUserFriendlyMessage('server', 'test'),
                timeout: errorHandler.getUserFriendlyMessage('timeout', 'test'),
                notfound: errorHandler.getUserFriendlyMessage('notfound', 'test'),
                client: errorHandler.getUserFriendlyMessage('client', 'test'),
                unknown: errorHandler.getUserFriendlyMessage('unknown', 'test')
            };
            
            expect(messages.offline).toContain('offline');
            expect(messages.network).toContain('connect');
            expect(messages.server).toContain('server');
            expect(messages.timeout).toContain('timeout');
            expect(messages.notfound).toContain('not found');
            expect(messages.client).toContain('request');
            expect(messages.unknown).toContain('unexpected');
        });
    });
    
    describe('Retry Logic', () => {
        test('should succeed on first attempt when API call works', async () => {
            const successfulApiCall = jest.fn().mockResolvedValue({ success: true });
            
            const result = await errorHandler.executeWithRetry(successfulApiCall, {
                maxRetries: 3,
                operation: 'test operation'
            });
            
            expect(successfulApiCall).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: true });
        });
        
        test('should retry on failure and eventually succeed', async () => {
            let attempts = 0;
            const retryApiCall = jest.fn().mockImplementation(() => {
                attempts++;
                if (attempts < 3) {
                    return Promise.reject(new Error('Temporary failure'));
                }
                return Promise.resolve({ success: true, attempts });
            });
            
            const result = await errorHandler.executeWithRetry(retryApiCall, {
                maxRetries: 3,
                retryDelay: 10, // Short delay for testing
                operation: 'retry test'
            });
            
            expect(retryApiCall).toHaveBeenCalledTimes(3);
            expect(result).toEqual({ success: true, attempts: 3 });
        });
        
        test('should fail after all retries are exhausted', async () => {
            const failingApiCall = jest.fn().mockRejectedValue(new Error('Persistent failure'));
            const fallbackHandler = jest.fn();
            
            await expect(errorHandler.executeWithRetry(failingApiCall, {
                maxRetries: 2,
                retryDelay: 10,
                operation: 'failing test',
                fallbackHandler: fallbackHandler
            })).rejects.toThrow('Persistent failure');
            
            expect(failingApiCall).toHaveBeenCalledTimes(3); // Initial + 2 retries
            expect(fallbackHandler).toHaveBeenCalledTimes(1);
        });
        
        test('should use exponential backoff for retry delays', async () => {
            const startTime = Date.now();
            const delays = [];
            
            // Mock sleep to capture delay values
            const originalSleep = errorHandler.sleep;
            errorHandler.sleep = jest.fn().mockImplementation((ms) => {
                delays.push(ms);
                return Promise.resolve();
            });
            
            const failingApiCall = jest.fn().mockRejectedValue(new Error('Test failure'));
            
            try {
                await errorHandler.executeWithRetry(failingApiCall, {
                    maxRetries: 3,
                    retryDelay: 100,
                    operation: 'backoff test'
                });
            } catch (error) {
                // Expected to fail
            }
            
            // Verify exponential backoff: 100ms, 200ms, 400ms
            expect(delays).toEqual([100, 200, 400]);
            
            // Restore original sleep method
            errorHandler.sleep = originalSleep;
        });
    });
    
    describe('Fetch with Timeout', () => {
        test('should handle successful fetch requests', async () => {
            // Mock successful fetch
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: 'test' })
            });
            
            global.AbortController = jest.fn().mockImplementation(() => ({
                signal: {},
                abort: jest.fn()
            }));
            
            const response = await errorHandler.fetchWithTimeout('http://test.com');
            expect(response.ok).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith('http://test.com', {
                signal: expect.any(Object)
            });
        });
        
        test('should throw error for non-ok responses', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 404
            });
            
            await expect(errorHandler.fetchWithTimeout('http://test.com'))
                .rejects.toThrow('HTTP error! status: 404');
        });
        
        test('should handle timeout errors', async () => {
            global.fetch = jest.fn().mockImplementation(() => 
                new Promise((resolve, reject) => {
                    // Simulate AbortError
                    setTimeout(() => {
                        const error = new Error('AbortError');
                        error.name = 'AbortError';
                        reject(error);
                    }, 50);
                })
            );
            
            await expect(errorHandler.fetchWithTimeout('http://test.com', {}, 100))
                .rejects.toThrow('Request timeout');
        });
    });
    
    describe('Notification Methods', () => {
        test('should create error notifications', () => {
            const showErrorSpy = jest.spyOn(errorHandler, 'showErrorMessage');
            errorHandler.showErrorMessage('Test error', 'network');
            expect(showErrorSpy).toHaveBeenCalledWith('Test error', 'network');
        });
        
        test('should create success notifications', () => {
            const showSuccessSpy = jest.spyOn(errorHandler, 'showSuccessMessage');
            errorHandler.showSuccessMessage('Test success');
            expect(showSuccessSpy).toHaveBeenCalledWith('Test success');
        });
        
        test('should clear notifications', () => {
            const clearSpy = jest.spyOn(errorHandler, 'clearErrorMessages');
            errorHandler.clearErrorMessages();
            expect(clearSpy).toHaveBeenCalled();
        });
    });
});

// Export for use in test runners
module.exports = {
    ErrorHandler
};