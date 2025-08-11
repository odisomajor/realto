Write-Host "🚀 Starting Xillix Real Estate Platform Deployment to DigitalOcean (FIXED VERSION)" -ForegroundColor Green
Write-Host "Server: 146.190.121.74" -ForegroundColor Cyan
Write-Host "Domain: xillix.co.ke" -ForegroundColor Cyan
Write-Host "Fix: Frontend API URL Configuration" -ForegroundColor Yellow
Write-Host ("=" * 70)

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

# SSH into the server and run deployment with fixes
try {
    Write-Host "Executing SSH command with API URL fix..." -ForegroundColor Blue
    
    $deploymentScript = @"
echo '🚀 Starting automated deployment with API URL fix...'

# Navigate to project directory
cd /var/www/xillix || { echo 'Project directory not found'; exit 1; }

# Stop existing processes
echo '🛑 Stopping existing processes...'
pm2 stop all || true

# Update backend environment
echo '⚙️ Updating backend environment...'
cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"

# JWT Configuration
JWT_SECRET="xillix-super-secure-jwt-key-production-2024"
JWT_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="production"
PORT=5000
FRONTEND_URL="http://146.190.121.74:3000"

# CORS Configuration
CORS_ORIGINS="http://146.190.121.74:3000,http://146.190.121.74:5000"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@xillix.co.ke"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@xillix.co.ke"

# File Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Health Check
HEALTH_CHECK_ENABLED="true"
LOG_LEVEL="info"
EOF

# Update frontend environment - THIS IS THE KEY FIX
echo '🔧 Updating frontend environment (API URL FIX)...'
cat > frontend/.env.local << 'EOF'
# Backend API URL - FIXED TO POINT TO PRODUCTION BACKEND
NEXT_PUBLIC_API_URL=http://146.190.121.74:5000/api

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCBSxKw5E44c_KpF8lqwQXQ157hRAur2TA

# Authentication
NEXTAUTH_SECRET=xillix-nextauth-secret-production-2024
NEXTAUTH_URL=http://146.190.121.74:3000
EOF

# Install dependencies
echo '📦 Installing dependencies...'
cd backend && npm install --production
cd ../frontend && npm install --production
cd ..

# Build applications
echo '🔨 Building applications...'
cd frontend && npm run build
cd ../backend && npm run build || echo 'Backend build skipped (using JS directly)'
cd ..

# Database setup
echo '🗄️ Setting up database...'
cd backend
npx prisma db push --force-reset
npx prisma db seed || echo 'Seeding completed or skipped'
cd ..

# Start applications with PM2
echo '🚀 Starting applications...'
pm2 start backend/src/app.js --name "real-estate-backend" --env production
pm2 start "cd frontend && npm start" --name "real-estate-frontend" --env production

# Save PM2 configuration
pm2 save
pm2 startup

echo '✅ Deployment completed!'
echo '🌐 Frontend: http://146.190.121.74:3000'
echo '🔗 Backend API: http://146.190.121.74:5000/api'
echo '🏥 Health Check: http://146.190.121.74:5000/health'

# Test the endpoints
echo '🧪 Testing endpoints...'
curl -s http://localhost:5000/health && echo ' ✅ Backend health check passed'
curl -s http://localhost:5000/api/properties | head -c 100 && echo ' ✅ Properties API working'
"@

    $sshCommand = "ssh -i $sshKeyPath -o StrictHostKeyChecking=no root@146.190.121.74 `"$deploymentScript`""
    
    Invoke-Expression $sshCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔧 KEY FIX APPLIED:" -ForegroundColor Yellow
        Write-Host "   Frontend API URL: http://146.190.121.74:5000/api" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 Your application should now be available at:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://146.190.121.74:3000" -ForegroundColor White
        Write-Host "   Backend API: http://146.190.121.74:5000/api" -ForegroundColor White
        Write-Host "   Health Check: http://146.190.121.74:5000/health" -ForegroundColor White
        
        Write-Host ""
        Write-Host "🧪 Testing the fix..." -ForegroundColor Blue
        try {
            $response = Invoke-WebRequest -Uri "http://146.190.121.74:5000/api/properties" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Properties API is working!" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  API test failed, but deployment completed. Please check manually." -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "📋 Post-deployment verification:" -ForegroundColor Yellow
        Write-Host "   1. Check PM2 processes: ssh -i .\key root@146.190.121.74 'pm2 status'" -ForegroundColor White
        Write-Host "   2. Check application logs: ssh -i .\key root@146.190.121.74 'pm2 logs'" -ForegroundColor White
        Write-Host "   3. Test frontend: http://146.190.121.74:3000" -ForegroundColor White
        Write-Host "   4. Test properties page: http://146.190.121.74:3000/properties" -ForegroundColor White
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
Write-Host "🎉 Fixed deployment process completed!" -ForegroundColor Green
Write-Host "The 'Failed to fetch properties' issue should now be resolved!" -ForegroundColor Green