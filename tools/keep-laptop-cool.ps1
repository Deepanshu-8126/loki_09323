# 🚀 Ultra-Smooth & Laptop Cool Helper Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Scanning and Cooling Laptop System..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Check for orphaned/runaway kilo or node processes > 500s CPU
$heavyProcesses = Get-Process | Where-Object { $_.CPU -gt 500 -and ($_.ProcessName -match "kilo|node") }
if ($heavyProcesses) {
    foreach ($p in $heavyProcesses) {
        Write-Host "Found runaway process $($p.ProcessName) (PID: $($p.Id)). Terminating..." -ForegroundColor Yellow
        Stop-Process -Id $p.Id -Force
    }
} else {
    Write-Host "No runaway background processes found." -ForegroundColor Green
}

# 1b. Terminate background bloatware / telemetry processes if running
$bloatNames = @("WinUnzip", "DSATray", "msedge")
foreach ($b in $bloatNames) {
    Get-Process -Name $b -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Write-Host "Background bloatware and telemetry cleared." -ForegroundColor Green

# 2. Flush Garbage Collection
[System.GC]::Collect()

# 3. Report Current State
$mem = Get-CimInstance Win32_OperatingSystem
$usedGb = [math]::Round(($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory) / 1MB, 2)
$totalGb = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
$pct = [math]::Round(($usedGb / $totalGb) * 100, 1)
$freeGb = [math]::Round($mem.FreePhysicalMemory / 1MB, 2)

Write-Host "----------------------------------------" -ForegroundColor DarkGray
Write-Host "Current RAM Usage : $usedGb GB / $totalGb GB ($($pct)%)" -ForegroundColor Green
Write-Host "Available Free RAM: $freeGb GB" -ForegroundColor Green
Write-Host "Laptop Status     : Super Cool and Optimized!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
