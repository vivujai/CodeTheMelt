/**
 * Core data types and enums for Ice Sheet Visualization System
 * Requirements: 3.4, 4.1
 */

// Ice Sheet Types
const IceSheetType = {
    GREENLAND: 'GREENLAND',
    ANTARCTICA: 'ANTARCTICA'
};

// Time Periods with conversion to seconds
const TimePeriod = {
    CENTURY: {
        name: 'CENTURY',
        seconds: 3153600000,  // 100 * 365 * 24 * 60 * 60
        displayName: 'Century'
    },
    DECADE: {
        name: 'DECADE', 
        seconds: 315360000,   // 10 * 365 * 24 * 60 * 60
        displayName: 'Decade'
    },
    ANNUAL: {
        name: 'ANNUAL',
        seconds: 31536000,    // 365 * 24 * 60 * 60
        displayName: 'Annual'
    }
};

// Visualization Types
const VisualizationType = {
    SIDE_VIEW: 'SIDE_VIEW',
    SIZE_GRAPH: 'SIZE_GRAPH', 
    LAYER_OVERLAY: 'LAYER_OVERLAY'
};

// Ice Sheet Base Data (Requirements 3.4)
const IceSheetBaseData = {
    [IceSheetType.ANTARCTICA]: {
        sizeKm2: 14000000,           // 14,000,000 km²
        meltingRateKgPerSecond: -26.9982036,  // kg/s
        ambientTemperature: -57.0,            // °C
        name: 'Antarctica'
    },
    [IceSheetType.GREENLAND]: {
        sizeKm2: 4380000,            // 4,380,000 km²
        meltingRateKgPerSecond: -4.364067,    // kg/s  
        ambientTemperature: -29.45,           // °C
        name: 'Greenland'
    }
};

// Data Transfer Objects
class DetailStatistics {
    constructor(currentSize, ambientTemperature, meltingRate) {
        this.currentSize = currentSize;
        this.ambientTemperature = ambientTemperature;
        this.meltingRate = meltingRate;
    }
}

class VisualizationStatistics {
    constructor(meltingRate, massLoss, initialSize, finalSize, iceSheetName, period) {
        this.meltingRate = meltingRate;
        this.massLoss = massLoss;
        this.initialSize = initialSize;
        this.finalSize = finalSize;
        this.iceSheetName = iceSheetName;
        this.period = period;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        IceSheetType,
        TimePeriod,
        VisualizationType,
        IceSheetBaseData,
        DetailStatistics,
        VisualizationStatistics
    };
}