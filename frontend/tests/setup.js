/**
 * Jest setup file for frontend tests
 * Configures test environment and global mocks
 */

// Mock DOM APIs that might not be available in test environment
global.console = {
    ...console,
    // Suppress console.log in tests unless needed
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock localStorage if needed
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch for API calls
global.fetch = jest.fn();

// Setup DOM environment
document.body.innerHTML = '<div id="app"></div>';

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="app"></div>';
});