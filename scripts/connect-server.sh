#!/bin/bash

# =============================================================================
# XILLIX PRODUCTION SERVER CONNECTION SCRIPT
# =============================================================================
# This script connects to the DigitalOcean production server
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

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}CONNECTING TO XILLIX PRODUCTION SERVER${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${YELLOW}Server IP:${NC} $SERVER_IP"
echo -e "${YELLOW}Domain:${NC} $DOMAIN"
echo -e "${YELLOW}User:${NC} $SERVER_USER"
echo -e "${YELLOW}SSH Key:${NC} $SSH_KEY_PATH"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ SSH key not found at: $SSH_KEY_PATH${NC}"
    echo -e "${YELLOW}Please ensure the SSH key is in the project root directory${NC}"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$SSH_KEY_PATH"

echo -e "${GREEN}🔑 Connecting to server...${NC}"
echo ""

# Connect to server
ssh -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_IP"

echo ""
echo -e "${GREEN}✅ Connection closed${NC}"