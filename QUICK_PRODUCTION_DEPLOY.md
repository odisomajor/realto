# Quick Production Deployment to xillix.co.ke

## 🚀 Deployment Steps for HostPinnacle VPS

### Prerequisites
- HostPinnacle VPS ordered and configured
- Domain xillix.co.ke pointing to your VPS IP
- SSH access to your VPS

### Step 1: Connect to Your VPS
```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Run the Automated Deployment Script
```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/your-username/your-repo/main/scripts/production-deploy.sh | bash
```

### Step 3: Manual Configuration (if automated script not available)

#### Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL, Redis, Nginx, PM2
apt install postgresql postgresql-contrib redis-server nginx -y
npm install -g pm2
systemctl start postgresql redis-server nginx
systemctl enable postgresql redis-server nginx
```

#### Setup Project
```bash
# Create project directory
mkdir -p /var/www/xillix
cd /var/www/xillix

# Clone your repository (update with your actual repo URL)
git clone https://github.com/odisomajor/realto.git .

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

#### Configure Database
```bash
# Setup PostgreSQL
sudo -u postgres createdb realestate_prod
sudo -u postgres createuser realestate
sudo -u postgres psql -c "ALTER USER realestate PASSWORD 'realto2024secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;"
```

#### Setup Environment
```bash
# Copy production environment template
cp production-env-template.txt .env

# Edit environment variables
nano .env
```

Update these key values in `.env`:
```env
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"
JWT_SECRET="your-super-secure-jwt-secret-for-xillix-production"
FRONTEND_URL="https://xillix.co.ke"
CORS_ORIGIN="https://xillix.co.ke,https://www.xillix.co.ke"
EMAIL_FROM="noreply@xillix.co.ke"
```

#### Build Applications
```bash
# Build backend
cd backend
npm run build
npx prisma generate
npx prisma migrate deploy
npm run seed
cd ..

# Build frontend
cd frontend
npm run build
cd ..
```

#### Configure Nginx
```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/xillix.co.ke << 'EOF'
server {
    listen 80;
    server_name xillix.co.ke www.xillix.co.ke;

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

    location /uploads {
        alias /var/www/xillix/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

#### Start Applications with PM2
```bash
# Start applications using ecosystem config
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Setup SSL Certificate
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke --email admin@xillix.co.ke --agree-tos --non-interactive

# Test auto-renewal
certbot renew --dry-run
```

#### Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### Step 4: Verify Deployment

1. **Check PM2 Status**
   ```bash
   pm2 status
   pm2 logs
   ```

2. **Test Website**
   - Visit: https://xillix.co.ke
   - Test API: https://xillix.co.ke/api/health
   - Test Google Search Console verification

3. **Check SSL**
   ```bash
   curl -I https://xillix.co.ke
   ```

### Step 5: Google Search Console Verification

Your Google Search Console verification meta tag is already added to the layout.tsx file:
```html
<meta name="google-site-verification" content="h9ze1yXkf_JN5iH7OPrqLN68uYDkdwijAoYSfGI_kr4" />
```

After deployment:
1. Go to Google Search Console
2. Verify domain ownership
3. Submit sitemap: https://xillix.co.ke/sitemap.xml
4. Monitor indexing status

## 🔧 Post-Deployment Tasks

1. **Setup Monitoring**
   - Configure health checks
   - Setup log rotation
   - Monitor performance

2. **Backup Configuration**
   ```bash
   # Setup automated backups
   crontab -e
   # Add: 0 2 * * * /var/www/xillix/scripts/backup.sh
   ```

3. **Performance Optimization**
   - Enable Nginx gzip compression
   - Configure caching headers
   - Optimize database queries

## 🆘 Troubleshooting

- **PM2 Issues**: `pm2 restart all`
- **Nginx Issues**: `nginx -t && systemctl reload nginx`
- **Database Issues**: Check PostgreSQL logs
- **SSL Issues**: `certbot renew --force-renewal`

## 📞 Support

- HostPinnacle Support: 24/7 available
- Check logs: `pm2 logs`, `tail -f /var/log/nginx/error.log`
- Monitor resources: `htop`, `df -h`

Your site should now be live at https://xillix.co.ke with Google Search Console verification ready!