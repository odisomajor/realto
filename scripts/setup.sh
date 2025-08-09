#!/bin/bash

# =============================================================================
# XILLIX REAL ESTATE PLATFORM - SETUP SCRIPT
# =============================================================================
# This script sets up the development environment for the Xillix platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running on supported OS
check_os() {
    log "Checking operating system..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        error "Unsupported operating system: $OSTYPE"
    fi
    log "Operating system: $OS"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18.0 or higher."
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! printf '%s\n%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V -C; then
        error "Node.js version $NODE_VERSION is too old. Please install version $REQUIRED_VERSION or higher."
    fi
    
    log "Node.js version: $NODE_VERSION ✓"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed."
    fi
    
    NPM_VERSION=$(npm --version)
    log "npm version: $NPM_VERSION ✓"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        error "Git is not installed."
    fi
    
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    log "Git version: $GIT_VERSION ✓"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log "Docker version: $DOCKER_VERSION ✓"
    else
        warn "Docker is not installed. Docker is optional but recommended for development."
    fi
    
    # Check PostgreSQL (optional)
    if command -v psql &> /dev/null; then
        POSTGRES_VERSION=$(psql --version | cut -d' ' -f3)
        log "PostgreSQL version: $POSTGRES_VERSION ✓"
    else
        warn "PostgreSQL is not installed. You can use Docker for PostgreSQL or install it separately."
    fi
    
    # Check Redis (optional)
    if command -v redis-cli &> /dev/null; then
        REDIS_VERSION=$(redis-cli --version | cut -d' ' -f2)
        log "Redis version: $REDIS_VERSION ✓"
    else
        warn "Redis is not installed. You can use Docker for Redis or install it separately."
    fi
}

# Setup environment file
setup_environment() {
    log "Setting up environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        log "Creating .env.local from .env.example..."
        cp .env.example .env.local
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-jwt-secret-in-production")
        SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-session-secret-in-production")
        NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-nextauth-secret-in-production")
        
        # Update secrets in .env.local
        if [[ "$OS" == "macos" ]]; then
            sed -i '' "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/g" .env.local
            sed -i '' "s/your-session-secret-change-this-in-production/$SESSION_SECRET/g" .env.local
            sed -i '' "s/your-nextauth-secret-change-this-in-production/$NEXTAUTH_SECRET/g" .env.local
        else
            sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/g" .env.local
            sed -i "s/your-session-secret-change-this-in-production/$SESSION_SECRET/g" .env.local
            sed -i "s/your-nextauth-secret-change-this-in-production/$NEXTAUTH_SECRET/g" .env.local
        fi
        
        log "Environment file created with generated secrets ✓"
        warn "Please update the remaining environment variables in .env.local"
    else
        log "Environment file .env.local already exists ✓"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing project dependencies..."
    
    # Install root dependencies
    log "Installing root dependencies..."
    npm install
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        log "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    # Install backend dependencies
    if [ -d "backend" ]; then
        log "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    log "Dependencies installed successfully ✓"
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Check if Docker is available and PostgreSQL is not running locally
    if command -v docker &> /dev/null && ! pgrep -x "postgres" > /dev/null; then
        log "Starting PostgreSQL with Docker..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        log "Waiting for PostgreSQL to be ready..."
        sleep 10
        
        # Check if PostgreSQL is ready
        for i in {1..30}; do
            if docker-compose exec -T postgres pg_isready -U xillix_user -d xillix_realestate &> /dev/null; then
                log "PostgreSQL is ready ✓"
                break
            fi
            
            if [ $i -eq 30 ]; then
                error "PostgreSQL failed to start after 30 attempts"
            fi
            
            sleep 2
        done
    fi
    
    # Run database migrations if backend exists
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        log "Running database migrations..."
        cd backend
        
        # Check if Prisma is available
        if npm list prisma &> /dev/null; then
            npx prisma migrate dev --name init
            log "Database migrations completed ✓"
            
            # Seed database
            if [ -f "prisma/seed.js" ] || [ -f "prisma/seed.ts" ]; then
                log "Seeding database..."
                npx prisma db seed
                log "Database seeded ✓"
            fi
        else
            warn "Prisma not found. Skipping database migrations."
        fi
        
        cd ..
    fi
}

# Setup Redis
setup_redis() {
    log "Setting up Redis..."
    
    # Check if Docker is available and Redis is not running locally
    if command -v docker &> /dev/null && ! pgrep -x "redis-server" > /dev/null; then
        log "Starting Redis with Docker..."
        docker-compose up -d redis
        
        # Wait for Redis to be ready
        log "Waiting for Redis to be ready..."
        sleep 5
        
        # Check if Redis is ready
        for i in {1..15}; do
            if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
                log "Redis is ready ✓"
                break
            fi
            
            if [ $i -eq 15 ]; then
                error "Redis failed to start after 15 attempts"
            fi
            
            sleep 2
        done
    fi
}

# Setup Elasticsearch (optional)
setup_elasticsearch() {
    log "Setting up Elasticsearch..."
    
    if command -v docker &> /dev/null; then
        log "Starting Elasticsearch with Docker..."
        docker-compose up -d elasticsearch
        
        # Wait for Elasticsearch to be ready
        log "Waiting for Elasticsearch to be ready..."
        sleep 15
        
        # Check if Elasticsearch is ready
        for i in {1..30}; do
            if curl -f http://localhost:9200/_cluster/health &> /dev/null; then
                log "Elasticsearch is ready ✓"
                break
            fi
            
            if [ $i -eq 30 ]; then
                warn "Elasticsearch failed to start. This is optional for development."
                break
            fi
            
            sleep 3
        done
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    # Create upload directories
    mkdir -p uploads/properties uploads/users uploads/temp
    
    # Create log directories
    mkdir -p logs/backend logs/frontend logs/worker logs/scheduler logs/nginx
    
    # Create SSL directory
    mkdir -p ssl
    
    log "Directories created ✓"
}

# Setup Git hooks
setup_git_hooks() {
    log "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        # Install husky if available
        if npm list husky &> /dev/null; then
            npx husky install
            log "Git hooks installed ✓"
        else
            warn "Husky not found. Git hooks not installed."
        fi
    else
        warn "Not a Git repository. Git hooks not installed."
    fi
}

# Generate development SSL certificates
generate_ssl_certificates() {
    log "Generating development SSL certificates..."
    
    if command -v openssl &> /dev/null; then
        if [ ! -f "ssl/localhost.crt" ]; then
            openssl req -x509 -newkey rsa:4096 -keyout ssl/localhost.key -out ssl/localhost.crt -days 365 -nodes -subj "/C=KE/ST=Nairobi/L=Nairobi/O=Xillix/OU=Development/CN=localhost"
            log "SSL certificates generated ✓"
        else
            log "SSL certificates already exist ✓"
        fi
    else
        warn "OpenSSL not found. SSL certificates not generated."
    fi
}

# Main setup function
main() {
    log "Starting Xillix Real Estate Platform setup..."
    
    check_os
    check_prerequisites
    setup_environment
    create_directories
    install_dependencies
    setup_database
    setup_redis
    setup_elasticsearch
    setup_git_hooks
    generate_ssl_certificates
    
    log "Setup completed successfully! 🎉"
    echo ""
    log "Next steps:"
    echo "  1. Update environment variables in .env.local"
    echo "  2. Configure Google Maps API key"
    echo "  3. Configure email and SMS services"
    echo "  4. Run 'npm run dev' to start development servers"
    echo ""
    log "For more information, see README.md"
}

# Run main function
main "$@"