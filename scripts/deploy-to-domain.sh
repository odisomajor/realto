#!/bin/bash

# Real Estate Platform - Custom Domain Deployment Script
# Usage: ./deploy-to-domain.sh yourdomain.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide your domain name${NC}"
    echo "Usage: ./deploy-to-domain.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1
PROJECT_DIR="/var/www/realto"

echo -e "${BLUE}🚀 Starting Real Estate Platform deployment for ${DOMAIN}${NC}"

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

# Setup database
echo -e "${BLUE}🗄️  Setting up database...${NC}"
sudo -u postgres psql -c "CREATE DATABASE realestate_prod;" 2>/dev/null || print_warning "Database already exists"
sudo -u postgres psql -c "CREATE USER realestate WITH ENCRYPTED PASSWORD 'realto2024secure';" 2>/dev/null || print_warning "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;" 2>/dev/null
print_status "Database configured"

# Setup environment
echo -e "${BLUE}⚙️  Configuring environment...${NC}"
cat > .env << EOF
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"
JWT_SECRET="$(openssl rand -base64 32)"
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://${DOMAIN}"
CORS_ORIGIN="https://${DOMAIN}"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
REDIS_URL="redis://localhost:6379"
EMAIL_FROM="noreply@${DOMAIN}"
SMTP_HOST="localhost"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
SESSION_SECRET="$(openssl rand -base64 32)"
BCRYPT_ROUNDS=12
EOF
print_status "Environment configured"

# Build applications
echo -e "${BLUE}🔨 Building applications...${NC}"
cd backend
npm run build
npx prisma generate
npx prisma migrate deploy
npm run seed 2>/dev/null || print_warning "Seeding skipped (might already be done)"
cd ../frontend
npm run build
cd ..
print_status "Applications built"

# Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
sed "s/yourdomain.com/${DOMAIN}/g" config/nginx/custom-domain.conf > /etc/nginx/sites-available/${DOMAIN}
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
print_status "Nginx configured"

# Start applications with PM2
echo -e "${BLUE}🚀 Starting applications...${NC}"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
print_status "Applications started"

# Install Certbot and get SSL certificate
echo -e "${BLUE}🔒 Setting up SSL certificate...${NC}"
apt install certbot python3-certbot-nginx -y

# Check if domain resolves
if nslookup ${DOMAIN} > /dev/null 2>&1; then
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    print_status "SSL certificate installed"
else
    print_warning "Domain doesn't resolve yet. Run 'certbot --nginx -d ${DOMAIN}' after DNS propagation"
fi

# Setup firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
print_status "Firewall configured"

# Final status check
echo -e "${BLUE}🔍 Checking deployment status...${NC}"
sleep 5

if pm2 list | grep -q "online"; then
    print_status "PM2 processes running"
else
    print_error "Some PM2 processes failed to start"
fi

if systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx is not running"
fi

if systemctl is-active --quiet postgresql; then
    print_status "PostgreSQL is running"
else
    print_error "PostgreSQL is not running"
fi

echo -e "${GREEN}"
echo "🎉 Deployment completed!"
echo "=================================="
echo "Domain: https://${DOMAIN}"
echo "API: https://${DOMAIN}/api"
echo "Admin: https://${DOMAIN}/admin"
echo ""
echo "Next steps:"
echo "1. Point your domain DNS to this server IP"
echo "2. Wait for DNS propagation (up to 48 hours)"
echo "3. Run: certbot --nginx -d ${DOMAIN} (if SSL wasn't installed)"
echo "4. Test your application"
echo ""
echo "Useful commands:"
echo "- pm2 status (check app status)"
echo "- pm2 logs (view logs)"
echo "- nginx -t (test nginx config)"
echo "- systemctl status nginx (nginx status)"
echo "${NC}"

# Create a simple status check script
cat > /usr/local/bin/realto-status << 'EOF'
#!/bin/bash
echo "=== Real Estate Platform Status ==="
echo "PM2 Processes:"
pm2 list
echo ""
echo "Nginx Status:"
systemctl status nginx --no-pager -l
echo ""
echo "PostgreSQL Status:"
systemctl status postgresql --no-pager -l
echo ""
echo "Disk Usage:"
df -h /
echo ""
echo "Memory Usage:"
free -h
EOF

chmod +x /usr/local/bin/realto-status
print_status "Status script created: run 'realto-status' to check system"

echo -e "${BLUE}🏁 Deployment script completed!${NC}"