# Environment Sync Guide

This guide explains how to keep your local development, GitHub repository, and production environments in sync for the Real Estate application.

## Overview

The project now has three synchronized environments:
- **Local Development**: Your local machine (`http://localhost:3000`)
- **GitHub Repository**: Version control (`https://github.com/odisomajor/realto`)
- **Production Server**: Live site (`https://xillix.co.ke`)

## Sync Script Usage

Use the `sync-environments.ps1` PowerShell script to manage synchronization:

### Complete Sync (Recommended)
```powershell
.\sync-environments.ps1 -Action sync-all
```
This will:
1. Commit local changes to git
2. Push changes to GitHub
3. Deploy changes to production
4. Restart production services
5. Verify all environments

### Push to Production Only
```powershell
.\sync-environments.ps1 -Action push-to-production
```
Deploys current local state to production without GitHub sync.

### Pull from Production
```powershell
.\sync-environments.ps1 -Action pull-from-production
```
Downloads production files for manual review and merging.

### Custom Commit Message
```powershell
.\sync-environments.ps1 -Action sync-all -CommitMessage "Add new feature: user authentication"
```

## Development Workflow

### 1. Starting Development
Always ensure you're working on the latest production version:
```powershell
# Pull latest from GitHub
git pull origin main

# Start local servers
cd backend
npm run dev

cd ../frontend
npm run dev
```

### 2. Making Changes
1. Make your changes locally
2. Test thoroughly on `http://localhost:3000`
3. When ready to deploy, run the sync script

### 3. Deploying Changes
```powershell
# Complete sync (recommended)
.\sync-environments.ps1 -Action sync-all
```

## Environment Status Check

### Local Environment
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Check: Both servers should be running

### GitHub Repository
- URL: `https://github.com/odisomajor/realto`
- Check: Latest commits should match your local changes

### Production Environment
- URL: `https://xillix.co.ke`
- Check: Site should be accessible and reflect latest changes

## Troubleshooting

### SSH Key Issues
Ensure the `new_key` file exists in the project root:
```powershell
# Check if key exists
Test-Path .\new_key
```

### Git Issues
If git operations fail:
```powershell
# Check git status
git status

# Pull latest changes
git pull origin main

# Force push if needed (use carefully)
git push origin main --force
```

### Production Deployment Issues
If production deployment fails:
1. Check SSH connection: `ssh -i .\new_key root@146.190.121.74`
2. Check production logs: `pm2 logs`
3. Restart services manually: `pm2 restart all`

### Local Development Issues
If local servers won't start:
1. Check if ports are in use: `netstat -ano | findstr :3000`
2. Kill existing processes: `taskkill /F /IM node.exe`
3. Restart servers

## File Structure Sync

The sync process maintains consistency across these key directories:

### Frontend
- `frontend/src/` - All React components and pages
- `frontend/package.json` - Dependencies
- `frontend/next.config.js` - Next.js configuration

### Backend
- `backend/src/` - All API routes and controllers
- `backend/package.json` - Dependencies
- `backend/prisma/` - Database schema

### Configuration
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables

## Best Practices

1. **Always sync before starting new work**
2. **Test locally before deploying**
3. **Use descriptive commit messages**
4. **Deploy frequently to avoid large changes**
5. **Monitor production after deployment**

## Emergency Procedures

### Rollback Production
If production deployment breaks the site:
```powershell
# SSH into production server
ssh -i .\new_key root@146.190.121.74

# Check PM2 status
pm2 status

# Restart services
pm2 restart all

# Check logs
pm2 logs
```

### Restore from GitHub
If local changes are lost:
```powershell
# Reset to latest GitHub version
git fetch origin
git reset --hard origin/main
```

## Monitoring

After each deployment, verify:
- [ ] Production site loads: `https://xillix.co.ke`
- [ ] Key pages work: `/properties`, `/agents`, `/about`
- [ ] API endpoints respond: `https://xillix.co.ke/api/properties`
- [ ] No console errors in browser
- [ ] Mobile responsiveness

## Support

If you encounter issues:
1. Check this guide first
2. Review error messages carefully
3. Test each environment individually
4. Use the troubleshooting section above