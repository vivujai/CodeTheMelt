# Ice Sheet Visualization - Python Backend

This is a Python Flask backend converted from the Java Spring Boot version, specifically designed for easy deployment on PythonAnywhere.

## Features

✅ **Identical API endpoints** to Java version  
✅ **Thread-safe concurrent request handling**  
✅ **Comprehensive error handling**  
✅ **CORS enabled** for frontend access  
✅ **Health monitoring** endpoint  
✅ **Scientific precision** calculations  

## API Endpoints

### Detail Statistics
```
GET /api/icesheet/{GREENLAND|ANTARCTICA}/details
```

**Response:**
```json
{
  "currentSize": 4380000.0,
  "ambientTemperature": -29.45,
  "meltingRate": -4.364067
}
```

### Visualization Statistics
```
GET /api/icesheet/{GREENLAND|ANTARCTICA}/visualization?period={ANNUAL|DECADE|CENTURY}
```

**Response:**
```json
{
  "meltingRate": -4.364067,
  "massLoss": 137625217.0,
  "initialSize": 4380000.0,
  "finalSize": 4379999.86,
  "iceSheetName": "Greenland",
  "period": "ANNUAL"
}
```

### Health Check
```
GET /api/icesheet/health
```

## Local Development

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run the server:**
```bash
python app.py
```

3. **Test the API:**
```bash
curl http://localhost:5000/api/icesheet/GREENLAND/details
```

## PythonAnywhere Deployment

### Step 1: Upload Files
1. Go to PythonAnywhere Dashboard
2. Open Files tab
3. Upload `app.py`, `wsgi.py`, and `requirements.txt`

### Step 2: Install Dependencies
In PythonAnywhere console:
```bash
pip3.10 install --user -r requirements.txt
```

### Step 3: Configure Web App
1. Go to Web tab
2. Create new web app
3. Choose Flask
4. Set source code path to your uploaded files
5. Set WSGI configuration file to `wsgi.py`

### Step 4: Update Frontend
Update your frontend JavaScript to use:
```javascript
const API_BASE_URL = 'https://yourusername.pythonanywhere.com';
```

## Error Handling

The API provides comprehensive error responses:

```json
{
  "error": "INVALID_ICE_SHEET",
  "message": "Invalid ice sheet type: 'INVALID'. Valid values: GREENLAND, ANTARCTICA",
  "path": "/api/icesheet/INVALID/details",
  "timestamp": 1640995200.0
}
```

## Thread Safety

- Uses thread-safe counters for monitoring
- Immutable data structures for ice sheet constants
- Proper exception handling for concurrent requests
- Request tracking and logging

## Requirements Satisfied

- **6.2**: Frontend requests data from backend
- **6.3**: Backend handles concurrent user requests
- **6.5**: Input validation and error responses
- **7.1**: Well-defined API communication
- **7.5**: Network communication error handling

## Conversion Notes

This Python backend maintains 100% API compatibility with the original Java version:

- Same endpoint URLs
- Same request/response formats
- Same error handling
- Same mathematical calculations
- Same thread safety guarantees

The conversion simplifies deployment while maintaining all functionality.