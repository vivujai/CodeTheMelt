package com.icesheet.visualization.model;

/**
 * Enumeration of visualization display types
 * Requirements: 4.1
 */
public enum VisualizationType {
    SIDE_VIEW("Side View"),
    SIZE_GRAPH("Size Graph"),
    LAYER_OVERLAY("Layer Overlay");
    
    private final String displayName;
    
    VisualizationType(String displayName) {
        this.displayName = displayName;
    }
    
    /**
     * Get the display name for the visualization type
     * @return display name
     */
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}