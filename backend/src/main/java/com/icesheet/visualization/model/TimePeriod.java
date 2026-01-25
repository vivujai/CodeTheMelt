package com.icesheet.visualization.model;

/**
 * Enumeration of time periods with conversion to seconds
 * Requirements: 4.1
 */
public enum TimePeriod {
    CENTURY(3_153_600_000L, "Century"),    // 100 * 365 * 24 * 60 * 60 seconds
    DECADE(315_360_000L, "Decade"),        // 10 * 365 * 24 * 60 * 60 seconds  
    ANNUAL(31_536_000L, "Annual");         // 365 * 24 * 60 * 60 seconds
    
    private final long seconds;
    private final String displayName;
    
    TimePeriod(long seconds, String displayName) {
        this.seconds = seconds;
        this.displayName = displayName;
    }
    
    /**
     * Get the time period in seconds
     * @return time period in seconds
     */
    public long getSeconds() {
        return seconds;
    }
    
    /**
     * Get the display name for the time period
     * @return display name
     */
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Convert time period to seconds (for calculations)
     * @return seconds as double for mathematical operations
     */
    public double getSecondsAsDouble() {
        return (double) seconds;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}