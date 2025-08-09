#!/bin/bash

# Xillix Real Estate Platform - Production Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
VERSION="${2:-latest}"
BACKUP_DIR="/opt/backups/xillix"
LOG_FILE="/var/log/xillix-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
    fi
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        production|staging|development)
            log "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Use: production, staging, or development"
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if required directories exist
    mkdir -p "$BACKUP_DIR" /var/log /opt/xillix-$ENVIRONMENT
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$ENVIRONMENT_$BACKUP_TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database
    if docker ps | grep -q "xillix_postgres"; then
        log "Backing up database..."
        docker exec xillix_postgres_$ENVIRONMENT pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_PATH/database.sql"
        success "Database backup created"
    fi
    
    # Backup uploaded files
    if [ -d "/opt/xillix-$ENVIRONMENT/uploads" ]; then
        log "Backing up uploaded files..."
        cp -r "/opt/xillix-$ENVIRONMENT/uploads" "$BACKUP_PATH/"
        success "Files backup created"
    fi
    
    # Backup configuration
    if [ -f "/opt/xillix-$ENVIRONMENT/.env" ]; then
        cp "/opt/xillix-$ENVIRONMENT/.env" "$BACKUP_PATH/"
    fi
    
    # Compress backup
    tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "backup_$ENVIRONMENT_$BACKUP_TIMESTAMP"
    rm -rf "$BACKUP_PATH"
    
    success "Backup created: $BACKUP_PATH.tar.gz"
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    
    cd "/opt/xillix-$ENVIRONMENT"
    
    # Pull images based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml pull
    else
        docker-compose pull
    fi
    
    success "Docker images pulled successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml exec -T backend npm run prisma:deploy
    else
        docker-compose exec -T backend npm run prisma:deploy
    fi
    
    success "Database migrations completed"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    cd "/opt/xillix-$ENVIRONMENT"
    
    # Stop existing containers
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down --remove-orphans
    else
        docker-compose down --remove-orphans
    fi
    
    # Start new containers
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml up -d --remove-orphans
    else
        docker-compose up -d --remove-orphans
    fi
    
    success "Application deployed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    BACKEND_URL="http://localhost:5000/health"
    if curl -f "$BACKEND_URL" &> /dev/null; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend health
    FRONTEND_URL="http://localhost:3000"
    if curl -f "$FRONTEND_URL" &> /dev/null; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed"
    fi
    
    # Check database connection
    if docker exec "xillix_postgres_$ENVIRONMENT" pg_isready -U "$POSTGRES_USER" &> /dev/null; then
        success "Database health check passed"
    else
        error "Database health check failed"
    fi
    
    success "All health checks passed"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes (be careful with this in production)
    if [ "$ENVIRONMENT" != "production" ]; then
        docker volume prune -f
    fi
    
    success "Cleanup completed"
}

# Send notification
send_notification() {
    log "Sending deployment notification..."
    
    # Slack notification (if webhook URL is configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Xillix deployment to $ENVIRONMENT completed successfully!\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Email notification (if configured)
    if command -v mail &> /dev/null && [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "Xillix deployment to $ENVIRONMENT completed successfully at $(date)" | \
            mail -s "Deployment Notification" "$NOTIFICATION_EMAIL"
    fi
    
    success "Notifications sent"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_"$ENVIRONMENT"_*.tar.gz | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $LATEST_BACKUP"
    
    # Stop current deployment
    cd "/opt/xillix-$ENVIRONMENT"
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    # Restore backup
    RESTORE_DIR=$(mktemp -d)
    tar -xzf "$LATEST_BACKUP" -C "$RESTORE_DIR"
    
    # Restore database
    if [ -f "$RESTORE_DIR"/*/database.sql ]; then
        docker exec "xillix_postgres_$ENVIRONMENT" psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$RESTORE_DIR"/*/database.sql
    fi
    
    # Restore files
    if [ -d "$RESTORE_DIR"/*/uploads ]; then
        cp -r "$RESTORE_DIR"/*/uploads "/opt/xillix-$ENVIRONMENT/"
    fi
    
    rm -rf "$RESTORE_DIR"
    
    success "Rollback completed"
}

# Main deployment function
main() {
    log "Starting deployment process..."
    
    check_permissions
    validate_environment
    check_prerequisites
    
    # Load environment variables
    if [ -f "/opt/xillix-$ENVIRONMENT/.env" ]; then
        source "/opt/xillix-$ENVIRONMENT/.env"
    fi
    
    # Create backup before deployment
    create_backup
    
    # Deploy
    pull_images
    deploy_application
    run_migrations
    health_check
    cleanup
    send_notification
    
    success "Deployment completed successfully!"
    log "Deployment logs available at: $LOG_FILE"
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    health-check)
        health_check
        ;;
    backup)
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check|backup} [environment] [version]"
        echo "Environments: production, staging, development"
        exit 1
        ;;
esac