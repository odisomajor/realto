# Real Estate Platform - Deployment Checklist for xillix.co.ke

## Pre-Deployment Checklist

### ✅ Prerequisites Verification

- [ ] Server with Ubuntu 20.04+ or Debian 11+
- [ ] Minimum 2GB RAM, 2 CPU cores
- [ ] 20GB+ available disk space
- [ ] Root or sudo access to server
- [ ] Domain `xillix.co.ke` purchased and configured

### ✅ DNS Configuration

- [ ] A record: `xillix.co.ke` → YOUR_SERVER_IP
- [ ] A record: `www.xillix.co.ke` → YOUR_SERVER_IP
- [ ] DNS propagation completed (check with `nslookup xillix.co.ke`)

### ✅ Server Access

- [ ] SSH access to server confirmed
- [ ] Root/sudo privileges verified
- [ ] Server firewall configured (if any)

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

#### Step 1: Connect to Server

```bash
ssh root@YOUR_SERVER_IP
# or
ssh your-username@YOUR_SERVER_IP
sudo su -
```

- [ ] Successfully connected to server
- [ ] Root access confirmed

#### Step 2: Run Deployment Script

```bash
# Download the deployment script
curl -O https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh

# Make it executable
chmod +x deploy-to-domain.sh

# Run the deployment
./deploy-to-domain.sh xillix.co.ke
```

#### Step 3: Monitor Deployment Progress

Watch for these success messages:

- [ ] ✅ System updated
- [ ] ✅ Node.js installed: v18.x.x
- [ ] ✅ PostgreSQL installed
- [ ] ✅ Nginx installed
- [ ] ✅ PM2 installed
- [ ] ✅ Git installed
- [ ] ✅ Repository cloned
- [ ] ✅ Dependencies installed
- [ ] ✅ Database configured
- [ ] ✅ Environment configured
- [ ] ✅ Applications built
- [ ] ✅ Nginx configured
- [ ] ✅ Applications started
- [ ] ✅ SSL certificate installed
- [ ] ✅ Firewall configured

### Option 2: Manual Deployment

If you prefer manual deployment, follow the detailed steps in
`DEPLOYMENT_GUIDE.md`

## Post-Deployment Verification

### ✅ Service Status Checks

```bash
# Check PM2 processes
pm2 list
```

- [ ] Backend process running (port 5000)
- [ ] Frontend process running (port 3000)
- [ ] All processes show "online" status

```bash
# Check Nginx status
sudo systemctl status nginx
```

- [ ] Nginx is active and running

```bash
# Check PostgreSQL status
sudo systemctl status postgresql
```

- [ ] PostgreSQL is active and running

### ✅ Application Access Tests

- [ ] Visit `http://xillix.co.ke` (should redirect to HTTPS)
- [ ] Visit `https://xillix.co.ke` (should load homepage)
- [ ] Test property listings page
- [ ] Test search functionality
- [ ] Test user registration/login
- [ ] Check API health: `https://xillix.co.ke/api/health`

### ✅ SSL Certificate Verification

```bash
# Check SSL certificate
sudo certbot certificates
```

- [ ] SSL certificate installed for xillix.co.ke
- [ ] Certificate is valid and not expired
- [ ] Auto-renewal is configured

### ✅ Security Verification

```bash
# Check firewall status
sudo ufw status
```

- [ ] UFW firewall is active
- [ ] SSH (22) is allowed
- [ ] Nginx Full (80, 443) is allowed

## Troubleshooting Checklist

### If SSL Certificate Installation Fails:

- [ ] Verify DNS records are pointing to correct IP
- [ ] Check domain propagation: `nslookup xillix.co.ke`
- [ ] Manually run: `sudo certbot --nginx -d xillix.co.ke -d www.xillix.co.ke`

### If Applications Don't Start:

- [ ] Check PM2 logs: `pm2 logs`
- [ ] Verify environment variables in `/var/www/realto/.env`
- [ ] Check database connection:
      `sudo -u postgres psql -d realestate_prod -c "SELECT 1;"`
- [ ] Restart applications: `pm2 restart all`

### If Website Doesn't Load:

- [ ] Check Nginx configuration: `sudo nginx -t`
- [ ] Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] Verify ports 3000 and 5000 are running:
      `netstat -tlnp | grep -E ':(3000|5000)'`
- [ ] Restart Nginx: `sudo systemctl restart nginx`

## Post-Deployment Configuration

### ✅ Email Configuration (Optional)

Update SMTP settings in `/var/www/realto/.env`:

```bash
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_USER="your-email@xillix.co.ke"
SMTP_PASS="your-email-password"
```

- [ ] SMTP settings configured
- [ ] Test email functionality

### ✅ Monitoring Setup

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

- [ ] Log rotation configured
- [ ] Monitoring tools installed

### ✅ Backup Configuration

```bash
# Verify backup script exists
ls -la /usr/local/bin/backup-realto.sh

# Check crontab
sudo crontab -l
```

- [ ] Backup script created
- [ ] Daily backup cron job configured
- [ ] Test backup script: `sudo /usr/local/bin/backup-realto.sh`

## Final Verification

### ✅ Complete Application Test

- [ ] Homepage loads with property listings
- [ ] Property search and filtering works
- [ ] Property details pages load correctly
- [ ] User registration works
- [ ] User login works
- [ ] Property favorites/wishlist works
- [ ] Contact forms work
- [ ] Image uploads work (if applicable)
- [ ] Mobile responsiveness verified

### ✅ Performance Check

- [ ] Page load times are acceptable (<3 seconds)
- [ ] Images load properly
- [ ] Search responses are fast
- [ ] No console errors in browser

### ✅ SEO and Analytics (Optional)

- [ ] Meta tags are properly set
- [ ] Google Analytics configured (if needed)
- [ ] Search engine indexing allowed
- [ ] Sitemap accessible

## Maintenance Schedule

### Daily

- [ ] Check application status: `pm2 list`
- [ ] Monitor disk space: `df -h`
- [ ] Check error logs: `pm2 logs --err`

### Weekly

- [ ] Review application logs
- [ ] Check SSL certificate status
- [ ] Monitor database performance
- [ ] Review backup files

### Monthly

- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Update Node.js dependencies (if needed)
- [ ] Review security logs
- [ ] Test backup restoration

## Emergency Contacts & Commands

### Quick Recovery Commands

```bash
# Restart all services
sudo systemctl restart nginx
sudo systemctl restart postgresql
pm2 restart all

# Check all service status
sudo systemctl status nginx postgresql
pm2 list

# View recent logs
pm2 logs --lines 50
sudo tail -f /var/log/nginx/error.log
```

### Rollback Plan

If deployment fails:

1. Stop PM2 processes: `pm2 stop all`
2. Restore previous backup (if available)
3. Check logs for specific errors
4. Contact support with error details

## Success Criteria

✅ **Deployment is successful when:**

- [ ] Website loads at `https://xillix.co.ke`
- [ ] All core features work (search, listings, user auth)
- [ ] SSL certificate is valid
- [ ] All services are running and monitored
- [ ] Backups are configured
- [ ] Performance is acceptable

---

## Next Steps After Successful Deployment

1. **Content Management**: Add real property listings
2. **User Testing**: Test all features thoroughly
3. **SEO Optimization**: Configure meta tags and sitemaps
4. **Analytics**: Set up Google Analytics or similar
5. **Marketing**: Announce the launch
6. **Monitoring**: Set up uptime monitoring
7. **Support**: Prepare customer support processes

**🎉 Congratulations! Your Real Estate Platform is now live at
https://xillix.co.ke**
