package com.icesheet.visualization.service;

import com.icesheet.visualization.dto.VisualizationStatistics;
import com.icesheet.visualization.model.IceSheetBaseData;
import com.icesheet.visualization.model.IceSheetType;
import com.icesheet.visualization.model.TimePeriod;
import org.springframework.stereotype.Service;

/**
 * Service for calculating ice sheet statistics
 * Requirements: 4.1, 4.2, 4.3
 */
@Service
public class StatisticsCalculator {
    
    /**
     * Calculate mass loss and visualization statistics for an ice sheet over a time period
     * Requirements: 4.1, 4.2, 4.3
     * 
     * @param iceSheet The ice sheet type
     * @param period The time period for calculation
     * @return VisualizationStatistics with calculated values
     */
    public VisualizationStatistics calculateMassLoss(IceSheetType iceSheet, TimePeriod period) {
        IceSheetBaseData baseData = IceSheetBaseData.getBaseData(iceSheet);
        
        // Convert time period to seconds (Requirement 4.1)
        double timeInSeconds = convertPeriodToSeconds(period);
        
        // Calculate mass loss = time period × melting rate (Requirement 4.2)
        double massLoss = timeInSeconds * Math.abs(baseData.getMeltingRateKgPerSecond());
        
        // Calculate final mass = initial size - mass loss (Requirement 4.3)
        double initialSize = baseData.getSizeKm2();
        double finalSize = calculateFinalMass(initialSize, massLoss);
        
        return new VisualizationStatistics(
            baseData.getMeltingRateKgPerSecond(),
            massLoss,
            initialSize,
            finalSize,
            baseData.getName(),
            period
        );
    }
    
    /**
     * Convert time period to seconds
     * Requirements: 4.1
     * Century: 3,153,600,000s, Decade: 315,360,000s, Annual: 31,536,000s
     * 
     * @param period The time period to convert
     * @return Time period in seconds
     */
    public double convertPeriodToSeconds(TimePeriod period) {
        return period.getSecondsAsDouble();
    }
    
    /**
     * Calculate final mass after mass loss
     * Requirements: 4.3
     * 
     * @param initialSize Initial size in km²
     * @param massLoss Mass loss amount
     * @return Final mass after loss
     */
    public double calculateFinalMass(double initialSize, double massLoss) {
        return initialSize - massLoss;
    }
}