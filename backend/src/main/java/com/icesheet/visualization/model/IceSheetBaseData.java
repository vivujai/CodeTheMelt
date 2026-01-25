package com.icesheet.visualization.model;

import javax.annotation.concurrent.ThreadSafe;

/**
 * Base data for ice sheets with constants
 * This class is thread-safe as all fields are final and immutable.
 * Requirements: 3.4, 6.3
 */
@ThreadSafe
public class IceSheetBaseData {
    private final double sizeKm2;
    private final double meltingRateKgPerSecond;
    private final double ambientTemperature;
    private final String name;
    
    // Constants for ice sheet base data (Requirements 3.4)
    public static final IceSheetBaseData ANTARCTICA = new IceSheetBaseData(
        14_000_000.0,      // 14,000,000 km²
        -26.9982036,       // kg/s melting rate
        -57.0,             // ambient temperature in °C
        "Antarctica"
    );
    
    public static final IceSheetBaseData GREENLAND = new IceSheetBaseData(
        4_380_000.0,       // 4,380,000 km²
        -4.364067,         // kg/s melting rate
        -29.45,            // ambient temperature in °C
        "Greenland"
    );
    
    /**
     * Constructor for IceSheetBaseData
     * @param sizeKm2 Size in square kilometers
     * @param meltingRateKgPerSecond Melting rate in kg/s
     * @param ambientTemperature Ambient temperature
     * @param name Display name of the ice sheet
     */
    public IceSheetBaseData(double sizeKm2, double meltingRateKgPerSecond, 
                           double ambientTemperature, String name) {
        this.sizeKm2 = sizeKm2;
        this.meltingRateKgPerSecond = meltingRateKgPerSecond;
        this.ambientTemperature = ambientTemperature;
        this.name = name;
    }
    
    /**
     * Get base data for a specific ice sheet type
     * This method is thread-safe as it only accesses immutable constants.
     * @param iceSheetType The ice sheet type
     * @return IceSheetBaseData for the specified type
     * @throws IllegalArgumentException if iceSheetType is null or unknown
     */
    public static IceSheetBaseData getBaseData(IceSheetType iceSheetType) {
        if (iceSheetType == null) {
            throw new IllegalArgumentException("Ice sheet type cannot be null");
        }
        
        switch (iceSheetType) {
            case ANTARCTICA:
                return ANTARCTICA;
            case GREENLAND:
                return GREENLAND;
            default:
                throw new IllegalArgumentException("Unknown ice sheet type: " + iceSheetType);
        }
    }
    
    // Getters
    public double getSizeKm2() {
        return sizeKm2;
    }
    
    public double getMeltingRateKgPerSecond() {
        return meltingRateKgPerSecond;
    }
    
    public double getAmbientTemperature() {
        return ambientTemperature;
    }
    
    public String getName() {
        return name;
    }
    
    @Override
    public String toString() {
        return String.format("IceSheetBaseData{name='%s', size=%.0f km², meltingRate=%.6f kg/s, temp=%.6f}", 
                           name, sizeKm2, meltingRateKgPerSecond, ambientTemperature);
    }
}