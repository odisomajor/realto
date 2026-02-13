#!/bin/bash

# Xillix Health Check & Troubleshooting Script
# Run this on your DigitalOcean Droplet

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Starting Health Check...${NC}"
echo "====================================="

# 1. Check System Resources
echo -e "\n${YELLOW}1. System Resources:${NC}"
free -h
df -h /

# 2. Check Nginx
echo -e "\n${YELLOW}2. Nginx Status:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is NOT running${NC}"
    echo "Last error logs:"
    journalctl -u nginx -n 10 --no-pager
fi

# 3. Check PM2 (Application)
echo -e "\n${YELLOW}3. PM2 Application Status:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 list
    
    echo -e "\n${YELLOW}Recent Frontend Logs:${NC}"
    pm2 logs xillix-frontend --lines 20 --nostream
    
    echo -e "\n${YELLOW}Recent Backend Logs:${NC}"
    pm2 logs xillix-backend --lines 20 --nostream
else
    echo -e "${RED}❌ PM2 is not installed${NC}"
fi

# 4. Check Ports
echo -e "\n${YELLOW}4. Listening Ports:${NC}"
ss -tulpn | grep -E ':(80|443|3000|5000)'

# 5. Check Database
echo -e "\n${YELLOW}5. Database Status:${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is NOT running${NC}"
fi

echo -e "\n====================================="
echo -e "${YELLOW}Health Check Complete${NC}"
