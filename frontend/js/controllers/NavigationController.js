/**
 * Navigation Controller for Ice Sheet Visualization System
 * Handles client-side routing and page navigation
 * Requirements: 1.2, 1.4, 1.5
 */

class NavigationController {
    constructor() {
        this.currentPage = 'title';
        this.currentIceSheet = null;
        this.currentPeriod = null;
        
        // Initialize page elements
        this.titlePage = null;
        this.detailPage = null;
        this.visualizationPage = null;
        
        // Initialize after DOM is loaded
        this.initializePages();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });
    }

    /**
     * Initialize page elements
     */
    initializePages() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupPageElements();
            });
        } else {
            this.setupPageElements();
        }
    }

    /**
     * Setup page element references
     */
    setupPageElements() {
        this.titlePage = document.getElementById('title-page');
        this.detailPage = document.getElementById('detail-page');
        this.visualizationPage = document.getElementById('visualization-page');
        
        // Show title page by default
        this.showTitlePage();
    }

    /**
     * Navigate to the title page
     * Requirement 1.1: Navigation system provides title page with two main navigation options
     */
    navigateToTitlePage() {
        this.currentPage = 'title';
        this.currentIceSheet = null;
        this.currentPeriod = null;
        
        this.showTitlePage();
        this.updateURL('');
        
        console.log('Navigated to title page');
    }

    /**
     * Navigate to ice sheet detail page
     * Requirement 1.2: Navigation to corresponding ice sheet detail page
     * @param {string} iceSheet - IceSheetType value
     */
    navigateToDetailPage(iceSheet) {
        if (!IceSheetType[iceSheet]) {
            console.error('Invalid ice sheet type:', iceSheet);
            return;
        }

        this.currentPage = 'detail';
        this.currentIceSheet = iceSheet;
        this.currentPeriod = null;
        
        this.showDetailPage(iceSheet);
        this.updateURL(`detail/${iceSheet.toLowerCase()}`);
        
        console.log(`Navigated to detail page for ${iceSheet}`);
    }

    /**
     * Navigate to visualization page
     * Requirement 1.4: Navigation to corresponding visualization page
     * @param {string} iceSheet - IceSheetType value
     * @param {object} period - TimePeriod value
     */
    navigateToVisualizationPage(iceSheet, period) {
        if (!IceSheetType[iceSheet]) {
            console.error('Invalid ice sheet type:', iceSheet);
            return;
        }
        
        if (!period || !period.name) {
            console.error('Invalid time period:', period);
            return;
        }

        this.currentPage = 'visualization';
        this.currentIceSheet = iceSheet;
        this.currentPeriod = period;
        
        this.showVisualizationPage(iceSheet, period);
        this.updateURL(`visualization/${iceSheet.toLowerCase()}/${period.name.toLowerCase()}`);
        
        console.log(`Navigated to visualization page for ${iceSheet} - ${period.displayName}`);
    }

    /**
     * Exit from visualization page back to detail page
     * Requirement 1.5: Exit option in top right corner
     */
    exitToDetailPage() {
        if (this.currentIceSheet) {
            this.navigateToDetailPage(this.currentIceSheet);
        } else {
            this.navigateToTitlePage();
        }
    }

    /**
     * Show title page and hide others
     */
    showTitlePage() {
        this.hideAllPages();
        if (this.titlePage) {
            this.titlePage.classList.remove('hidden');
        }
    }

    /**
     * Show detail page and hide others
     * @param {string} iceSheet - IceSheetType value
     */
    showDetailPage(iceSheet) {
        this.hideAllPages();
        if (this.detailPage) {
            this.detailPage.classList.remove('hidden');
            
            // Update detail page content
            const titleElement = document.getElementById('detail-title');
            if (titleElement) {
                const iceSheetData = IceSheetBaseData[iceSheet];
                titleElement.textContent = iceSheetData ? iceSheetData.name : iceSheet;
            }
            
            // Load detail statistics (will be implemented in later tasks)
            this.loadDetailStatistics(iceSheet);
        }
    }

    /**
     * Show visualization page and hide others
     * @param {string} iceSheet - IceSheetType value
     * @param {object} period - TimePeriod value
     */
    showVisualizationPage(iceSheet, period) {
        this.hideAllPages();
        if (this.visualizationPage) {
            this.visualizationPage.classList.remove('hidden');
            
            // Update visualization page content
            const nameElement = document.getElementById('viz-ice-sheet-name');
            if (nameElement) {
                const iceSheetData = IceSheetBaseData[iceSheet];
                nameElement.textContent = iceSheetData ? iceSheetData.name : iceSheet;
            }
            
            // Load visualization statistics (will be implemented in later tasks)
            this.loadVisualizationStatistics(iceSheet, period);
        }
    }

    /**
     * Hide all pages
     */
    hideAllPages() {
        const pages = [this.titlePage, this.detailPage, this.visualizationPage];
        pages.forEach(page => {
            if (page) {
                page.classList.add('hidden');
            }
        });
    }

    /**
     * Update browser URL without page reload
     * @param {string} path - URL path
     */
    updateURL(path) {
        const newURL = window.location.origin + window.location.pathname + (path ? '#' + path : '');
        window.history.pushState({ path }, '', newURL);
    }

    /**
     * Handle browser back/forward navigation
     * @param {PopStateEvent} event - Browser navigation event
     */
    handlePopState(event) {
        const path = window.location.hash.substring(1); // Remove # from hash
        this.navigateFromURL(path);
    }

    /**
     * Navigate based on URL path
     * @param {string} path - URL path
     */
    navigateFromURL(path) {
        if (!path || path === '') {
            this.navigateToTitlePage();
            return;
        }

        const segments = path.split('/');
        
        if (segments[0] === 'detail' && segments[1]) {
            const iceSheet = segments[1].toUpperCase();
            if (IceSheetType[iceSheet]) {
                this.navigateToDetailPage(iceSheet);
            } else {
                this.navigateToTitlePage();
            }
        } else if (segments[0] === 'visualization' && segments[1] && segments[2]) {
            const iceSheet = segments[1].toUpperCase();
            const periodName = segments[2].toUpperCase();
            
            if (IceSheetType[iceSheet] && TimePeriod[periodName]) {
                this.navigateToVisualizationPage(iceSheet, TimePeriod[periodName]);
            } else {
                this.navigateToTitlePage();
            }
        } else {
            this.navigateToTitlePage();
        }
    }

    /**
     * Load detail statistics from backend API
     * Requirements: 3.1, 6.2
     * @param {string} iceSheet - IceSheetType value
     */
    async loadDetailStatistics(iceSheet) {
        console.log(`Loading detail statistics for ${iceSheet}`);
        
        try {
            // Fetch data from backend API - Requirements: 6.2
            const response = await fetch(`http://localhost:8080/api/icesheet/${iceSheet}/details`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const detailStats = await response.json();
            
            // Update UI with fetched statistics - Requirements: 3.1
            this.displayDetailStatistics(detailStats);
            
        } catch (error) {
            console.error('Error loading detail statistics:', error);
            
            // Fallback to base data if API call fails
            this.displayFallbackDetailStatistics(iceSheet);
        }
    }

    /**
     * Display detail statistics in the UI
     * Requirements: 3.1
     * @param {Object} detailStats - DetailStatistics object from API
     */
    displayDetailStatistics(detailStats) {
        const currentSizeElement = document.getElementById('current-size');
        const ambientTempElement = document.getElementById('ambient-temperature');
        const meltingRateElement = document.getElementById('melting-rate');
        
        if (currentSizeElement) {
            currentSizeElement.textContent = `${detailStats.currentSize.toLocaleString()} km²`;
        }
        
        if (ambientTempElement) {
            ambientTempElement.textContent = `${detailStats.ambientTemperature}°C`;
        }
        
        if (meltingRateElement) {
            // Display actual melting rate value (negative for melting)
            meltingRateElement.textContent = `${detailStats.meltingRate} kg/s`;
        }
    }

    /**
     * Display fallback statistics using base data when API fails
     * @param {string} iceSheet - IceSheetType value
     */
    displayFallbackDetailStatistics(iceSheet) {
        const currentSizeElement = document.getElementById('current-size');
        const ambientTempElement = document.getElementById('ambient-temperature');
        const meltingRateElement = document.getElementById('melting-rate');
        
        if (IceSheetBaseData[iceSheet]) {
            const data = IceSheetBaseData[iceSheet];
            
            if (currentSizeElement) {
                currentSizeElement.textContent = `${data.sizeKm2.toLocaleString()} km²`;
            }
            
            if (ambientTempElement) {
                ambientTempElement.textContent = `${data.ambientTemperature}°C`;
            }
            
            if (meltingRateElement) {
                meltingRateElement.textContent = `${data.meltingRateKgPerSecond} kg/s`;
            }
        } else {
            // Handle case where ice sheet data is not found
            if (currentSizeElement) currentSizeElement.textContent = 'N/A';
            if (ambientTempElement) ambientTempElement.textContent = 'N/A';
            if (meltingRateElement) meltingRateElement.textContent = 'N/A';
        }
    }

    /**
     * Load visualization statistics from backend API
     * Requirements: 3.2, 4.4, 6.2
     * @param {string} iceSheet - IceSheetType value
     * @param {object} period - TimePeriod value
     */
    async loadVisualizationStatistics(iceSheet, period) {
        console.log(`Loading visualization statistics for ${iceSheet} - ${period.displayName}`);
        
        try {
            // Use StatisticsDisplay component to fetch and display stats
            if (window.statisticsDisplay) {
                const stats = await window.statisticsDisplay.fetchAndDisplayVisualizationStats(iceSheet, period.name);
                
                // Initialize visualization engine with the loaded data
                if (window.visualizationEngine && stats) {
                    window.visualizationEngine.initialize(stats);
                }
            } else {
                console.error('StatisticsDisplay component not available');
                this.displayFallbackVisualizationStatistics(iceSheet, period);
            }
        } catch (error) {
            console.error('Error loading visualization statistics:', error);
            this.displayFallbackVisualizationStatistics(iceSheet, period);
        }
    }

    /**
     * Display fallback visualization statistics when API fails
     * @param {string} iceSheet - IceSheetType value
     * @param {object} period - TimePeriod value
     */
    displayFallbackVisualizationStatistics(iceSheet, period) {
        const meltingRateElement = document.getElementById('viz-melting-rate');
        const massLossElement = document.getElementById('viz-mass-loss');
        const initialSizeElement = document.getElementById('viz-initial-size');
        
        if (IceSheetBaseData[iceSheet]) {
            const data = IceSheetBaseData[iceSheet];
            
            // Calculate basic statistics using base data
            const meltingRate = data.meltingRateKgPerSecond;
            const massLoss = Math.abs(data.meltingRateKgPerSecond * period.seconds);
            const initialSize = data.sizeKm2;
            
            if (meltingRateElement) {
                meltingRateElement.textContent = `${meltingRate.toLocaleString()} kg/s`;
            }
            
            if (massLossElement) {
                massLossElement.textContent = `${massLoss.toLocaleString()} kg`;
            }
            
            if (initialSizeElement) {
                initialSizeElement.textContent = `${initialSize.toLocaleString()} km²`;
            }
            
            // Initialize visualization engine with fallback data
            if (window.visualizationEngine) {
                const fallbackStats = new VisualizationStatistics(
                    data.meltingRateKgPerSecond,
                    -massLoss, // Negative for mass loss
                    initialSize,
                    initialSize, // Keep finalSize for backend compatibility but don't display
                    data.name,
                    period
                );
                window.visualizationEngine.initialize(fallbackStats);
            }
        } else {
            // Handle case where ice sheet data is not found
            const errorMessage = 'N/A';
            if (meltingRateElement) meltingRateElement.textContent = errorMessage;
            if (massLossElement) massLossElement.textContent = errorMessage;
            if (initialSizeElement) initialSizeElement.textContent = errorMessage;
        }
    }

    /**
     * Get current navigation state
     */
    getCurrentState() {
        return {
            page: this.currentPage,
            iceSheet: this.currentIceSheet,
            period: this.currentPeriod
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationController;
}