package com.icesheet.visualization.service;

import com.icesheet.visualization.dto.VisualizationStatistics;
import com.icesheet.visualization.model.IceSheetBaseData;
import com.icesheet.visualization.model.IceSheetType;
import com.icesheet.visualization.model.TimePeriod;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.concurrent.ThreadSafe;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for calculating ice sheet statistics
 * This service is thread-safe and can handle concurrent requests without data corruption.
 * All methods are stateless and use only immutable data or local variables.
 * Requirements: 4.1, 4.2, 4.3, 6.3, 7.5
 */
@Service
@ThreadSafe
public class StatisticsCalculator {
    
    private static final Logger logger = LoggerFactory.getLogger(StatisticsCalculator.class);
    
    // Thread-safe counter for monitoring concurrent access
    private final AtomicLong requestCounter = new AtomicLong(0);
    private final AtomicLong concurrentRequestCounter = new AtomicLong(0);
    
    /**
     * Calculate mass loss and visualization statistics for an ice sheet over a time period
     * This method is thread-safe and can handle concurrent requests.
     * Requirements: 4.1, 4.2, 4.3, 6.3, 7.5
     * 
     * @param iceSheet The ice sheet type
     * @param period The time period for calculation
     * @return VisualizationStatistics with calculated values
     * @throws IllegalArgumentException if parameters are invalid
     * @throws RuntimeException if calculation fails due to concurrent access issues
     */
    public VisualizationStatistics calculateMassLoss(IceSheetType iceSheet, TimePeriod period) {
        // Increment request counters for monitoring
        long requestId = requestCounter.incrementAndGet();
        long currentConcurrent = concurrentRequestCounter.incrementAndGet();
        
        try {
            logger.debug("Starting calculation request {} (concurrent: {})", requestId, currentConcurrent);
            
            // Validate inputs to prevent concurrent access issues
            if (iceSheet == null) {
                throw new IllegalArgumentException("Ice sheet type cannot be null");
            }
            if (period == null) {
                throw new IllegalArgumentException("Time period cannot be null");
            }
            
            // Get base data (thread-safe - uses immutable constants)
            IceSheetBaseData baseData;
            try {
                baseData = IceSheetBaseData.getBaseData(iceSheet);
            } catch (Exception e) {
                logger.error("Failed to retrieve base data for ice sheet {} in request {}", iceSheet, requestId, e);
                throw new RuntimeException("Failed to retrieve ice sheet data due to concurrent access issue", e);
            }
            
            // Convert time period to seconds (Requirement 4.1)
            double timeInSeconds;
            try {
                timeInSeconds = convertPeriodToSeconds(period);
            } catch (Exception e) {
                logger.error("Failed to convert time period {} in request {}", period, requestId, e);
                throw new RuntimeException("Failed to convert time period due to calculation error", e);
            }
            
            // Calculate mass loss = time period × melting rate (Requirement 4.2)
            double massLoss;
            try {
                massLoss = timeInSeconds * Math.abs(baseData.getMeltingRateKgPerSecond());
            } catch (Exception e) {
                logger.error("Failed to calculate mass loss in request {}", requestId, e);
                throw new RuntimeException("Failed to calculate mass loss due to arithmetic error", e);
            }
            
            // Calculate final mass = initial size - mass loss (Requirement 4.3)
            double initialSize = baseData.getSizeKm2();
            double finalSize;
            try {
                finalSize = calculateFinalMass(initialSize, massLoss);
            } catch (Exception e) {
                logger.error("Failed to calculate final mass in request {}", requestId, e);
                throw new RuntimeException("Failed to calculate final mass due to arithmetic error", e);
            }
            
            VisualizationStatistics result = new VisualizationStatistics(
                baseData.getMeltingRateKgPerSecond(),
                massLoss,
                initialSize,
                finalSize,
                baseData.getName(),
                period
            );
            
            logger.debug("Completed calculation request {} successfully", requestId);
            return result;
            
        } catch (RuntimeException e) {
            logger.error("Calculation failed for request {} due to concurrent access or calculation error", requestId, e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error in calculation request {}", requestId, e);
            throw new RuntimeException("Unexpected error during calculation", e);
        } finally {
            // Always decrement concurrent counter
            concurrentRequestCounter.decrementAndGet();
        }
    }
    
    /**
     * Convert time period to seconds
     * This method is thread-safe as it only uses immutable enum values.
     * Requirements: 4.1
     * Century: 3,153,600,000s, Decade: 315,360,000s, Annual: 31,536,000s
     * 
     * @param period The time period to convert
     * @return Time period in seconds
     * @throws IllegalArgumentException if period is null
     */
    public double convertPeriodToSeconds(TimePeriod period) {
        if (period == null) {
            throw new IllegalArgumentException("Time period cannot be null");
        }
        return period.getSecondsAsDouble();
    }
    
    /**
     * Calculate final mass after mass loss
     * This method is thread-safe as it only uses local variables.
     * Requirements: 4.3
     * 
     * @param initialSize Initial size in km²
     * @param massLoss Mass loss amount
     * @return Final mass after loss
     * @throws IllegalArgumentException if parameters are invalid
     */
    public double calculateFinalMass(double initialSize, double massLoss) {
        if (initialSize < 0) {
            throw new IllegalArgumentException("Initial size cannot be negative");
        }
        if (massLoss < 0) {
            throw new IllegalArgumentException("Mass loss cannot be negative");
        }
        if (massLoss > initialSize) {
            logger.warn("Mass loss ({}) exceeds initial size ({}), result will be negative", massLoss, initialSize);
        }
        return initialSize - massLoss;
    }
    
    /**
     * Get current request statistics for monitoring concurrent access
     * This method is thread-safe using atomic counters.
     * 
     * @return Array containing [total requests, current concurrent requests]
     */
    public long[] getRequestStatistics() {
        return new long[]{requestCounter.get(), concurrentRequestCounter.get()};
    }
}