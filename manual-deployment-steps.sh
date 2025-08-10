#!/bin/bash

# Manual Deployment Steps for xillix.co.ke on DigitalOcean
# Run this script as root on your Ubuntu server

set -e

echo "🚀 Starting manual deployment for xillix.co.ke"

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql

# Install Nginx
echo "📦 Installing Nginx..."
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install Git
echo "📦 Installing Git..."
apt install git -y

# Create project directory
echo "📁 Setting up project..."
mkdir -p /var/www/realto
cd /var/www/realto

# Clone repository (replace with your actual repo URL)
git clone https://github.com/your-username/your-repo.git .

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Setup database
echo "🗄️ Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE realestate_prod;" 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "CREATE USER realestate WITH ENCRYPTED PASSWORD 'realto2024secure';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;" 2>/dev/null

# Setup environment
echo "⚙️ Configuring environment..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://realestate:realto2024secure@localhost:5432/realestate_prod"
JWT_SECRET="xillix-super-secure-jwt-secret-2024"
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://xillix.co.ke"
CORS_ORIGIN="https://xillix.co.ke,https://www.xillix.co.ke"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
REDIS_URL="redis://localhost:6379"
EMAIL_FROM="noreply@xillix.co.ke"
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
SESSION_SECRET="xillix-session-secret-2024"
BCRYPT_ROUNDS=12
EOF

# Build applications
echo "🔨 Building applications..."
cd backend
npm run build
npx prisma generate
npx prisma migrate deploy
npm run seed 2>/dev/null || echo "Seeding skipped"
cd ../frontend
npm run build
cd ..

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/xillix.co.ke << 'EOF'
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

    # Static files
    location /uploads {
        alias /var/www/realto/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Start applications with PM2
echo "🚀 Starting applications..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# Install SSL certificate
echo "🔒 Setting up SSL..."
apt install certbot python3-certbot-nginx -y
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke --non-interactive --agree-tos --email admin@xillix.co.ke

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "✅ Deployment complete! Your site should be available at https://xillix.co.ke"
echo "🔍 Check status with: pm2 status"
echo "📊 View logs with: pm2 logs"