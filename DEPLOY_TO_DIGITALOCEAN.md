# Deploy Xillix Real Estate Platform to DigitalOcean

## 🚀 Complete Deployment Guide for xillix.co.ke

This guide will help you deploy your Real Estate Platform to DigitalOcean using the domain you purchased from HostPinnacle.

## 📋 Pre-Deployment Information

Based on the codebase analysis, here's what we have configured:

- **GitHub Repository**: `https://github.com/odisomajor/realto.git`
- **Domain**: `xillix.co.ke` (purchased from HostPinnacle)
- **Platform**: DigitalOcean Ubuntu Droplet
- **Database**: PostgreSQL
- **Cache**: Redis
- **Web Server**: Nginx
- **Process Manager**: PM2

## 🔧 Step 1: Create DigitalOcean Droplet

1. **Login to DigitalOcean**
   - Go to [DigitalOcean](https://cloud.digitalocean.com)
   - Create a new Droplet

2. **Droplet Configuration**
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($12/month - 2GB RAM, 1 vCPU, 50GB SSD)
   - **Region**: Choose closest to Kenya (Frankfurt or London)
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `xillix-production`

3. **Note Your Droplet IP**
   - After creation, note the public IP address (e.g., `123.456.789.012`)

## 🌐 Step 2: Configure DNS (Already Done)

Since you mentioned nameservers are already changed, verify:
- Your domain `xillix.co.ke` should point to your DigitalOcean droplet IP
- Check DNS propagation: `nslookup xillix.co.ke`

## 🚀 Step 3: Deploy Using Automated Script

### Option A: Quick Deployment (Recommended)

1. **SSH into your server**:
```bash
ssh root@YOUR_DROPLET_IP
```

2. **Download and run the deployment script**:
```bash
curl -o deploy.sh https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

### Option B: Manual Step-by-Step Deployment

If you prefer manual control, follow these steps:

1. **SSH into your server**:
```bash
ssh root@YOUR_DROPLET_IP
```

2. **Update system**:
```bash
apt update && apt upgrade -y
```

3. **Install Node.js 18**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

4. **Install PostgreSQL**:
```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
```

5. **Install Redis**:
```bash
apt install redis-server -y
systemctl start redis-server
systemctl enable redis-server
```

6. **Install Nginx**:
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

7. **Install PM2**:
```bash
npm install -g pm2
```

8. **Clone repository**:
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/odisomajor/realto.git xillix
cd xillix
```

9. **Install dependencies**:
```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

10. **Setup database**:
```bash
sudo -u postgres createuser realestate
sudo -u postgres createdb realestate_prod
sudo -u postgres psql -c "ALTER USER realestate PASSWORD 'realto2024secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;"
```

## 🔐 Step 4: Configure Environment Variables

Create the production environment file:

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

# Email Configuration (Gmail SMTP)
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
```

## 🏗️ Step 5: Build and Setup Applications

1. **Run database migrations**:
```bash
cd /var/www/xillix/backend
npx prisma migrate deploy
npx prisma generate
npm run seed
```

2. **Build frontend**:
```bash
cd /var/www/xillix/frontend
npm run build
```

3. **Build backend**:
```bash
cd /var/www/xillix/backend
npm run build
```

## ⚙️ Step 6: Configure Nginx

Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/xillix.co.ke
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name xillix.co.ke www.xillix.co.ke;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name xillix.co.ke www.xillix.co.ke;
    
    # SSL Configuration (will be added by Certbot)
    
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
nginx -t
systemctl reload nginx
```

## 🔒 Step 7: Setup SSL Certificate

Install Certbot and get SSL certificate:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke
```

## 🚀 Step 8: Start Applications with PM2

1. **Start backend**:
```bash
cd /var/www/xillix/backend
pm2 start npm --name "xillix-backend" -- start
```

2. **Start frontend**:
```bash
cd /var/www/xillix/frontend
pm2 start npm --name "xillix-frontend" -- start
```

3. **Save PM2 configuration**:
```bash
pm2 save
pm2 startup
```

## 🔥 Step 9: Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## ✅ Step 10: Verify Deployment

1. **Check services**:
```bash
pm2 status
systemctl status nginx
systemctl status postgresql
systemctl status redis-server
```

2. **Test your website**:
   - Visit `https://xillix.co.ke`
   - Check API: `https://xillix.co.ke/api/health`

## 🔧 Step 11: Generate Secure Secrets

If you need to generate secure secrets:

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate database password
openssl rand -base64 32
```

## 📊 Monitoring and Maintenance

1. **Check logs**:
```bash
pm2 logs
tail -f /var/log/nginx/error.log
```

2. **Update application**:
```bash
cd /var/www/xillix
git pull origin main
npm install
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..
pm2 restart all
```

3. **Backup database**:
```bash
pg_dump -U realestate realestate_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🆘 Troubleshooting

### Common Issues:

1. **502 Bad Gateway**: Check if PM2 processes are running
2. **Database connection error**: Verify PostgreSQL is running and credentials are correct
3. **SSL issues**: Run `certbot renew --dry-run` to test renewal
4. **Permission issues**: Ensure proper ownership: `chown -R www-data:www-data /var/www/xillix`

### Useful Commands:

```bash
# Check system resources
htop
df -h
free -h

# Check service status
systemctl status nginx postgresql redis-server

# PM2 management
pm2 status
pm2 restart all
pm2 logs --lines 50
```

## 🎉 Success!

Your Xillix Real Estate Platform should now be live at `https://xillix.co.ke`!

## 📞 Next Steps

1. **Test all functionality**: Registration, login, property listings, search
2. **Setup monitoring**: Consider adding Prometheus/Grafana for monitoring
3. **Configure backups**: Setup automated database and file backups
4. **Performance optimization**: Enable caching, CDN if needed
5. **Security hardening**: Regular updates, security scanning

---

**Need Help?** If you encounter any issues during deployment, check the logs and ensure all services are running properly.