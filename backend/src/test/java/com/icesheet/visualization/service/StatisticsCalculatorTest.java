package com.icesheet.visualization.service;

import com.icesheet.visualization.dto.VisualizationStatistics;
import com.icesheet.visualization.model.IceSheetType;
import com.icesheet.visualization.model.TimePeriod;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for StatisticsCalculator
 * Validates mathematical calculations and time period conversions
 */
public class StatisticsCalculatorTest {
    
    private StatisticsCalculator calculator;
    
    @BeforeEach
    public void setUp() {
        calculator = new StatisticsCalculator();
    }
    
    @Test
    public void testConvertPeriodToSeconds() {
        // Test time period conversions (Requirements 4.1)
        assertEquals(31_536_000.0, calculator.convertPeriodToSeconds(TimePeriod.ANNUAL), 0.001);
        assertEquals(2_628_000.0, calculator.convertPeriodToSeconds(TimePeriod.MONTHLY), 0.001);
        assertEquals(604_800.0, calculator.convertPeriodToSeconds(TimePeriod.WEEKLY), 0.001);
    }
    
    @Test
    public void testCalculateFinalMass() {
        // Test final mass calculation (Requirements 4.3)
        assertEquals(1000.0, calculator.calculateFinalMass(1500.0, 500.0), 0.001);
        assertEquals(0.0, calculator.calculateFinalMass(100.0, 100.0), 0.001);
        assertEquals(50.0, calculator.calculateFinalMass(75.0, 25.0), 0.001);
    }
    
    @Test
    public void testCalculateMassLossAntarctica() {
        // Test mass loss calculation for Antarctica (Requirements 4.2)
        VisualizationStatistics stats = calculator.calculateMassLoss(IceSheetType.ANTARCTICA, TimePeriod.ANNUAL);
        
        assertEquals(-26.9982036, stats.getMeltingRate(), 0.0000001);
        assertEquals(14_000_000.0, stats.getInitialSize(), 0.001);
        assertEquals("Antarctica", stats.getIceSheetName());
        assertEquals(TimePeriod.ANNUAL, stats.getPeriod());
        
        // Mass loss = time period × |melting rate|
        double expectedMassLoss = 31_536_000.0 * 26.9982036;
        assertEquals(expectedMassLoss, stats.getMassLoss(), 0.01);
        
        // Final size = initial size - mass loss
        double expectedFinalSize = 14_000_000.0 - expectedMassLoss;
        assertEquals(expectedFinalSize, stats.getFinalSize(), 0.01);
    }
    
    @Test
    public void testCalculateMassLossGreenland() {
        // Test mass loss calculation for Greenland (Requirements 4.2)
        VisualizationStatistics stats = calculator.calculateMassLoss(IceSheetType.GREENLAND, TimePeriod.MONTHLY);
        
        assertEquals(-4.364067, stats.getMeltingRate(), 0.000001);
        assertEquals(4_380_000.0, stats.getInitialSize(), 0.001);
        assertEquals("Greenland", stats.getIceSheetName());
        assertEquals(TimePeriod.MONTHLY, stats.getPeriod());
        
        // Mass loss = time period × |melting rate|
        double expectedMassLoss = 2_628_000.0 * 4.364067;
        assertEquals(expectedMassLoss, stats.getMassLoss(), 0.01);
        
        // Final size = initial size - mass loss
        double expectedFinalSize = 4_380_000.0 - expectedMassLoss;
        assertEquals(expectedFinalSize, stats.getFinalSize(), 0.01);
    }
    
    @Test
    public void testCalculateMassLossWeekly() {
        // Test weekly calculation for both ice sheets
        VisualizationStatistics antarcticaStats = calculator.calculateMassLoss(IceSheetType.ANTARCTICA, TimePeriod.WEEKLY);
        VisualizationStatistics greenlandStats = calculator.calculateMassLoss(IceSheetType.GREENLAND, TimePeriod.WEEKLY);
        
        // Verify weekly time period is used correctly
        assertEquals(TimePeriod.WEEKLY, antarcticaStats.getPeriod());
        assertEquals(TimePeriod.WEEKLY, greenlandStats.getPeriod());
        
        // Verify mass loss calculations
        double antarcticaMassLoss = 604_800.0 * 26.9982036;
        double greenlandMassLoss = 604_800.0 * 4.364067;
        
        assertEquals(antarcticaMassLoss, antarcticaStats.getMassLoss(), 0.01);
        assertEquals(greenlandMassLoss, greenlandStats.getMassLoss(), 0.01);
    }
}