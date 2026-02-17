# ============================================
# CropClient Server Setup - ONE TIME ONLY
# Run this on the server via PowerShell (as Administrator)
# ============================================

Write-Host "============================" -ForegroundColor Cyan
Write-Host "CropClient Server Setup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# --- 1. Enable OpenSSH Server ---
Write-Host "`n[1/6] Enabling OpenSSH Server..." -ForegroundColor Yellow
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
Write-Host "OpenSSH Server enabled and set to auto-start." -ForegroundColor Green

# --- 2. Open SSH port in firewall ---
Write-Host "`n[2/6] Opening SSH port 22 in firewall..." -ForegroundColor Yellow
$existing = Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue
if (-not $existing) {
    New-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -DisplayName "OpenSSH Server (sshd)" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
    Write-Host "Firewall rule created." -ForegroundColor Green
} else {
    Write-Host "Firewall rule already exists." -ForegroundColor Green
}

# --- 3. Clone the repo ---
Write-Host "`n[3/6] Cloning repo from GitHub..." -ForegroundColor Yellow
$targetPath = "C:\AICode\Crop-Client-Services"
if (Test-Path $targetPath) {
    Write-Host "Repo already exists at $targetPath - skipping clone." -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path "C:\AICode" -Force | Out-Null
    git clone https://github.com/sspappasjr/Crop-Client-Services.git $targetPath
    Write-Host "Repo cloned to $targetPath" -ForegroundColor Green
}

# --- 4. Install npm dependencies ---
Write-Host "`n[4/6] Installing npm dependencies..." -ForegroundColor Yellow
Set-Location $targetPath
npm install
Set-Location "$targetPath\api-server"
npm install
Set-Location $targetPath
Write-Host "Dependencies installed." -ForegroundColor Green

# --- 5. Open port 3101 in firewall ---
Write-Host "`n[5/6] Opening port 3101 in firewall..." -ForegroundColor Yellow
$existing3101 = Get-NetFirewallRule -Name "CropClient-API-3101" -ErrorAction SilentlyContinue
if (-not $existing3101) {
    New-NetFirewallRule -Name "CropClient-API-3101" -DisplayName "CropClient API Server (3101)" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 3101
    Write-Host "Firewall rule for port 3101 created." -ForegroundColor Green
} else {
    Write-Host "Firewall rule for port 3101 already exists." -ForegroundColor Green
}

# --- 6. Start the API server ---
Write-Host "`n[6/6] Starting API server..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "api-server\APIServer1.2.js" -WorkingDirectory $targetPath -WindowStyle Hidden
Start-Sleep -Seconds 5

# --- Verify ---
Write-Host "`n============================" -ForegroundColor Cyan
Write-Host "Verifying..." -ForegroundColor Cyan
try {
    $ping = Invoke-RestMethod -Uri "http://localhost:3101/ping" -TimeoutSec 10
    Write-Host "PING OK: $($ping | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "PING FAILED - server may need a moment to start" -ForegroundColor Red
}

Write-Host "`n============================" -ForegroundColor Cyan
Write-Host "Your new API tools are ready." -ForegroundColor Green
Write-Host "Server: http://localhost:3101" -ForegroundColor Green
Write-Host "SSH: Enabled on port 22" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Cyan
