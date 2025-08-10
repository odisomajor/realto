# Real Estate Platform v1.0 - Deployment Guide

## 🚀 Quick Deployment Steps

### 1. GitHub Repository Setup

If you haven't set up a GitHub repository yet:

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/yourusername/real-estate-platform.git
git branch -M main
git push -u origin main
git push origin v1.0
```

### 2. Production Environment Setup

#### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)
- Domain name and SSL certificate

#### Environment Configuration

1. Copy the production environment template:
```bash
cp .env.production .env
```

2. Update `.env` with your production values:
   - Database connection string
   - JWT secret (generate a secure one)
   - SMTP settings for email notifications
   - Domain and CORS settings

### 3. Database Setup

```bash
# Install dependencies
npm install

# Setup database
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
```

### 4. Build Applications

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm install
npm run build
```

### 5. Deployment Options

#### Option A: Traditional VPS/Server Deployment

1. **Upload files to your server**
2. **Install dependencies and build**
3. **Setup PM2 for process management:**

```bash
# Install PM2 globally
npm install -g pm2

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Setup Nginx reverse proxy** (use `config/nginx/nginx.prod.conf`)

#### Option B: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Option C: Cloud Platform Deployment

**Vercel (Frontend) + Railway/Heroku (Backend):**

1. **Frontend on Vercel:**
   - Connect your GitHub repository
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/.next`

2. **Backend on Railway/Heroku:**
   - Connect your GitHub repository
   - Set build command: `cd backend && npm run build`
   - Add environment variables
   - Setup PostgreSQL addon

### 6. Domain and SSL Setup

1. Point your domain to your server IP
2. Setup SSL certificate (Let's Encrypt recommended)
3. Configure Nginx with SSL

### 7. Post-Deployment Checklist

- [ ] Database is accessible and seeded
- [ ] Frontend loads correctly
- [ ] API endpoints respond properly
- [ ] Authentication works
- [ ] Email notifications work
- [ ] File uploads work (if implemented)
- [ ] SSL certificate is valid
- [ ] Monitoring is setup

## 🔧 Configuration Files

### Nginx Configuration
Use `config/nginx/nginx.prod.conf` for production Nginx setup.

### PM2 Configuration
The `ecosystem.config.js` file is configured for production deployment.

### Docker Configuration
Use `docker-compose.prod.yml` for containerized deployment.

## 📊 Monitoring and Maintenance

### Health Checks
- Backend health: `https://yourdomain.com/api/health`
- Frontend: `https://yourdomain.com`

### Logs
```bash
# PM2 logs
pm2 logs

# Docker logs
docker-compose logs -f
```

### Database Backups
```bash
# PostgreSQL backup
pg_dump -h localhost -U username -d realestate_prod > backup_$(date +%Y%m%d).sql
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify firewall settings

2. **CORS Errors**
   - Update CORS_ORIGIN in backend .env
   - Check NEXT_PUBLIC_API_URL in frontend

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

4. **SSL Issues**
   - Verify certificate installation
   - Check Nginx configuration
   - Ensure domain DNS is correct

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify all environment variables
3. Test API endpoints manually
4. Check database connectivity

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Rebuild and restart
npm run build
pm2 restart all
```

### Database Migrations
```bash
cd backend
npx prisma migrate deploy
```

---

## 📋 Version 1.0 Features Included

✅ **Core Features:**
- User authentication and authorization
- Property listings (CRUD operations)
- Property search and filtering
- Agent profiles and management
- Inquiry system
- Favorites system

✅ **Enhanced Features:**
- Property management dashboard
- Property analytics and performance tracking
- Property comparison tool (up to 4 properties)
- Saved searches with email alerts
- Personalized property recommendations
- Advanced filtering and sorting

✅ **Technical Features:**
- Responsive design for all devices
- RESTful API with proper error handling
- Database with proper relationships
- Authentication with JWT
- Input validation and sanitization
- Production-ready configuration

This deployment guide ensures your Real Estate Platform v1.0 is properly deployed and configured for production use.