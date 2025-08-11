# =============================================================================
# XILLIX PRODUCTION SERVER CONNECTION SCRIPT (PowerShell)
# =============================================================================
# This script connects to the DigitalOcean production server
# Server IP: 146.190.121.74
# Domain: xillix.co.ke
# =============================================================================

# Server configuration
$SERVER_IP = "146.190.121.74"
$SERVER_USER = "root"
$SSH_KEY_PATH = ".\new_key"
$DOMAIN = "xillix.co.ke"

Write-Host "==============================================================================" -ForegroundColor Blue
Write-Host "CONNECTING TO XILLIX PRODUCTION SERVER" -ForegroundColor Blue
Write-Host "==============================================================================" -ForegroundColor Blue
Write-Host "Server IP: $SERVER_IP" -ForegroundColor Yellow
Write-Host "Domain: $DOMAIN" -ForegroundColor Yellow
Write-Host "User: $SERVER_USER" -ForegroundColor Yellow
Write-Host "SSH Key: $SSH_KEY_PATH" -ForegroundColor Yellow
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY_PATH)) {
    Write-Host "ERROR: SSH key not found at: $SSH_KEY_PATH" -ForegroundColor Red
    Write-Host "Please ensure the SSH key is in the project root directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Connecting to server..." -ForegroundColor Green
Write-Host ""

# Connect to server using ssh command
& ssh -i $SSH_KEY_PATH "$SERVER_USER@$SERVER_IP"

Write-Host ""
Write-Host "Connection closed" -ForegroundColor Green