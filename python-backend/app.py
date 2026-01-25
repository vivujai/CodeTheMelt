"""
Ice Sheet Visualization System - Python Backend
Flask API for PythonAnywhere deployment
Converted from Java Spring Boot backend
Requirements: 6.2, 6.3, 6.5, 7.1, 7.5
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import time
from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Thread-safe counters for monitoring
request_counter = 0
concurrent_counter = 0
counter_lock = threading.Lock()

class IceSheetType(Enum):
    GREENLAND = "GREENLAND"
    ANTARCTICA = "ANTARCTICA"

class TimePeriod(Enum):
    ANNUAL = "ANNUAL"
    DECADE = "DECADE" 
    CENTURY = "CENTURY"

@dataclass
class IceSheetBaseData:
    """Base data for ice sheets with constants"""
    size_km2: float
    melting_rate_kg_per_second: float
    ambient_temperature: float
    name: str

# Constants for ice sheet base data (Requirements 3.4)
ICE_SHEET_DATA = {
    IceSheetType.ANTARCTICA: IceSheetBaseData(
        size_km2=14_000_000.0,      # 14,000,000 km²
        melting_rate_kg_per_second=-26.9982036,  # kg/s melting rate
        ambient_temperature=-57.0,   # ambient temperature in °C
        name="Antarctica"
    ),
    IceSheetType.GREENLAND: IceSheetBaseData(
        size_km2=4_380_000.0,       # 4,380,000 km²
        melting_rate_kg_per_second=-4.364067,   # kg/s melting rate
        ambient_temperature=-29.45,  # ambient temperature in °C
        name="Greenland"
    )
}

# Time period conversions (Requirements 4.1)
TIME_PERIOD_SECONDS = {
    TimePeriod.ANNUAL: 31_536_000,      # 1 year in seconds
    TimePeriod.DECADE: 315_360_000,     # 10 years in seconds
    TimePeriod.CENTURY: 3_153_600_000   # 100 years in seconds
}

def increment_counters():
    """Thread-safe counter increment"""
    global request_counter, concurrent_counter
    with counter_lock:
        request_counter += 1
        concurrent_counter += 1
        return request_counter

def decrement_concurrent():
    """Thread-safe concurrent counter decrement"""
    global concurrent_counter
    with counter_lock:
        concurrent_counter -= 1

def get_base_data(ice_sheet_type: IceSheetType) -> IceSheetBaseData:
    """Get base data for a specific ice sheet type"""
    if ice_sheet_type not in ICE_SHEET_DATA:
        raise ValueError(f"Unknown ice sheet type: {ice_sheet_type}")
    return ICE_SHEET_DATA[ice_sheet_type]

def convert_period_to_seconds(period: TimePeriod) -> float:
    """Convert time period to seconds (Requirements 4.1)"""
    return float(TIME_PERIOD_SECONDS[period])

def calculate_mass_loss(ice_sheet_type: IceSheetType, period: TimePeriod) -> Dict[str, Any]:
    """
    Calculate mass loss and visualization statistics
    Requirements: 4.1, 4.2, 4.3, 6.3, 7.5
    """
    request_id = increment_counters()
    
    try:
        logger.info(f"Starting calculation request {request_id}")
        
        # Get base data (thread-safe - uses immutable constants)
        base_data = get_base_data(ice_sheet_type)
        
        # Convert time period to seconds (Requirement 4.1)
        time_in_seconds = convert_period_to_seconds(period)
        
        # Calculate mass loss = time period × melting rate (Requirement 4.2)
        mass_loss = time_in_seconds * abs(base_data.melting_rate_kg_per_second)
        
        # Calculate final mass = initial size - mass loss (Requirement 4.3)
        initial_size = base_data.size_km2
        final_size = initial_size - mass_loss
        
        result = {
            "meltingRate": base_data.melting_rate_kg_per_second,
            "massLoss": mass_loss,
            "initialSize": initial_size,
            "finalSize": final_size,
            "iceSheetName": base_data.name,
            "period": period.value
        }
        
        logger.info(f"Completed calculation request {request_id} successfully")
        return result
        
    except Exception as e:
        logger.error(f"Calculation failed for request {request_id}: {str(e)}")
        raise
    finally:
        decrement_concurrent()

def create_error_response(error_type: str, message: str, path: str) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        "error": error_type,
        "message": message,
        "path": path,
        "timestamp": time.time()
    }

@app.route('/api/icesheet/<ice_sheet>/details', methods=['GET'])
def get_detail_statistics(ice_sheet: str):
    """
    Get detail statistics for an ice sheet
    Requirements: 6.2, 6.3, 6.5, 7.1, 7.5
    """
    start_time = time.time()
    
    try:
        logger.info(f"Received detail statistics request for ice sheet: {ice_sheet}")
        
        # Input validation (Requirements: 6.5)
        if not ice_sheet or ice_sheet.strip() == "":
            return jsonify(create_error_response(
                "INVALID_INPUT",
                "Ice sheet parameter cannot be null or empty. Valid values: GREENLAND, ANTARCTICA",
                request.path
            )), 400
        
        try:
            ice_sheet_type = IceSheetType(ice_sheet.upper())
        except ValueError:
            return jsonify(create_error_response(
                "INVALID_ICE_SHEET",
                f"Invalid ice sheet type: '{ice_sheet}'. Valid values: GREENLAND, ANTARCTICA",
                request.path
            )), 400
        
        # Get base data
        base_data = get_base_data(ice_sheet_type)
        
        result = {
            "currentSize": base_data.size_km2,
            "ambientTemperature": base_data.ambient_temperature,
            "meltingRate": base_data.melting_rate_kg_per_second
        }
        
        duration = (time.time() - start_time) * 1000
        logger.info(f"Successfully processed detail statistics request for {ice_sheet} in {duration:.2f}ms")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Unexpected error processing detail statistics request for {ice_sheet}: {str(e)}")
        return jsonify(create_error_response(
            "INTERNAL_ERROR",
            "An unexpected error occurred while processing the request. Please try again later.",
            request.path
        )), 500

@app.route('/api/icesheet/<ice_sheet>/visualization', methods=['GET'])
def get_visualization_statistics(ice_sheet: str):
    """
    Get visualization statistics for an ice sheet over a time period
    Requirements: 6.2, 6.3, 6.5, 7.1, 7.5
    """
    start_time = time.time()
    period = request.args.get('period')
    
    try:
        logger.info(f"Received visualization statistics request for ice sheet: {ice_sheet}, period: {period}")
        
        # Input validation (Requirements: 6.5)
        if not ice_sheet or ice_sheet.strip() == "":
            return jsonify(create_error_response(
                "INVALID_INPUT",
                "Ice sheet parameter cannot be null or empty. Valid values: GREENLAND, ANTARCTICA",
                request.path
            )), 400
        
        if not period or period.strip() == "":
            return jsonify(create_error_response(
                "INVALID_INPUT",
                "Period parameter cannot be null or empty. Valid values: CENTURY, DECADE, ANNUAL",
                request.path
            )), 400
        
        try:
            ice_sheet_type = IceSheetType(ice_sheet.upper())
        except ValueError:
            return jsonify(create_error_response(
                "INVALID_PARAMETER",
                f"Invalid ice sheet type: '{ice_sheet}'. Valid values: GREENLAND, ANTARCTICA",
                request.path
            )), 400
        
        try:
            time_period = TimePeriod(period.upper())
        except ValueError:
            return jsonify(create_error_response(
                "INVALID_PARAMETER",
                f"Invalid time period: '{period}'. Valid values: CENTURY, DECADE, ANNUAL",
                request.path
            )), 400
        
        # Calculate statistics
        statistics = calculate_mass_loss(ice_sheet_type, time_period)
        
        duration = (time.time() - start_time) * 1000
        logger.info(f"Successfully processed visualization statistics request for {ice_sheet}/{period} in {duration:.2f}ms")
        
        return jsonify(statistics)
        
    except Exception as e:
        logger.error(f"Unexpected error processing visualization statistics request for {ice_sheet}/{period}: {str(e)}")
        return jsonify(create_error_response(
            "INTERNAL_ERROR",
            "An unexpected error occurred while processing the request. Please try again later.",
            request.path
        )), 500

@app.route('/api/icesheet/health', methods=['GET'])
def get_health_status():
    """Health check endpoint to monitor system status"""
    try:
        with counter_lock:
            total_requests = request_counter
            current_concurrent = concurrent_counter
        
        return jsonify({
            "status": "UP",
            "totalCalculatorRequests": total_requests,
            "currentConcurrentRequests": current_concurrent,
            "totalDataServiceRequests": total_requests
        })
    except Exception as e:
        logger.error(f"Error retrieving health status: {str(e)}")
        return jsonify({
            "status": "DOWN",
            "totalCalculatorRequests": 0,
            "currentConcurrentRequests": 0,
            "totalDataServiceRequests": 0
        }), 503

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for basic connectivity test"""
    return jsonify({
        "message": "Ice Sheet Visualization API",
        "status": "running",
        "endpoints": [
            "/api/icesheet/{GREENLAND|ANTARCTICA}/details",
            "/api/icesheet/{GREENLAND|ANTARCTICA}/visualization?period={ANNUAL|DECADE|CENTURY}",
            "/api/icesheet/health"
        ]
    })

if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=5000)