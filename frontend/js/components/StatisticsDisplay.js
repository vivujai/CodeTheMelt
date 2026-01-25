/**
 * Statistics Display Component for Ice Sheet Visualization System
 * Handles display and updating of ice sheet statistics
 */

class StatisticsDisplay {
    constructor() {
        this.currentStats = null;
    }

    /**
     * Display detail statistics on ice sheet detail page
     * Requirements: 3.1, 6.2
     * @param {DetailStatistics} stats - Detail statistics object
     */
    displayDetailStats(stats) {
        this.currentStats = stats;
        
        // Update the detail page statistics display
        const currentSizeElement = document.getElementById('current-size');
        const ambientTempElement = document.getElementById('ambient-temperature');
        const meltingRateElement = document.getElementById('melting-rate');
        
        if (currentSizeElement && stats.currentSize !== undefined) {
            currentSizeElement.textContent = `${stats.currentSize.toLocaleString()} km²`;
        }
        
        if (ambientTempElement && stats.ambientTemperature !== undefined) {
            ambientTempElement.textContent = `${stats.ambientTemperature}°C`;
        }
        
        if (meltingRateElement && stats.meltingRate !== undefined) {
            // Display actual melting rate value (negative for melting)
            meltingRateElement.textContent = `${stats.meltingRate} kg/s`;
        }
        
        console.log('Displaying detail stats:', stats);
    }

    /**
     * Display visualization statistics on visualization page
     * Requirements: 3.2, 4.4
     * @param {VisualizationStatistics} stats - Visualization statistics object
     */
    displayVisualizationStats(stats) {
        this.currentStats = stats;
        
        // Update the visualization page statistics display
        const meltingRateElement = document.getElementById('viz-melting-rate');
        const massLossElement = document.getElementById('viz-mass-loss');
        const initialSizeElement = document.getElementById('viz-initial-size');
        
        if (meltingRateElement && stats.meltingRate !== undefined) {
            // Display actual melting rate value (negative for melting)
            meltingRateElement.textContent = `${stats.meltingRate.toLocaleString()} kg/s`;
        }
        
        if (massLossElement && stats.massLoss !== undefined) {
            // Display absolute value for user-friendly display
            massLossElement.textContent = `${Math.abs(stats.massLoss).toLocaleString()} kg`;
        }
        
        if (initialSizeElement && stats.initialSize !== undefined) {
            initialSizeElement.textContent = `${stats.initialSize.toLocaleString()} km²`;
        }
        
        console.log('Displaying visualization stats:', stats);
    }

    /**
     * Fetch and display visualization statistics from backend API
     * Requirements: 3.2, 4.4, 6.2, 7.5
     * @param {string} iceSheetType - Ice sheet type (GREENLAND or ANTARCTICA)
     * @param {string} timePeriod - Time period (ANNUAL, DECADE, or CENTURY)
     */
    async fetchAndDisplayVisualizationStats(iceSheetType, timePeriod) {
        // Define the API call function
        const apiCall = async () => {
            const response = await window.errorHandler.fetchWithTimeout(
                `http://localhost:8080/api/icesheet/${iceSheetType}/visualization?period=${timePeriod}`,
                {},
                10000 // 10 second timeout for visualization data
            );
            return await response.json();
        };

        // Define fallback handler
        const fallbackHandler = (error) => {
            console.log('Using fallback data for visualization statistics');
            this.displayErrorStats();
            
            // Create fallback statistics using base data
            if (IceSheetBaseData[iceSheetType] && TimePeriod[timePeriod]) {
                const baseData = IceSheetBaseData[iceSheetType];
                const period = TimePeriod[timePeriod];
                
                const meltingRate = baseData.meltingRateKgPerSecond;
                const massLoss = Math.abs(meltingRate * period.seconds);
                const initialSize = baseData.sizeKm2;
                
                const fallbackStats = new VisualizationStatistics(
                    meltingRate,
                    -massLoss, // Negative for mass loss
                    initialSize,
                    initialSize, // Keep finalSize for backend compatibility
                    baseData.name,
                    period
                );
                
                // Update visualization engine with fallback data
                if (window.visualizationEngine) {
                    window.visualizationEngine.updateWithNewData(fallbackStats);
                }
                
                return fallbackStats;
            }
            return null;
        };

        try {
            // Execute API call with retry logic and error handling
            const statsData = await window.errorHandler.executeWithRetry(apiCall, {
                maxRetries: 3,
                retryDelay: 2000,
                operation: `${iceSheetType} visualization data`,
                fallbackHandler: fallbackHandler
            });
            
            // Create VisualizationStatistics object
            const stats = new VisualizationStatistics(
                statsData.meltingRate,
                statsData.massLoss,
                statsData.initialSize,
                statsData.finalSize,
                statsData.iceSheetName,
                statsData.period
            );
            
            this.displayVisualizationStats(stats);
            
            // Update visualization engine with new data while maintaining current mode
            if (window.visualizationEngine) {
                window.visualizationEngine.updateWithNewData(stats);
            }
            
            // Show success message
            window.errorHandler.showSuccessMessage(`${iceSheetType} visualization data updated`);
            
            return stats;
            
        } catch (error) {
            console.error('All attempts to fetch visualization statistics failed:', error);
            // Fallback handler was already called by errorHandler
            throw error;
        }
    }

    /**
     * Display error message when statistics cannot be loaded
     */
    displayErrorStats() {
        const errorMessage = 'Unable to load data';
        
        // Update visualization stats with error message
        const meltingRateElement = document.getElementById('viz-melting-rate');
        const massLossElement = document.getElementById('viz-mass-loss');
        const initialSizeElement = document.getElementById('viz-initial-size');
        
        if (meltingRateElement) meltingRateElement.textContent = errorMessage;
        if (massLossElement) massLossElement.textContent = errorMessage;
        if (initialSizeElement) initialSizeElement.textContent = errorMessage;
        
        // Also update detail stats if on detail page
        const currentSizeElement = document.getElementById('current-size');
        const ambientTempElement = document.getElementById('ambient-temperature');
        const detailMeltingRateElement = document.getElementById('melting-rate');
        
        if (currentSizeElement) currentSizeElement.textContent = errorMessage;
        if (ambientTempElement) ambientTempElement.textContent = errorMessage;
        if (detailMeltingRateElement) detailMeltingRateElement.textContent = errorMessage;
    }

    /**
     * Update displayed statistics with new data
     * @param {DetailStatistics|VisualizationStatistics} newStats - New statistics
     */
    updateStats(newStats) {
        this.currentStats = newStats;
        
        if (newStats instanceof DetailStatistics) {
            this.displayDetailStats(newStats);
        } else if (newStats instanceof VisualizationStatistics) {
            this.displayVisualizationStats(newStats);
        }
    }

    /**
     * Get currently displayed statistics
     */
    getCurrentStats() {
        return this.currentStats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsDisplay;
}