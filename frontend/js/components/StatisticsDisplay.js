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
     * Requirements: 3.2, 4.4, 6.2
     * @param {string} iceSheetType - Ice sheet type (GREENLAND or ANTARCTICA)
     * @param {string} timePeriod - Time period (ANNUAL, MONTHLY, or WEEKLY)
     */
    async fetchAndDisplayVisualizationStats(iceSheetType, timePeriod) {
        try {
            const response = await fetch(`/api/icesheet/${iceSheetType}/visualization?period=${timePeriod}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const statsData = await response.json();
            
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
            
            return stats;
        } catch (error) {
            console.error('Error fetching visualization statistics:', error);
            this.displayErrorStats();
            throw error;
        }
    }

    /**
     * Display error message when statistics cannot be loaded
     */
    displayErrorStats() {
        const errorMessage = 'Error loading data';
        
        // Update visualization stats with error message
        const meltingRateElement = document.getElementById('viz-melting-rate');
        const massLossElement = document.getElementById('viz-mass-loss');
        const initialSizeElement = document.getElementById('viz-initial-size');
        
        if (meltingRateElement) meltingRateElement.textContent = errorMessage;
        if (massLossElement) massLossElement.textContent = errorMessage;
        if (initialSizeElement) initialSizeElement.textContent = errorMessage;
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