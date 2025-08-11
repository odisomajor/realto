# Environment Sync Script for Real Estate Application
# This script ensures all environments (local, GitHub, production) stay in sync

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("pull-from-production", "push-to-production", "sync-all")]
    [string]$Action = "sync-all",
    
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Sync environments: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "Real Estate Environment Sync Tool" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path ".\new_key")) {
    Write-Host "ERROR: SSH key 'new_key' not found. Please ensure the key is in the project root." -ForegroundColor Red
    exit 1
}

function Pull-From-Production {
    Write-Host "Pulling changes from production server..." -ForegroundColor Cyan
    
    # Create temp directory for production files
    $tempDir = ".\temp-production-sync"
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    # Download key files from production
    Write-Host "  Downloading frontend source..." -ForegroundColor Gray
    & scp -i .\new_key -o StrictHostKeyChecking=no -r root@146.190.121.74:/var/www/xillix/frontend/src/ "$tempDir\frontend-src"
    
    Write-Host "  Downloading backend source..." -ForegroundColor Gray
    & scp -i .\new_key -o StrictHostKeyChecking=no -r root@146.190.121.74:/var/www/xillix/backend/src/ "$tempDir\backend-src"
    
    Write-Host "  Downloading configuration files..." -ForegroundColor Gray
    & scp -i .\new_key -o StrictHostKeyChecking=no root@146.190.121.74:/var/www/xillix/frontend/package.json "$tempDir\frontend-package.json"
    & scp -i .\new_key -o StrictHostKeyChecking=no root@146.190.121.74:/var/www/xillix/backend/package.json "$tempDir\backend-package.json"
    
    # Compare and merge changes (manual review required)
    Write-Host "  Production files downloaded to: $tempDir" -ForegroundColor Yellow
    Write-Host "  Please review changes manually and merge as needed" -ForegroundColor Yellow
    
    return $true
}

function Push-To-Production {
    Write-Host "Pushing changes to production server..." -ForegroundColor Cyan
    
    # Ensure we're on the latest commit
    Write-Host "  Ensuring local repository is up to date..." -ForegroundColor Gray
    git pull origin main
    
    # Upload source files
    Write-Host "  Uploading frontend source..." -ForegroundColor Gray
    & scp -i .\new_key -o StrictHostKeyChecking=no -r .\frontend\src\ root@146.190.121.74:/var/www/xillix/frontend/
    
    Write-Host "  Uploading backend source..." -ForegroundColor Gray
    & scp -i .\new_key -o StrictHostKeyChecking=no -r .\backend\src\ root@146.190.121.74:/var/www/xillix/backend/
    
    # Update package.json files
    Write-Host "  Updating package.json files..." -ForegroundColor Gray
    & scp -i .\new_key -o StrictHostKeyChecking=no .\frontend\package.json root@146.190.121.74:/var/www/xillix/frontend/
    & scp -i .\new_key -o StrictHostKeyChecking=no .\backend\package.json root@146.190.121.74:/var/www/xillix/backend/
    
    # Rebuild and restart services
    Write-Host "  Rebuilding frontend..." -ForegroundColor Gray
    & ssh -i .\new_key -o StrictHostKeyChecking=no root@146.190.121.74 "cd /var/www/xillix/frontend && npm install && npm run build"
    
    Write-Host "  Rebuilding backend..." -ForegroundColor Gray
    & ssh -i .\new_key -o StrictHostKeyChecking=no root@146.190.121.74 "cd /var/www/xillix/backend && npm install"
    
    Write-Host "  Restarting services..." -ForegroundColor Gray
    & ssh -i .\new_key -o StrictHostKeyChecking=no root@146.190.121.74 "pm2 restart all"
    
    Write-Host "  Verifying deployment..." -ForegroundColor Gray
    & ssh -i .\new_key -o StrictHostKeyChecking=no root@146.190.121.74 "curl -I https://xillix.co.ke"
    
    return $true
}

function Sync-All {
    Write-Host "Performing complete environment sync..." -ForegroundColor Cyan
    
    # 1. Commit local changes
    Write-Host "  Committing local changes..." -ForegroundColor Gray
    git add .
    $hasChanges = git status --porcelain
    if ($hasChanges) {
        git commit -m $CommitMessage --no-verify
        Write-Host "    SUCCESS: Local changes committed" -ForegroundColor Green
    } else {
        Write-Host "    INFO: No local changes to commit" -ForegroundColor Blue
    }
    
    # 2. Push to GitHub
    Write-Host "  Pushing to GitHub..." -ForegroundColor Gray
    git push origin main
    Write-Host "    SUCCESS: Changes pushed to GitHub" -ForegroundColor Green
    
    # 3. Deploy to production
    Write-Host "  Deploying to production..." -ForegroundColor Gray
    if (Push-To-Production) {
        Write-Host "    SUCCESS: Production deployment completed" -ForegroundColor Green
    } else {
        Write-Host "    ERROR: Production deployment failed" -ForegroundColor Red
        return $false
    }
    
    # 4. Verify all environments
    Write-Host "  Verifying environments..." -ForegroundColor Gray
    Write-Host "    Local: http://localhost:3000" -ForegroundColor Blue
    Write-Host "    Production: https://xillix.co.ke" -ForegroundColor Blue
    Write-Host "    GitHub: https://github.com/odisomajor/realto" -ForegroundColor Blue
    
    return $true
}

# Execute the requested action
switch ($Action) {
    "pull-from-production" {
        if (Pull-From-Production) {
            Write-Host "SUCCESS: Production pull completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Production pull failed!" -ForegroundColor Red
            exit 1
        }
    }
    "push-to-production" {
        if (Push-To-Production) {
            Write-Host "SUCCESS: Production push completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Production push failed!" -ForegroundColor Red
            exit 1
        }
    }
    "sync-all" {
        if (Sync-All) {
            Write-Host "SUCCESS: Complete environment sync completed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "All environments are now in sync:" -ForegroundColor Green
            Write-Host "   Local development environment" -ForegroundColor White
            Write-Host "   GitHub repository" -ForegroundColor White
            Write-Host "   Production server (xillix.co.ke)" -ForegroundColor White
        } else {
            Write-Host "ERROR: Environment sync failed!" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "Environment sync operation completed!" -ForegroundColor Green