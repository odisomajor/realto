# 🔐 SSH Access & Production Deployment Guide

## 🚨 Current Issue: SSH Authentication Failed

Your DigitalOcean server is reachable but SSH authentication is failing. Here's
how to fix it:

## 🔧 **Option 1: Reset SSH Access via DigitalOcean Console**

### **Via DigitalOcean Web Console:**

1. **Login to DigitalOcean Dashboard**: https://cloud.digitalocean.com/
2. **Navigate to your Droplet**: Find droplet with IP `146.190.121.74`
3. **Access Console**: Click "Console" to open web-based terminal
4. **Login as root** (use your droplet password)
5. **Add your public key**:

   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh

   # Copy your public key content and paste it
   echo "YOUR_PUBLIC_KEY_CONTENT_HERE" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

### **Get Your Public Key Content:**

Run this command locally to get your public key:

```powershell
Get-Content new_key.pub
```

## 🔧 **Option 2: Password Authentication (Temporary)**

If you have the root password, enable password authentication temporarily:

### **Via DigitalOcean Console:**

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Change these lines:
PasswordAuthentication yes
PermitRootLogin yes

# Restart SSH service
systemctl restart sshd
```

Then connect with password:

```powershell
ssh root@146.190.121.74
```

## 🚀 **Automated Deployment Script**

Once SSH access is working, run this single command to deploy everything:

```bash
curl -sSL https://raw.githubusercontent.com/odisomajor/realto/main/scripts/digitalocean-deploy.sh | bash
```

## 📋 **What the Deployment Will Install:**

### **System Components:**

- ✅ Node.js 18 (Latest LTS)
- ✅ PostgreSQL 14 (Database)
- ✅ Redis (Caching & Sessions)
- ✅ Nginx (Web Server & Reverse Proxy)
- ✅ PM2 (Process Manager)
- ✅ Git (Version Control)

### **Application Setup:**

- ✅ Clone repository from GitHub
- ✅ Install dependencies (Backend & Frontend)
- ✅ Configure PostgreSQL database
- ✅ Set up environment variables
- ✅ Build production applications
- ✅ Configure Nginx for domain `xillix.co.ke`
- ✅ Set up SSL certificate (Let's Encrypt)
- ✅ Configure firewall (UFW)

### **Process Management:**

- ✅ Backend API (Port 5000)
- ✅ Frontend App (Port 3000)
- ✅ Worker processes
- ✅ Scheduled tasks

## 🔐 **Manual Deployment Steps** (If automated script fails)

### **1. System Updates & Dependencies:**

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs postgresql postgresql-contrib redis-server nginx git
npm install -g pm2
```

### **2. Database Setup:**

```bash
sudo -u postgres createuser --interactive --pwprompt realto_user
sudo -u postgres createdb -O realto_user realto_production
```

### **3. Clone & Setup Project:**

```bash
cd /var/www
git clone https://github.com/odisomajor/realto.git
cd realto
```

### **4. Backend Setup:**

```bash
cd backend
npm install
cp .env.production .env
# Edit .env with your database credentials
npm run build
```

### **5. Frontend Setup:**

```bash
cd ../frontend
npm install
npm run build
```

### **6. PM2 Process Management:**

```bash
cd ..
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **7. Nginx Configuration:**

```bash
cp config/nginx/nginx.prod.conf /etc/nginx/sites-available/xillix.co.ke
ln -s /etc/nginx/sites-available/xillix.co.ke /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### **8. SSL Certificate:**

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d xillix.co.ke
```

### **9. Firewall Setup:**

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## 🌐 **DNS Configuration Required**

After deployment, configure your domain DNS:

### **DNS Records for xillix.co.ke:**

```
Type: A
Name: @
Value: 146.190.121.74
TTL: 300

Type: A
Name: www
Value: 146.190.121.74
TTL: 300
```

## 🔍 **Post-Deployment Verification**

### **Check Services:**

```bash
# Check PM2 processes
pm2 status

# Check Nginx
systemctl status nginx

# Check database
sudo -u postgres psql -c "\l"

# Check application logs
pm2 logs
```

### **Test Application:**

- **Frontend**: https://xillix.co.ke
- **Backend API**: https://xillix.co.ke/api/health
- **Admin Panel**: https://xillix.co.ke/admin

## 🆘 **Troubleshooting**

### **SSH Issues:**

```bash
# Check SSH service
systemctl status sshd

# View SSH logs
tail -f /var/log/auth.log
```

### **Application Issues:**

```bash
# Check PM2 logs
pm2 logs --lines 50

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Check database connection
sudo -u postgres psql realto_production -c "SELECT version();"
```

### **SSL Issues:**

```bash
# Renew certificate
certbot renew --dry-run

# Check certificate status
certbot certificates
```

## 📞 **Need Help?**

If you encounter issues:

1. **Check the logs** mentioned above
2. **Verify DNS propagation**: https://dnschecker.org/
3. **Test individual components** before full deployment
4. **Use DigitalOcean console** for direct server access

---

**Next Steps:** Fix SSH access first, then run the automated deployment script!
