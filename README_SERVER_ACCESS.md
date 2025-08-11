# 🚀 Xillix Production Server Access & Deployment Guide

## 📋 Server Information

- **Server IP**: `146.190.121.74`
- **Domain**: `xillix.co.ke`
- **Provider**: DigitalOcean
- **User**: `root`
- **SSH Key**: `./key` (stored in project root)

## 🔑 Quick Server Access

### Option 1: Using Connection Scripts

**For Linux/Mac:**
```bash
# Make script executable
chmod +x scripts/connect-server.sh

# Connect to server
./scripts/connect-server.sh
```

**For Windows (PowerShell):**
```powershell
# Run PowerShell script
.\scripts\connect-server.ps1
```

### Option 2: Direct SSH Command

```bash
# Connect directly using SSH
ssh -i ./key root@146.190.121.74
```

## 🚀 Deployment Options

### Option 1: Automated Deployment Script

Run the complete deployment with one command:

```bash
# Make script executable
chmod +x scripts/deploy-to-production.sh

# Deploy to production
./scripts/deploy-to-production.sh
```

### Option 2: Initial Server Setup

If this is the first deployment, use the complete setup script:

```bash
# Run on the server (after connecting via SSH)
curl -fsSL https://raw.githubusercontent.com/your-username/your-repo/main/deploy-xillix.sh | bash
```

## 📁 Server Configuration

The server configuration is stored in `server-config.json`:

```json
{
  "production": {
    "server": {
      "host": "146.190.121.74",
      "user": "root",
      "port": 22,
      "domain": "xillix.co.ke"
    },
    "ssh": {
      "keyPath": "./key",
      "publicKeyPath": "./key.pub",
      "keyName": "xillix-production-key"
    },
    "deployment": {
      "projectPath": "/var/www/xillix",
      "services": {
        "frontend": { "port": 3000 },
        "backend": { "port": 5000 }
      }
    }
  }
}
```

## 🔧 Common Server Commands

Once connected to the server, use these commands:

```bash
# Check PM2 processes
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Check Nginx status
systemctl status nginx

# View website logs
tail -f /var/log/nginx/access.log

# Check SSL certificate
certbot certificates
```

## 🌐 Live URLs

- **Website**: https://xillix.co.ke
- **API**: https://xillix.co.ke/api
- **Admin Panel**: https://xillix.co.ke/admin
- **Sitemap**: https://xillix.co.ke/sitemap.xml

## 🔒 Security Notes

1. **SSH Key**: The private key (`./key`) should never be shared or committed to version control
2. **Permissions**: The SSH key has restricted permissions (600) for security
3. **Firewall**: Server has UFW firewall configured for ports 22, 80, 443
4. **SSL**: Let's Encrypt SSL certificate is automatically renewed

## 📊 Monitoring

- **PM2 Monitoring**: `pm2 monit`
- **Server Resources**: `htop` or `top`
- **Disk Usage**: `df -h`
- **Memory Usage**: `free -h`

## 🆘 Troubleshooting

### Connection Issues
```bash
# Test SSH connection
ssh -i ./key -v root@146.190.121.74

# Check SSH key permissions
ls -la ./key
```

### Deployment Issues
```bash
# Check PM2 processes
pm2 status

# View error logs
pm2 logs --err

# Restart specific service
pm2 restart xillix-frontend
pm2 restart xillix-backend
```

### SSL Certificate Issues
```bash
# Renew SSL certificate
certbot renew

# Test SSL configuration
nginx -t
```

## 📞 Support

If you encounter any issues:
1. Check the logs using the commands above
2. Verify all services are running with `pm2 status`
3. Test the website accessibility at https://xillix.co.ke
4. Review the deployment logs for any error messages