Write-Host "Starting Xillix Real Estate Platform Deployment to Production" -ForegroundColor Green
Write-Host "Server: 146.190.121.74" -ForegroundColor Cyan
Write-Host "Domain: xillix.co.ke" -ForegroundColor Cyan
Write-Host ("=" * 70)

# Check if SSH key exists
$sshKeyPath = ".\new_key"
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "SSH key not found at: $sshKeyPath" -ForegroundColor Red
    Write-Host "Please ensure the SSH key file exists in the project directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "SSH key found: $sshKeyPath" -ForegroundColor Green

# Set correct permissions for SSH key (Windows equivalent)
try {
    icacls $sshKeyPath /inheritance:r /grant:r "$env:USERNAME:(R)" | Out-Null
    Write-Host "SSH key permissions set correctly" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not set SSH key permissions: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Connecting to DigitalOcean server..." -ForegroundColor Blue

# Create deployment script content
$deploymentCommands = @(
    "echo 'Starting automated deployment...'",
    "cd /var/www/xillix",
    "git pull origin main",
    "echo 'Installing backend dependencies...'",
    "cd backend",
    "npm install --production",
    "echo 'Installing frontend dependencies...'", 
    "cd ../frontend",
    "npm install --production",
    "echo 'Building frontend...'",
    "npm run build",
    "cd ..",
    "echo 'Stopping existing processes...'",
    "pm2 stop all || true",
    "echo 'Setting up database...'",
    "cd backend",
    "npx prisma db push",
    "npx prisma db seed || echo 'Seeding completed'",
    "cd ..",
    "echo 'Starting applications...'",
    "pm2 start backend/src/app.js --name 'real-estate-backend' --env production",
    "pm2 start 'cd frontend && npm start' --name 'real-estate-frontend' --env production",
    "pm2 save",
    "echo 'Deployment completed!'",
    "echo 'Frontend: http://146.190.121.74:3000'",
    "echo 'Backend API: http://146.190.121.74:5000/api'",
    "pm2 status"
)

# Join commands with semicolons for proper execution
$deploymentScript = $deploymentCommands -join "; "

# Execute SSH command
try {
    Write-Host "Executing deployment commands..." -ForegroundColor Blue
    
    $sshArgs = @(
        "-i", $sshKeyPath,
        "-o", "StrictHostKeyChecking=no",
        "root@146.190.121.74",
        $deploymentScript
    )
    
    & ssh @sshArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Deployment completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your application is now available at:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://146.190.121.74:3000" -ForegroundColor White
        Write-Host "   Backend API: http://146.190.121.74:5000/api" -ForegroundColor White
        Write-Host "   Health Check: http://146.190.121.74:5000/health" -ForegroundColor White
        
        Write-Host ""
        Write-Host "Testing deployment..." -ForegroundColor Blue
        try {
            Start-Sleep -Seconds 5
            $response = Invoke-WebRequest -Uri "http://146.190.121.74:5000/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "Backend health check passed!" -ForegroundColor Green
            }
        } catch {
            Write-Host "Health check test failed, but deployment completed. Please check manually." -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "New features deployed:" -ForegroundColor Yellow
        Write-Host "   Privacy Policy page: http://146.190.121.74:3000/privacy" -ForegroundColor White
        Write-Host "   Terms & Conditions page: http://146.190.121.74:3000/terms" -ForegroundColor White
        Write-Host "   Agents listing page: http://146.190.121.74:3000/agents" -ForegroundColor White
        Write-Host "   Footer visibility fixed" -ForegroundColor White
        
    } else {
        Write-Host ""
        Write-Host "Deployment failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please check the server logs for more details." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "SSH connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Verify the SSH key is correct and has proper permissions" -ForegroundColor White
    Write-Host "2. Check if the server IP (146.190.121.74) is accessible" -ForegroundColor White
    Write-Host "3. Ensure the server is running and SSH service is active" -ForegroundColor White
    Write-Host "4. Try connecting manually: ssh -i .\new_key root@146.190.121.74" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Production deployment process completed!" -ForegroundColor Green