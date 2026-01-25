# Frontend Error Handling Implementation Guide

## Overview

This document describes the comprehensive error handling system implemented for the Ice Sheet Visualization System frontend. The implementation satisfies **Requirement 7.5: System SHALL handle network communication errors gracefully**.

## Features Implemented

### 1. Centralized Error Handling (`ErrorHandler.js`)

The `ErrorHandler` class provides:

- **Retry Logic**: Automatic retry with exponential backoff
- **Error Categorization**: Intelligent error type detection
- **User-Friendly Messages**: Clear, actionable error messages
- **Timeout Support**: Configurable request timeouts
- **Fallback Mechanisms**: Graceful degradation with local data
- **Visual Notifications**: User-friendly error/success notifications

### 2. Error Categories

The system categorizes errors into specific types:

- **`offline`**: User is offline
- **`network`**: Network connectivity issues
- **`server`**: Server errors (5xx status codes)
- **`timeout`**: Request timeout errors
- **`notfound`**: Resource not found (404)
- **`client`**: Client errors (4xx status codes)
- **`http`**: General HTTP errors
- **`unknown`**: Unclassified errors

### 3. Retry Logic

- **Exponential Backoff**: Delays increase exponentially (1s, 2s, 4s, etc.)
- **Configurable Retries**: Maximum retry attempts can be customized
- **Smart Retry**: Only retries on recoverable errors
- **Fallback Support**: Executes fallback handlers when all retries fail

### 4. User Notifications

Visual notification system with:

- **Error Messages**: Red-themed notifications for errors
- **Success Messages**: Green-themed notifications for success
- **Loading Indicators**: Blue-themed loading spinners
- **Retry Notifications**: Orange-themed retry progress
- **Auto-Dismiss**: Notifications auto-remove after timeout
- **Manual Dismiss**: Users can close notifications manually

## Implementation Details

### Core Components

#### 1. ErrorHandler Class

```javascript
// Initialize error handler
const errorHandler = new ErrorHandler();

// Execute API call with retry logic
const result = await errorHandler.executeWithRetry(apiCall, {
    maxRetries: 3,
    retryDelay: 1000,
    operation: 'loading ice sheet data',
    fallbackHandler: () => useLocalData()
});
```

#### 2. Enhanced API Calls

All API calls now use the error handling system:

```javascript
// NavigationController.js - Detail statistics
const apiCall = async () => {
    const response = await window.errorHandler.fetchWithTimeout(
        `http://localhost:8080/api/icesheet/${iceSheet}/details`,
        {},
        8000 // 8 second timeout
    );
    return await response.json();
};

const detailStats = await window.errorHandler.executeWithRetry(apiCall, {
    maxRetries: 2,
    retryDelay: 1500,
    operation: `${iceSheet} detail statistics`,
    fallbackHandler: () => this.displayFallbackDetailStatistics(iceSheet)
});
```

#### 3. Fallback Data Mechanisms

When API calls fail, the system gracefully falls back to:

- **Base Data**: Uses `IceSheetBaseData` constants
- **Calculated Values**: Computes basic statistics locally
- **Error Messages**: Shows "Unable to load data" in UI elements
- **User Notifications**: Informs users about fallback usage

### Integration Points

#### 1. NavigationController Updates

- **`loadDetailStatistics()`**: Enhanced with retry logic and fallback
- **`loadVisualizationStatistics()`**: Improved error handling
- **Fallback Methods**: Use base data when API fails

#### 2. StatisticsDisplay Updates

- **`fetchAndDisplayVisualizationStats()`**: Full retry implementation
- **Enhanced Error Display**: Better error state management
- **Fallback Statistics**: Creates local statistics objects

#### 3. HTML Integration

- **Error Notification Styles**: `error-notifications.css`
- **Script Loading**: `ErrorHandler.js` loaded before other components
- **Global Access**: Error handler available as `window.errorHandler`

## Usage Examples

### Basic Error Handling

```javascript
try {
    const data = await apiCall();
    // Handle success
} catch (error) {
    window.errorHandler.showErrorMessage(
        'Failed to load data. Please try again.',
        'network'
    );
}
```

### Advanced Retry Logic

```javascript
const result = await window.errorHandler.executeWithRetry(
    () => fetch('/api/data').then(r => r.json()),
    {
        maxRetries: 3,
        retryDelay: 2000,
        operation: 'loading critical data',
        fallbackHandler: (error) => {
            console.log('Using cached data');
            return getCachedData();
        }
    }
);
```

### Custom Notifications

```javascript
// Show loading
window.errorHandler.showLoadingMessage('ice sheet data');

// Show success
window.errorHandler.showSuccessMessage('Data loaded successfully');

// Show error
window.errorHandler.showErrorMessage(
    'Connection failed. Check your internet connection.',
    'network'
);

// Clear all notifications
window.errorHandler.clearErrorMessages();
```

## Testing

### Test Files

1. **`test-error-handling.html`**: Comprehensive interactive test suite
2. **`test-error-simple.html`**: Basic functionality verification
3. **`error-handler.test.js`**: Unit tests (requires Node.js/Jest)

### Test Coverage

- ✅ Error categorization
- ✅ Retry logic with exponential backoff
- ✅ Timeout handling
- ✅ Fallback mechanisms
- ✅ User notifications
- ✅ API integration
- ✅ Component integration

### Running Tests

```bash
# Start local server
python -m http.server 3000

# Open test pages
http://localhost:3000/test-error-handling.html
http://localhost:3000/test-error-simple.html

# Run unit tests (if Node.js available)
npm test
```

## Configuration Options

### ErrorHandler Constructor Options

```javascript
const errorHandler = new ErrorHandler({
    maxRetries: 3,        // Default maximum retries
    retryDelay: 1000,     // Default base delay (ms)
    timeout: 10000        // Default request timeout (ms)
});
```

### executeWithRetry Options

```javascript
{
    maxRetries: 3,                    // Maximum retry attempts
    retryDelay: 1000,                // Base delay between retries
    operation: 'API operation',       // Description for user messages
    fallbackHandler: (error) => {}   // Function to call on final failure
}
```

### fetchWithTimeout Options

```javascript
await errorHandler.fetchWithTimeout(
    url,                    // Request URL
    fetchOptions,          // Standard fetch options
    timeout               // Timeout in milliseconds
);
```

## Error Handling Flow

```
API Request
    ↓
Try Request
    ↓
Success? → Yes → Return Result
    ↓ No
Categorize Error
    ↓
Retryable? → No → Execute Fallback → Show Error Message
    ↓ Yes
Retry < Max? → No → Execute Fallback → Show Error Message
    ↓ Yes
Wait (Exponential Backoff)
    ↓
Retry Request
    ↓
(Loop back to "Try Request")
```

## Best Practices

### 1. Always Use Error Handling

```javascript
// ❌ Bad: No error handling
const data = await fetch('/api/data').then(r => r.json());

// ✅ Good: With error handling
const data = await window.errorHandler.executeWithRetry(
    () => window.errorHandler.fetchWithTimeout('/api/data'),
    { operation: 'loading data' }
);
```

### 2. Provide Meaningful Operation Names

```javascript
// ❌ Bad: Generic operation name
{ operation: 'API call' }

// ✅ Good: Specific operation name
{ operation: 'Antarctica ice sheet statistics' }
```

### 3. Implement Fallback Handlers

```javascript
// ✅ Good: Always provide fallback
{
    fallbackHandler: (error) => {
        console.log('Using local data due to:', error.message);
        return getLocalData();
    }
}
```

### 4. Use Appropriate Timeouts

```javascript
// Different timeouts for different operations
const detailTimeout = 8000;      // 8s for detail stats
const visualTimeout = 10000;     // 10s for visualization data
const quickTimeout = 3000;       // 3s for health checks
```

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome 60+, Firefox 55+, Safari 12+)
- **Fetch API**: Required (polyfill available for older browsers)
- **AbortController**: Required for timeout support
- **Promises/Async-Await**: Required for retry logic

## Performance Considerations

- **Exponential Backoff**: Prevents server overload during retries
- **Timeout Limits**: Prevents hanging requests
- **Notification Cleanup**: Auto-removes notifications to prevent memory leaks
- **Fallback Data**: Cached locally to reduce repeated API calls

## Security Considerations

- **Input Validation**: All error messages are sanitized
- **No Sensitive Data**: Error messages don't expose internal details
- **HTTPS Only**: Fetch timeout only works with secure connections
- **CORS Handling**: Proper error categorization for CORS failures

## Future Enhancements

Potential improvements for future versions:

1. **Offline Support**: Service worker integration for offline functionality
2. **Request Queuing**: Queue requests when offline, execute when online
3. **Circuit Breaker**: Temporarily disable failing endpoints
4. **Metrics Collection**: Track error rates and performance
5. **A/B Testing**: Test different retry strategies
6. **Progressive Enhancement**: Graceful degradation for older browsers

## Troubleshooting

### Common Issues

1. **"ErrorHandler not found"**
   - Ensure `ErrorHandler.js` is loaded before other scripts
   - Check browser console for script loading errors

2. **Notifications not showing**
   - Verify `error-notifications.css` is loaded
   - Check if notifications container exists in DOM

3. **Retries not working**
   - Confirm error is categorized as retryable
   - Check network tab for actual request attempts

4. **Fallback not executing**
   - Verify fallback handler is provided
   - Check console for fallback execution logs

### Debug Mode

Enable debug logging:

```javascript
// Add to console for debugging
window.errorHandler.debug = true;
```

This implementation provides robust, user-friendly error handling that gracefully manages network communication errors while maintaining a smooth user experience.