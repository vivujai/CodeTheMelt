package com.icesheet.visualization.service;

import com.icesheet.visualization.dto.DetailStatistics;
import com.icesheet.visualization.model.IceSheetBaseData;
import com.icesheet.visualization.model.IceSheetType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for IceSheetDataService
 * Validates data retrieval and detail statistics generation
 */
public class IceSheetDataServiceTest {
    
    private IceSheetDataService dataService;
    
    @BeforeEach
    public void setUp() {
        dataService = new IceSheetDataService();
    }
    
    @Test
    public void testGetBaseDataAntarctica() {
        // Test base data retrieval for Antarctica (Requirements 3.4)
        IceSheetBaseData baseData = dataService.getBaseData(IceSheetType.ANTARCTICA);
        
        assertNotNull(baseData);
        assertEquals(14_000_000.0, baseData.getSizeKm2(), 0.001);
        assertEquals(-26.9982036, baseData.getMeltingRateKgPerSecond(), 0.0000001);
        assertEquals("Antarctica", baseData.getName());
    }
    
    @Test
    public void testGetBaseDataGreenland() {
        // Test base data retrieval for Greenland (Requirements 3.4)
        IceSheetBaseData baseData = dataService.getBaseData(IceSheetType.GREENLAND);
        
        assertNotNull(baseData);
        assertEquals(4_380_000.0, baseData.getSizeKm2(), 0.001);
        assertEquals(-4.364067, baseData.getMeltingRateKgPerSecond(), 0.000001);
        assertEquals("Greenland", baseData.getName());
    }
    
    @Test
    public void testGetDetailStatisticsAntarctica() {
        // Test detail statistics for Antarctica (Requirements 3.1)
        DetailStatistics stats = dataService.getDetailStatistics(IceSheetType.ANTARCTICA);
        
        assertNotNull(stats);
        assertEquals(14_000_000.0, stats.getCurrentSize(), 0.001);
        assertEquals(-26.9982036, stats.getAmbientTemperature(), 0.0000001);
        assertEquals(-26.9982036, stats.getMeltingRate(), 0.0000001);
    }
    
    @Test
    public void testGetDetailStatisticsGreenland() {
        // Test detail statistics for Greenland (Requirements 3.1)
        DetailStatistics stats = dataService.getDetailStatistics(IceSheetType.GREENLAND);
        
        assertNotNull(stats);
        assertEquals(4_380_000.0, stats.getCurrentSize(), 0.001);
        assertEquals(-4.364067, stats.getAmbientTemperature(), 0.000001);
        assertEquals(-4.364067, stats.getMeltingRate(), 0.000001);
    }
    
    @Test
    public void testDetailStatisticsConsistencyWithBaseData() {
        // Verify that detail statistics are consistent with base data
        for (IceSheetType iceSheetType : IceSheetType.values()) {
            IceSheetBaseData baseData = dataService.getBaseData(iceSheetType);
            DetailStatistics detailStats = dataService.getDetailStatistics(iceSheetType);
            
            assertEquals(baseData.getSizeKm2(), detailStats.getCurrentSize(), 0.001);
            assertEquals(baseData.getAmbientTemperature(), detailStats.getAmbientTemperature(), 0.000001);
            assertEquals(baseData.getMeltingRateKgPerSecond(), detailStats.getMeltingRate(), 0.000001);
        }
    }
}