# 功能完整性快速测试脚本（英文输出避免乱码）
# 使用方法: .\test-core-functions.ps1

# 强制控制台使用 UTF-8，避免乱码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:3001"
$testResults = @()

function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null
    )
    
    Write-Host "`nTest: $Name" -ForegroundColor Cyan
    Write-Host "Request: $Method $Url" -ForegroundColor Gray
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Method Get -Uri $Url -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Method Post -Uri $Url -Body ($Body | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        }
        
        $success = $response.success -ne $false
        if ($success) {
            Write-Host "✓ Passed" -ForegroundColor Green
            $script:testResults += [PSCustomObject]@{
                Name = $Name
                Status = "Passed"
                Details = "OK"
            }
        } else {
            Write-Host "✗ Failed: $($response.message)" -ForegroundColor Red
            $script:testResults += [PSCustomObject]@{
                Name = $Name
                Status = "Failed"
                Details = $response.message
            }
        }
    } catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += [PSCustomObject]@{
            Name = $Name
            Status = "Error"
            Details = $_.Exception.Message
        }
    }
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Quick Functional Test" -ForegroundColor Yellow
Write-Host "Backend: $baseUrl" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# 1. 标准服务测试
Write-Host "`n[1] Standard Service Tests" -ForegroundColor Magenta

Test-Api -Name "Standard Search" -Method "GET" -Url "$baseUrl/api/standards/search?standardType=MIL&page=1&limit=20&category=MIL-STD"

Test-Api -Name "Standard Categories" -Method "GET" -Url "$baseUrl/api/standards/categories?standardType=MIL"

Test-Api -Name "Standard Statistics" -Method "GET" -Url "$baseUrl/api/standards/statistics"

# 2. Standard Attachments
Write-Host "`n[2] Standard Attachment Tests" -ForegroundColor Magenta

Test-Api -Name "Standard Attachment (MIL-STD-883H)" -Method "GET" -Url "$baseUrl/api/standards/MIL-STD-883H/attachment"

# 3. Import Component Search
Write-Host "`n[3] Import Component Search Tests" -ForegroundColor Magenta

Test-Api -Name "Import Search" -Method "GET" -Url "$baseUrl/api/doeeet/search?page=1`&limit=20"

Test-Api -Name "Import Categories" -Method "GET" -Url "$baseUrl/api/doeeet/categories/tree"

Test-Api -Name "Manufacturers" -Method "GET" -Url "$baseUrl/api/doeeet/manufacturers"

Test-Api -Name "Import Statistics" -Method "GET" -Url "$baseUrl/api/doeeet/statistics"

# 4. Domestic Component Search
Write-Host "`n[4] Domestic Component Search Tests" -ForegroundColor Magenta

Test-Api -Name "Domestic Search" -Method "GET" -Url "$baseUrl/api/domestic/search?page=1`&limit=10"

Test-Api -Name "Domestic Categories" -Method "GET" -Url "$baseUrl/api/domestic/categories/tree"

# 5. Domestic Attachments
Write-Host "`n[5] Domestic Attachment Tests" -ForegroundColor Magenta

# Note: Need a valid material_code; uncomment and replace with a real code
# Test-Api -Name "Domestic Attachment (sample)" -Method "GET" -Url "$baseUrl/api/domestic/attachments/WVM14N10S6R"

# 6. Component Compare (needs real IDs)
Write-Host "`n[6] Component Compare (manual IDs needed)" -ForegroundColor Magenta
# Test-Api -Name "Import Compare" -Method "POST" -Url "$baseUrl/api/doeeet/components/compare" -Body @{ componentIds = @("id1", "id2") }

# 7. Health Check
Write-Host "`n[7] Health Check" -ForegroundColor Magenta

Test-Api -Name "Health" -Method "GET" -Url "$baseUrl/health"

# 输出测试结果汇总
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Results" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$passed = ($testResults | Where-Object { $_.Status -eq "Passed" }).Count
$failed = ($testResults | Where-Object { $_.Status -ne "Passed" }).Count
$total = $testResults.Count

Write-Host "`nTotal: $total tests" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host "`nFailed tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -ne "通过" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Details)" -ForegroundColor Red
    }
}

Write-Host "`nDetail:" -ForegroundColor Cyan
$testResults | Format-Table -AutoSize

if ($failed -eq 0) {
    Write-Host "`n✓ All tests passed. Ready to build." -ForegroundColor Green
} else {
    Write-Host "`n✗ Some tests failed. Please fix before build." -ForegroundColor Red
}

