# Ice Sheet Visualization System

A web-based application that provides interactive visualization and statistical analysis of ice sheet changes over time for Greenland and Antarctica.

## Project Structure

```
├── frontend/                 # HTML/CSS/JavaScript frontend
│   ├── index.html           # Main HTML file
│   ├── styles/              # CSS stylesheets
│   │   └── main.css        # Main styling with neon theme
│   ├── js/                  # JavaScript modules
│   │   ├── models/         # Data types and models
│   │   │   └── DataTypes.js
│   │   ├── controllers/    # Navigation and control logic
│   │   │   └── NavigationController.js
│   │   ├── components/     # UI components
│   │   │   ├── StatisticsDisplay.js
│   │   │   └── VisualizationEngine.js
│   │   └── main.js         # Application entry point
│   └── package.json        # Frontend dependencies
│
├── backend/                 # Java Spring Boot backend
│   ├── src/main/java/com/icesheet/visualization/
│   │   ├── model/          # Core data models and enums
│   │   │   ├── IceSheetType.java
│   │   │   ├── TimePeriod.java
│   │   │   ├── VisualizationType.java
│   │   │   └── IceSheetBaseData.java
│   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── DetailStatistics.java
│   │   │   └── VisualizationStatistics.java
│   │   └── IceSheetVisualizationApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml             # Maven configuration
│
└── README.md               # This file
```

## Core Data Models

### Ice Sheet Types
- **Antarctica**: 14,000,000 km², -26.9982036 kg/s melting rate
- **Greenland**: 4,380,000 km², -4.364067 kg/s melting rate

### Time Periods
- **Annual**: 31,536,000 seconds
- **Monthly**: 2,628,000 seconds (average month)
- **Weekly**: 604,800 seconds

### Visualization Types
- **Side View**: Side profile visualization
- **Size Graph**: Graphical size representation
- **Layer Overlay**: Mass loss overlay visualization

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm start
```
The frontend will be available at http://localhost:3000

### Backend
```bash
cd backend
mvn spring-boot:run
```
The backend API will be available at http://localhost:8080

## Features

- Multi-page navigation system
- Neon-styled dark theme interface
- Real-time statistical calculations
- Multiple visualization modes
- Responsive design for different screen sizes
- RESTful API architecture

## Requirements

- Node.js 14+ (for frontend)
- Java 11+ (for backend)
- Maven 3.6+ (for backend build)

## Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
mvn test
```

## Architecture

The system follows a client-server architecture with:
- **Frontend**: Single-page application with client-side routing
- **Backend**: Java Spring Boot REST API
- **Communication**: HTTP/JSON API calls

## License

MIT License