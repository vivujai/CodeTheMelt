// Static data for frontend-only version
const STATIC_ICE_SHEET_DATA = {
    GREENLAND: {
        details: {
            currentSize: 4380000,
            ambientTemperature: -29.45,
            meltingRate: -4.364067
        },
        visualization: {
            ANNUAL: {
                iceSheetName: "Greenland",
                period: "ANNUAL",
                meltingRate: -4.364067,
                massLoss: 137625217,
                initialSize: 4380000,
                finalSize: 4379999.86
            },
            DECADE: {
                iceSheetName: "Greenland",
                period: "DECADE", 
                meltingRate: -4.364067,
                massLoss: 1376252169,
                initialSize: 4380000,
                finalSize: 4379998.6
            },
            CENTURY: {
                iceSheetName: "Greenland",
                period: "CENTURY",
                meltingRate: -4.364067,
                massLoss: 13762521691,
                initialSize: 4380000,
                finalSize: 4379986.2
            }
        }
    },
    ANTARCTICA: {
        details: {
            currentSize: 14000000,
            ambientTemperature: -57.0,
            meltingRate: -26.9982036
        },
        visualization: {
            ANNUAL: {
                iceSheetName: "Antarctica",
                period: "ANNUAL",
                meltingRate: -26.9982036,
                massLoss: 851415349,
                initialSize: 14000000,
                finalSize: 13999999.15
            },
            DECADE: {
                iceSheetName: "Antarctica", 
                period: "DECADE",
                meltingRate: -26.9982036,
                massLoss: 8514153487,
                initialSize: 14000000,
                finalSize: 13999991.5
            },
            CENTURY: {
                iceSheetName: "Antarctica",
                period: "CENTURY", 
                meltingRate: -26.9982036,
                massLoss: 85141534873,
                initialSize: 14000000,
                finalSize: 13999915
            }
        }
    }
};

// Mock API functions
window.mockAPI = {
    getDetails: (iceSheet) => {
        return Promise.resolve(STATIC_ICE_SHEET_DATA[iceSheet].details);
    },
    
    getVisualization: (iceSheet, period) => {
        return Promise.resolve(STATIC_ICE_SHEET_DATA[iceSheet].visualization[period]);
    }
};