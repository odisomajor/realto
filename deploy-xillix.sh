#!/bin/bash

# =============================================================================
# XILLIX REAL ESTATE PLATFORM - PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# This script automates the complete deployment of the Xillix Real Estate
# platform to a DigitalOcean server (IP: 146.190.121.74) with domain xillix.co.ke
# =============================================================================
# Usage: curl -fsSL https://raw.githubusercontent.com/your-username/your-repo/main/deploy-xillix.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="xillix.co.ke"
PROJECT_DIR="/var/www/xillix"
REPO_URL="https://github.com/odisomajor/realto.git"

echo -e "${BLUE}🚀 Starting Xillix Real Estate Platform deployment for ${DOMAIN}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
apt update && apt upgrade -y
print_status "System updated"

# Install Node.js 18
echo -e "${BLUE}📦 Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
print_status "Node.js installed: $(node --version)"

# Install PostgreSQL
echo -e "${BLUE}📦 Installing PostgreSQL...${NC}"
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
print_status "PostgreSQL installed"

# Install Redis
echo -e "${BLUE}📦 Installing Redis...${NC}"
apt install redis-server -y
systemctl start redis-server
systemctl enable redis-server
print_status "Redis installed"

# Install Nginx
echo -e "${BLUE}📦 Installing Nginx...${NC}"
apt install nginx -y
systemctl start nginx
systemctl enable nginx
print_status "Nginx installed"

# Install PM2
echo -e "${BLUE}📦 Installing PM2...${NC}"
npm install -g pm2
print_status "PM2 installed"

# Install Git
echo -e "${BLUE}📦 Installing Git...${NC}"
apt install git -y
print_status "Git installed"

# Create project directory
echo -e "${BLUE}📁 Setting up project directory...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone repository
echo -e "${BLUE}📥 Cloning repository...${NC}"
if [ -d ".git" ]; then
    git pull origin main
    print_status "Repository updated"
else
    git clone $REPO_URL .
    print_status "Repository cloned"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
print_status "Dependencies installed"

# Setup database
echo -e "${BLUE}🗄️ Setting up database...${NC}"
sudo -u postgres psql -c "CREATE DATABASE realestate_prod;" 2>/dev/null || print_warning "Database already exists"
sudo -u postgres psql -c "CREATE USER realestate WITH ENCRYPTED PASSWORD 'realto2024secure';" 2>/dev/null || print_warning "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;" 2>/dev/null
print_status "Database configured"

# Setup environment
echo -e "${BLUE}⚙️ Configuring environment...${NC}"
cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"

# JWT Configuration
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://xillix.co.ke"
BACKEND_URL="https://xillix.co.ke/api"

# Domain Configuration
DOMAIN="xillix.co.ke"
SITE_URL="https://xillix.co.ke"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Email Configuration (Update with your email provider)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@xillix.co.ke"

# File Upload Configuration
UPLOAD_DIR="/var/www/xillix/uploads"
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="jpg,jpeg,png,gif,pdf,doc,docx"

# Security Configuration
CORS_ORIGIN="https://xillix.co.ke"
RATE_LIMIT_WINDOW="900000"
RATE_LIMIT_MAX="100"
BCRYPT_ROUNDS="12"
SESSION_SECRET="$(openssl rand -base64 32)"
EOF
print_status "Environment configured"

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Build applications
echo -e "${BLUE}🔨 Building applications...${NC}"
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed 2>/dev/null || print_warning "Seeding skipped (might already be done)"
npm run build 2>/dev/null || print_warning "Backend build skipped (no build script)"
cd ../frontend
npm run build
cd ..
print_status "Applications built"

# Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/xillix.co.ke << 'EOF'
server {
    listen 80;
    server_name xillix.co.ke www.xillix.co.ke;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /uploads {
        alias /var/www/xillix/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
print_status "Nginx configured"

# Start applications with PM2
echo -e "${BLUE}🚀 Starting applications with PM2...${NC}"
pm2 delete all 2>/dev/null || true

# Start backend
cd backend
pm2 start npm --name "xillix-backend" -- start
cd ..

# Start frontend
cd frontend
pm2 start npm --name "xillix-frontend" -- start
cd ..

pm2 save
pm2 startup systemd -u root --hp /root
print_status "Applications started with PM2"

# Install SSL certificate
echo -e "${BLUE}🔒 Setting up SSL certificate...${NC}"
apt install certbot python3-certbot-nginx -y

# Prompt for email
echo -e "${YELLOW}Please enter your email for SSL certificate notifications:${NC}"
read -p "Email: " SSL_EMAIL

if [ -z "$SSL_EMAIL" ]; then
    SSL_EMAIL="admin@xillix.co.ke"
fi

certbot --nginx -d xillix.co.ke -d www.xillix.co.ke --email $SSL_EMAIL --agree-tos --non-interactive
print_status "SSL certificate installed"

# Test auto-renewal
certbot renew --dry-run
print_status "SSL auto-renewal configured"

# Setup firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
print_status "Firewall configured"

# Create log directories
mkdir -p logs/backend logs/frontend logs/worker logs/scheduler
chmod 755 logs logs/backend logs/frontend logs/worker logs/scheduler

echo -e "${GREEN}"
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
echo "=========================================="
echo -e "${NC}"
echo -e "${BLUE}Your Xillix Real Estate Platform is now live at:${NC}"
echo -e "${GREEN}🌐 https://xillix.co.ke${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. 📧 Update email configuration in .env file"
echo "2. 🔍 Verify Google Search Console at https://search.google.com/search-console"
echo "3. 📊 Submit sitemap: https://xillix.co.ke/sitemap.xml"
echo "4. 🔍 Test all functionality on your live site"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "• Check PM2 status: pm2 status"
echo "• View logs: pm2 logs"
echo "• Restart apps: pm2 restart all"
echo "• Check Nginx: systemctl status nginx"
echo ""
echo -e "${GREEN}🚀 Your site is ready for production!${NC}"