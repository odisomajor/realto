# Real Estate Platform - Deployment Guide to xillix.co.ke

## Overview

This guide provides step-by-step instructions for deploying the Real Estate
Platform to your `xillix.co.ke` domain using both automated and manual
deployment methods.

## Prerequisites

### Server Requirements

- Ubuntu 20.04+ or Debian 11+ server
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ available disk space
- Root or sudo access
- Domain name pointing to your server IP

### DNS Configuration

Ensure your domain `xillix.co.ke` has the following DNS records:

```
A     xillix.co.ke        → YOUR_SERVER_IP
A     www.xillix.co.ke    → YOUR_SERVER_IP
```

## Option 1: Automated Deployment (Recommended)

### Step 1: Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
# or
ssh your-username@YOUR_SERVER_IP
sudo su -
```

### Step 2: Download and Run Deployment Script

```bash
# Download the deployment script
curl -O https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh

# Make it executable
chmod +x deploy-to-domain.sh

# Run the deployment
./deploy-to-domain.sh xillix.co.ke
```

### What the Script Does

The automated script will:

1. **System Setup**: Update packages, install Node.js 18, PostgreSQL, Nginx,
   PM2, Git
2. **Application Setup**: Clone repository, install dependencies, build
   applications
3. **Database Configuration**: Create PostgreSQL database and user
4. **Environment Configuration**: Set up production environment variables
5. **Web Server Configuration**: Configure Nginx with SSL-ready setup
6. **Process Management**: Start applications using PM2
7. **SSL Certificate**: Install Let's Encrypt SSL certificate (if DNS is
   configured)
8. **Security**: Configure UFW firewall

### Expected Output

```
🚀 Starting Real Estate Platform deployment for xillix.co.ke
✅ System updated
✅ Node.js installed: v18.x.x
✅ PostgreSQL installed
✅ Nginx installed
✅ PM2 installed
✅ Git installed
✅ Repository cloned
✅ Dependencies installed
✅ Database configured
✅ Environment configured
✅ Applications built
✅ Nginx configured
✅ Applications started
✅ SSL certificate installed
✅ Firewall configured
```

## Option 2: Manual Deployment

### Step 1: System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### Step 2: Clone and Setup Application

```bash
# Create project directory
sudo mkdir -p /var/www/realto
cd /var/www/realto

# Clone repository
sudo git clone https://github.com/odisomajor/realto.git .

# Install dependencies
sudo npm install
cd backend && sudo npm install
cd ../frontend && sudo npm install
cd ..
```

### Step 3: Database Setup

```bash
# Switch to postgres user and create database
sudo -u postgres psql -c "CREATE DATABASE realestate_prod;"
sudo -u postgres psql -c "CREATE USER realestate WITH ENCRYPTED PASSWORD 'realto2024secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;"
```

### Step 4: Environment Configuration

```bash
# Create production environment file
sudo tee .env << EOF
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"
JWT_SECRET="$(openssl rand -base64 32)"
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://xillix.co.ke"
CORS_ORIGIN="https://xillix.co.ke"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
REDIS_URL="redis://localhost:6379"
EMAIL_FROM="noreply@xillix.co.ke"
SMTP_HOST="localhost"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
SESSION_SECRET="$(openssl rand -base64 32)"
BCRYPT_ROUNDS=12
EOF
```

### Step 5: Build Applications

```bash
# Build backend
cd backend
sudo npm run build
sudo npx prisma generate
sudo npx prisma migrate deploy
sudo npm run seed

# Build frontend
cd ../frontend
sudo npm run build
cd ..
```

### Step 6: Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/xillix.co.ke << 'EOF'
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
    location /api/ {
        proxy_pass http://localhost:5000/;
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
    location /uploads/ {
        alias /var/www/realto/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Start Applications with PM2

```bash
# Start applications
sudo pm2 start ecosystem.config.js
sudo pm2 save
sudo pm2 startup systemd -u root --hp /root
```

### Step 8: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (ensure DNS is configured first)
sudo certbot --nginx -d xillix.co.ke -d www.xillix.co.ke --non-interactive --agree-tos --email admin@xillix.co.ke
```

### Step 9: Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Verification Steps

### 1. Check Services Status

```bash
# Check PM2 processes
pm2 list

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Check application logs
pm2 logs
```

### 2. Test Application Access

- Visit `https://xillix.co.ke` in your browser
- Check that the homepage loads correctly
- Test property listings and search functionality
- Verify API endpoints: `https://xillix.co.ke/api/health`

### 3. SSL Certificate Verification

```bash
# Check SSL certificate
sudo certbot certificates

# Test SSL configuration
curl -I https://xillix.co.ke
```

## What Will Be Deployed

Your `https://xillix.co.ke` will include:

### Main Application

- **Homepage**: Property listings with search and filters
- **Property Details**: Enhanced property pages with image galleries
- **Advanced Search**: AI-powered property search with filters
- **User Authentication**: Login, registration, and user profiles
- **Favorites/Wishlist**: Save and manage favorite properties
- **Property Comparison**: Side-by-side property comparison tool
- **Agent Contact**: Contact forms and agent information
- **Tours Scheduling**: Schedule property viewings

### API Endpoints

- **Properties API**: `/api/properties` - Property CRUD operations
- **Users API**: `/api/users` - User management
- **Authentication**: `/api/auth` - Login/register endpoints
- **Favorites**: `/api/favorites` - Wishlist management
- **Search**: `/api/search` - Advanced search functionality
- **Tours**: `/api/tours` - Tour scheduling

### Admin Panel

- Property management dashboard
- User management
- Analytics and reporting
- Content management

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**

   ```bash
   # If SSL fails, check DNS first
   nslookup xillix.co.ke

   # Retry SSL certificate
   sudo certbot --nginx -d xillix.co.ke
   ```

2. **Application Not Starting**

   ```bash
   # Check PM2 logs
   pm2 logs

   # Restart applications
   pm2 restart all
   ```

3. **Database Connection Issues**

   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql

   # Test database connection
   sudo -u postgres psql -d realestate_prod -c "SELECT 1;"
   ```

4. **Nginx Configuration Issues**

   ```bash
   # Test Nginx configuration
   sudo nginx -t

   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Performance Optimization

1. **Enable Gzip Compression**

   ```bash
   # Add to Nginx configuration
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   ```

2. **Set up Redis Caching** (Optional)
   ```bash
   sudo apt install redis-server
   sudo systemctl enable redis-server
   ```

## Post-Deployment Tasks

### 1. Configure Email Settings

Update SMTP settings in `.env` file for email notifications:

```bash
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_USER="your-email@xillix.co.ke"
SMTP_PASS="your-email-password"
```

### 2. Set up Monitoring

```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3. Configure Backups

```bash
# Create backup script
sudo tee /usr/local/bin/backup-realto.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/realto"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump realestate_prod > $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/realto/backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-realto.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-realto.sh" | sudo crontab -
```

## Maintenance Commands

### Regular Maintenance

```bash
# Update application
cd /var/www/realto
sudo git pull origin main
sudo npm install
cd backend && sudo npm install && sudo npm run build
cd ../frontend && sudo npm install && sudo npm run build
sudo pm2 restart all

# View logs
pm2 logs

# Monitor processes
pm2 monit

# Restart services
sudo systemctl restart nginx
sudo systemctl restart postgresql
pm2 restart all
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
sudo npm install -g npm@latest
```

## Support

For deployment issues or questions:

- Check the application logs: `pm2 logs`
- Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check system logs: `sudo journalctl -f`

## Security Considerations

1. **Regular Updates**: Keep system and dependencies updated
2. **Firewall**: Only allow necessary ports (22, 80, 443)
3. **SSL**: Ensure SSL certificates are auto-renewed
4. **Database**: Use strong passwords and limit access
5. **Backups**: Regular automated backups
6. **Monitoring**: Set up log monitoring and alerts

---

**Deployment Complete!** Your Real Estate Platform should now be accessible at
`https://xillix.co.ke`
