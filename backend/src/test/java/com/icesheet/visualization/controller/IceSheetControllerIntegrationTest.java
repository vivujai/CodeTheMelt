package com.icesheet.visualization.controller;

import com.icesheet.visualization.dto.DetailStatistics;
import com.icesheet.visualization.dto.VisualizationStatistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test for IceSheetController with concurrent request handling
 * Requirements: 6.3, 7.5
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class IceSheetControllerIntegrationTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    private String getBaseUrl() {
        return "http://localhost:" + port + "/api/icesheet";
    }
    
    /**
     * Test concurrent requests to detail statistics endpoint
     * Verifies thread safety and proper error handling
     */
    @Test
    void testConcurrentDetailStatisticsRequests() throws Exception {
        int numberOfRequests = 20;
        ExecutorService executor = Executors.newFixedThreadPool(10);
        
        // Create concurrent requests
        CompletableFuture<ResponseEntity<DetailStatistics>>[] futures = 
            IntStream.range(0, numberOfRequests)
                .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                    String iceSheet = (i % 2 == 0) ? "ANTARCTICA" : "GREENLAND";
                    return restTemplate.getForEntity(
                        getBaseUrl() + "/" + iceSheet + "/details", 
                        DetailStatistics.class
                    );
                }, executor))
                .toArray(CompletableFuture[]::new);
        
        // Wait for all requests to complete
        CompletableFuture.allOf(futures).get(30, TimeUnit.SECONDS);
        
        // Verify all requests succeeded
        for (CompletableFuture<ResponseEntity<DetailStatistics>> future : futures) {
            ResponseEntity<DetailStatistics> response = future.get();
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertTrue(response.getBody().getCurrentSize() > 0);
        }
        
        executor.shutdown();
    }
    
    /**
     * Test concurrent requests to visualization statistics endpoint
     * Verifies thread safety and calculation accuracy under load
     */
    @Test
    void testConcurrentVisualizationStatisticsRequests() throws Exception {
        int numberOfRequests = 15;
        ExecutorService executor = Executors.newFixedThreadPool(8);
        
        // Create concurrent requests with different parameters
        CompletableFuture<ResponseEntity<VisualizationStatistics>>[] futures = 
            IntStream.range(0, numberOfRequests)
                .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                    String iceSheet = (i % 2 == 0) ? "ANTARCTICA" : "GREENLAND";
                    String period = (i % 3 == 0) ? "ANNUAL" : (i % 3 == 1) ? "DECADE" : "CENTURY";
                    return restTemplate.getForEntity(
                        getBaseUrl() + "/" + iceSheet + "/visualization?period=" + period, 
                        VisualizationStatistics.class
                    );
                }, executor))
                .toArray(CompletableFuture[]::new);
        
        // Wait for all requests to complete
        CompletableFuture.allOf(futures).get(30, TimeUnit.SECONDS);
        
        // Verify all requests succeeded and have consistent results
        for (int i = 0; i < futures.length; i++) {
            ResponseEntity<VisualizationStatistics> response = futures[i].get();
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            
            VisualizationStatistics stats = response.getBody();
            assertTrue(stats.getInitialSize() > 0);
            assertTrue(stats.getMassLoss() >= 0);
            assertNotNull(stats.getIceSheetName());
            assertNotNull(stats.getPeriod());
            
            // Verify calculation consistency based on ice sheet type
            String expectedIceSheet = (i % 2 == 0) ? "Antarctica" : "Greenland";
            assertEquals(expectedIceSheet, stats.getIceSheetName());
        }
        
        executor.shutdown();
    }
    
    /**
     * Test health endpoint for monitoring concurrent request handling
     */
    @Test
    void testHealthEndpoint() {
        ResponseEntity<IceSheetController.HealthStatus> response = 
            restTemplate.getForEntity(getBaseUrl() + "/health", IceSheetController.HealthStatus.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().getStatus());
        assertTrue(response.getBody().getTotalCalculatorRequests() >= 0);
        assertEquals(0, response.getBody().getCurrentConcurrentRequests()); // Should be 0 when not under load
        assertTrue(response.getBody().getTotalDataServiceRequests() >= 0);
    }
    
    /**
     * Test error handling with invalid parameters under concurrent load
     */
    @Test
    void testConcurrentErrorHandling() throws Exception {
        int numberOfRequests = 10;
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        // Create concurrent requests with invalid parameters
        CompletableFuture<ResponseEntity<String>>[] futures = 
            IntStream.range(0, numberOfRequests)
                .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                    String invalidIceSheet = "INVALID_" + i;
                    return restTemplate.getForEntity(
                        getBaseUrl() + "/" + invalidIceSheet + "/details", 
                        String.class
                    );
                }, executor))
                .toArray(CompletableFuture[]::new);
        
        // Wait for all requests to complete
        CompletableFuture.allOf(futures).get(15, TimeUnit.SECONDS);
        
        // Verify all requests return proper error responses
        for (CompletableFuture<ResponseEntity<String>> future : futures) {
            ResponseEntity<String> response = future.get();
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertTrue(response.getBody().contains("INVALID_ICE_SHEET") || 
                      response.getBody().contains("Invalid ice sheet type"));
        }
        
        executor.shutdown();
    }
    
    /**
     * Test mixed concurrent operations (valid and invalid requests)
     */
    @Test
    void testMixedConcurrentOperations() throws Exception {
        int numberOfRequests = 12;
        ExecutorService executor = Executors.newFixedThreadPool(6);
        
        // Create mixed concurrent requests
        CompletableFuture<ResponseEntity<String>>[] futures = 
            IntStream.range(0, numberOfRequests)
                .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                    if (i % 3 == 0) {
                        // Valid detail request
                        return restTemplate.getForEntity(
                            getBaseUrl() + "/ANTARCTICA/details", 
                            String.class
                        );
                    } else if (i % 3 == 1) {
                        // Valid visualization request
                        return restTemplate.getForEntity(
                            getBaseUrl() + "/GREENLAND/visualization?period=ANNUAL", 
                            String.class
                        );
                    } else {
                        // Invalid request
                        return restTemplate.getForEntity(
                            getBaseUrl() + "/INVALID/details", 
                            String.class
                        );
                    }
                }, executor))
                .toArray(CompletableFuture[]::new);
        
        // Wait for all requests to complete
        CompletableFuture.allOf(futures).get(20, TimeUnit.SECONDS);
        
        // Verify responses based on request type
        for (int i = 0; i < futures.length; i++) {
            ResponseEntity<String> response = futures[i].get();
            
            if (i % 3 == 2) {
                // Invalid requests should return 400
                assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            } else {
                // Valid requests should return 200
                assertEquals(HttpStatus.OK, response.getStatusCode());
            }
            
            assertNotNull(response.getBody());
        }
        
        executor.shutdown();
    }
}