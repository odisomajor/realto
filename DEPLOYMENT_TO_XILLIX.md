# Deployment Guide for xillix.co.ke

## ✅ GitHub Deployment Status

The latest version has been successfully pushed to GitHub repository:
https://github.com/odisomajor/realto.git

## 🚀 Production Deployment to xillix.co.ke

### Prerequisites

- SSH access to your xillix.co.ke server
- Root or sudo privileges on the server
- Domain DNS pointing to your server IP

### Step 1: Connect to Your Server

```bash
ssh root@xillix.co.ke
# or
ssh your-username@xillix.co.ke
```

### Step 2: Download and Run Deployment Script

```bash
# Download the deployment script
wget https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh

# Make it executable
chmod +x deploy-to-domain.sh

# Run the deployment
sudo ./deploy-to-domain.sh xillix.co.ke
```

### What the Deployment Script Does:

1. **System Setup**: Updates packages and installs required software
   - Node.js 18
   - PostgreSQL
   - Nginx
   - PM2 (Process Manager)
   - Git

2. **Application Setup**:
   - Clones the latest code from GitHub
   - Installs all dependencies
   - Builds both frontend and backend
   - Sets up production environment variables

3. **Database Configuration**:
   - Creates PostgreSQL database
   - Runs database migrations
   - Seeds initial data

4. **Web Server Configuration**:
   - Configures Nginx as reverse proxy
   - Sets up SSL certificate with Let's Encrypt
   - Configures firewall

5. **Process Management**:
   - Starts applications with PM2
   - Configures auto-restart on server reboot

### Step 3: Verify Deployment

After deployment completes, check the status:

```bash
# Check application status
realto-status

# Check PM2 processes
pm2 status

# Check Nginx status
systemctl status nginx

# View application logs
pm2 logs
```

### Step 4: Access Your Application

- **Main Site**: https://xillix.co.ke
- **API Endpoint**: https://xillix.co.ke/api
- **Admin Panel**: https://xillix.co.ke/admin

### Manual Deployment Alternative

If you prefer manual deployment:

1. **Clone Repository**:

```bash
cd /var/www
git clone https://github.com/odisomajor/realto.git
cd realto
```

2. **Install Dependencies**:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

3. **Setup Environment**:

```bash
cp .env.example .env
# Edit .env with your production settings
nano .env
```

4. **Build Applications**:

```bash
cd backend
npm run build
npx prisma generate
npx prisma migrate deploy
cd ../frontend
npm run build
cd ..
```

5. **Start with PM2**:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Troubleshooting

#### If SSL Certificate Fails:

```bash
# Wait for DNS propagation, then run:
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke
```

#### If Applications Don't Start:

```bash
# Check logs
pm2 logs

# Restart applications
pm2 restart all

# Check database connection
cd backend && npm run db:status
```

#### If Nginx Configuration Issues:

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx
```

### Post-Deployment Tasks

1. **Configure Email Settings** (in .env):
   - Set up SMTP credentials for email notifications
   - Configure email templates

2. **Set Up Monitoring**:
   - Configure PM2 monitoring
   - Set up log rotation
   - Configure backup schedules

3. **Security Hardening**:
   - Review firewall rules
   - Set up fail2ban
   - Configure regular security updates

4. **Performance Optimization**:
   - Configure Redis for caching
   - Set up CDN for static assets
   - Optimize database queries

### Maintenance Commands

```bash
# Update application
cd /var/www/realto
git pull origin main
npm run build:all
pm2 restart all

# View logs
pm2 logs

# Monitor resources
htop

# Check disk space
df -h

# Database backup
pg_dump realestate_prod > backup_$(date +%Y%m%d).sql
```

### Support

If you encounter any issues during deployment:

1. Check the deployment logs
2. Verify DNS settings
3. Ensure all prerequisites are met
4. Contact your hosting provider if server-specific issues arise

## 🎉 Deployment Complete!

Your Real Estate Platform is now live at https://xillix.co.ke with all the
latest features including:

- Enhanced Property Details & Listing Management
- Interactive Image Gallery
- Tour Scheduling System
- Agent Contact System
- Property Statistics and Analytics
- Responsive Design
- SEO Optimization
