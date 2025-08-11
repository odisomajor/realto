Write-Host "🚀 Starting Xillix Real Estate Platform Deployment to DigitalOcean" -ForegroundColor Green
Write-Host "Server: 146.190.121.74" -ForegroundColor Cyan
Write-Host "Domain: xillix.co.ke" -ForegroundColor Cyan
Write-Host ("=" * 60)

# Check if SSH key exists
$sshKeyPath = ".\key"
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "❌ SSH key not found at: $sshKeyPath" -ForegroundColor Red
    Write-Host "Please ensure the SSH key file exists in the project directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ SSH key found: $sshKeyPath" -ForegroundColor Green

# Set correct permissions for SSH key (Windows equivalent)
try {
    icacls $sshKeyPath /inheritance:r /grant:r "$env:USERNAME:(R)" | Out-Null
    Write-Host "✅ SSH key permissions set correctly" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not set SSH key permissions: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔐 Connecting to DigitalOcean server..." -ForegroundColor Blue

# SSH into the server and run deployment
try {
    Write-Host "Executing SSH command..." -ForegroundColor Blue
    
    $sshCommand = "ssh -i $sshKeyPath -o StrictHostKeyChecking=no root@146.190.121.74 `"echo '🚀 Starting automated deployment...' && curl -sSL https://raw.githubusercontent.com/odisomajor/realto/main/scripts/digitalocean-deploy.sh | bash`""
    
    Invoke-Expression $sshCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Your application should now be available at:" -ForegroundColor Cyan
        Write-Host "   Frontend: https://xillix.co.ke" -ForegroundColor White
        Write-Host "   Backend API: https://xillix.co.ke/api" -ForegroundColor White
        Write-Host "   Admin Panel: https://xillix.co.ke/admin" -ForegroundColor White
        
        Write-Host ""
        Write-Host "📋 Post-deployment verification:" -ForegroundColor Yellow
        Write-Host "   1. Check PM2 processes: pm2 status" -ForegroundColor White
        Write-Host "   2. Check application logs: pm2 logs" -ForegroundColor White
        Write-Host "   3. Check Nginx status: sudo systemctl status nginx" -ForegroundColor White
        Write-Host "   4. Test the application: curl -I https://xillix.co.ke" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Deployment failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please check the server logs for more details." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ SSH connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Verify the SSH key is correct and has proper permissions" -ForegroundColor White
    Write-Host "2. Check if the server IP (146.190.121.74) is accessible" -ForegroundColor White
    Write-Host "3. Ensure the server is running and SSH service is active" -ForegroundColor White
    Write-Host "4. Try connecting manually: ssh -i .\key root@146.190.121.74" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment process completed!" -ForegroundColor Green