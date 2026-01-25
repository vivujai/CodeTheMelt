# PowerShell script to test all API endpoints
Write-Host "🧪 Testing Ice Sheet Visualization API Connections..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/icesheet"
$tests = @(
    @{ Name = "Health Check"; Url = "$baseUrl/health" },
    @{ Name = "Greenland Details"; Url = "$baseUrl/GREENLAND/details" },
    @{ Name = "Antarctica Details"; Url = "$baseUrl/ANTARCTICA/details" },
    @{ Name = "Greenland Annual"; Url = "$baseUrl/GREENLAND/visualization?period=ANNUAL" },
    @{ Name = "Antarctica Annual"; Url = "$baseUrl/ANTARCTICA/visualization?period=ANNUAL" },
    @{ Name = "Greenland Decade"; Url = "$baseUrl/GREENLAND/visualization?period=DECADE" },
    @{ Name = "Antarctica Century"; Url = "$baseUrl/ANTARCTICA/visualization?period=CENTURY" }
)

$passed = 0
$failed = 0

foreach ($test in $tests) {
    Write-Host "Testing: $($test.Name)..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $test.Url -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ SUCCESS" -ForegroundColor Green
            
            # Parse JSON and show details
            $data = $response.Content | ConvertFrom-Json
            
            if ($test.Name -like "*Details*") {
                Write-Host "   Size: $($data.currentSize.ToString('N0')) km²" -ForegroundColor Gray
                Write-Host "   Temperature: $($data.ambientTemperature)°C" -ForegroundColor Gray
                Write-Host "   Melting Rate: $($data.meltingRate) kg/s" -ForegroundColor Gray
            }
            elseif ($test.Name -like "*Annual*" -or $test.Name -like "*Decade*" -or $test.Name -like "*Century*") {
                $massLoss = [Math]::Abs($data.massLoss)
                Write-Host "   Mass Loss: $($massLoss.ToString('N0')) kg" -ForegroundColor Gray
                Write-Host "   Initial Size: $($data.initialSize.ToString('N0')) km²" -ForegroundColor Gray
                Write-Host "   Period: $($data.period)" -ForegroundColor Gray
            }
            elseif ($test.Name -eq "Health Check") {
                Write-Host "   Status: $($data.status)" -ForegroundColor Gray
                Write-Host "   Total Requests: $($data.totalCalculatorRequests)" -ForegroundColor Gray
            }
            
            $passed++
        }
        else {
            Write-Host " ❌ FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        Write-Host " ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

Write-Host "📊 Test Results:" -ForegroundColor Cyan
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red

$successRate = if (($passed + $failed) -gt 0) { ($passed / ($passed + $failed)) * 100 } else { 0 }
Write-Host "📈 Success Rate: $($successRate.ToString('F1'))%" -ForegroundColor Yellow

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 All API connections are working correctly!" -ForegroundColor Green
    Write-Host "✅ Frontend-Backend integration is ready." -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "⚠️  Some connections failed. Check the backend server." -ForegroundColor Yellow
}