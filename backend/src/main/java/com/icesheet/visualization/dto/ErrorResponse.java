package com.icesheet.visualization.dto;

/**
 * Data Transfer Object for error responses
 * Requirements: 7.5
 */
public class ErrorResponse {
    private final String error;
    private final String message;
    private final long timestamp;
    private final String path;
    
    /**
     * Constructor for ErrorResponse
     * @param error Error type
     * @param message Detailed error message
     * @param path Request path that caused the error
     */
    public ErrorResponse(String error, String message, String path) {
        this.error = error;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
        this.path = path;
    }
    
    // Getters
    public String getError() {
        return error;
    }
    
    public String getMessage() {
        return message;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public String getPath() {
        return path;
    }
    
    @Override
    public String toString() {
        return String.format("ErrorResponse{error='%s', message='%s', timestamp=%d, path='%s'}", 
                           error, message, timestamp, path);
    }
}