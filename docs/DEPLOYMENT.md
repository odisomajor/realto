# Xillix Real Estate Platform - Deployment Guide

## Overview

This guide covers the complete deployment process for the Xillix Real Estate
Platform, including development, staging, and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring Setup](#monitoring-setup)
6. [Performance Testing](#performance-testing)
7. [Security Configuration](#security-configuration)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **CPU**: Minimum 4 cores (8 cores recommended for production)
- **RAM**: Minimum 8GB (16GB recommended for production)
- **Storage**: Minimum 100GB SSD (500GB recommended for production)
- **Network**: Stable internet connection with adequate bandwidth

### Required Software

```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Node.js (for local development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get update
sudo apt-get install -y git

# Additional tools
sudo apt-get install -y curl wget unzip htop
```

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/xillix-real-estate.git
cd xillix-real-estate
```

### 2. Environment Configuration

Create environment files for each environment:

#### Development (.env.development)

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/xillix_dev"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=xillix_dev

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-development"
JWT_EXPIRES_IN="7d"

# API Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/webp,application/pdf"

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@xillix.com

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=admin@xillix.com
```

#### Production (.env.production)

```bash
# Database
DATABASE_URL="postgresql://postgres:secure_password@postgres:5432/xillix_prod"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=xillix_prod

# Redis
REDIS_URL="redis://redis:6379"

# JWT
JWT_SECRET="your-super-secure-jwt-key-production-change-this"
JWT_EXPIRES_IN="24h"

# API Configuration
PORT=5000
NODE_ENV=production
API_VERSION=v1

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL/TLS
SSL_CERT_PATH="/etc/ssl/certs/xillix.crt"
SSL_KEY_PATH="/etc/ssl/private/xillix.key"

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 3. SSL Certificate Setup

For production deployment, obtain SSL certificates:

```bash
# Using Let's Encrypt (recommended)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Or use your own certificates
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo cp your-certificate.crt /etc/ssl/certs/xillix.crt
sudo cp your-private-key.key /etc/ssl/private/xillix.key
sudo chmod 600 /etc/ssl/private/xillix.key
```

## Docker Deployment

### 1. Development Deployment

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down
```

### 2. Production Deployment

```bash
# Build and start production environment
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:deploy

# Create initial admin user
docker-compose -f docker-compose.prod.yml exec backend npm run seed:admin
```

### 3. Using Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy to production
sudo ./scripts/deploy.sh production latest

# Deploy to staging
sudo ./scripts/deploy.sh staging latest

# Rollback deployment
sudo ./scripts/deploy.sh rollback production
```

## CI/CD Pipeline

### 1. GitHub Actions Setup

The CI/CD pipeline is automatically configured with the
`.github/workflows/ci-cd.yml` file.

#### Required Secrets

Add these secrets to your GitHub repository:

```
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
PRODUCTION_HOST=your-production-server-ip
PRODUCTION_USER=deploy-user
PRODUCTION_SSH_KEY=your-private-ssh-key
STAGING_HOST=your-staging-server-ip
STAGING_USER=deploy-user
STAGING_SSH_KEY=your-staging-ssh-key
SLACK_WEBHOOK_URL=your-slack-webhook-url
DATABASE_URL=your-test-database-url
REDIS_URL=your-test-redis-url
```

### 2. Manual Deployment

If you prefer manual deployment:

```bash
# Build Docker images
docker build -t xillix/backend:latest ./backend
docker build -t xillix/frontend:latest ./frontend

# Push to registry
docker push xillix/backend:latest
docker push xillix/frontend:latest

# Deploy on server
ssh user@your-server "cd /opt/xillix && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
```

## Monitoring Setup

### 1. Setup Monitoring Stack

```bash
# Run monitoring setup script
chmod +x scripts/setup-monitoring.sh
sudo ./scripts/setup-monitoring.sh

# Start monitoring services
cd /opt/xillix-monitoring
./start-monitoring.sh
```

### 2. Access Monitoring Dashboards

- **Prometheus**: http://your-server:9090
- **Grafana**: http://your-server:3001 (admin/admin123)
- **Node Exporter**: http://your-server:9100
- **cAdvisor**: http://your-server:8080

### 3. Configure Alerts

Edit `/opt/xillix-monitoring/alertmanager/alertmanager.yml` to configure:

- Email notifications
- Slack notifications
- PagerDuty integration
- Custom webhooks

## Performance Testing

### 1. Install K6

```bash
# Install K6
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### 2. Run Load Tests

```bash
# Basic load test
k6 run k6-tests/load-test.js

# Load test with custom configuration
k6 run --vus 50 --duration 10m k6-tests/load-test.js

# Load test against specific environment
BASE_URL=https://your-production-domain.com k6 run k6-tests/load-test.js
```

### 3. Analyze Results

Results are automatically generated in:

- `load-test-results.json` - Raw test data
- `load-test-summary.html` - HTML report

## Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # Backend API (if needed)
```

### 2. Security Headers

Nginx is configured with security headers in `config/nginx/nginx.prod.conf`:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### 3. Database Security

```bash
# Secure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'secure_password';"
sudo -u postgres psql -c "CREATE USER xillix_app WITH PASSWORD 'app_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE xillix_prod TO xillix_app;"
```

### 4. Regular Security Updates

```bash
# Create update script
cat > /etc/cron.weekly/security-updates << 'EOF'
#!/bin/bash
apt-get update
apt-get -y upgrade
docker system prune -f
EOF

chmod +x /etc/cron.weekly/security-updates
```

## Backup and Recovery

### 1. Automated Backups

The production Docker Compose includes a backup service that runs daily:

```yaml
backup:
  image: postgres:15
  volumes:
    - ./backups:/backups
    - postgres_data:/var/lib/postgresql/data
  environment:
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    - POSTGRES_DB=${POSTGRES_DB}
  command: |
    bash -c "
    while true; do
      pg_dump -h postgres -U $${POSTGRES_USER} $${POSTGRES_DB} > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql
      find /backups -name '*.sql' -mtime +7 -delete
      sleep 86400
    done"
```

### 2. Manual Backup

```bash
# Database backup
docker exec xillix_postgres_production pg_dump -U postgres xillix_prod > backup_$(date +%Y%m%d).sql

# Files backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/xillix-production/uploads

# Full system backup
rsync -avz /opt/xillix-production/ backup-server:/backups/xillix/
```

### 3. Recovery Process

```bash
# Restore database
docker exec -i xillix_postgres_production psql -U postgres xillix_prod < backup_20231201.sql

# Restore files
tar -xzf uploads_backup_20231201.tar.gz -C /opt/xillix-production/

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database status
docker-compose logs postgres

# Test connection
docker exec xillix_postgres_production pg_isready -U postgres

# Reset database connection
docker-compose restart postgres backend
```

#### 2. High Memory Usage

```bash
# Check memory usage
docker stats

# Restart services with memory limits
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/xillix.crt -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew --nginx
```

#### 4. Performance Issues

```bash
# Check system resources
htop
df -h
iostat -x 1

# Analyze slow queries
docker exec xillix_postgres_production psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

### Log Analysis

```bash
# View application logs
docker-compose logs -f backend

# View Nginx logs
docker-compose logs -f nginx

# View system logs
journalctl -u docker -f

# Search for errors
docker-compose logs backend | grep -i error
```

### Health Checks

```bash
# Check service health
curl http://localhost:5000/health

# Check all services
docker-compose ps

# Detailed health check
curl -s http://localhost:5000/health | jq .
```

## Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Review monitoring dashboards
   - Check backup integrity
   - Update security patches

2. **Monthly**:
   - Analyze performance metrics
   - Review and rotate logs
   - Update dependencies

3. **Quarterly**:
   - Security audit
   - Disaster recovery testing
   - Capacity planning review

### Scaling Considerations

For high-traffic scenarios, consider:

1. **Horizontal Scaling**:
   - Multiple backend instances
   - Load balancer configuration
   - Database read replicas

2. **Vertical Scaling**:
   - Increase server resources
   - Optimize database queries
   - Implement caching strategies

3. **CDN Integration**:
   - Static asset delivery
   - Image optimization
   - Global content distribution

## Support

For deployment support:

- **Documentation**: Check this guide and inline comments
- **Logs**: Always check application and system logs first
- **Monitoring**: Use Grafana dashboards for insights
- **Community**: Refer to project documentation and issues

---

**Note**: This deployment guide assumes a Linux-based production environment.
Adjust commands and paths as necessary for your specific setup.
