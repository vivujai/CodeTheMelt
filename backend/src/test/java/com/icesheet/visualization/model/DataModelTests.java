package com.icesheet.visualization.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for core data models
 * Validates basic functionality of enums and data classes
 */
public class DataModelTests {
    
    @Test
    public void testIceSheetTypeEnum() {
        assertEquals("Greenland", IceSheetType.GREENLAND.getDisplayName());
        assertEquals("Antarctica", IceSheetType.ANTARCTICA.getDisplayName());
        assertEquals("Greenland", IceSheetType.GREENLAND.toString());
        assertEquals("Antarctica", IceSheetType.ANTARCTICA.toString());
    }
    
    @Test
    public void testTimePeriodEnum() {
        assertEquals(3_153_600_000L, TimePeriod.CENTURY.getSeconds());
        assertEquals(315_360_000L, TimePeriod.DECADE.getSeconds());
        assertEquals(31_536_000L, TimePeriod.ANNUAL.getSeconds());
        
        assertEquals("Century", TimePeriod.CENTURY.getDisplayName());
        assertEquals("Decade", TimePeriod.DECADE.getDisplayName());
        assertEquals("Annual", TimePeriod.ANNUAL.getDisplayName());
        
        assertEquals(3_153_600_000.0, TimePeriod.CENTURY.getSecondsAsDouble(), 0.001);
        assertEquals(315_360_000.0, TimePeriod.DECADE.getSecondsAsDouble(), 0.001);
        assertEquals(31_536_000.0, TimePeriod.ANNUAL.getSecondsAsDouble(), 0.001);
    }
    
    @Test
    public void testVisualizationTypeEnum() {
        assertEquals("Side View", VisualizationType.SIDE_VIEW.getDisplayName());
        assertEquals("Size Graph", VisualizationType.SIZE_GRAPH.getDisplayName());
        assertEquals("Layer Overlay", VisualizationType.LAYER_OVERLAY.getDisplayName());
    }
    
    @Test
    public void testIceSheetBaseDataConstants() {
        // Test Antarctica constants (Requirements 3.4)
        IceSheetBaseData antarctica = IceSheetBaseData.ANTARCTICA;
        assertEquals(14_000_000.0, antarctica.getSizeKm2(), 0.001);
        assertEquals(-26.9982036, antarctica.getMeltingRateKgPerSecond(), 0.0000001);
        assertEquals("Antarctica", antarctica.getName());
        
        // Test Greenland constants (Requirements 3.4)
        IceSheetBaseData greenland = IceSheetBaseData.GREENLAND;
        assertEquals(4_380_000.0, greenland.getSizeKm2(), 0.001);
        assertEquals(-4.364067, greenland.getMeltingRateKgPerSecond(), 0.000001);
        assertEquals("Greenland", greenland.getName());
    }
    
    @Test
    public void testGetBaseDataMethod() {
        IceSheetBaseData antarctica = IceSheetBaseData.getBaseData(IceSheetType.ANTARCTICA);
        assertEquals(IceSheetBaseData.ANTARCTICA, antarctica);
        
        IceSheetBaseData greenland = IceSheetBaseData.getBaseData(IceSheetType.GREENLAND);
        assertEquals(IceSheetBaseData.GREENLAND, greenland);
    }
    
    @Test
    public void testGetBaseDataWithInvalidType() {
        // This test would require a mock or invalid enum value
        // For now, we'll test that the method works with valid inputs
        assertNotNull(IceSheetBaseData.getBaseData(IceSheetType.ANTARCTICA));
        assertNotNull(IceSheetBaseData.getBaseData(IceSheetType.GREENLAND));
    }
}