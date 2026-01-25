/**
 * Visualization Engine for Ice Sheet Visualization System
 * Handles rendering of different visualization modes
 */

class VisualizationEngine {
    constructor() {
        this.currentVisualizationType = null;
        this.currentData = null;
        this.activeButton = null;
    }

    /**
     * Initialize visualization engine with data
     * @param {object} data - Ice sheet data for visualization
     */
    initialize(data) {
        this.currentData = data;
        // Set default visualization mode to side view
        this.updateDisplay(VisualizationType.SIDE_VIEW);
    }

    /**
     * Update visualization with new data while maintaining current mode
     * @param {object} newData - Updated ice sheet data
     */
    updateWithNewData(newData) {
        this.currentData = newData;
        // Maintain current visualization type when data updates
        if (this.currentVisualizationType) {
            this.updateDisplay(this.currentVisualizationType);
        }
    }

    /**
     * Render side view visualization with detailed geological layers
     * @param {object} data - Ice sheet data for visualization
     */
    renderSideView(data) {
        this.currentVisualizationType = VisualizationType.SIDE_VIEW;
        this.currentData = data;
        
        const displayArea = document.getElementById('visualization-display');
        if (!displayArea) return;
        
        // Calculate realistic percentages for visualization
        const baseMassLossPercentage = this.calculateRealisticLossPercentage(data);
        
        // Exaggerate thinning by 500% for better visualization
        const exaggeratedMassLossPercentage = Math.min(baseMassLossPercentage * 5, 75); // Cap at 75% for visual clarity
        const remainingPercentage = 100 - exaggeratedMassLossPercentage;
        
        // Create realistic ice sheet dimensions with detailed layers
        const totalHeight = 220; // Reduced from 280 to make it more compact
        const seaLevelHeight = 20; // Reduced from 25
        const bedrockHeight = 25; // Reduced from 35
        const subglacialHeight = 12; // Reduced from 15
        const iceHeight = totalHeight - seaLevelHeight - bedrockHeight - subglacialHeight;
        const currentIceHeight = (remainingPercentage / 100) * iceHeight;
        const meltedHeight = Math.max(10, iceHeight - currentIceHeight); // Ensure minimum visible thinning
        
        // Calculate layer heights for detailed ice structure
        // The thinning zone is now part of the ice layers, so we need to account for it
        const totalIceLayerHeight = currentIceHeight + meltedHeight;
        const surfaceLayerHeight = Math.max(8, totalIceLayerHeight * 0.05);
        const thinningZoneHeight = meltedHeight; // This is the exaggerated thinning zone
        const firnLayerHeight = Math.max(12, totalIceLayerHeight * 0.12);
        const glacialIceHeight = Math.max(15, totalIceLayerHeight * 0.55);
        const basalIceHeight = Math.max(10, totalIceLayerHeight * 0.05);
        
        // Profile information based on ice sheet type
        const profileInfo = data.iceSheetName === 'Greenland' 
            ? { profile: 'East-West profile at 72°N', maxElevation: '3000m' }
            : { profile: 'Transect across ice divide', maxElevation: '4000m' };
        
        displayArea.innerHTML = `
            <div class="side-view-container">
                <div class="side-view-header neon-text">
                    <h4>Geological Cross-Section - ${data.iceSheetName}</h4>
                    <p class="profile-info">Cross Section Representation</p>
                    <p class="thinning-notice">⚠️ Thinning zone height exaggerated 5x for visualization clarity</p>
                </div>
                <div class="side-view-display">
                    <div class="side-view-left-section">
                        <div class="side-view-visual">
                            <div class="ice-sheet-cross-section" style="height: ${totalHeight}px;">
                                <!-- Surface snow/firn layer -->
                                <div class="surface-snow-layer" style="height: ${surfaceLayerHeight}px;">
                                    <span class="layer-label neon-text">Surface Snow 2%</span>
                                    <div class="layer-texture surface-texture"></div>
                                </div>
                                
                                <!-- Enhanced melted/thinning zone positioned at surface -->
                                <div class="melted-zone" style="height: ${thinningZoneHeight}px;">
                                    <div class="thinning-indicator">
                                        <span class="thinning-text neon-text">Surface Thinning Zone ${baseMassLossPercentage.toFixed(2)}% Lost</span>
                                        <div class="thinning-arrows">
                                            <div class="arrow-down">↓</div>
                                            <div class="arrow-down">↓</div>
                                            <div class="arrow-down">↓</div>
                                        </div>
                                    </div>
                                    <div class="melt-gradient"></div>
                                    <div class="thinning-pattern"></div>
                                </div>
                                
                                <!-- Firn layer (compressed snow) -->
                                <div class="firn-layer" style="height: ${firnLayerHeight}px;">
                                    <span class="layer-label neon-text">Firn Layer ${(5 - baseMassLossPercentage).toFixed(1)}%</span>
                                    <div class="layer-texture firn-texture"></div>
                                </div>
                                
                                <!-- Main glacial ice body -->
                                <div class="glacial-ice-layer" style="height: ${glacialIceHeight}px;">
                                    <span class="layer-label neon-text">Glacial Ice 92%</span>
                                    <div class="layer-texture ice-texture"></div>
                                    <div class="ice-flow-lines"></div>
                                </div>
                                
                                <!-- Basal ice layer -->
                                <div class="basal-ice-layer" style="height: ${basalIceHeight}px;">
                                    <span class="layer-label neon-text">Basal Ice 1%</span>
                                    <div class="layer-texture basal-texture"></div>
                                </div>
                                
                                <!-- Subglacial environment -->
                                <div class="subglacial-layer" style="height: ${subglacialHeight}px;">
                                    <span class="layer-label neon-text">Subglacial Zone</span>
                                    <div class="subglacial-water"></div>
                                </div>
                                
                                <!-- Sea level reference -->
                                <div class="sea-level" style="height: ${seaLevelHeight}px;">
                                    <span class="sea-label neon-text">Sea Level</span>
                                    <div class="sea-waves"></div>
                                </div>
                                
                                <!-- Bedrock foundation -->
                                <div class="bedrock-layer" style="height: ${bedrockHeight}px;">
                                    <span class="bedrock-label neon-text">Bedrock</span>
                                    <div class="bedrock-texture"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Layer legend - moved underneath the visual -->
                        <div class="layer-legend neon-text">
                            <div class="legend-row">
                                <div class="legend-item">
                                    <div class="legend-color surface-color"></div>
                                    <span>Surface Snow</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color melt-color"></div>
                                    <span>Surface Thinning (${baseMassLossPercentage.toFixed(2)}%)</span>
                                </div>
                            </div>
                            <div class="legend-row">
                                <div class="legend-item">
                                    <div class="legend-color firn-color"></div>
                                    <span>Firn</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color glacial-color"></div>
                                    <span>Glacial Ice</span>
                                </div>
                            </div>
                            <div class="legend-row">
                                <div class="legend-item">
                                    <div class="legend-color basal-color"></div>
                                    <span>Basal Ice</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color subglacial-color"></div>
                                    <span>Subglacial</span>
                                </div>
                            </div>
                            <div class="legend-row">
                                <div class="legend-item">
                                    <div class="legend-color sea-color"></div>
                                    <span>Sea Level</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color bedrock-color"></div>
                                    <span>Bedrock</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Enhanced information panel - moved to the right -->
                    <div class="side-view-info neon-text">
                        <div class="info-grid">
                            <div class="info-section">
                                <h5>Ice Structure</h5>
                                <p>• Surface: Fresh snow accumulation</p>
                                <p>• Thinning: Surface melting zone</p>
                                <p>• Firn: Compressed granular snow</p>
                                <p>• Glacial: Dense crystalline ice</p>
                                <p>• Basal: Ice-bedrock interface</p>
                            </div>
                            <div class="info-section">
                                <h5>Thinning Analysis</h5>
                                <p>Remaining thickness: ${remainingPercentage.toFixed(1)}%</p>
                                <p>Actual thickness loss: ${baseMassLossPercentage.toFixed(2)}%</p>
                                <p>Time period: ${data.period.displayName.toLowerCase()}</p>
                                <p>Mass loss rate: ${data.meltingRate.toFixed(2)} kg/s</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Rendered detailed layered side view with exaggerated thinning for:', data);
    }

    /**
     * Render size graph visualization
     * @param {object} data - Ice sheet data for visualization
     */
    renderSizeGraph(data) {
        this.currentVisualizationType = VisualizationType.SIZE_GRAPH;
        this.currentData = data;
        
        const displayArea = document.getElementById('visualization-display');
        if (!displayArea) return;
        
        // Calculate realistic percentages for meaningful visualization
        const massLossPercentage = this.calculateRealisticLossPercentage(data);
        const remainingPercentage = 100 - massLossPercentage;
        
        // Set bar heights based on realistic proportions - use fixed heights that fit well
        // Don't scale with container - use consistent heights that look good
        const baseMaxHeight = 140; // Fixed base height that works well visually
        
        // Enhanced scaling for better visual distinction
        // Use logarithmic scaling for small differences to make them more visible
        const scaleFactor = massLossPercentage < 1 ? 3 : 1; // Amplify small percentages
        const adjustedLossPercentage = Math.min(massLossPercentage * scaleFactor, 25); // Cap at 25%
        
        // Calculate ice layer percentages (same as side view)
        const surfaceSnowPercentage = 2;
        const firnLayerPercentage = Math.max(0.1, 5 - massLossPercentage); // Firn layer reduces with mass loss
        const glacialIcePercentage = 92;
        const basalIcePercentage = 1;
        
        // Calculate heights for all bars
        const initialHeight = baseMaxHeight; // 100% always uses base height
        const surfaceSnowHeight = Math.max(15, (surfaceSnowPercentage / 100) * baseMaxHeight);
        const firnLayerHeight = Math.max(15, (firnLayerPercentage / 100) * baseMaxHeight);
        const glacialIceHeight = Math.max(30, (glacialIcePercentage / 100) * baseMaxHeight);
        const basalIceHeight = Math.max(10, (basalIcePercentage / 100) * baseMaxHeight);
        const lossHeight = Math.max(20, (adjustedLossPercentage / 100) * baseMaxHeight); // Minimum 20px for visibility
        
        displayArea.innerHTML = `
            <div class="size-graph-container">
                <div class="size-graph-header neon-text">
                    <h4>Size Comparison - ${data.iceSheetName}</h4>
                </div>
                <div class="size-graph-display">
                    <div class="graph-bars">
                        <div class="bar-container">
                            <div class="size-bar initial-bar" style="height: ${initialHeight}px;">
                                <span class="bar-label neon-text">100%</span>
                            </div>
                            <div class="bar-title neon-text">Initial Size</div>
                            <div class="bar-value neon-text">${data.initialSize.toLocaleString()} km²</div>
                        </div>
                        <div class="bar-container">
                            <div class="size-bar surface-snow-bar" style="height: ${surfaceSnowHeight}px;">
                                <span class="bar-label neon-text">${surfaceSnowPercentage}%</span>
                            </div>
                            <div class="bar-title neon-text">Surface Snow</div>
                            <div class="bar-value neon-text">${(data.initialSize * surfaceSnowPercentage / 100).toLocaleString()} km²</div>
                        </div>
                        <div class="bar-container">
                            <div class="size-bar firn-layer-bar" style="height: ${firnLayerHeight}px;">
                                <span class="bar-label neon-text">${firnLayerPercentage.toFixed(1)}%</span>
                            </div>
                            <div class="bar-title neon-text">Firn Layer</div>
                            <div class="bar-value neon-text">${(data.initialSize * firnLayerPercentage / 100).toLocaleString()} km²</div>
                        </div>
                        <div class="bar-container">
                            <div class="size-bar glacial-ice-bar" style="height: ${glacialIceHeight}px;">
                                <span class="bar-label neon-text">${glacialIcePercentage}%</span>
                            </div>
                            <div class="bar-title neon-text">Glacial Ice</div>
                            <div class="bar-value neon-text">${(data.initialSize * glacialIcePercentage / 100).toLocaleString()} km²</div>
                        </div>
                        <div class="bar-container">
                            <div class="size-bar basal-ice-bar" style="height: ${basalIceHeight}px;">
                                <span class="bar-label neon-text">${basalIcePercentage}%</span>
                            </div>
                            <div class="bar-title neon-text">Basal Ice</div>
                            <div class="bar-value neon-text">${(data.initialSize * basalIcePercentage / 100).toLocaleString()} km²</div>
                        </div>
                        <div class="bar-container">
                            <div class="size-bar loss-bar" style="height: ${lossHeight}px;">
                                <span class="bar-label neon-text">${massLossPercentage.toFixed(2)}%</span>
                            </div>
                            <div class="bar-title neon-text">Area Affected${scaleFactor > 1 ? ' (Enhanced)' : ''}</div>
                            <div class="bar-value neon-text">${(data.initialSize * massLossPercentage / 100).toLocaleString()} km²</div>
                        </div>
                    </div>
                    <div class="size-graph-info neon-text">
                        <p>Ice sheet layer composition and impact visualization</p>
                        <p>Shows layer breakdown over ${data.period.displayName.toLowerCase()} period</p>
                        <p>Mass loss: ${Math.abs(data.massLoss).toLocaleString()} kg affects ${massLossPercentage.toFixed(2)}% of area</p>
                        ${scaleFactor > 1 ? '<p style="color: #ffaa00; font-size: 0.8rem;">⚠️ Small percentages enhanced for visibility</p>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        console.log('Rendered realistic size graph for:', data);
    }

    /**
     * Render layer overlay visualization showing mass loss with accurate ice sheet shape
     * @param {object} data - Ice sheet data for visualization
     */
    renderLayerOverlay(data) {
        console.log('renderLayerOverlay called with data:', data);
        this.currentVisualizationType = VisualizationType.LAYER_OVERLAY;
        this.currentData = data;
        
        const displayArea = document.getElementById('visualization-display');
        if (!displayArea) {
            console.error('visualization-display element not found!');
            return;
        }
        
        console.log('Display area found:', displayArea);
        
        // Calculate realistic percentages for visualization
        const massLossPercentage = this.calculateRealisticLossPercentage(data);
        const remainingPercentage = 100 - massLossPercentage;
        
        console.log('Mass loss percentage:', massLossPercentage);
        console.log('Remaining percentage:', remainingPercentage);
        
        // Only show detailed map for Antarctica, simplified for others
        const isAntarctica = data.iceSheetName === 'Antarctica';
        console.log('Is Antarctica:', isAntarctica);
        
        if (isAntarctica) {
            displayArea.innerHTML = `
                <div class="layer-overlay-container">
                    <div class="layer-overlay-header neon-text">
                        <h4>Impact Overlay - ${data.iceSheetName}</h4>
                        <p class="overlay-subtitle">Simplified Impact Visualization From Space.Com</p>
                    </div>
                    <div class="layer-overlay-display">
                        <div class="overlay-content-wrapper">
                            <div class="overlay-left-panel">
                                <!-- Scale reference -->
                                <div class="scale-reference">
                                    <div class="scale-bar">
                                        <div class="scale-segment" style="width: 75px;"></div>
                                        <div class="scale-segment" style="width: 75px;"></div>
                                    </div>
                                    <div class="scale-labels neon-text">
                                        <span>0</span>
                                        <span>500</span>
                                        <span>1000 km</span>
                                    </div>
                                </div>
                                
                                <!-- Color scale legend matching the reference map -->
                                <div class="color-scale-legend">
                                    <div class="legend-title neon-text">Ice Thickness Change</div>
                                    <div class="color-scale-bar">
                                        <div class="scale-gradient"></div>
                                        <div class="scale-values neon-text">
                                            <span class="scale-min">-10.0</span>
                                            <span class="scale-mid">-5.0</span>
                                            <span class="scale-zero">0</span>
                                            <span class="scale-max">+0.5</span>
                                        </div>
                                    </div>
                                    <div class="legend-unit neon-text">meters of ice per year</div>
                                </div>
                                
                                <!-- Enhanced legend with color coding -->
                                <div class="impact-legend">
                                    <div class="legend-row">
                                        <div class="legend-item">
                                            <div class="legend-color high-loss-color"></div>
                                            <span>High Loss (-6 to -10 m/year)</span>
                                        </div>
                                        <div class="legend-item">
                                            <div class="legend-color medium-loss-color"></div>
                                            <span>Medium Loss (-3 to -6 m/year)</span>
                                        </div>
                                    </div>
                                    <div class="legend-row">
                                        <div class="legend-item">
                                            <div class="legend-color low-loss-color"></div>
                                            <span>Low Loss (-1 to -3 m/year)</span>
                                        </div>
                                        <div class="legend-item">
                                            <div class="legend-color stable-color"></div>
                                            <span>Stable/Gain (0 to +0.5 m/year)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="overlay-map-container">
                                <!-- Real Antarctica impact map image -->
                                <div class="antarctica-impact-image">
                                    <img src="images/antarctica-impact-map.png" 
                                         alt="Antarctica Ice Thickness Change Map" 
                                         class="impact-map-img"
                                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                    <div class="image-placeholder" style="display: none;">
                                        <div class="placeholder-content neon-text">
                                            <h5>Antarctica Impact Map</h5>
                                            <p>Replace images/antarctica-impact-map.png</p>
                                            <p>with the actual satellite data image</p>
                                            <div class="placeholder-icon">🗺️</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="layer-overlay-info neon-text">
                                <div class="info-grid">
                                    <div class="info-section">
                                        <h5>Impact Distribution</h5>
                                        <p>• Coastal regions: Highest ice loss (red zones)</p>
                                        <p>• Outlet glaciers: Accelerated thinning</p>
                                        <p>• Interior plateau: Relatively stable (blue)</p>
                                        <p>• Accumulation zones: Slight ice gain</p>
                                    </div>
                                    <div class="info-section">
                                        <h5>Analysis Summary</h5>
                                        <p>Affected area: ${massLossPercentage.toFixed(1)}% of total</p>
                                        <p>Stable regions: ${remainingPercentage.toFixed(1)}% of total</p>
                                        <p>Time period: annual</p>
                                        <p>Mass loss rate: ${data.meltingRate.toFixed(2)} kg/s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Simplified view for non-Antarctica ice sheets
            displayArea.innerHTML = `
                <div class="layer-overlay-container">
                    <div class="layer-overlay-header neon-text">
                        <h4>Impact Overlay - ${data.iceSheetName}</h4>
                        <p class="overlay-subtitle">Simplified Impact Visualization From Nasa.Gov</p>
                    </div>
                    <div class="layer-overlay-display">
                        <div class="overlay-content-wrapper">
                            <div class="overlay-left-panel">
                                <!-- Scale reference -->
                                <div class="scale-reference">
                                    <div class="scale-bar">
                                        <div class="scale-segment" style="width: 75px;"></div>
                                        <div class="scale-segment" style="width: 75px;"></div>
                                    </div>
                                    <div class="scale-labels neon-text">
                                        <span>0</span>
                                        <span>500</span>
                                        <span>1000 km</span>
                                    </div>
                                </div>
                                
                                <!-- Color scale legend for Greenland -->
                                <div class="color-scale-legend">
                                    <div class="legend-title neon-text">Greenland Ice Loss</div>
                                    <div class="color-scale-bar">
                                        <div class="greenland-scale-gradient"></div>
                                        <div class="scale-values neon-text">
                                            <span class="scale-min">-4</span>
                                            <span class="scale-mid-left">-3</span>
                                            <span class="scale-mid-right">-1</span>
                                            <span class="scale-zero">0</span>
                                            <span class="scale-max">0.5</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Enhanced legend with color coding -->
                                <div class="impact-legend">
                                    <div class="legend-row">
                                        <div class="legend-item">
                                            <div class="legend-color high-loss-color"></div>
                                            <span>High Loss (-6 to -10 m/year)</span>
                                        </div>
                                        <div class="legend-item">
                                            <div class="legend-color medium-loss-color"></div>
                                            <span>Medium Loss (-3 to -6 m/year)</span>
                                        </div>
                                    </div>
                                    <div class="legend-row">
                                        <div class="legend-item">
                                            <div class="legend-color low-loss-color"></div>
                                            <span>Low Loss (-1 to -3 m/year)</span>
                                        </div>
                                        <div class="legend-item">
                                            <div class="legend-color stable-color"></div>
                                            <span>Stable/Gain (0 to +0.5 m/year)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="overlay-map-container">
                                <!-- Greenland impact map image -->
                                <div class="greenland-impact-image">
                                    <img src="images/greenland-impact-map.png" 
                                         alt="Greenland Ice Thickness Change Map" 
                                         class="impact-map-img"
                                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                    <div class="image-placeholder" style="display: none;">
                                        <div class="placeholder-content neon-text">
                                            <h5>Greenland Impact Map</h5>
                                            <p>Replace images/greenland-impact-map.png</p>
                                            <p>with the actual satellite data image</p>
                                            <div class="placeholder-icon">🗺️</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="layer-overlay-info neon-text">
                                <div class="info-grid">
                                    <div class="info-section">
                                        <h5>Impact Distribution</h5>
                                        <p>• Coastal regions: Primary ice loss areas</p>
                                        <p>• Interior regions: More stable</p>
                                        <p>• Overall impact: ${massLossPercentage.toFixed(1)}% affected</p>
                                    </div>
                                    <div class="info-section">
                                        <h5>Analysis Summary</h5>
                                        <p>Affected area: ${massLossPercentage.toFixed(1)}% of total</p>
                                        <p>Stable regions: ${remainingPercentage.toFixed(1)}% of total</p>
                                        <p>Time period: annual</p>
                                        <p>Mass loss rate: ${data.meltingRate.toFixed(2)} kg/s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        console.log('renderLayerOverlay completed successfully');
    }

    /**
     * Update the main display area with selected visualization type
     * @param {string} visualizationType - VisualizationType value
     */
    updateDisplay(visualizationType) {
        if (!this.currentData) {
            console.warn('No data available for visualization update');
            return;
        }

        // Update active button styling
        this.updateActiveButton(visualizationType);

        switch (visualizationType) {
            case VisualizationType.SIDE_VIEW:
                this.renderSideView(this.currentData);
                break;
            case VisualizationType.SIZE_GRAPH:
                this.renderSizeGraph(this.currentData);
                break;
            case VisualizationType.LAYER_OVERLAY:
                this.renderLayerOverlay(this.currentData);
                break;
            default:
                console.error('Unknown visualization type:', visualizationType);
        }
    }

    /**
     * Update active button styling for visualization mode selection
     * @param {string} visualizationType - Currently selected visualization type
     */
    updateActiveButton(visualizationType) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.viz-mode-button');
        buttons.forEach(button => button.classList.remove('active'));

        // Add active class to current button
        let activeButtonId;
        switch (visualizationType) {
            case VisualizationType.SIDE_VIEW:
                activeButtonId = 'side-view-btn';
                break;
            case VisualizationType.SIZE_GRAPH:
                activeButtonId = 'size-graph-btn';
                break;
            case VisualizationType.LAYER_OVERLAY:
                activeButtonId = 'layer-overlay-btn';
                break;
        }

        if (activeButtonId) {
            const activeButton = document.getElementById(activeButtonId);
            if (activeButton) {
                activeButton.classList.add('active');
                this.activeButton = activeButton;
            }
        }
    }

    /**
     * Get current visualization state
     */
    getCurrentState() {
        return {
            type: this.currentVisualizationType,
            data: this.currentData
        };
    }

    /**
     * Calculate display width percentage for visualization elements
     * @param {number} value - The value to calculate percentage for
     * @param {number} total - The total value to calculate percentage against
     * @returns {number} Percentage value for display
     */
    calculateDisplayWidth(value, total) {
        if (!total || total === 0) return 0;
        return Math.max(5, Math.min(95, (Math.abs(value) / total) * 100));
    }

    /**
     * Calculate realistic loss percentage for visualization purposes
     * Since backend data has unit mismatch (kg vs km²), we need to create realistic percentages
     * @param {object} data - Ice sheet data
     * @returns {number} Realistic loss percentage for visualization
     */
    calculateRealisticLossPercentage(data) {
        // Use melting rate and time period to estimate realistic impact
        const meltingRateKgPerSecond = Math.abs(data.meltingRate);
        const periodSeconds = data.period.seconds;
        
        // Create realistic percentages based on melting rate and time period
        // These are approximations for visualization purposes
        let basePercentage;
        
        if (data.iceSheetName === 'Antarctica') {
            // Antarctica is larger and melts slower proportionally
            basePercentage = (meltingRateKgPerSecond / 500000) * (periodSeconds / 31536000) * 100;
        } else {
            // Greenland is smaller and shows more dramatic percentage changes
            basePercentage = (meltingRateKgPerSecond / 50000) * (periodSeconds / 31536000) * 100;
        }
        
        // Adjust for different time periods
        if (data.period.name === 'CENTURY') {
            basePercentage *= 2.5; // More dramatic over century
        } else if (data.period.name === 'DECADE') {
            basePercentage *= 1.5; // Moderate over decade
        }
        
        // Ensure reasonable bounds for visualization (0.1% to 25%)
        return Math.max(0.1, Math.min(25, basePercentage));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualizationEngine;
}