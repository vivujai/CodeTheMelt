package com.icesheet.visualization.dto;

import com.icesheet.visualization.model.TimePeriod;

/**
 * Data Transfer Object for visualization statistics
 * Used for visualization page display
 */
public class VisualizationStatistics {
    private final double meltingRate;
    private final double massLoss;
    private final double initialSize;
    private final double finalSize;
    private final String iceSheetName;
    private final TimePeriod period;
    
    /**
     * Constructor for VisualizationStatistics
     * @param meltingRate Melting rate in kg/s
     * @param massLoss Total mass loss for the time period
     * @param initialSize Initial size of the ice sheet in km²
     * @param finalSize Final size after mass loss in km²
     * @param iceSheetName Name of the ice sheet
     * @param period Time period for the calculation
     */
    public VisualizationStatistics(double meltingRate, double massLoss, double initialSize, 
                                 double finalSize, String iceSheetName, TimePeriod period) {
        this.meltingRate = meltingRate;
        this.massLoss = massLoss;
        this.initialSize = initialSize;
        this.finalSize = finalSize;
        this.iceSheetName = iceSheetName;
        this.period = period;
    }
    
    // Getters
    public double getMeltingRate() {
        return meltingRate;
    }
    
    public double getMassLoss() {
        return massLoss;
    }
    
    public double getInitialSize() {
        return initialSize;
    }
    
    public double getFinalSize() {
        return finalSize;
    }
    
    public String getIceSheetName() {
        return iceSheetName;
    }
    
    public TimePeriod getPeriod() {
        return period;
    }
    
    @Override
    public String toString() {
        return String.format("VisualizationStatistics{name='%s', period=%s, meltingRate=%.6f kg/s, " +
                           "massLoss=%.2f, initialSize=%.0f km², finalSize=%.0f km²}", 
                           iceSheetName, period.getDisplayName(), meltingRate, massLoss, initialSize, finalSize);
    }
}