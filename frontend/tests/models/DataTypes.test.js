/**
 * Unit tests for frontend data types and models
 */

// Import the data types (simulating browser environment)
const fs = require('fs');
const path = require('path');

// Read and evaluate the DataTypes.js file
const dataTypesPath = path.join(__dirname, '../../js/models/DataTypes.js');
const dataTypesCode = fs.readFileSync(dataTypesPath, 'utf8');
eval(dataTypesCode);

describe('Frontend Data Types', () => {
    
    describe('IceSheetType', () => {
        test('should have correct enum values', () => {
            expect(IceSheetType.GREENLAND).toBe('GREENLAND');
            expect(IceSheetType.ANTARCTICA).toBe('ANTARCTICA');
        });
    });
    
    describe('TimePeriod', () => {
        test('should have correct time periods with seconds', () => {
            expect(TimePeriod.ANNUAL.name).toBe('ANNUAL');
            expect(TimePeriod.ANNUAL.seconds).toBe(31536000);
            expect(TimePeriod.ANNUAL.displayName).toBe('Annual');
            
            expect(TimePeriod.DECADE.name).toBe('DECADE');
            expect(TimePeriod.DECADE.seconds).toBe(315360000);
            expect(TimePeriod.DECADE.displayName).toBe('Decade');
            
            expect(TimePeriod.CENTURY.name).toBe('CENTURY');
            expect(TimePeriod.CENTURY.seconds).toBe(3153600000);
            expect(TimePeriod.CENTURY.displayName).toBe('Century');
        });
    });
    
    describe('VisualizationType', () => {
        test('should have correct visualization types', () => {
            expect(VisualizationType.SIDE_VIEW).toBe('SIDE_VIEW');
            expect(VisualizationType.SIZE_GRAPH).toBe('SIZE_GRAPH');
            expect(VisualizationType.LAYER_OVERLAY).toBe('LAYER_OVERLAY');
        });
    });
    
    describe('IceSheetBaseData', () => {
        test('should have correct Antarctica data', () => {
            const antarctica = IceSheetBaseData[IceSheetType.ANTARCTICA];
            expect(antarctica.sizeKm2).toBe(14000000);
            expect(antarctica.meltingRateKgPerSecond).toBe(-26.9982036);
            expect(antarctica.name).toBe('Antarctica');
        });
        
        test('should have correct Greenland data', () => {
            const greenland = IceSheetBaseData[IceSheetType.GREENLAND];
            expect(greenland.sizeKm2).toBe(4380000);
            expect(greenland.meltingRateKgPerSecond).toBe(-4.364067);
            expect(greenland.name).toBe('Greenland');
        });
    });
    
    describe('DetailStatistics', () => {
        test('should create instance with correct properties', () => {
            const stats = new DetailStatistics(1000000, -20.5, -5.2);
            expect(stats.currentSize).toBe(1000000);
            expect(stats.ambientTemperature).toBe(-20.5);
            expect(stats.meltingRate).toBe(-5.2);
        });
    });
    
    describe('VisualizationStatistics', () => {
        test('should create instance with correct properties', () => {
            const stats = new VisualizationStatistics(
                -5.2, 1000, 2000000, 1999000, 'Test Sheet', TimePeriod.CENTURY
            );
            expect(stats.meltingRate).toBe(-5.2);
            expect(stats.massLoss).toBe(1000);
            expect(stats.initialSize).toBe(2000000);
            expect(stats.finalSize).toBe(1999000);
            expect(stats.iceSheetName).toBe('Test Sheet');
            expect(stats.period).toBe(TimePeriod.CENTURY);
        });
    });
});