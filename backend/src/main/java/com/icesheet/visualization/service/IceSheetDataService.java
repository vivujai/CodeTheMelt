package com.icesheet.visualization.service;

import com.icesheet.visualization.dto.DetailStatistics;
import com.icesheet.visualization.model.IceSheetBaseData;
import com.icesheet.visualization.model.IceSheetType;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.concurrent.ThreadSafe;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for retrieving ice sheet data and statistics
 * This service is thread-safe and can handle concurrent requests without data corruption.
 * All methods are stateless and use only immutable data.
 * Requirements: 3.1, 3.4, 6.3, 7.5
 */
@Service
@ThreadSafe
public class IceSheetDataService {
    
    private static final Logger logger = LoggerFactory.getLogger(IceSheetDataService.class);
    
    // Thread-safe counter for monitoring concurrent access
    private final AtomicLong requestCounter = new AtomicLong(0);
    
    /**
     * Get base data for a specific ice sheet type
     * This method is thread-safe as it only accesses immutable constants.
     * Requirements: 3.4, 6.3, 7.5
     * 
     * @param iceSheet The ice sheet type
     * @return IceSheetBaseData for the specified type
     * @throws IllegalArgumentException if iceSheet is null or invalid
     * @throws RuntimeException if data retrieval fails due to concurrent access issues
     */
    public IceSheetBaseData getBaseData(IceSheetType iceSheet) {
        long requestId = requestCounter.incrementAndGet();
        
        try {
            logger.debug("Retrieving base data for ice sheet {} (request {})", iceSheet, requestId);
            
            if (iceSheet == null) {
                throw new IllegalArgumentException("Ice sheet type cannot be null");
            }
            
            IceSheetBaseData result = IceSheetBaseData.getBaseData(iceSheet);
            logger.debug("Successfully retrieved base data for {} (request {})", iceSheet, requestId);
            return result;
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid ice sheet type {} in request {}", iceSheet, requestId, e);
            throw e;
        } catch (Exception e) {
            logger.error("Failed to retrieve base data for {} in request {}", iceSheet, requestId, e);
            throw new RuntimeException("Failed to retrieve ice sheet data due to concurrent access issue", e);
        }
    }
    
    /**
     * Get detail statistics for an ice sheet
     * This method is thread-safe as it only uses local variables and immutable data.
     * Requirements: 3.1, 6.3, 7.5
     * 
     * @param iceSheet The ice sheet type
     * @return DetailStatistics containing current size, ambient temperature, and melting rate
     * @throws IllegalArgumentException if iceSheet is null or invalid
     * @throws RuntimeException if statistics calculation fails due to concurrent access issues
     */
    public DetailStatistics getDetailStatistics(IceSheetType iceSheet) {
        long requestId = requestCounter.incrementAndGet();
        
        try {
            logger.debug("Calculating detail statistics for ice sheet {} (request {})", iceSheet, requestId);
            
            if (iceSheet == null) {
                throw new IllegalArgumentException("Ice sheet type cannot be null");
            }
            
            IceSheetBaseData baseData = getBaseData(iceSheet);
            
            DetailStatistics result = new DetailStatistics(
                baseData.getSizeKm2(),
                baseData.getAmbientTemperature(),
                baseData.getMeltingRateKgPerSecond()
            );
            
            logger.debug("Successfully calculated detail statistics for {} (request {})", iceSheet, requestId);
            return result;
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid parameters for detail statistics in request {}", requestId, e);
            throw e;
        } catch (Exception e) {
            logger.error("Failed to calculate detail statistics for {} in request {}", iceSheet, requestId, e);
            throw new RuntimeException("Failed to calculate detail statistics due to concurrent access issue", e);
        }
    }
    
    /**
     * Get current request count for monitoring concurrent access
     * This method is thread-safe using atomic counter.
     * 
     * @return Total number of requests processed
     */
    public long getRequestCount() {
        return requestCounter.get();
    }
}