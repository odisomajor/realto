# DigitalOcean Deployment Instructions for xillix.co.ke

## Prerequisites

- DigitalOcean Droplet IP: 146.190.121.74
- Domain: xillix.co.ke
- SSH access to the server

## Step 1: Connect to Your Server

```bash
ssh root@146.190.121.74
```

## Step 2: Download and Execute Deployment Script

```bash
# Download the deployment script
curl -o /tmp/digitalocean-deploy.sh https://raw.githubusercontent.com/odisomajor/realto/main/scripts/digitalocean-deploy.sh

# Make it executable
chmod +x /tmp/digitalocean-deploy.sh

# Run the deployment script
/tmp/digitalocean-deploy.sh
```

## Step 3: Manual Deployment (Alternative Method)

If the script doesn't work, follow these manual steps:

### 1. Update System and Install Dependencies

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
apt install git curl wget unzip -y
```

### 2. Setup Project

```bash
# Create project directory
mkdir -p /var/www/xillix
cd /var/www/xillix

# Clone repository
git clone https://github.com/odisomajor/realto.git .

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. Setup Database

```bash
# Setup PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE realestate_prod;"
sudo -u postgres psql -c "CREATE USER realestate WITH ENCRYPTED PASSWORD 'realto2024secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;"
sudo -u postgres psql -c "ALTER USER realestate CREATEDB;"
```

### 4. Configure Environment

```bash
# Create .env file
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="production"
PORT=5000
FRONTEND_PORT=3000

# Domain Configuration
DOMAIN="xillix.co.ke"
SITE_URL="https://xillix.co.ke"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Email Configuration (Update with your credentials)
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
SESSION_SECRET="your-session-secret-here"
EOF
```

### 5. Build Applications

```bash
# Create uploads directory
mkdir -p /var/www/xillix/uploads
chown -R www-data:www-data /var/www/xillix/uploads
chmod 755 /var/www/xillix/uploads

# Build backend
cd backend
npx prisma generate
npx prisma migrate deploy
npm run build

# Build frontend
cd ../frontend
npm run build
cd ..
```

### 6. Configure Nginx

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/xillix.co.ke << 'EOF'
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
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 7. Start Applications with PM2

```bash
# Start backend
cd /var/www/xillix/backend
pm2 start npm --name "xillix-backend" -- start

# Start frontend
cd ../frontend
pm2 start npm --name "xillix-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup systemd -u root --hp /root
```

### 8. Setup SSL Certificate

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (run this after DNS propagation)
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke
```

### 9. Configure Firewall

```bash
# Setup UFW firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## Step 4: DNS Configuration

Point your domain `xillix.co.ke` to your server IP `146.190.121.74`:

1. Go to your domain registrar's DNS management
2. Add/Update these records:
   - A record: `xillix.co.ke` → `146.190.121.74`
   - A record: `www.xillix.co.ke` → `146.190.121.74`

## Step 5: Post-Deployment

1. Wait for DNS propagation (5-48 hours)
2. Update email credentials in `.env` file
3. Run SSL setup: `certbot --nginx -d xillix.co.ke -d www.xillix.co.ke`
4. Test your application at `https://xillix.co.ke`

## Useful Commands

```bash
# Check system status
pm2 status
systemctl status nginx
systemctl status postgresql
systemctl status redis-server

# View logs
pm2 logs
tail -f /var/log/nginx/error.log

# Restart applications
pm2 restart all
systemctl reload nginx
```

## Troubleshooting

- If build fails, check Node.js version: `node --version` (should be 18.x)
- If database connection fails, check PostgreSQL: `sudo -u postgres psql -l`
- If SSL fails, ensure DNS has propagated: `nslookup xillix.co.ke`
- Check firewall: `ufw status`

## Security Notes

- Change default database password in production
- Update JWT_SECRET and SESSION_SECRET with strong random values
- Configure email settings with your actual SMTP credentials
- Consider setting up automated backups
