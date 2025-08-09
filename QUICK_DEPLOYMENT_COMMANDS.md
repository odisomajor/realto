# Quick Deployment Commands for xillix.co.ke

## Step 1: Connect to Server

```bash
ssh root@YOUR_SERVER_IP
# Replace YOUR_SERVER_IP with your actual server IP address
```

## Step 2: Download and Run Deployment Script

```bash
# Download the deployment script
curl -O https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh

# Make it executable
chmod +x deploy-to-domain.sh

# Run the automated deployment
./deploy-to-domain.sh xillix.co.ke
```

## Step 3: Monitor Progress

The script will automatically:

- ✅ Update system packages
- ✅ Install Node.js 18, PostgreSQL, Nginx, PM2, Git
- ✅ Clone your repository
- ✅ Install all dependencies
- ✅ Setup database and environment
- ✅ Build frontend and backend
- ✅ Configure Nginx with SSL
- ✅ Start applications with PM2
- ✅ Setup firewall

## Step 4: Verify Deployment

After completion, check:

```bash
# Check PM2 processes
pm2 list

# Check services
sudo systemctl status nginx
sudo systemctl status postgresql

# Test website
curl -I https://xillix.co.ke
```

## Troubleshooting Commands

```bash
# Check logs if issues occur
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Restart services if needed
pm2 restart all
sudo systemctl restart nginx
```

## Post-Deployment Access

- Website: https://xillix.co.ke
- API Health: https://xillix.co.ke/api/health
- Admin Panel: https://xillix.co.ke/admin (if configured)
