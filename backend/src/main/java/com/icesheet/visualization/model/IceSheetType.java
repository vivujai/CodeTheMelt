package com.icesheet.visualization.model;

/**
 * Enumeration of supported ice sheet types
 * Requirements: 3.4, 4.1
 */
public enum IceSheetType {
    GREENLAND("Greenland"),
    ANTARCTICA("Antarctica");
    
    private final String displayName;
    
    IceSheetType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}