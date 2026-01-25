package com.icesheet.visualization.service;

import com.icesheet.visualization.dto.DetailStatistics;
import com.icesheet.visualization.dto.VisualizationStatistics;
import com.icesheet.visualization.model.IceSheetType;
import com.icesheet.visualization.model.TimePeriod;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.RepeatedTest;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for verifying thread safety and concurrent request handling
 * Requirements: 6.3, 7.5
 */
@SpringBootTest
public class ConcurrentRequestTest {
    
    private StatisticsCalculator statisticsCalculator;
    private IceSheetDataService dataService;
    
    @BeforeEach
    void setUp() {
        statisticsCalculator = new StatisticsCalculator();
        dataService = new IceSheetDataService();
    }
    
    /**
     * Test concurrent access to StatisticsCalculator
     * Verifies that multiple threads can safely calculate statistics simultaneously
     */
    @Test
    void testConcurrentStatisticsCalculation() throws InterruptedException {
        int numberOfThreads = 10;
        int requestsPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);
        List<Exception> exceptions = new CopyOnWriteArrayList<>();
        
        // Submit concurrent calculation tasks
        for (int i = 0; i < numberOfThreads; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < requestsPerThread; j++) {
                        IceSheetType iceSheet = (j % 2 == 0) ? IceSheetType.ANTARCTICA : IceSheetType.GREENLAND;
                        TimePeriod period = TimePeriod.values()[j % TimePeriod.values().length];
                        
                        VisualizationStatistics result = statisticsCalculator.calculateMassLoss(iceSheet, period);
                        
                        // Verify result is not null and has expected values
                        assertNotNull(result, "Result should not be null");
                        assertTrue(result.getInitialSize() > 0, "Initial size should be positive");
                        assertTrue(result.getMassLoss() >= 0, "Mass loss should be non-negative");
                        assertNotNull(result.getIceSheetName(), "Ice sheet name should not be null");
                        
                        successCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    exceptions.add(e);
                    errorCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }
        
        // Wait for all threads to complete
        assertTrue(latch.await(30, TimeUnit.SECONDS), "All threads should complete within 30 seconds");
        executor.shutdown();
        
        // Verify results
        int expectedSuccesses = numberOfThreads * requestsPerThread;
        assertEquals(expectedSuccesses, successCount.get(), 
                    "All requests should succeed. Errors: " + errorCount.get() + 
                    ", Exceptions: " + exceptions.size());
        assertEquals(0, errorCount.get(), "No errors should occur during concurrent access");
        
        if (!exceptions.isEmpty()) {
            fail("Exceptions occurred during concurrent testing: " + exceptions.get(0).getMessage());
        }
        
        // Verify request counters
        long[] stats = statisticsCalculator.getRequestStatistics();
        assertEquals(expectedSuccesses, stats[0], "Request counter should match total requests");
        assertEquals(0, stats[1], "Concurrent counter should be zero after completion");
    }
    
    /**
     * Test concurrent access to IceSheetDataService
     * Verifies that multiple threads can safely retrieve data simultaneously
     */
    @Test
    void testConcurrentDataServiceAccess() throws InterruptedException {
        int numberOfThreads = 8;
        int requestsPerThread = 50;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger successCount = new AtomicInteger(0);
        List<Exception> exceptions = new CopyOnWriteArrayList<>();
        
        for (int i = 0; i < numberOfThreads; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < requestsPerThread; j++) {
                        IceSheetType iceSheet = (j % 2 == 0) ? IceSheetType.ANTARCTICA : IceSheetType.GREENLAND;
                        
                        DetailStatistics result = dataService.getDetailStatistics(iceSheet);
                        
                        // Verify result consistency
                        assertNotNull(result, "Result should not be null");
                        assertTrue(result.getCurrentSize() > 0, "Current size should be positive");
                        assertNotNull(result.getAmbientTemperature(), "Ambient temperature should not be null");
                        assertNotNull(result.getMeltingRate(), "Melting rate should not be null");
                        
                        // Verify expected values for each ice sheet
                        if (iceSheet == IceSheetType.ANTARCTICA) {
                            assertEquals(14_000_000.0, result.getCurrentSize(), 0.1, 
                                       "Antarctica size should be correct");
                        } else {
                            assertEquals(4_380_000.0, result.getCurrentSize(), 0.1, 
                                       "Greenland size should be correct");
                        }
                        
                        successCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    exceptions.add(e);
                } finally {
                    latch.countDown();
                }
            });
        }
        
        assertTrue(latch.await(20, TimeUnit.SECONDS), "All threads should complete within 20 seconds");
        executor.shutdown();
        
        int expectedSuccesses = numberOfThreads * requestsPerThread;
        assertEquals(expectedSuccesses, successCount.get(), "All requests should succeed");
        
        if (!exceptions.isEmpty()) {
            fail("Exceptions occurred during concurrent data service testing: " + exceptions.get(0).getMessage());
        }
        
        // Verify request counter (account for internal calls)
        long requestCount = dataService.getRequestCount();
        // Each getDetailStatistics call also calls getBaseData internally, so we expect 2x the requests
        assertEquals(expectedSuccesses * 2, requestCount, "Data service request counter should account for internal calls");
    }
    
    /**
     * Test mixed concurrent operations
     * Verifies that both services can handle concurrent mixed operations
     */
    @RepeatedTest(3)
    void testMixedConcurrentOperations() throws InterruptedException {
        int numberOfThreads = 6;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger totalOperations = new AtomicInteger(0);
        List<Exception> exceptions = new CopyOnWriteArrayList<>();
        
        for (int i = 0; i < numberOfThreads; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < 20; j++) {
                        IceSheetType iceSheet = (threadId % 2 == 0) ? IceSheetType.ANTARCTICA : IceSheetType.GREENLAND;
                        
                        if (j % 2 == 0) {
                            // Test data service
                            DetailStatistics detailStats = dataService.getDetailStatistics(iceSheet);
                            assertNotNull(detailStats);
                        } else {
                            // Test statistics calculator
                            TimePeriod period = TimePeriod.values()[j % TimePeriod.values().length];
                            VisualizationStatistics vizStats = statisticsCalculator.calculateMassLoss(iceSheet, period);
                            assertNotNull(vizStats);
                        }
                        
                        totalOperations.incrementAndGet();
                        
                        // Add small random delay to increase chance of concurrent access
                        Thread.sleep((long) (Math.random() * 5));
                    }
                } catch (Exception e) {
                    exceptions.add(e);
                } finally {
                    latch.countDown();
                }
            });
        }
        
        assertTrue(latch.await(15, TimeUnit.SECONDS), "All mixed operations should complete");
        executor.shutdown();
        
        int expectedOperations = numberOfThreads * 20;
        assertEquals(expectedOperations, totalOperations.get(), "All mixed operations should succeed");
        
        if (!exceptions.isEmpty()) {
            fail("Exceptions occurred during mixed concurrent operations: " + exceptions.get(0).getMessage());
        }
    }
    
    /**
     * Test error handling under concurrent access
     * Verifies that error conditions are handled properly during concurrent access
     */
    @Test
    void testConcurrentErrorHandling() throws InterruptedException {
        int numberOfThreads = 4;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger expectedErrors = new AtomicInteger(0);
        AtomicInteger actualErrors = new AtomicInteger(0);
        
        for (int i = 0; i < numberOfThreads; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < 10; j++) {
                        try {
                            // Test with null parameters (should throw IllegalArgumentException)
                            statisticsCalculator.calculateMassLoss(null, TimePeriod.ANNUAL);
                            fail("Should have thrown IllegalArgumentException for null ice sheet");
                        } catch (IllegalArgumentException e) {
                            expectedErrors.incrementAndGet();
                            actualErrors.incrementAndGet();
                        }
                        
                        try {
                            // Test with null time period
                            statisticsCalculator.calculateMassLoss(IceSheetType.ANTARCTICA, null);
                            fail("Should have thrown IllegalArgumentException for null period");
                        } catch (IllegalArgumentException e) {
                            expectedErrors.incrementAndGet();
                            actualErrors.incrementAndGet();
                        }
                        
                        try {
                            // Test data service with null parameter
                            dataService.getDetailStatistics(null);
                            fail("Should have thrown IllegalArgumentException for null ice sheet");
                        } catch (IllegalArgumentException e) {
                            expectedErrors.incrementAndGet();
                            actualErrors.incrementAndGet();
                        }
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        assertTrue(latch.await(10, TimeUnit.SECONDS), "All error handling tests should complete");
        executor.shutdown();
        
        int expectedErrorCount = numberOfThreads * 10 * 3; // 3 error cases per iteration
        assertEquals(expectedErrorCount, expectedErrors.get(), "Expected number of errors should occur");
        assertEquals(expectedErrorCount, actualErrors.get(), "All errors should be properly caught");
    }
}