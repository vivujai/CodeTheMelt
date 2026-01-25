package com.icesheet.visualization.controller;

import com.icesheet.visualization.dto.DetailStatistics;
import com.icesheet.visualization.dto.ErrorResponse;
import com.icesheet.visualization.dto.VisualizationStatistics;
import com.icesheet.visualization.model.IceSheetType;
import com.icesheet.visualization.model.TimePeriod;
import com.icesheet.visualization.service.IceSheetDataService;
import com.icesheet.visualization.service.StatisticsCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for IceSheetController
 * Tests REST API endpoints and error handling
 */
class IceSheetControllerTest {
    
    @Mock
    private IceSheetDataService dataService;
    
    @Mock
    private StatisticsCalculator statisticsCalculator;
    
    @Mock
    private HttpServletRequest request;
    
    private IceSheetController controller;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new IceSheetController(dataService, statisticsCalculator);
        when(request.getRequestURI()).thenReturn("/api/icesheet/test");
    }
    
    @Test
    void testGetDetailStatistics_ValidInput() {
        // Arrange
        DetailStatistics expectedStats = new DetailStatistics(14000000.0, -26.9982036, -26.9982036);
        when(dataService.getDetailStatistics(IceSheetType.ANTARCTICA)).thenReturn(expectedStats);
        
        // Act
        ResponseEntity<?> response = controller.getDetailStatistics("ANTARCTICA", request);
        
        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof DetailStatistics);
        DetailStatistics actualStats = (DetailStatistics) response.getBody();
        assertEquals(expectedStats.getCurrentSize(), actualStats.getCurrentSize());
    }
    
    @Test
    void testGetDetailStatistics_InvalidIceSheet() {
        // Act
        ResponseEntity<?> response = controller.getDetailStatistics("INVALID", request);
        
        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("INVALID_ICE_SHEET", error.getError());
        assertTrue(error.getMessage().contains("Invalid ice sheet type"));
    }
    
    @Test
    void testGetDetailStatistics_NullInput() {
        // Act
        ResponseEntity<?> response = controller.getDetailStatistics(null, request);
        
        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("INVALID_INPUT", error.getError());
    }
    
    @Test
    void testGetVisualizationStatistics_ValidInput() {
        // Arrange
        VisualizationStatistics expectedStats = new VisualizationStatistics(
            -26.9982036, 851536000.0, 14000000.0, 13148464000.0, "Antarctica", TimePeriod.ANNUAL);
        when(statisticsCalculator.calculateMassLoss(IceSheetType.ANTARCTICA, TimePeriod.ANNUAL))
            .thenReturn(expectedStats);
        
        // Act
        ResponseEntity<?> response = controller.getVisualizationStatistics("ANTARCTICA", "ANNUAL", request);
        
        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof VisualizationStatistics);
        VisualizationStatistics actualStats = (VisualizationStatistics) response.getBody();
        assertEquals(expectedStats.getIceSheetName(), actualStats.getIceSheetName());
        assertEquals(expectedStats.getPeriod(), actualStats.getPeriod());
    }
    
    @Test
    void testGetVisualizationStatistics_InvalidPeriod() {
        // Act
        ResponseEntity<?> response = controller.getVisualizationStatistics("ANTARCTICA", "INVALID", request);
        
        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("INVALID_PARAMETER", error.getError());
        assertTrue(error.getMessage().contains("Invalid time period"));
    }
    
    @Test
    void testGetVisualizationStatistics_NullPeriod() {
        // Act
        ResponseEntity<?> response = controller.getVisualizationStatistics("ANTARCTICA", null, request);
        
        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof ErrorResponse);
        ErrorResponse error = (ErrorResponse) response.getBody();
        assertEquals("INVALID_INPUT", error.getError());
        assertTrue(error.getMessage().contains("Period parameter cannot be null"));
    }
}