# DigitalOcean Deployment Guide for xillix.co.ke

## 🌊 DigitalOcean Server Setup

### Step 1: Get Your Server Information

From your DigitalOcean dashboard, you'll need:

#### **Server Details:**

- **Droplet IP Address**: Found in your DigitalOcean dashboard
- **SSH Access**: Usually `root` user with password or SSH key
- **Server Region**: Where your droplet is located
- **Server Size**: Recommended minimum 2GB RAM / 2 vCPUs

#### **Example Server Info:**

```
IP Address: 164.90.XXX.XXX
Username: root
Authentication: SSH key or password
Region: NYC1, SFO3, etc.
Size: s-2vcpu-2gb (or larger)
```

### Step 2: Configure DNS for xillix.co.ke

#### **Option A: Using DigitalOcean DNS (Recommended)**

1. Go to DigitalOcean → Networking → Domains
2. Add domain: `xillix.co.ke`
3. Create A records:
   - `@` (root domain) → Your Droplet IP
   - `www` → Your Droplet IP

#### **Option B: Using Your Domain Registrar**

Update your domain's nameservers or add A records:

- `xillix.co.ke` → Your Droplet IP
- `www.xillix.co.ke` → Your Droplet IP

### Step 3: Initial Server Access

#### **SSH with Password:**

```bash
ssh root@YOUR_DROPLET_IP
```

#### **SSH with Key (if you uploaded SSH key):**

```bash
ssh -i ~/.ssh/your_key root@YOUR_DROPLET_IP
```

### Step 4: Verify Server Requirements

Once connected, check your server:

```bash
# Check OS version (should be Ubuntu 20.04+)
lsb_release -a

# Check available memory (should be 2GB+)
free -h

# Check disk space (should have 20GB+)
df -h

# Check if ports are available
netstat -tlnp | grep -E ':(80|443|22)'
```

## 🚀 Automated Deployment Commands

Once you have your server details, run these commands:

### **On Your DigitalOcean Droplet:**

```bash
# Download deployment script
curl -O https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh

# Make executable
chmod +x deploy-to-domain.sh

# Run deployment
./deploy-to-domain.sh xillix.co.ke
```

## 🔧 DigitalOcean-Specific Optimizations

### **Firewall Configuration:**

DigitalOcean droplets come with UFW. The script will configure:

- SSH (port 22) - Allow
- HTTP (port 80) - Allow
- HTTPS (port 443) - Allow

### **Performance Optimization:**

For better performance on DigitalOcean:

```bash
# Enable swap (if not already enabled)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### **Monitoring Setup:**

DigitalOcean provides monitoring. Enable it in your dashboard:

- Droplet → Monitoring → Enable

## 📊 Post-Deployment Verification

After deployment, verify everything works:

### **Check Services:**

```bash
pm2 list                    # Should show running processes
sudo systemctl status nginx # Should be active
sudo systemctl status postgresql # Should be active
```

### **Test Website:**

- Visit: `https://xillix.co.ke`
- API Health: `https://xillix.co.ke/api/health`

### **SSL Certificate:**

```bash
sudo certbot certificates   # Should show valid certificate
```

## 🛡️ DigitalOcean Security Best Practices

### **Enable Additional Security:**

```bash
# Disable root login (after creating sudo user)
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### **Backup Configuration:**

Set up DigitalOcean Snapshots:

1. Go to your Droplet → Snapshots
2. Enable automatic weekly snapshots
3. Or create manual snapshots before major changes

## 🔍 Troubleshooting DigitalOcean Issues

### **Common Issues:**

#### **SSH Connection Issues:**

```bash
# Check if SSH is running
sudo systemctl status ssh

# Reset SSH if needed
sudo systemctl restart ssh
```

#### **DNS Not Resolving:**

```bash
# Check DNS propagation
nslookup xillix.co.ke
dig xillix.co.ke

# If using DO DNS, verify in dashboard
```

#### **Firewall Blocking Connections:**

```bash
# Check UFW status
sudo ufw status

# Allow specific ports if needed
sudo ufw allow 80
sudo ufw allow 443
```

## 📞 Support Resources

- **DigitalOcean Docs**: https://docs.digitalocean.com/
- **Community**: https://www.digitalocean.com/community/
- **Support**: Available through DO dashboard

## 💰 Cost Optimization

### **Recommended Droplet Sizes:**

- **Development/Testing**: s-1vcpu-2gb ($12/month)
- **Production**: s-2vcpu-2gb ($18/month)
- **High Traffic**: s-2vcpu-4gb ($24/month)

### **Additional Services:**

- **Load Balancer**: If you expect high traffic
- **Managed Database**: For production PostgreSQL
- **Spaces**: For file storage (images, documents)
