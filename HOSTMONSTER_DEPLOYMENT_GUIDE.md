# Deploy Xillix Real Estate Platform to HostMonster

## 🚀 Complete HostMonster Deployment Guide for xillix.co.ke

This guide will help you deploy your Real Estate Platform to HostMonster (now part of Bluehost) hosting service.

## 📋 HostMonster Hosting Analysis

HostMonster offers several hosting options for your Node.js application:

### **Option 1: VPS Hosting (Recommended)**
- **Full control** over server environment
- **Node.js support** available
- **Root access** for custom configurations
- **Cost**: Starting from $19.99/month
- **Resources**: 2GB RAM, 30GB SSD, 1TB bandwidth

### **Option 2: Dedicated Hosting**
- **Maximum performance** and control
- **Ideal for high-traffic** applications
- **Cost**: Starting from $79.99/month

### **Option 3: Shared Hosting (Limited)**
- **Basic hosting** with limited Node.js support
- **Cost-effective** but with restrictions
- **May not support** full-stack applications

## 🚀 Deployment Method 1: VPS Hosting (Recommended)

### **Step 1: Order HostMonster VPS**

1. **Login to HostMonster**
   - Go to [HostMonster](https://www.hostmonster.com/)
   - Login to your account or create one

2. **Order VPS Plan**
   - Choose **VPS Standard** ($19.99/month) or higher
   - **Operating System**: CentOS 7 or Ubuntu 20.04 LTS
   - **Control Panel**: cPanel (recommended)

3. **VPS Setup Details**
   - **RAM**: Minimum 2GB (recommended 4GB)
   - **Storage**: 30GB SSD (expandable)
   - **Bandwidth**: 1TB/month

### **Step 2: Access Your VPS**

Once your VPS is provisioned, you'll receive:
- **IP Address**: e.g., `192.xxx.xxx.xxx`
- **Root Username**: `root`
- **Root Password**: (provided by HostMonster)
- **cPanel Access**: `https://your-ip:2083`

### **Step 3: Connect from Windows**

```powershell
# Connect via SSH from Windows PowerShell
ssh root@YOUR_VPS_IP

# Example:
# ssh root@192.123.456.789
```

### **Step 4: Prepare Server Environment**

Once connected to your HostMonster VPS:

```bash
# Update system (CentOS)
yum update -y

# Or for Ubuntu
# apt update && apt upgrade -y

# Install EPEL repository (CentOS)
yum install epel-release -y

# Install Node.js 18 (CentOS)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
yum install nodejs -y

# For Ubuntu:
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# apt-get install -y nodejs

# Install PostgreSQL (CentOS)
yum install postgresql-server postgresql-contrib -y
postgresql-setup initdb
systemctl start postgresql
systemctl enable postgresql

# For Ubuntu:
# apt install postgresql postgresql-contrib -y
# systemctl start postgresql
# systemctl enable postgresql

# Install Redis (CentOS)
yum install redis -y
systemctl start redis
systemctl enable redis

# For Ubuntu:
# apt install redis-server -y
# systemctl start redis-server
# systemctl enable redis-server

# Install Nginx (CentOS)
yum install nginx -y
systemctl start nginx
systemctl enable nginx

# For Ubuntu:
# apt install nginx -y
# systemctl start nginx
# systemctl enable nginx

# Install PM2
npm install -g pm2

# Install Git
yum install git -y
# Or for Ubuntu: apt install git -y
```

### **Step 5: Clone and Setup Application**

```bash
# Create project directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/odisomajor/realto.git xillix
cd xillix

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### **Step 6: Configure Database**

```bash
# Setup PostgreSQL database
sudo -u postgres createuser realestate
sudo -u postgres createdb realestate_prod
sudo -u postgres psql -c "ALTER USER realestate PASSWORD 'realto2024secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;"

# Configure PostgreSQL authentication (CentOS)
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/pgsql/data/postgresql.conf
echo "host realestate_prod realestate 127.0.0.1/32 md5" >> /var/lib/pgsql/data/pg_hba.conf
systemctl restart postgresql
```

### **Step 7: Configure Environment**

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
SMTP_HOST="mail.xillix.co.ke"  # HostMonster SMTP
SMTP_PORT=587
SMTP_USER="noreply@xillix.co.ke"
SMTP_PASS="your-email-password"
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

### **Step 8: Build Applications**

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

### **Step 9: Configure Nginx**

```bash
# Create Nginx configuration
nano /etc/nginx/conf.d/xillix.co.ke.conf
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

Test and reload Nginx:
```bash
nginx -t
systemctl reload nginx
```

### **Step 10: Configure Firewall (CentOS)**

```bash
# Configure firewall (CentOS)
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# For Ubuntu, use ufw:
# ufw allow OpenSSH
# ufw allow 'Nginx Full'
# ufw enable
```

### **Step 11: Start Applications with PM2**

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

### **Step 12: Configure DNS**

1. **Login to your domain registrar** (where you bought xillix.co.ke)
2. **Update DNS records**:
   - `A Record`: `@` → `YOUR_HOSTMONSTER_VPS_IP`
   - `A Record`: `www` → `YOUR_HOSTMONSTER_VPS_IP`
3. **Wait for DNS propagation** (up to 24 hours)

### **Step 13: Setup SSL Certificate**

```bash
# Install Certbot (CentOS)
yum install certbot python3-certbot-nginx -y

# For Ubuntu:
# apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke

# Test auto-renewal
certbot renew --dry-run
```

## 🌐 Deployment Method 2: Using cPanel (Shared/VPS with cPanel)

If your HostMonster plan includes cPanel:

### **Step 1: Access cPanel**
- Login to `https://your-domain.com:2083` or through HostMonster control panel

### **Step 2: Setup Node.js App**
1. **Go to "Node.js Apps"** in cPanel
2. **Create New App**:
   - **Node.js Version**: 18.x
   - **Application Mode**: Production
   - **Application Root**: `public_html/xillix`
   - **Application URL**: Leave blank for root domain
   - **Application Startup File**: `backend/src/app.js`

### **Step 3: Upload Files**
1. **Use File Manager** or FTP to upload your project files
2. **Extract** your project to `public_html/xillix/`

### **Step 4: Install Dependencies**
```bash
# SSH into your account
cd public_html/xillix
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### **Step 5: Configure Database**
1. **Go to "MySQL Databases"** in cPanel
2. **Create Database**: `realestate_prod`
3. **Create User**: `realestate`
4. **Assign User** to database with all privileges

### **Step 6: Build Applications**
```bash
cd public_html/xillix
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..
```

## 🔧 HostMonster-Specific Configurations

### **Email Configuration**
HostMonster provides email services:

```env
# HostMonster Email Settings
SMTP_HOST="mail.xillix.co.ke"
SMTP_PORT=587
SMTP_USER="noreply@xillix.co.ke"
SMTP_PASS="your-email-password"
FROM_EMAIL="noreply@xillix.co.ke"
```

### **Backup Configuration**
HostMonster provides automated backups, but you can set up additional ones:

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
   systemctl status nginx postgresql redis
   ```

2. **Test Website**
   - Visit `https://xillix.co.ke`
   - Test API: `https://xillix.co.ke/api/health`
   - Test user registration and login

3. **Check SSL Certificate**
   ```bash
   curl -I https://xillix.co.ke
   ```

## 🆘 HostMonster-Specific Troubleshooting

### **Common Issues**

1. **VPS Access Issues**
   - Contact HostMonster support for VPS credentials
   - Check if SSH is enabled on your plan

2. **Node.js Version Issues**
   - HostMonster may have specific Node.js versions
   - Use `nvm` to manage Node.js versions if needed

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check firewall settings
   - Ensure database credentials are correct

4. **Email Not Working**
   - Verify email settings with HostMonster support
   - Check if SMTP is enabled on your plan

### **HostMonster Support**
- **24/7 Support** available
- **Contact Methods**:
  - Phone: 1-888-401-4678
  - Live chat on their website
  - Support ticket system

## 💰 Cost Breakdown

### **VPS Hosting**
- **VPS Standard**: $19.99/month
- **Domain**: Already owned
- **SSL**: Free (Let's Encrypt)
- **Total**: $19.99/month

### **Shared Hosting** (if applicable)
- **Shared Plan**: $3.95-$13.95/month
- **Domain**: Already owned
- **SSL**: Usually included
- **Total**: $3.95-$13.95/month

## 🎉 Success!

Your Xillix Real Estate Platform should now be live at `https://xillix.co.ke` hosted on HostMonster!

## 📞 Next Steps

1. **Test all functionality**: Registration, login, property listings
2. **Setup monitoring**: Use HostMonster's monitoring tools
3. **Configure backups**: Leverage HostMonster's backup services
4. **Performance optimization**: Monitor and optimize as needed
5. **Security hardening**: Regular updates, security scanning

## 🔗 Useful Links

- **HostMonster Control Panel**: Login through your HostMonster account
- **Support**: Contact HostMonster support for technical assistance
- **Documentation**: Check HostMonster's knowledge base for VPS management

---

**Need Help?** Contact HostMonster's 24/7 support team for any hosting-specific issues or questions about your VPS setup.