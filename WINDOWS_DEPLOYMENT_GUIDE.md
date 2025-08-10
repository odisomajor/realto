# Deploy from Windows to DigitalOcean

## 🖥️ Windows to DigitalOcean Deployment Guide

This guide helps you deploy your Xillix Real Estate Platform from your Windows machine to a DigitalOcean Ubuntu server.

## 📋 Prerequisites

1. **DigitalOcean Account** - [Sign up here](https://cloud.digitalocean.com)
2. **SSH Client** - Windows 10/11 has OpenSSH built-in
3. **Domain Ready** - Your `xillix.co.ke` nameservers already changed

## 🚀 Step 1: Create DigitalOcean Droplet

### Via DigitalOcean Web Interface:

1. **Login to DigitalOcean**
   - Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com)

2. **Create New Droplet**
   - Click "Create" → "Droplets"
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($12/month - 2GB RAM, 1 vCPU, 50GB SSD)
   - **Region**: Frankfurt or London (closest to Kenya)
   - **Authentication**: 
     - **SSH Key** (recommended) - Upload your public key
     - **Password** (easier for beginners)
   - **Hostname**: `xillix-production`

3. **Note Your Server Details**
   - **IP Address**: `123.456.789.012` (example)
   - **Username**: `root`
   - **Password**: (if you chose password auth)

## 🔐 Step 2: Connect from Windows

### Option A: Using Windows PowerShell (Recommended)

Open PowerShell as Administrator and run:

```powershell
# Connect to your server (replace with your actual IP)
ssh root@YOUR_DROPLET_IP

# Example:
# ssh root@123.456.789.012
```

### Option B: Using PuTTY

1. Download [PuTTY](https://www.putty.org/)
2. Open PuTTY
3. Enter your droplet IP in "Host Name"
4. Click "Open"
5. Login as `root`

### Option C: Using Windows Subsystem for Linux (WSL)

```bash
# If you have WSL installed
wsl
ssh root@YOUR_DROPLET_IP
```

## 🛠️ Step 3: Deploy on Server

Once connected to your Ubuntu server, run these commands:

### Quick Automated Deployment:

```bash
# Update system
apt update && apt upgrade -y

# Download deployment script
curl -o deploy.sh https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh

# Make executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Manual Deployment (if automated fails):

```bash
# 1. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 2. Install PostgreSQL
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql

# 3. Install Redis
apt install redis-server -y
systemctl start redis-server
systemctl enable redis-server

# 4. Install Nginx
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# 5. Install PM2
npm install -g pm2

# 6. Install Git
apt install git -y

# 7. Clone repository
mkdir -p /var/www
cd /var/www
git clone https://github.com/odisomajor/realto.git xillix
cd xillix

# 8. Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 9. Setup database
sudo -u postgres createuser realestate
sudo -u postgres createdb realestate_prod
sudo -u postgres psql -c "ALTER USER realestate PASSWORD 'realto2024secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;"
```

## 🔧 Step 4: Configure Environment

Create environment file:

```bash
nano /var/www/xillix/.env
```

Add this configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
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

# Email Configuration
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
```

## 🏗️ Step 5: Build and Start Applications

```bash
# Build applications
cd /var/www/xillix/backend
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run build

cd /var/www/xillix/frontend
npm run build

# Start with PM2
cd /var/www/xillix/backend
pm2 start npm --name "xillix-backend" -- start

cd /var/www/xillix/frontend
pm2 start npm --name "xillix-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🌐 Step 6: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/xillix.co.ke
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name xillix.co.ke www.xillix.co.ke;
    
    # Frontend
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
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔒 Step 7: Setup SSL Certificate

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke
```

## 🔥 Step 8: Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## ✅ Step 9: Verify Deployment

Check if everything is running:

```bash
# Check PM2 processes
pm2 status

# Check services
systemctl status nginx
systemctl status postgresql
systemctl status redis-server

# Check website
curl -I https://xillix.co.ke
```

## 🖥️ Managing from Windows

### Useful Windows Commands for Server Management:

```powershell
# Connect to server
ssh root@YOUR_DROPLET_IP

# Copy files to server (using SCP)
scp -r ./local-folder root@YOUR_DROPLET_IP:/var/www/xillix/

# Copy files from server
scp root@YOUR_DROPLET_IP:/var/www/xillix/logs/app.log ./local-logs/
```

### Using VS Code for Remote Development:

1. Install "Remote - SSH" extension in VS Code
2. Connect to your server: `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
3. Enter: `root@YOUR_DROPLET_IP`
4. Edit files directly on the server

## 🔧 Troubleshooting from Windows

### Check Server Status:
```bash
ssh root@YOUR_DROPLET_IP "pm2 status"
ssh root@YOUR_DROPLET_IP "systemctl status nginx"
```

### View Logs:
```bash
ssh root@YOUR_DROPLET_IP "pm2 logs --lines 50"
ssh root@YOUR_DROPLET_IP "tail -f /var/log/nginx/error.log"
```

### Restart Services:
```bash
ssh root@YOUR_DROPLET_IP "pm2 restart all"
ssh root@YOUR_DROPLET_IP "systemctl restart nginx"
```

## 🎉 Success!

Your website should now be live at `https://xillix.co.ke`!

## 📞 Need Help?

If you encounter issues:

1. **Check server logs**: `ssh root@YOUR_DROPLET_IP "pm2 logs"`
2. **Verify services**: `ssh root@YOUR_DROPLET_IP "pm2 status"`
3. **Test connectivity**: `ping YOUR_DROPLET_IP`
4. **Check DNS**: `nslookup xillix.co.ke`

---

**Remember**: All deployment commands run on your Ubuntu server, not on your Windows machine. Your Windows machine is just the client to connect and manage the server.