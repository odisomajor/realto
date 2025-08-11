#!/bin/bash

# =============================================================================
# XILLIX PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# This script deploys the RealEstate project to the DigitalOcean production server
# Server IP: 146.190.121.74
# Domain: xillix.co.ke
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configuration
SERVER_IP="146.190.121.74"
SERVER_USER="root"
SSH_KEY_PATH="./new_key"
DOMAIN="xillix.co.ke"
PROJECT_PATH="/var/www/xillix"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}DEPLOYING TO XILLIX PRODUCTION SERVER${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${YELLOW}Server IP:${NC} $SERVER_IP"
echo -e "${YELLOW}Domain:${NC} $DOMAIN"
echo -e "${YELLOW}Project Path:${NC} $PROJECT_PATH"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ SSH key not found at: $SSH_KEY_PATH${NC}"
    echo -e "${YELLOW}Please ensure the SSH key is in the project root directory${NC}"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$SSH_KEY_PATH"

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Function to run commands on remote server
run_remote() {
    ssh -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to copy files to remote server
copy_to_remote() {
    scp -i "$SSH_KEY_PATH" -r "$1" "$SERVER_USER@$SERVER_IP:$2"
}

echo -e "${YELLOW}📥 Pulling latest changes from repository...${NC}"
run_remote "cd $PROJECT_PATH && git pull origin main"

echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
run_remote "cd $PROJECT_PATH/backend && npm install --production"

echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
run_remote "cd $PROJECT_PATH/frontend && npm install --production"

echo -e "${YELLOW}🔨 Building frontend application...${NC}"
run_remote "cd $PROJECT_PATH/frontend && npm run build"

echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
run_remote "cd $PROJECT_PATH/backend && npx prisma migrate deploy"

echo -e "${YELLOW}🔄 Restarting PM2 processes...${NC}"
run_remote "cd $PROJECT_PATH && pm2 restart ecosystem.config.js --env production"

echo -e "${YELLOW}🔍 Checking PM2 status...${NC}"
run_remote "pm2 status"

echo -e "${YELLOW}🌐 Testing website availability...${NC}"
if curl -f -s "https://$DOMAIN" > /dev/null; then
    echo -e "${GREEN}✅ Website is accessible at https://$DOMAIN${NC}"
else
    echo -e "${RED}❌ Website is not accessible. Please check the deployment.${NC}"
fi

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Website URL: https://$DOMAIN${NC}"
echo -e "${GREEN}Admin Panel: https://$DOMAIN/admin${NC}"
echo -e "${GREEN}API Endpoint: https://$DOMAIN/api${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Verify all functionality on the live site"
echo -e "2. Check Google Search Console verification"
echo -e "3. Submit sitemap to Google: https://$DOMAIN/sitemap.xml"
echo -e "4. Monitor PM2 processes: ${BLUE}pm2 monit${NC}"