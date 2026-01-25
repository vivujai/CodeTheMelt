package com.icesheet.visualization.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Data Transfer Object for detail statistics
 * Used for ice sheet detail page display
 */
public class DetailStatistics {
    private final double currentSize;
    private final double ambientTemperature;
    @JsonFormat(shape = JsonFormat.Shape.NUMBER)
    private final double meltingRate;
    
    /**
     * Constructor for DetailStatistics
     * @param currentSize Current size of the ice sheet in km²
     * @param ambientTemperature Ambient temperature
     * @param meltingRate Melting rate in kg/s
     */
    public DetailStatistics(double currentSize, double ambientTemperature, double meltingRate) {
        this.currentSize = currentSize;
        this.ambientTemperature = ambientTemperature;
        this.meltingRate = meltingRate;
    }
    
    // Getters
    public double getCurrentSize() {
        return currentSize;
    }
    
    public double getAmbientTemperature() {
        return ambientTemperature;
    }
    
    public double getMeltingRate() {
        return meltingRate;
    }
    
    @Override
    public String toString() {
        return String.format("DetailStatistics{currentSize=%.0f km², ambientTemp=%.6f, meltingRate=%.6f kg/s}", 
                           currentSize, ambientTemperature, meltingRate);
    }
}