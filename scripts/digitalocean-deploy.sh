#!/bin/bash

# DigitalOcean Deployment Script for Xillix Real Estate Platform
# This script automates the deployment process on a DigitalOcean Ubuntu Droplet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="xillix.co.ke"
PROJECT_DIR="/var/www/xillix"
DB_NAME="realestate_prod"
DB_USER="realestate"
DB_PASS="realto2024secure"

# Helper functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

echo -e "${BLUE}"
echo "🚀 DigitalOcean Deployment Script"
echo "=================================="
echo "Domain: ${DOMAIN}"
echo "Project Directory: ${PROJECT_DIR}"
echo "Database: ${DB_NAME}"
echo "${NC}"

# Update system
echo -e "${BLUE}🔄 Updating system packages...${NC}"
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

# Install Git and other utilities
echo -e "${BLUE}📦 Installing Git and utilities...${NC}"
apt install git curl wget unzip -y
print_status "Git and utilities installed"

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
    git clone https://github.com/odisomajor/realto.git .
    print_status "Repository cloned"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
print_status "Dependencies installed"

# Setup PostgreSQL database
echo -e "${BLUE}🗄️  Setting up PostgreSQL database...${NC}"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || print_warning "Database already exists"
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';" 2>/dev/null || print_warning "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" 2>/dev/null
sudo -u postgres psql -c "ALTER USER ${DB_USER} CREATEDB;" 2>/dev/null
print_status "PostgreSQL database configured"

# Create uploads directory
echo -e "${BLUE}📁 Creating uploads directory...${NC}"
mkdir -p ${PROJECT_DIR}/uploads
chown -R www-data:www-data ${PROJECT_DIR}/uploads
chmod 755 ${PROJECT_DIR}/uploads
print_status "Uploads directory created"

# Setup environment variables
echo -e "${BLUE}⚙️  Configuring environment variables...${NC}"
cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# JWT Configuration
JWT_SECRET="$(openssl rand -base64 64)"
JWT_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="production"
PORT=5000
FRONTEND_PORT=3000

# Domain Configuration
DOMAIN="${DOMAIN}"
SITE_URL="https://${DOMAIN}"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Email Configuration (Gmail SMTP - Update with your credentials)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@${DOMAIN}"

# File Upload Configuration
UPLOAD_DIR="${PROJECT_DIR}/uploads"
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="jpg,jpeg,png,gif,pdf,doc,docx"

# Security Configuration
CORS_ORIGIN="https://${DOMAIN}"
RATE_LIMIT_WINDOW="900000"
RATE_LIMIT_MAX="100"
BCRYPT_ROUNDS="12"
SESSION_SECRET="$(openssl rand -base64 64)"

# Optional: Cloudinary (for image hosting)
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="your-api-key"
# CLOUDINARY_API_SECRET="your-api-secret"

# Optional: SMS Configuration (Twilio)
# TWILIO_ACCOUNT_SID="your-twilio-sid"
# TWILIO_AUTH_TOKEN="your-twilio-token"
# TWILIO_PHONE_NUMBER="your-twilio-number"

# Optional: Push Notifications
# VAPID_PUBLIC_KEY="your-vapid-public-key"
# VAPID_PRIVATE_KEY="your-vapid-private-key"
EOF
print_status "Environment variables configured"

# Build applications
echo -e "${BLUE}🔨 Building applications...${NC}"
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed 2>/dev/null || print_warning "Seeding skipped (might already be done)"
npm run build
cd ../frontend
npm run build
cd ..
print_status "Applications built"

# Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/${DOMAIN} << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL Configuration (will be added by Certbot)
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location /uploads {
        alias ${PROJECT_DIR}/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
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

# Save PM2 configuration
pm2 save
pm2 startup systemd -u root --hp /root
print_status "Applications started with PM2"

# Install Certbot and setup SSL
echo -e "${BLUE}🔒 Installing Certbot for SSL...${NC}"
apt install certbot python3-certbot-nginx -y

# Check if domain resolves
print_info "Checking if domain resolves..."
if nslookup ${DOMAIN} > /dev/null 2>&1; then
    print_info "Domain resolves, attempting to get SSL certificate..."
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || print_warning "SSL setup failed - you may need to run it manually after DNS propagation"
    print_status "SSL certificate setup attempted"
else
    print_warning "Domain doesn't resolve yet. Run 'certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}' after DNS propagation"
fi

# Configure UFW firewall
echo -e "${BLUE}🔥 Configuring UFW firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
print_status "UFW firewall configured"

# Final status check
echo -e "${BLUE}🔍 Performing final status check...${NC}"
sleep 5

# Check PM2 processes
if pm2 list | grep -q "online"; then
    print_status "PM2 processes are running"
else
    print_error "Some PM2 processes failed to start"
fi

# Check services
services=("nginx" "postgresql" "redis-server")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service is not running"
    fi
done

# Create status check script
cat > /usr/local/bin/xillix-status << 'EOF'
#!/bin/bash
echo "=== Xillix Real Estate Platform Status ==="
echo ""
echo "🔄 PM2 Processes:"
pm2 list
echo ""
echo "🌐 Nginx Status:"
systemctl status nginx --no-pager -l | head -10
echo ""
echo "🗄️  PostgreSQL Status:"
systemctl status postgresql --no-pager -l | head -10
echo ""
echo "📊 Redis Status:"
systemctl status redis-server --no-pager -l | head -10
echo ""
echo "💾 Disk Usage:"
df -h /
echo ""
echo "🧠 Memory Usage:"
free -h
echo ""
echo "🔗 Network Connections:"
ss -tulpn | grep -E ':(80|443|3000|5000|5432|6379)'
EOF

chmod +x /usr/local/bin/xillix-status
print_status "Status script created: run 'xillix-status' to check system"

# Display completion message
echo -e "${GREEN}"
echo "🎉 DigitalOcean Deployment Completed!"
echo "====================================="
echo ""
echo "🌐 Your application should be accessible at:"
echo "   • Website: https://${DOMAIN}"
echo "   • API: https://${DOMAIN}/api"
echo "   • Admin: https://${DOMAIN}/admin"
echo ""
echo "📋 Next Steps:"
echo "   1. Update DNS records to point ${DOMAIN} to this server's IP"
echo "   2. Wait for DNS propagation (5-48 hours)"
echo "   3. Update email credentials in .env file"
echo "   4. Run SSL setup if it failed: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "   5. Test your application"
echo ""
echo "🛠️  Useful Commands:"
echo "   • xillix-status          - Check system status"
echo "   • pm2 status            - Check PM2 processes"
echo "   • pm2 logs              - View application logs"
echo "   • pm2 restart all       - Restart all applications"
echo "   • nginx -t              - Test Nginx configuration"
echo "   • systemctl status nginx - Check Nginx status"
echo "   • tail -f /var/log/nginx/error.log - View Nginx errors"
echo ""
echo "📧 Don't forget to update email settings in .env file!"
echo "📱 Configure optional services (Cloudinary, Twilio, etc.) as needed"
echo "${NC}"

print_status "Deployment script completed successfully!"