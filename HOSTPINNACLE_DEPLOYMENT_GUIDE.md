# Deploy Xillix Real Estate Platform to HostPinnacle Kenya

## 🇰🇪 Complete HostPinnacle Deployment Guide for xillix.co.ke

This guide will help you deploy your Real Estate Platform to HostPinnacle Kenya, where you purchased your domain.

## 📋 HostPinnacle Hosting Options

Based on HostPinnacle's services <mcreference link="https://www.hostpinnacle.co.ke/" index="1">1</mcreference>, you have several deployment options:

### **Option 1: VPS Hosting (Recommended)**
- **Full control** over server environment
- **Node.js support** available <mcreference link="https://creativekigen.com/hostpinnacle-review/" index="3">3</mcreference>
- **Root access** for custom configurations
- **99.9% uptime guarantee** <mcreference link="https://www.hostpinnacle.co.ke/" index="1">1</mcreference>
- **Cost**: Starting from Ksh 1,800/month

### **Option 2: Shared Hosting**
- **Limited** but may support Node.js <mcreference link="https://creativekigen.com/hostpinnacle-review/" index="3">3</mcreference>
- **Cheaper** option
- **Less control** over server configuration

## 🚀 Deployment Method 1: VPS Hosting (Recommended)

### **Step 1: Order HostPinnacle VPS**

1. **Login to HostPinnacle**
   - Go to [HostPinnacle Dashboard](https://www.hostpinnacle.co.ke/)
   - Login to your account

2. **Order VPS Plan**
   - Choose **VPS Starter** (Ksh 1,800/month) or higher
   - **Operating System**: Ubuntu 22.04 LTS
   - **Location**: Kenya (for better local performance)

3. **VPS Setup Details**
   - **RAM**: Minimum 2GB (recommended)
   - **Storage**: Minimum 50GB SSD
   - **Bandwidth**: Unlimited (as per HostPinnacle plans)

### **Step 2: Access Your VPS**

Once your VPS is provisioned, you'll receive:
- **IP Address**: e.g., `41.xxx.xxx.xxx`
- **Root Username**: `root`
- **Root Password**: (provided by HostPinnacle)

### **Step 3: Connect from Windows**

```powershell
# Connect via SSH from Windows PowerShell
ssh root@YOUR_VPS_IP

# Example:
# ssh root@41.123.456.789
```

### **Step 4: Deploy Your Application**

Once connected to your HostPinnacle VPS:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql

# Install Redis
apt install redis-server -y
systemctl start redis-server
systemctl enable redis-server

# Install Nginx
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# Install PM2
npm install -g pm2

# Install Git
apt install git -y

# Clone your repository
mkdir -p /var/www
cd /var/www
git clone https://github.com/odisomajor/realto.git xillix
cd xillix

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### **Step 5: Configure Database**

```bash
# Setup PostgreSQL database
sudo -u postgres createuser realestate
sudo -u postgres createdb realestate_prod
sudo -u postgres psql -c "ALTER USER realestate PASSWORD 'realto2024secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;"
```

### **Step 6: Configure Environment**

```bash
# Create production environment file
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

### **Step 7: Build and Setup Applications**

```bash
# Run database migrations
cd /var/www/xillix/backend
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run build

# Build frontend
cd /var/www/xillix/frontend
npm run build
```

### **Step 8: Configure Nginx**

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/xillix.co.ke
```

Add this configuration:

```nginx
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
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### **Step 9: Start Applications with PM2**

```bash
# Start backend
cd /var/www/xillix/backend
pm2 start npm --name "xillix-backend" -- start

# Start frontend
cd /var/www/xillix/frontend
pm2 start npm --name "xillix-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Step 10: Configure DNS (Already Done)**

Since you purchased your domain from HostPinnacle, your DNS should already be configured. Verify:

1. **Login to HostPinnacle Control Panel**
2. **Go to DNS Management**
3. **Ensure A Records point to your VPS IP**:
   - `@` → `YOUR_VPS_IP`
   - `www` → `YOUR_VPS_IP`

### **Step 11: Setup SSL Certificate**

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke

# Test auto-renewal
certbot renew --dry-run
```

### **Step 12: Configure Firewall**

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## 🌐 Deployment Method 2: Shared Hosting (If VPS Not Available)

### **Requirements Check**

First, verify if HostPinnacle shared hosting supports:
- **Node.js applications** <mcreference link="https://creativekigen.com/hostpinnacle-review/" index="3">3</mcreference>
- **PostgreSQL database**
- **SSH access or file manager**

### **Steps for Shared Hosting**

1. **Contact HostPinnacle Support**
   - Ask about Node.js support on shared hosting
   - Request PostgreSQL database setup
   - Get SSH access details

2. **Upload Files via FTP/SFTP**
   ```bash
   # From your Windows machine, upload project files
   # Use FileZilla or WinSCP to upload to your hosting directory
   ```

3. **Install Dependencies** (if SSH available)
   ```bash
   ssh your-username@your-shared-hosting-server
   cd public_html  # or your web directory
   npm install
   ```

4. **Configure Database**
   - Use HostPinnacle's control panel to create PostgreSQL database
   - Update your `.env` file with provided database credentials

5. **Build Applications**
   ```bash
   cd frontend && npm run build && cd ..
   cd backend && npm run build && cd ..
   ```

6. **Start Application**
   - Use HostPinnacle's process manager or PM2 (if available)
   - Configure according to their shared hosting requirements

## 🔧 HostPinnacle-Specific Configurations

### **Email Configuration**

Since you're using HostPinnacle, you can use their email services:

```env
# HostPinnacle Email Settings
SMTP_HOST="mail.xillix.co.ke"  # or HostPinnacle's SMTP server
SMTP_PORT=587
SMTP_USER="noreply@xillix.co.ke"
SMTP_PASS="your-email-password"
FROM_EMAIL="noreply@xillix.co.ke"
```

### **Backup Configuration**

HostPinnacle provides daily automated backups <mcreference link="https://www.hostpinnacle.co.ke/" index="1">1</mcreference>, but you can also set up additional backups:

```bash
# Create backup script
nano /var/www/xillix/backup.sh
```

```bash
#!/bin/bash
# Backup database
pg_dump -U realestate realestate_prod > /var/www/xillix/backups/db_$(date +%Y%m%d_%H%M%S).sql

# Backup uploads
tar -czf /var/www/xillix/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/xillix/uploads/

# Keep only last 7 days of backups
find /var/www/xillix/backups/ -name "*.sql" -mtime +7 -delete
find /var/www/xillix/backups/ -name "*.tar.gz" -mtime +7 -delete
```

## ✅ Verification Steps

1. **Check VPS Status**
   ```bash
   pm2 status
   systemctl status nginx postgresql redis-server
   ```

2. **Test Website**
   - Visit `https://xillix.co.ke`
   - Test API: `https://xillix.co.ke/api/health`
   - Test user registration and login

3. **Check SSL Certificate**
   ```bash
   curl -I https://xillix.co.ke
   ```

## 🆘 HostPinnacle-Specific Troubleshooting

### **Common Issues**

1. **VPS Access Issues**
   - Contact HostPinnacle support for VPS credentials
   - Ensure your IP isn't blocked by their firewall

2. **Domain Not Resolving**
   - Check DNS settings in HostPinnacle control panel
   - DNS propagation can take up to 24 hours

3. **Email Not Working**
   - Verify email settings with HostPinnacle support
   - Check if SMTP is enabled on your plan

4. **Performance Issues**
   - Monitor resource usage: `htop`, `df -h`
   - Consider upgrading VPS plan if needed

### **HostPinnacle Support**

- **24/7 Support** available <mcreference link="https://www.hostpinnacle.co.ke/hosting/vps-hosting/" index="2">2</mcreference>
- **Contact Methods**:
  - Support ticket system
  - Live chat on their website
  - Phone support

## 💰 Cost Breakdown

### **VPS Hosting**
- **VPS Starter**: Ksh 1,800/month (~$12/month)
- **Domain**: Already owned
- **SSL**: Free (Let's Encrypt)
- **Total**: Ksh 1,800/month

### **Shared Hosting** (if available)
- **Shared Plan**: Ksh 500-1,200/month (~$3-8/month)
- **Domain**: Already owned
- **SSL**: Usually included
- **Total**: Ksh 500-1,200/month

## 🎉 Success!

Your Xillix Real Estate Platform should now be live at `https://xillix.co.ke` hosted on HostPinnacle Kenya!

## 📞 Next Steps

1. **Test all functionality**: Registration, login, property listings
2. **Setup monitoring**: Use HostPinnacle's monitoring tools
3. **Configure backups**: Leverage HostPinnacle's backup services
4. **Performance optimization**: Monitor and optimize as needed
5. **Local SEO**: Benefit from Kenya-based hosting for local search rankings

## 🔗 Useful Links

- **HostPinnacle Dashboard**: [https://www.hostpinnacle.co.ke/](https://www.hostpinnacle.co.ke/)
- **Support**: Contact HostPinnacle support for technical assistance
- **Documentation**: Check HostPinnacle's knowledge base for VPS management

---

**Need Help?** Contact HostPinnacle's 24/7 support team for any hosting-specific issues or questions about your VPS setup.