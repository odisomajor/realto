# =============================================================================
# XILLIX REAL ESTATE PLATFORM - SETUP SCRIPT (PowerShell)
# =============================================================================
# This script sets up the development environment for the Xillix platform on Windows

param(
    [switch]$SkipDocker,
    [switch]$SkipDatabase,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Enable verbose output if requested
if ($Verbose) {
    $VerbosePreference = "Continue"
}

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

# Logging functions
function Write-Log {
    param([string]$Message, [string]$Color = "Green")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Colors[$Color]
}

function Write-Warning {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] WARNING: $Message" -ForegroundColor $Colors["Yellow"]
}

function Write-Error {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] ERROR: $Message" -ForegroundColor $Colors["Red"]
    exit 1
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..." "Blue"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        if ($nodeVersion) {
            $version = $nodeVersion.TrimStart('v')
            $requiredVersion = [Version]"18.0.0"
            $currentVersion = [Version]$version
            
            if ($currentVersion -lt $requiredVersion) {
                Write-Error "Node.js version $version is too old. Please install version 18.0.0 or higher."
            }
            
            Write-Log "Node.js version: $version ✓"
        }
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18.0 or higher from https://nodejs.org/"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Log "npm version: $npmVersion ✓"
    }
    catch {
        Write-Error "npm is not installed."
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        Write-Log "Git version: $gitVersion ✓"
    }
    catch {
        Write-Error "Git is not installed. Please install Git from https://git-scm.com/"
    }
    
    # Check Docker (optional)
    if (-not $SkipDocker) {
        try {
            $dockerVersion = docker --version
            Write-Log "Docker version: $dockerVersion ✓"
        }
        catch {
            Write-Warning "Docker is not installed. Docker is optional but recommended for development."
            Write-Warning "You can install Docker Desktop from https://www.docker.com/products/docker-desktop"
        }
    }
    
    # Check PostgreSQL (optional)
    try {
        $postgresVersion = psql --version
        Write-Log "PostgreSQL version: $postgresVersion ✓"
    }
    catch {
        Write-Warning "PostgreSQL is not installed. You can use Docker for PostgreSQL or install it separately."
    }
    
    # Check Redis (optional)
    try {
        $redisVersion = redis-cli --version
        Write-Log "Redis version: $redisVersion ✓"
    }
    catch {
        Write-Warning "Redis is not installed. You can use Docker for Redis or install it separately."
    }
}

# Setup environment file
function Set-Environment {
    Write-Log "Setting up environment configuration..." "Blue"
    
    if (-not (Test-Path ".env.local")) {
        Write-Log "Creating .env.local from .env.example..."
        Copy-Item ".env.example" ".env.local"
        
        # Generate random secrets
        $jwtSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
        $sessionSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
        $nextAuthSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
        
        # Update secrets in .env.local
        (Get-Content ".env.local") -replace "your-super-secret-jwt-key-change-this-in-production", $jwtSecret | Set-Content ".env.local"
        (Get-Content ".env.local") -replace "your-session-secret-change-this-in-production", $sessionSecret | Set-Content ".env.local"
        (Get-Content ".env.local") -replace "your-nextauth-secret-change-this-in-production", $nextAuthSecret | Set-Content ".env.local"
        
        Write-Log "Environment file created with generated secrets ✓"
        Write-Warning "Please update the remaining environment variables in .env.local"
    }
    else {
        Write-Log "Environment file .env.local already exists ✓"
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Log "Installing project dependencies..." "Blue"
    
    # Install root dependencies
    Write-Log "Installing root dependencies..."
    npm install
    
    # Install frontend dependencies
    if (Test-Path "frontend") {
        Write-Log "Installing frontend dependencies..."
        Push-Location "frontend"
        npm install
        Pop-Location
    }
    
    # Install backend dependencies
    if (Test-Path "backend") {
        Write-Log "Installing backend dependencies..."
        Push-Location "backend"
        npm install
        Pop-Location
    }
    
    Write-Log "Dependencies installed successfully ✓"
}

# Setup database
function Set-Database {
    if ($SkipDatabase) {
        Write-Warning "Skipping database setup as requested."
        return
    }
    
    Write-Log "Setting up database..." "Blue"
    
    # Check if Docker is available and PostgreSQL is not running locally
    $dockerAvailable = $false
    try {
        docker --version | Out-Null
        $dockerAvailable = $true
    }
    catch {
        $dockerAvailable = $false
    }
    
    $postgresRunning = $false
    try {
        $processes = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
        $postgresRunning = $processes.Count -gt 0
    }
    catch {
        $postgresRunning = $false
    }
    
    if ($dockerAvailable -and -not $postgresRunning) {
        Write-Log "Starting PostgreSQL with Docker..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        Write-Log "Waiting for PostgreSQL to be ready..."
        Start-Sleep -Seconds 10
        
        # Check if PostgreSQL is ready
        $attempts = 0
        $maxAttempts = 30
        
        do {
            $attempts++
            try {
                $result = docker-compose exec -T postgres pg_isready -U xillix_user -d xillix_realestate 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Log "PostgreSQL is ready ✓"
                    break
                }
            }
            catch {
                # Continue trying
            }
            
            if ($attempts -eq $maxAttempts) {
                Write-Error "PostgreSQL failed to start after $maxAttempts attempts"
            }
            
            Start-Sleep -Seconds 2
        } while ($attempts -lt $maxAttempts)
    }
    
    # Run database migrations if backend exists
    if ((Test-Path "backend") -and (Test-Path "backend\package.json")) {
        Write-Log "Running database migrations..."
        Push-Location "backend"
        
        # Check if Prisma is available
        try {
            npm list prisma | Out-Null
            npx prisma migrate dev --name init
            Write-Log "Database migrations completed ✓"
            
            # Seed database
            if ((Test-Path "prisma\seed.js") -or (Test-Path "prisma\seed.ts")) {
                Write-Log "Seeding database..."
                npx prisma db seed
                Write-Log "Database seeded ✓"
            }
        }
        catch {
            Write-Warning "Prisma not found. Skipping database migrations."
        }
        
        Pop-Location
    }
}

# Setup Redis
function Set-Redis {
    Write-Log "Setting up Redis..." "Blue"
    
    # Check if Docker is available and Redis is not running locally
    $dockerAvailable = $false
    try {
        docker --version | Out-Null
        $dockerAvailable = $true
    }
    catch {
        $dockerAvailable = $false
    }
    
    $redisRunning = $false
    try {
        $processes = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
        $redisRunning = $processes.Count -gt 0
    }
    catch {
        $redisRunning = $false
    }
    
    if ($dockerAvailable -and -not $redisRunning) {
        Write-Log "Starting Redis with Docker..."
        docker-compose up -d redis
        
        # Wait for Redis to be ready
        Write-Log "Waiting for Redis to be ready..."
        Start-Sleep -Seconds 5
        
        # Check if Redis is ready
        $attempts = 0
        $maxAttempts = 15
        
        do {
            $attempts++
            try {
                $result = docker-compose exec -T redis redis-cli ping 2>$null
                if ($result -match "PONG") {
                    Write-Log "Redis is ready ✓"
                    break
                }
            }
            catch {
                # Continue trying
            }
            
            if ($attempts -eq $maxAttempts) {
                Write-Error "Redis failed to start after $maxAttempts attempts"
            }
            
            Start-Sleep -Seconds 2
        } while ($attempts -lt $maxAttempts)
    }
}

# Setup Elasticsearch (optional)
function Set-Elasticsearch {
    Write-Log "Setting up Elasticsearch..." "Blue"
    
    try {
        docker --version | Out-Null
        Write-Log "Starting Elasticsearch with Docker..."
        docker-compose up -d elasticsearch
        
        # Wait for Elasticsearch to be ready
        Write-Log "Waiting for Elasticsearch to be ready..."
        Start-Sleep -Seconds 15
        
        # Check if Elasticsearch is ready
        $attempts = 0
        $maxAttempts = 30
        
        do {
            $attempts++
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health" -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-Log "Elasticsearch is ready ✓"
                    break
                }
            }
            catch {
                # Continue trying
            }
            
            if ($attempts -eq $maxAttempts) {
                Write-Warning "Elasticsearch failed to start. This is optional for development."
                break
            }
            
            Start-Sleep -Seconds 3
        } while ($attempts -lt $maxAttempts)
    }
    catch {
        Write-Warning "Docker not available. Skipping Elasticsearch setup."
    }
}

# Create necessary directories
function New-Directories {
    Write-Log "Creating necessary directories..." "Blue"
    
    # Create upload directories
    New-Item -ItemType Directory -Force -Path "uploads\properties" | Out-Null
    New-Item -ItemType Directory -Force -Path "uploads\users" | Out-Null
    New-Item -ItemType Directory -Force -Path "uploads\temp" | Out-Null
    
    # Create log directories
    New-Item -ItemType Directory -Force -Path "logs\backend" | Out-Null
    New-Item -ItemType Directory -Force -Path "logs\frontend" | Out-Null
    New-Item -ItemType Directory -Force -Path "logs\worker" | Out-Null
    New-Item -ItemType Directory -Force -Path "logs\scheduler" | Out-Null
    New-Item -ItemType Directory -Force -Path "logs\nginx" | Out-Null
    
    # Create SSL directory
    New-Item -ItemType Directory -Force -Path "ssl" | Out-Null
    
    Write-Log "Directories created ✓"
}

# Setup Git hooks
function Set-GitHooks {
    Write-Log "Setting up Git hooks..." "Blue"
    
    if (Test-Path ".git") {
        # Install husky if available
        try {
            npm list husky | Out-Null
            npx husky install
            Write-Log "Git hooks installed ✓"
        }
        catch {
            Write-Warning "Husky not found. Git hooks not installed."
        }
    }
    else {
        Write-Warning "Not a Git repository. Git hooks not installed."
    }
}

# Generate development SSL certificates
function New-SSLCertificates {
    Write-Log "Generating development SSL certificates..." "Blue"
    
    if (-not (Test-Path "ssl\localhost.crt")) {
        try {
            # Check if OpenSSL is available
            openssl version | Out-Null
            
            $subject = "/C=KE/ST=Nairobi/L=Nairobi/O=Xillix/OU=Development/CN=localhost"
            openssl req -x509 -newkey rsa:4096 -keyout ssl\localhost.key -out ssl\localhost.crt -days 365 -nodes -subj $subject
            Write-Log "SSL certificates generated ✓"
        }
        catch {
            Write-Warning "OpenSSL not found. SSL certificates not generated."
            Write-Warning "You can install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html"
        }
    }
    else {
        Write-Log "SSL certificates already exist ✓"
    }
}

# Main setup function
function Start-Setup {
    Write-Log "Starting Xillix Real Estate Platform setup..." "Cyan"
    Write-Log "Platform: Windows PowerShell" "Blue"
    
    if (Test-Administrator) {
        Write-Log "Running as Administrator ✓" "Green"
    }
    else {
        Write-Warning "Not running as Administrator. Some operations may fail."
    }
    
    Test-Prerequisites
    Set-Environment
    New-Directories
    Install-Dependencies
    
    if (-not $SkipDatabase) {
        Set-Database
    }
    
    Set-Redis
    Set-Elasticsearch
    Set-GitHooks
    New-SSLCertificates
    
    Write-Log "Setup completed successfully! 🎉" "Green"
    Write-Host ""
    Write-Log "Next steps:" "Cyan"
    Write-Host "  1. Update environment variables in .env.local" -ForegroundColor White
    Write-Host "  2. Configure Google Maps API key" -ForegroundColor White
    Write-Host "  3. Configure email and SMS services" -ForegroundColor White
    Write-Host "  4. Run 'npm run dev' to start development servers" -ForegroundColor White
    Write-Host ""
    Write-Log "For more information, see README.md" "Blue"
}

# Run main function
try {
    Start-Setup
}
catch {
    Write-Error "Setup failed: $($_.Exception.Message)"
}