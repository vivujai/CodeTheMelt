package com.icesheet.visualization.controller;

import com.icesheet.visualization.dto.DetailStatistics;
import com.icesheet.visualization.dto.ErrorResponse;
import com.icesheet.visualization.dto.VisualizationStatistics;
import com.icesheet.visualization.model.IceSheetType;
import com.icesheet.visualization.model.TimePeriod;
import com.icesheet.visualization.service.IceSheetDataService;
import com.icesheet.visualization.service.StatisticsCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import java.util.concurrent.TimeoutException;

/**
 * REST API Controller for ice sheet data and statistics
 * This controller handles concurrent requests safely and provides proper error responses.
 * Requirements: 6.2, 6.3, 6.5, 7.1, 7.5
 */
@RestController
@RequestMapping("/api/icesheet")
@CrossOrigin(origins = "*") // Allow frontend access
public class IceSheetController {
    
    private static final Logger logger = LoggerFactory.getLogger(IceSheetController.class);
    
    private final IceSheetDataService dataService;
    private final StatisticsCalculator statisticsCalculator;
    
    @Autowired
    public IceSheetController(IceSheetDataService dataService, StatisticsCalculator statisticsCalculator) {
        this.dataService = dataService;
        this.statisticsCalculator = statisticsCalculator;
    }
    
    /**
     * Get detail statistics for an ice sheet
     * This endpoint handles concurrent requests safely and provides proper error responses.
     * Requirements: 6.2, 6.3, 6.5, 7.1, 7.5
     * 
     * @param iceSheet The ice sheet type (GREENLAND or ANTARCTICA)
     * @param request HTTP request for error path information
     * @return DetailStatistics containing current size, ambient temperature, and melting rate
     */
    @GetMapping("/{iceSheet}/details")
    public ResponseEntity<?> getDetailStatistics(@PathVariable String iceSheet, HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("Received detail statistics request for ice sheet: {}", iceSheet);
            
            // Input validation - Requirements: 6.5
            if (iceSheet == null || iceSheet.trim().isEmpty()) {
                ErrorResponse error = new ErrorResponse(
                    "INVALID_INPUT", 
                    "Ice sheet parameter cannot be null or empty. Valid values: GREENLAND, ANTARCTICA", 
                    request.getRequestURI()
                );
                return ResponseEntity.badRequest().body(error);
            }
            
            IceSheetType iceSheetType = IceSheetType.valueOf(iceSheet.toUpperCase());
            DetailStatistics statistics = dataService.getDetailStatistics(iceSheetType);
            
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Successfully processed detail statistics request for {} in {}ms", iceSheet, duration);
            
            return ResponseEntity.ok(statistics);
            
        } catch (IllegalArgumentException e) {
            // Error handling - Requirements: 7.5
            logger.warn("Invalid ice sheet parameter: {}", iceSheet, e);
            ErrorResponse error = new ErrorResponse(
                "INVALID_ICE_SHEET", 
                String.format("Invalid ice sheet type: '%s'. Valid values: GREENLAND, ANTARCTICA", iceSheet), 
                request.getRequestURI()
            );
            return ResponseEntity.badRequest().body(error);
            
        } catch (RuntimeException e) {
            // Handle concurrent access issues - Requirements: 6.3, 7.5
            logger.error("Runtime error processing detail statistics request for {}", iceSheet, e);
            
            String errorType = "CONCURRENT_ACCESS_ERROR";
            String message = "Request failed due to concurrent access issue. Please retry.";
            
            if (e.getMessage().contains("concurrent access")) {
                errorType = "CONCURRENT_ACCESS_ERROR";
                message = "System is experiencing high load. Please retry in a moment.";
            } else if (e.getMessage().contains("calculation")) {
                errorType = "CALCULATION_ERROR";
                message = "Calculation failed due to system error. Please retry.";
            }
            
            ErrorResponse error = new ErrorResponse(errorType, message, request.getRequestURI());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
            
        } catch (Exception e) {
            // General error handling - Requirements: 7.5
            logger.error("Unexpected error processing detail statistics request for {}", iceSheet, e);
            ErrorResponse error = new ErrorResponse(
                "INTERNAL_ERROR", 
                "An unexpected error occurred while processing the request. Please try again later.", 
                request.getRequestURI()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get visualization statistics for an ice sheet over a time period
     * This endpoint handles concurrent requests safely and provides proper error responses.
     * Requirements: 6.2, 6.3, 6.5, 7.1, 7.5
     * 
     * @param iceSheet The ice sheet type (GREENLAND or ANTARCTICA)
     * @param period The time period (CENTURY, DECADE, or ANNUAL)
     * @param request HTTP request for error path information
     * @return VisualizationStatistics with calculated mass loss and final size
     */
    @GetMapping("/{iceSheet}/visualization")
    public ResponseEntity<?> getVisualizationStatistics(
            @PathVariable String iceSheet, 
            @RequestParam String period,
            HttpServletRequest request) {
        
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("Received visualization statistics request for ice sheet: {}, period: {}", iceSheet, period);
            
            // Input validation - Requirements: 6.5
            if (iceSheet == null || iceSheet.trim().isEmpty()) {
                ErrorResponse error = new ErrorResponse(
                    "INVALID_INPUT", 
                    "Ice sheet parameter cannot be null or empty. Valid values: GREENLAND, ANTARCTICA", 
                    request.getRequestURI()
                );
                return ResponseEntity.badRequest().body(error);
            }
            
            if (period == null || period.trim().isEmpty()) {
                ErrorResponse error = new ErrorResponse(
                    "INVALID_INPUT", 
                    "Period parameter cannot be null or empty. Valid values: CENTURY, DECADE, ANNUAL", 
                    request.getRequestURI()
                );
                return ResponseEntity.badRequest().body(error);
            }
            
            IceSheetType iceSheetType = IceSheetType.valueOf(iceSheet.toUpperCase());
            TimePeriod timePeriod = TimePeriod.valueOf(period.toUpperCase());
            
            VisualizationStatistics statistics = statisticsCalculator.calculateMassLoss(iceSheetType, timePeriod);
            
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Successfully processed visualization statistics request for {}/{} in {}ms", 
                       iceSheet, period, duration);
            
            return ResponseEntity.ok(statistics);
            
        } catch (IllegalArgumentException e) {
            // Error handling - Requirements: 7.5
            logger.warn("Invalid parameters - ice sheet: {}, period: {}", iceSheet, period, e);
            
            String errorMessage;
            if (e.getMessage().contains("IceSheetType") || iceSheet == null || 
                !isValidIceSheetType(iceSheet.toUpperCase())) {
                errorMessage = String.format("Invalid ice sheet type: '%s'. Valid values: GREENLAND, ANTARCTICA", iceSheet);
            } else {
                errorMessage = String.format("Invalid time period: '%s'. Valid values: CENTURY, DECADE, ANNUAL", period);
            }
            
            ErrorResponse error = new ErrorResponse(
                "INVALID_PARAMETER", 
                errorMessage, 
                request.getRequestURI()
            );
            return ResponseEntity.badRequest().body(error);
            
        } catch (RuntimeException e) {
            // Handle concurrent access and calculation issues - Requirements: 6.3, 7.5
            logger.error("Runtime error processing visualization statistics request for {}/{}", iceSheet, period, e);
            
            String errorType = "CONCURRENT_ACCESS_ERROR";
            String message = "Request failed due to concurrent access issue. Please retry.";
            
            if (e.getMessage().contains("concurrent access")) {
                errorType = "CONCURRENT_ACCESS_ERROR";
                message = "System is experiencing high load. Please retry in a moment.";
            } else if (e.getMessage().contains("calculation") || e.getMessage().contains("arithmetic")) {
                errorType = "CALCULATION_ERROR";
                message = "Calculation failed due to system error. Please retry.";
            } else if (e.getMessage().contains("retrieve")) {
                errorType = "DATA_ACCESS_ERROR";
                message = "Failed to retrieve ice sheet data. Please retry.";
            }
            
            ErrorResponse error = new ErrorResponse(errorType, message, request.getRequestURI());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
            
        } catch (Exception e) {
            // General error handling - Requirements: 7.5
            logger.error("Unexpected error processing visualization statistics request for {}/{}", iceSheet, period, e);
            ErrorResponse error = new ErrorResponse(
                "INTERNAL_ERROR", 
                "An unexpected error occurred while processing the request. Please try again later.", 
                request.getRequestURI()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Helper method to validate ice sheet type without throwing exceptions
     * 
     * @param iceSheetType The ice sheet type to validate
     * @return true if valid, false otherwise
     */
    private boolean isValidIceSheetType(String iceSheetType) {
        try {
            IceSheetType.valueOf(iceSheetType);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Health check endpoint to monitor system status and concurrent request handling
     * 
     * @return System status including request statistics
     */
    @GetMapping("/health")
    public ResponseEntity<?> getHealthStatus() {
        try {
            long[] calculatorStats = statisticsCalculator.getRequestStatistics();
            long dataServiceRequests = dataService.getRequestCount();
            
            return ResponseEntity.ok(new HealthStatus(
                "UP",
                calculatorStats[0], // total calculator requests
                calculatorStats[1], // current concurrent requests
                dataServiceRequests // total data service requests
            ));
        } catch (Exception e) {
            logger.error("Error retrieving health status", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new HealthStatus("DOWN", 0, 0, 0));
        }
    }
    
    /**
     * Simple health status response class
     */
    public static class HealthStatus {
        private final String status;
        private final long totalCalculatorRequests;
        private final long currentConcurrentRequests;
        private final long totalDataServiceRequests;
        
        public HealthStatus(String status, long totalCalculatorRequests, 
                           long currentConcurrentRequests, long totalDataServiceRequests) {
            this.status = status;
            this.totalCalculatorRequests = totalCalculatorRequests;
            this.currentConcurrentRequests = currentConcurrentRequests;
            this.totalDataServiceRequests = totalDataServiceRequests;
        }
        
        public String getStatus() { return status; }
        public long getTotalCalculatorRequests() { return totalCalculatorRequests; }
        public long getCurrentConcurrentRequests() { return currentConcurrentRequests; }
        public long getTotalDataServiceRequests() { return totalDataServiceRequests; }
    }
}