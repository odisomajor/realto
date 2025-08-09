# Deploy Real Estate Platform to Your Custom Domain

Since you already have your own domain, here's how to deploy your Real Estate Platform to your custom domain and hosting.

## 🌐 **Deployment Options for Custom Domain**

### **Option 1: VPS/Cloud Server (Recommended)**
Best for full control and custom domain setup.

### **Option 2: Shared Hosting with Node.js Support**
If your hosting provider supports Node.js applications.

### **Option 3: Cloud Platform with Custom Domain**
Use Vercel/Netlify but connect your custom domain.

---

## 🚀 **Option 1: VPS/Cloud Server Deployment**

### **Step 1: Get a VPS Server**
Choose a provider:
- **DigitalOcean** ($6/month droplet)
- **Linode** ($5/month)
- **Vultr** ($6/month)
- **AWS EC2** (t3.micro)
- **Google Cloud Compute**

### **Step 2: Server Setup**

#### **Connect to your server:**
```bash
ssh root@your-server-ip
```

#### **Install required software:**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Nginx
apt install nginx -y

# Install PM2 (Process Manager)
npm install -g pm2

# Install Git
apt install git -y
```

### **Step 3: Clone Your Repository**
```bash
# Clone your repository
git clone https://github.com/odisomajor/realto.git
cd realto

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### **Step 4: Database Setup**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE realestate_prod;
CREATE USER realestate WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE realestate_prod TO realestate;
\q
```

### **Step 5: Environment Configuration**
```bash
# Copy and edit environment file
cp .env.production .env
nano .env
```

**Update these values in `.env`:**
```env
DATABASE_URL="postgresql://realestate:your-secure-password@localhost:5432/realestate_prod"
JWT_SECRET="your-super-secure-jwt-secret-key"
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://yourdomain.com"
CORS_ORIGIN="https://yourdomain.com"
```

### **Step 6: Build Applications**
```bash
# Build backend
cd backend
npm run build

# Setup database
npx prisma generate
npx prisma migrate deploy
npm run seed

# Build frontend
cd ../frontend
npm run build
```

### **Step 7: Start Applications with PM2**
```bash
# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Step 8: Configure Nginx**
```bash
# Copy custom domain configuration
cp config/nginx/custom-domain.conf /etc/nginx/sites-available/yourdomain.com

# Edit the configuration
nano /etc/nginx/sites-available/yourdomain.com
```

**Replace `yourdomain.com` with your actual domain in the file.**

```bash
# Enable the site
ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### **Step 9: SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

### **Step 10: Point Domain to Server**
In your domain registrar's DNS settings:
- **A Record**: `@` → `your-server-ip`
- **A Record**: `www` → `your-server-ip`

---

## 🌐 **Option 2: Shared Hosting with Node.js**

If your hosting provider supports Node.js:

### **Requirements:**
- Node.js 18+ support
- PostgreSQL database
- SSH access or file manager
- Custom domain pointing

### **Steps:**
1. **Upload files** via FTP/SSH
2. **Install dependencies**: `npm install`
3. **Setup database** through hosting panel
4. **Configure environment** variables
5. **Build applications**: `npm run build`
6. **Start with PM2** or hosting's process manager

---

## 🔧 **Option 3: Cloud Platform + Custom Domain**

### **Vercel with Custom Domain:**
1. **Deploy to Vercel** (as explained earlier)
2. **Add custom domain** in Vercel dashboard
3. **Update DNS** records as instructed by Vercel
4. **SSL** is automatically handled

### **Netlify with Custom Domain:**
1. **Deploy to Netlify**
2. **Add custom domain** in site settings
3. **Update DNS** records
4. **SSL** is automatically provided

---

## 📋 **Post-Deployment Checklist**

- [ ] **Domain resolves** to your server
- [ ] **HTTPS works** (SSL certificate installed)
- [ ] **Frontend loads** at https://yourdomain.com
- [ ] **API responds** at https://yourdomain.com/api/health
- [ ] **Database connected** and seeded
- [ ] **Authentication works**
- [ ] **All features functional**

---

## 🔧 **Environment Variables for Custom Domain**

**Backend (.env):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/realestate_prod"
JWT_SECRET="your-super-secure-jwt-secret"
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://yourdomain.com"
CORS_ORIGIN="https://yourdomain.com"
```

**Frontend (if needed):**
```env
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Domain not resolving:**
   - Check DNS propagation (can take 24-48 hours)
   - Verify A records point to correct IP

2. **SSL certificate issues:**
   - Ensure domain resolves before running certbot
   - Check firewall allows ports 80 and 443

3. **API not accessible:**
   - Check Nginx configuration
   - Verify backend is running on port 5000
   - Check firewall settings

4. **Database connection errors:**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

---

## 💰 **Cost Estimate**

**VPS Deployment:**
- **Server**: $5-10/month
- **Domain**: $10-15/year (you already have this)
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$5-10/month

---

## 🚀 **Quick Start Commands**

Once you have your VPS ready:

```bash
# 1. Clone and setup
git clone https://github.com/odisomajor/realto.git
cd realto && npm install

# 2. Setup database
sudo -u postgres createdb realestate_prod

# 3. Configure environment
cp .env.production .env
# Edit .env with your values

# 4. Build and deploy
cd backend && npm run build && npx prisma migrate deploy
cd ../frontend && npm run build
cd .. && pm2 start ecosystem.config.js

# 5. Setup Nginx
cp config/nginx/custom-domain.conf /etc/nginx/sites-available/yourdomain.com
# Edit domain name, then enable site

# 6. Get SSL
certbot --nginx -d yourdomain.com
```

---

## 📞 **Need Help?**

**What's your hosting situation?**
1. **Do you have a VPS/server?** → Use Option 1
2. **Using shared hosting?** → Check if they support Node.js
3. **Want managed hosting?** → Use Option 3 (Vercel/Netlify)

Let me know your hosting setup and domain name, and I can provide more specific instructions!