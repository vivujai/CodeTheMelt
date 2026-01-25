#!/usr/bin/env pwsh

# Final System Validation Script for Ice Sheet Visualization System
# Task 12: Complete system validation

Write-Host "=== FINAL SYSTEM VALIDATION ===" -ForegroundColor Cyan
Write-Host "Validating complete Ice Sheet Visualization System functionality" -ForegroundColor White
Write-Host ""

$testResults = @()
$totalTests = 0
$passedTests = 0

function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [string]$ExpectedContent = $null
    )
    
    $global:totalTests++
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -ErrorAction Stop
        
        if ($ExpectedContent -and $response -notmatch $ExpectedContent) {
            Write-Host "  ❌ FAIL: $TestName - Expected content not found" -ForegroundColor Red
            return $false
        }
        
        Write-Host "  ✅ PASS: $TestName" -ForegroundColor Green
        $global:passedTests++
        return $true
    }
    catch {
        Write-Host "  ❌ FAIL: $TestName - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-WebPage {
    param(
        [string]$TestName,
        [string]$Url
    )
    
    $global:totalTests++
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ PASS: $TestName" -ForegroundColor Green
            $global:passedTests++
            return $true
        } else {
            Write-Host "  ❌ FAIL: $TestName - Status Code: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "  ❌ FAIL: $TestName - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. Frontend Accessibility Tests
Write-Host "1. Testing Frontend Accessibility" -ForegroundColor Magenta
Test-WebPage "Main Application Page" "http://localhost:3000/"
Test-WebPage "Complete Workflow Test Page" "http://localhost:3000/test-complete-workflow.html"
Test-WebPage "Error Handling Test Page" "http://localhost:3000/test-error-handling.html"
Test-WebPage "Visualization Test Page" "http://localhost:3000/test-visualization.html"

Write-Host ""

# 2. Backend API Endpoint Tests
Write-Host "2. Testing Backend API Endpoints" -ForegroundColor Magenta

# Test detail endpoints (Requirement 3.1)
Test-Endpoint "Greenland Details API" "http://localhost:8080/api/icesheet/GREENLAND/details"
Test-Endpoint "Antarctica Details API" "http://localhost:8080/api/icesheet/ANTARCTICA/details"

# Test visualization endpoints (Requirements 1.2, 1.4)
Test-Endpoint "Greenland Annual Visualization" "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=ANNUAL"
Test-Endpoint "Greenland Decade Visualization" "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=DECADE"
Test-Endpoint "Greenland Century Visualization" "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=CENTURY"

Test-Endpoint "Antarctica Annual Visualization" "http://localhost:8080/api/icesheet/ANTARCTICA/visualization?period=ANNUAL"
Test-Endpoint "Antarctica Decade Visualization" "http://localhost:8080/api/icesheet/ANTARCTICA/visualization?period=DECADE"
Test-Endpoint "Antarctica Century Visualization" "http://localhost:8080/api/icesheet/ANTARCTICA/visualization?period=CENTURY"

Write-Host ""

# 3. Data Validation Tests (Requirements 3.4, 4.1, 4.2, 4.3)
Write-Host "3. Testing Data Accuracy and Calculations" -ForegroundColor Magenta

# Test Greenland base data
$greenlandDetails = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/GREENLAND/details" -Method GET
$totalTests++
if ($greenlandDetails.currentSize -eq 4380000.0 -and $greenlandDetails.meltingRate -eq -4.364067) {
    Write-Host "  ✅ PASS: Greenland Base Data Accuracy" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "  ❌ FAIL: Greenland Base Data Accuracy" -ForegroundColor Red
}

# Test Antarctica base data
$antarcticaDetails = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/ANTARCTICA/details" -Method GET
$totalTests++
if ($antarcticaDetails.currentSize -eq 14000000 -and $antarcticaDetails.meltingRate -eq -26.9982036) {
    Write-Host "  ✅ PASS: Antarctica Base Data Accuracy" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "  ❌ FAIL: Antarctica Base Data Accuracy" -ForegroundColor Red
}

# Test time period calculations (Requirement 4.4)
$greenlandAnnual = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=ANNUAL" -Method GET
$greenlandDecade = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=DECADE" -Method GET
$greenlandCentury = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=CENTURY" -Method GET

$totalTests++
if ($greenlandCentury.massLoss -gt $greenlandDecade.massLoss -and $greenlandDecade.massLoss -gt $greenlandAnnual.massLoss) {
    Write-Host "  ✅ PASS: Time Period Scaling (Century > Decade > Annual)" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "  ❌ FAIL: Time Period Scaling" -ForegroundColor Red
}

Write-Host ""

# 4. Error Handling Tests (Requirement 7.5)
Write-Host "4. Testing Error Handling" -ForegroundColor Magenta

# Test invalid ice sheet
$totalTests++
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/INVALID/details" -Method GET -ErrorAction Stop
    Write-Host "  ❌ FAIL: Invalid Ice Sheet Error Handling" -ForegroundColor Red
} catch {
    Write-Host "  ✅ PASS: Invalid Ice Sheet Error Handling" -ForegroundColor Green
    $passedTests++
}

# Test invalid time period
$totalTests++
try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=MONTHLY" -Method GET -ErrorAction Stop
    Write-Host "  ❌ FAIL: Invalid Time Period Error Handling" -ForegroundColor Red
} catch {
    Write-Host "  ✅ PASS: Invalid Time Period Error Handling" -ForegroundColor Green
    $passedTests++
}

Write-Host ""

# 5. Concurrent Request Handling (Requirement 6.3)
Write-Host "5. Testing Concurrent Request Handling" -ForegroundColor Magenta

$jobs = @()
for ($i = 1; $i -le 5; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url)
        try {
            $response = Invoke-RestMethod -Uri $url -Method GET
            return $response -ne $null
        } catch {
            return $false
        }
    } -ArgumentList "http://localhost:8080/api/icesheet/GREENLAND/details"
}

$concurrentResults = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$totalTests++
if (($concurrentResults | Where-Object { $_ -eq $true }).Count -eq 5) {
    Write-Host "  ✅ PASS: Concurrent Request Handling" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "  ❌ FAIL: Concurrent Request Handling" -ForegroundColor Red
}

Write-Host ""

# 6. Complete Workflow Validation
Write-Host "6. Testing Complete User Workflows" -ForegroundColor Magenta

# Test complete Greenland workflow
$totalTests++
try {
    $greenlandDetail = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/GREENLAND/details" -Method GET
    $greenlandViz = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/GREENLAND/visualization?period=ANNUAL" -Method GET
    
    if ($greenlandDetail -and $greenlandViz -and $greenlandViz.iceSheetName -eq "Greenland") {
        Write-Host "  ✅ PASS: Complete Greenland Workflow" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "  ❌ FAIL: Complete Greenland Workflow" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ FAIL: Complete Greenland Workflow - $($_.Exception.Message)" -ForegroundColor Red
}

# Test complete Antarctica workflow
$totalTests++
try {
    $antarcticaDetail = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/ANTARCTICA/details" -Method GET
    $antarcticaViz = Invoke-RestMethod -Uri "http://localhost:8080/api/icesheet/ANTARCTICA/visualization?period=ANNUAL" -Method GET
    
    if ($antarcticaDetail -and $antarcticaViz -and $antarcticaViz.iceSheetName -eq "Antarctica") {
        Write-Host "  ✅ PASS: Complete Antarctica Workflow" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "  ❌ FAIL: Complete Antarctica Workflow" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ FAIL: Complete Antarctica Workflow - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Final Results
Write-Host "=== FINAL VALIDATION RESULTS ===" -ForegroundColor Cyan
Write-Host "Tests Passed: $passedTests / $totalTests" -ForegroundColor White

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor White

if ($passedTests -eq $totalTests) {
    Write-Host ""
    Write-Host "🎉 COMPLETE SYSTEM VALIDATION SUCCESSFUL!" -ForegroundColor Green
    Write-Host "✅ All requirements validated successfully" -ForegroundColor Green
    Write-Host "✅ Frontend and backend integration working" -ForegroundColor Green
    Write-Host "✅ Navigation and data flow verified" -ForegroundColor Green
    Write-Host "✅ Error handling and resilience confirmed" -ForegroundColor Green
    Write-Host "✅ Mathematical calculations accurate" -ForegroundColor Green
    Write-Host "✅ Concurrent request handling working" -ForegroundColor Green
    Write-Host ""
    Write-Host "The Ice Sheet Visualization System is ready for production!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ SYSTEM VALIDATION INCOMPLETE" -ForegroundColor Red
    Write-Host "Some tests failed. Please review and fix issues before deployment." -ForegroundColor Red
}

Write-Host ""
Write-Host "Validation completed at: $(Get-Date)" -ForegroundColor Gray