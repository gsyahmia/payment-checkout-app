# PowerShell version of flaky test detector for Windows
# Usage: .\detect-flaky-tests.ps1 -TestFile "generated_test/e2e/checkout-e2e.spec.ts" -Iterations 10

param(
    [string]$TestFile = "tests/generated_test/e2e/checkout-e2e.spec.ts",
    [int]$Iterations = 10
)

$ErrorActionPreference = "Continue"

Write-Host "🔍 Flaky Test Detector" -ForegroundColor Cyan
Write-Host "======================="
Write-Host "Test file: $TestFile"
Write-Host "Iterations: $Iterations"
Write-Host ""

# Create results directory
$ResultsDir = "flaky-test-results"
if (Test-Path $ResultsDir) {
    Remove-Item -Recurse -Force $ResultsDir
}
New-Item -ItemType Directory -Path $ResultsDir | Out-Null

# Track results
$Passed = 0
$Failed = 0

Write-Host "🏃 Running tests $Iterations times..." -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le $Iterations; $i++) {
    Write-Host "Run $i/$Iterations..."
    
    $output = & npx playwright test $TestFile --reporter=json 2>&1
    $output | Out-File "$ResultsDir/run-$i.log"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Passed" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ❌ Failed" -ForegroundColor Red
        $Failed++
    }
}

Write-Host ""
Write-Host "📊 Results Summary" -ForegroundColor Cyan
Write-Host "=================="
Write-Host "Passed: $Passed/$Iterations"
Write-Host "Failed: $Failed/$Iterations"
Write-Host ""

# Calculate flakiness
if ($Failed -gt 0 -and $Failed -lt $Iterations) {
    $Flakiness = [math]::Round(($Failed / $Iterations) * 100, 2)
    Write-Host "⚠️  Test is FLAKY (${Flakiness}% failure rate)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Recommended actions:"
    Write-Host "  1. Review test logs in $ResultsDir/"
    Write-Host "  2. Add explicit waits or improve selectors"
    Write-Host "  3. Check for race conditions"
    Write-Host "  4. Consider network instability"
    exit 1
} elseif ($Failed -eq $Iterations) {
    Write-Host "❌ Test CONSISTENTLY FAILS" -ForegroundColor Red
    Write-Host "   This is a genuine test failure, not flakiness"
    exit 1
} else {
    Write-Host "✅ Test is STABLE (0% failure rate)" -ForegroundColor Green
    Write-Host "   No flakiness detected"
    exit 0
}
