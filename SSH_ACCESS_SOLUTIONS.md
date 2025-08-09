# SSH Access Solutions for DigitalOcean Droplet

## 🔐 Current Issue: Permission Denied (publickey)

Your DigitalOcean droplet is configured for SSH key authentication only, but you
don't have the correct SSH key set up on your local machine.

## 🛠️ Solutions to Fix SSH Access

### **Solution 1: Use DigitalOcean Console (Immediate Access)**

1. **Go to DigitalOcean Dashboard**
   - Navigate to your droplet: `ubuntu-s-1vcpu-1gb-sfo3-01`
   - Click on your droplet name

2. **Access Console**
   - Click "Console" button (top right)
   - This opens a web-based terminal directly to your server
   - Login as `root` (no password needed via console)

3. **Enable Password Authentication (Temporary)**

   ```bash
   # Edit SSH config
   nano /etc/ssh/sshd_config

   # Find and change these lines:
   PasswordAuthentication yes
   PermitRootLogin yes

   # Save and restart SSH
   systemctl restart ssh
   ```

4. **Set Root Password**
   ```bash
   passwd root
   # Enter a secure password when prompted
   ```

### **Solution 2: Generate and Add SSH Key**

1. **Generate SSH Key on Your Local Machine**

   ```bash
   # Generate new SSH key
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

   # Press Enter to accept default location
   # Set a passphrase (optional)
   ```

2. **Copy Public Key**

   ```bash
   # Display your public key
   cat ~/.ssh/id_rsa.pub
   # Copy the entire output
   ```

3. **Add Key to DigitalOcean**
   - Go to DigitalOcean → Account → Security → SSH Keys
   - Click "Add SSH Key"
   - Paste your public key
   - Give it a name

4. **Add Key to Existing Droplet**
   - Use DigitalOcean Console (Solution 1) to access your server
   - Run: `nano ~/.ssh/authorized_keys`
   - Paste your public key on a new line
   - Save and exit

### **Solution 3: Reset Droplet with SSH Key**

1. **Add SSH Key to DigitalOcean Account First**
   - Follow steps in Solution 2 to add your SSH key

2. **Rebuild Droplet**
   - Go to your droplet → Destroy → Rebuild
   - Select Ubuntu 22.04
   - Choose your SSH key
   - Rebuild (this will wipe the server)

## 🚀 Recommended Approach

**Use Solution 1 (Console Access) - Quickest:**

1. **Access via DigitalOcean Console**
   - Go to your droplet dashboard
   - Click "Console" button
   - Login as root

2. **Enable Password Authentication**

   ```bash
   sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
   sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
   systemctl restart ssh
   passwd root
   ```

3. **Test SSH from Your Computer**
   ```bash
   ssh root@146.190.121.74
   # Enter the password you just set
   ```

## 🔧 After Gaining Access

Once you can SSH into your server, you can proceed with deployment:

```bash
# Download deployment script
curl -O https://raw.githubusercontent.com/odisomajor/realto/main/scripts/deploy-to-domain.sh

# Make executable
chmod +x deploy-to-domain.sh

# Run deployment
./deploy-to-domain.sh xillix.co.ke
```

## ⚠️ Important Notes

1. **Memory Warning**: Your droplet has only 1GB RAM. Consider upgrading to 2GB
   for better performance.

2. **DNS Setup**: Ensure `xillix.co.ke` points to `146.190.121.74` before
   deployment.

3. **Security**: After deployment, consider disabling password authentication
   and using SSH keys only.

## 🆘 If All Else Fails

**Contact DigitalOcean Support:**

- They can help reset SSH access
- Or provide alternative access methods

**Or Rebuild Droplet:**

- Create new droplet with proper SSH key setup
- Only takes 5-10 minutes
