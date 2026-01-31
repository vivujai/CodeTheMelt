# Ice Sheet Visualization System - Self-Contained Version

This folder contains a completely self-contained version of the Ice Sheet Visualization System with all data embedded directly in the HTML files. No backend API or server is required.

## Files Structure

### Main Files
- `index.html` - Main navigation page with embedded interactive functionality
- `visualization-engine.js` - Shared JavaScript for all visualization modes
- `styles/main.css` - Complete styling for the application
- `images/` - Contains the ice sheet impact map images

### Individual Ice Sheet Pages
Each ice sheet has dedicated pages for different time periods:

**Greenland:**
- `greenland-annual.html` - Annual view
- `greenland-decade.html` - Decade view  
- `greenland-century.html` - Century view

**Antarctica:**
- `antarctica-annual.html` - Annual view
- `antarctica-decade.html` - Decade view
- `antarctica-century.html` - Century view

## Features

### Embedded Data
All ice sheet data is embedded directly in the HTML files:
- **Greenland**: 4,380,000 km², -4.364067 kg/s melting rate, -29.45°C ambient temperature
- **Antarctica**: 14,000,000 km², -26.9982036 kg/s melting rate, -57.0°C ambient temperature

### Visualization Modes
Each page includes three interactive visualization modes:

1. **Side View** - Geological cross-section showing ice layers with thinning zones
2. **Size Graph** - Bar chart comparing ice layer compositions and mass loss
3. **Layer Overlay** - Impact maps showing ice thickness changes with color-coded legends

### Navigation
- Main index page provides navigation to both ice sheets
- Detail pages show statistics and time period selection
- Direct links to individual visualization pages
- All pages include "Exit" buttons to return to main navigation

## Usage

1. Open `index.html` in any modern web browser
2. Select either Greenland or Antarctica
3. Choose a time period (Annual, Decade, or Century)
4. Switch between visualization modes using the control buttons
5. Use direct links for quick access to specific combinations

## Technical Details

- **No Dependencies**: Pure HTML, CSS, and JavaScript - no external libraries
- **Responsive Design**: Works on desktop and mobile devices
- **Self-Contained**: All assets and data embedded - works offline
- **Cross-Browser**: Compatible with all modern browsers

## Data Sources

- Ice sheet impact maps from NASA and Space.com
- Statistical data based on scientific measurements
- Visualization percentages calculated for educational purposes

## Notes

- Thinning zones are exaggerated 5x for visualization clarity
- Mass loss percentages are realistic approximations for educational use
- Images include fallback placeholders if map files are missing
- All styling uses a neon blue theme with black background for visual appeal