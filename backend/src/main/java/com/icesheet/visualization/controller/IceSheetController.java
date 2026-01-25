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

import javax.servlet.http.HttpServletRequest;

/**
 * REST API Controller for ice sheet data and statistics
 * Requirements: 6.2, 6.5, 7.1, 7.5
 */
@RestController
@RequestMapping("/api/icesheet")
@CrossOrigin(origins = "*") // Allow frontend access
public class IceSheetController {
    
    private final IceSheetDataService dataService;
    private final StatisticsCalculator statisticsCalculator;
    
    @Autowired
    public IceSheetController(IceSheetDataService dataService, StatisticsCalculator statisticsCalculator) {
        this.dataService = dataService;
        this.statisticsCalculator = statisticsCalculator;
    }
    
    /**
     * Get detail statistics for an ice sheet
     * Requirements: 6.2, 6.5, 7.1, 7.5
     * 
     * @param iceSheet The ice sheet type (GREENLAND or ANTARCTICA)
     * @param request HTTP request for error path information
     * @return DetailStatistics containing current size, ambient temperature, and melting rate
     */
    @GetMapping("/{iceSheet}/details")
    public ResponseEntity<?> getDetailStatistics(@PathVariable String iceSheet, HttpServletRequest request) {
        // Input validation - Requirements: 6.5
        if (iceSheet == null || iceSheet.trim().isEmpty()) {
            ErrorResponse error = new ErrorResponse(
                "INVALID_INPUT", 
                "Ice sheet parameter cannot be null or empty. Valid values: GREENLAND, ANTARCTICA", 
                request.getRequestURI()
            );
            return ResponseEntity.badRequest().body(error);
        }
        
        try {
            IceSheetType iceSheetType = IceSheetType.valueOf(iceSheet.toUpperCase());
            DetailStatistics statistics = dataService.getDetailStatistics(iceSheetType);
            return ResponseEntity.ok(statistics);
        } catch (IllegalArgumentException e) {
            // Error handling - Requirements: 7.5
            ErrorResponse error = new ErrorResponse(
                "INVALID_ICE_SHEET", 
                String.format("Invalid ice sheet type: '%s'. Valid values: GREENLAND, ANTARCTICA", iceSheet), 
                request.getRequestURI()
            );
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            // General error handling - Requirements: 7.5
            ErrorResponse error = new ErrorResponse(
                "INTERNAL_ERROR", 
                "An unexpected error occurred while processing the request", 
                request.getRequestURI()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get visualization statistics for an ice sheet over a time period
     * Requirements: 6.2, 6.5, 7.1, 7.5
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
        
        try {
            IceSheetType iceSheetType = IceSheetType.valueOf(iceSheet.toUpperCase());
            TimePeriod timePeriod = TimePeriod.valueOf(period.toUpperCase());
            
            VisualizationStatistics statistics = statisticsCalculator.calculateMassLoss(iceSheetType, timePeriod);
            return ResponseEntity.ok(statistics);
        } catch (IllegalArgumentException e) {
            // Error handling - Requirements: 7.5
            String errorMessage;
            if (e.getMessage().contains("IceSheetType")) {
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
        } catch (Exception e) {
            // General error handling - Requirements: 7.5
            ErrorResponse error = new ErrorResponse(
                "INTERNAL_ERROR", 
                "An unexpected error occurred while processing the request", 
                request.getRequestURI()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}