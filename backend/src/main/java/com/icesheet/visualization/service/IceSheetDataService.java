package com.icesheet.visualization.service;

import com.icesheet.visualization.dto.DetailStatistics;
import com.icesheet.visualization.model.IceSheetBaseData;
import com.icesheet.visualization.model.IceSheetType;
import org.springframework.stereotype.Service;

/**
 * Service for retrieving ice sheet data and statistics
 * Requirements: 3.1, 3.4
 */
@Service
public class IceSheetDataService {
    
    /**
     * Get base data for a specific ice sheet type
     * Requirements: 3.4
     * 
     * @param iceSheet The ice sheet type
     * @return IceSheetBaseData for the specified type
     */
    public IceSheetBaseData getBaseData(IceSheetType iceSheet) {
        return IceSheetBaseData.getBaseData(iceSheet);
    }
    
    /**
     * Get detail statistics for an ice sheet
     * Requirements: 3.1
     * 
     * @param iceSheet The ice sheet type
     * @return DetailStatistics containing current size, ambient temperature, and melting rate
     */
    public DetailStatistics getDetailStatistics(IceSheetType iceSheet) {
        IceSheetBaseData baseData = getBaseData(iceSheet);
        
        return new DetailStatistics(
            baseData.getSizeKm2(),
            baseData.getAmbientTemperature(),
            baseData.getMeltingRateKgPerSecond()
        );
    }
}