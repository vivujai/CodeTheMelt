// Script to generate all ice sheet visualization pages
const fs = require('fs');

const iceSheets = {
    'GREENLAND': {
        name: 'Greenland',
        sizeKm2: 4380000,
        meltingRateKgPerSecond: -4.364067,
        ambientTemperature: -29.45,
        imageName: 'greenland-impact-map.png',
        source: 'Nasa.Gov'
    },
    'ANTARCTICA': {
        name: 'Antarctica',
        sizeKm2: 14000000,
        meltingRateKgPerSecond: -26.9982036,
        ambientTemperature: -57.0,
        imageName: 'antarctica-impact-map.png',
        source: 'Space.Com'
    }
};

const timePeriods = {
    'ANNUAL': {
        name: 'ANNUAL',
        seconds: 31536000,
        displayName: 'Annual'
    },
    'DECADE': {
        name: 'DECADE',
        seconds: 315360000,
        displayName: 'Decade'
    },
    'CENTURY': {
        name: 'CENTURY',
        seconds: 3153600000,
        displayName: 'Century'
    }
};

function generatePage(iceSheetKey, periodKey) {
    const iceSheet = iceSheets[iceSheetKey];
    const period = timePeriods[periodKey];
    const massLoss = Math.abs(iceSheet.meltingRateKgPerSecond * period.seconds);
    
    const filename = `${iceSheetKey.toLowerCase()}-${periodKey.toLowerCase()}.html`;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${iceSheet.name} Ice Sheet - ${period.displayName} View</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div id="app">
        <!-- Visualization Page for ${iceSheet.name} ${period.displayName} -->
        <div id="visualization-page" class="page">
            <div class="visualization-container">
                <div class="top-bar">
                    <h3 id="viz-ice-sheet-name" class="ice-sheet-name neon-text">${iceSheet.name}</h3>
                    <button id="exit-btn" class="exit-button nav-button neon-text" onclick="window.location.href='index.html'">Exit</button>
                </div>
                <div class="main-content">
                    <div class="visualization-controls">
                        <h4 class="controls-title neon-text">Visualization Modes</h4>
                        <button id="side-view-btn" class="viz-mode-button nav-button neon-text active" onclick="selectVisualizationMode('SIDE_VIEW')">Side View</button>
                        <button id="size-graph-btn" class="viz-mode-button nav-button neon-text" onclick="selectVisualizationMode('SIZE_GRAPH')">Size Graph</button>
                        <button id="layer-overlay-btn" class="viz-mode-button nav-button neon-text" onclick="selectVisualizationMode('LAYER_OVERLAY')">Layer Overlay</button>
                    </div>
                    <div id="visualization-display" class="visualization-area">
                        <!-- Content will be loaded by JavaScript -->
                    </div>
                    <div id="visualization-stats" class="stats-panel">
                        <div class="stat-item">
                            <span class="stat-label neon-text">Melting Rate:</span>
                            <span id="viz-melting-rate" class="stat-value neon-text">${iceSheet.meltingRateKgPerSecond} kg/s</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label neon-text">Mass Loss:</span>
                            <span id="viz-mass-loss" class="stat-value neon-text">${massLoss.toLocaleString()} kg</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label neon-text">Initial Size:</span>
                            <span id="viz-initial-size" class="stat-value neon-text">${iceSheet.sizeKm2.toLocaleString()} km²</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="visualization-engine.js"></script>
    <script>
        // Embedded data for ${iceSheet.name} ${period.displayName}
        const data = {
            meltingRate: ${iceSheet.meltingRateKgPerSecond},
            massLoss: ${-massLoss},
            initialSize: ${iceSheet.sizeKm2},
            finalSize: ${iceSheet.sizeKm2},
            iceSheetName: '${iceSheet.name}',
            period: {
                name: '${period.name}',
                seconds: ${period.seconds},
                displayName: '${period.displayName}'
            }
        };

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            updateVisualizationDisplay(VisualizationType.SIDE_VIEW);
        });
    </script>
</body>
</html>`;

    return { filename, html };
}

// Generate all pages
const pages = [];
Object.keys(iceSheets).forEach(iceSheetKey => {
    Object.keys(timePeriods).forEach(periodKey => {
        pages.push(generatePage(iceSheetKey, periodKey));
    });
});

console.log('Generated pages:');
pages.forEach(page => {
    console.log(`- ${page.filename}`);
    fs.writeFileSync(page.filename, page.html);
});

console.log('\\nAll pages generated successfully!');