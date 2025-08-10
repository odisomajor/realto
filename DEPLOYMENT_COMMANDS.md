# Xillix.co.ke Deployment Commands

## 1. SSH into your DigitalOcean Droplet
```bash
ssh root@your-server-ip
# or if you have a domain already pointing:
ssh root@xillix.co.ke
```

## 2. Run the Automated Deployment Script
```bash
curl -sSL https://raw.githubusercontent.com/odisomajor/realto/main/scripts/digitalocean-deploy.sh | bash
```

## 3. Alternative Manual Deployment (if script fails)
```bash
# Download the script first
wget https://raw.githubusercontent.com/odisomajor/realto/main/scripts/digitalocean-deploy.sh
chmod +x digitalocean-deploy.sh
./digitalocean-deploy.sh
```

## 4. After Deployment - DNS Configuration
1. Point your domain `xillix.co.ke` to your DigitalOcean droplet IP
2. Add these DNS records:
   - A record: `xillix.co.ke` → `your-server-ip`
   - A record: `www.xillix.co.ke` → `your-server-ip`

## 5. SSL Certificate Setup (after DNS propagation)
```bash
certbot --nginx -d xillix.co.ke -d www.xillix.co.ke
```

## 6. Useful Commands After Deployment
```bash
# Check system status
xillix-status

# Check PM2 processes
pm2 status
pm2 logs

# Restart applications
pm2 restart all

# Check Nginx
nginx -t
systemctl status nginx

# View logs
tail -f /var/log/nginx/error.log
```

## 7. Environment Variables to Update
After deployment, edit `/var/www/xillix/.env` and update:
- Email credentials (SMTP_USER, SMTP_PASS)
- Cloudinary credentials (if using)
- Any other API keys

## 8. Test Your Deployment
- Frontend: https://xillix.co.ke
- API: https://xillix.co.ke/api
- Health check: https://xillix.co.ke/api/health