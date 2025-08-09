# Xillix - Kenya Real Estate Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)

## Overview

Xillix is Kenya's premier real estate portal, connecting property buyers,
sellers, and renters across the country. Our platform features comprehensive
property listings including residential homes, commercial properties, land,
warehouses, containers, and rental properties.

**Live Site:** [https://xillix.co.ke](https://xillix.co.ke)

## Features

### 🏠 Property Management

- **Diverse Property Types:** Houses, land, commercial properties, warehouses,
  containers, and rentals
- **Advanced Search & Filtering:** Location-based search with detailed filters
- **Interactive Maps:** Google Maps integration for property locations
- **High-Quality Images:** Optimized image galleries with lazy loading
- **Property Comparison:** Side-by-side property comparison tool

### 👥 User Management

- **Dual Registration System:** Separate flows for publishers and general users
- **Two-Factor Authentication:** TOTP and SMS-based 2FA for enhanced security
- **Browsing Trigger:** General users prompted to register after viewing 3
  properties
- **User Dashboard:** Personalized dashboard with saved properties and search
  history

### 📱 Mobile Integration

- **Native Android App:** Seamless integration with mobile application
- **Deep Linking:** Direct navigation between web and mobile platforms
- **Push Notifications:** Real-time alerts for new properties and updates
- **Offline Support:** Cached property data for offline browsing

### 💰 Monetization

- **Google AdSense Integration:** Strategic ad placement (3 ads per page)
- **Premium Listings:** Featured property placements
- **Subscription Plans:** Enhanced visibility for property publishers

### 🔍 SEO Optimized

- **Server-Side Rendering:** Next.js SSR for optimal search engine indexing
- **Structured Data:** JSON-LD markup for rich search results
- **Dynamic Sitemaps:** Automated sitemap generation
- **Local SEO:** Kenya-specific optimization with .co.ke domain

## Technology Stack

### Frontend

- **Framework:** Next.js 14 with React 18
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit with RTK Query
- **Authentication:** NextAuth.js with JWT
- **Maps:** Google Maps API
- **SEO:** Next-SEO with structured data

### Backend

- **Runtime:** Node.js with Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis for session management and query caching
- **Authentication:** JWT with 2FA (TOTP/SMS)
- **File Storage:** AWS S3 for images and documents
- **Search:** Elasticsearch for advanced property search

### Mobile

- **Platform:** Native Android (Kotlin)
- **UI Framework:** Jetpack Compose
- **Architecture:** MVVM with Repository pattern
- **Database:** Room for local caching
- **Networking:** Retrofit with OkHttp

### Infrastructure

- **Hosting:** HostPinnacle Kenya VPS
- **Domain:** xillix.co.ke
- **SSL:** Free SSL certificate
- **CDN:** Cloudflare integration
- **CI/CD:** GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18.0 or higher
- PostgreSQL 13 or higher
- Redis 6.0 or higher
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/xillix-realestate.git
   cd xillix-realestate
   ```

2. **Install dependencies**

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment files
   cp .env.example .env.local

   # Update environment variables
   # See Environment Variables section below
   ```

4. **Database Setup**

   ```bash
   # Run database migrations
   cd backend
   npx prisma migrate dev

   # Seed initial data
   npx prisma db seed
   ```

5. **Start Development Servers**

   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/xillix_realestate"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
SESSION_SECRET="your-session-secret"

# 2FA Configuration
TOTP_SERVICE_NAME="Xillix Real Estate"
TOTP_ISSUER="Xillix"

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="xillix-property-images"

# Google Services
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxx"

# Domain Configuration
DOMAIN_URL="https://xillix.co.ke"
NEXT_PUBLIC_API_URL="https://xillix.co.ke/api"
```

## Project Structure

```
xillix-realestate/
├── frontend/                 # Next.js frontend application
│   ├── components/          # Reusable React components
│   ├── pages/              # Next.js pages and API routes
│   ├── styles/             # CSS and Tailwind styles
│   ├── utils/              # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend API
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   └── utils/              # Utility functions
├── mobile/                  # Android mobile application
│   ├── app/                # Android app source code
│   └── build.gradle        # Android build configuration
├── docs/                    # Project documentation
└── scripts/                # Deployment and utility scripts
```

## API Documentation

The API is documented using OpenAPI 3.0 specification. Access the interactive
documentation at:

- Development: http://localhost:5000/api-docs
- Production: https://xillix.co.ke/api-docs

### Key Endpoints

- **Authentication:** `/api/auth/*`
- **Properties:** `/api/properties/*`
- **Users:** `/api/users/*`
- **Search:** `/api/search/*`
- **Favorites:** `/api/favorites/*`

## Mobile App

The Android mobile application provides native mobile experience with:

- Offline property browsing
- Push notifications
- Deep linking from web
- Synchronized user accounts

### Building the Mobile App

```bash
cd mobile
./gradlew assembleDebug
```

## Deployment

### Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy to HostPinnacle**

   ```bash
   # Upload files via FTP/SFTP or use deployment scripts
   npm run deploy
   ```

3. **Configure domain and SSL**
   - Point xillix.co.ke to your server IP
   - SSL certificate is automatically provided by HostPinnacle

### Environment-Specific Configurations

- **Development:** Local development with hot reloading
- **Staging:** Testing environment with production-like setup
- **Production:** Live environment on xillix.co.ke

## Contributing

We welcome contributions to improve Xillix! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Maintain code documentation
- Follow the existing code style
- Update README for significant changes

## Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Run integration tests
npm run test:integration
```

## Performance Optimization

- **Image Optimization:** Next.js Image component with WebP/AVIF support
- **Code Splitting:** Automatic code splitting with Next.js
- **Caching:** Redis caching for database queries and sessions
- **CDN:** Cloudflare CDN for static assets
- **Database Optimization:** Indexed queries and connection pooling

## Security Features

- **Two-Factor Authentication:** TOTP and SMS-based 2FA
- **JWT Security:** Secure token handling with refresh tokens
- **Input Validation:** Comprehensive input sanitization
- **Rate Limiting:** API rate limiting to prevent abuse
- **HTTPS Only:** Enforced HTTPS in production
- **CORS Configuration:** Proper CORS setup for API security

## SEO Features

- **Server-Side Rendering:** Full SSR with Next.js
- **Meta Tags:** Dynamic meta tags for all pages
- **Structured Data:** JSON-LD markup for search engines
- **Sitemap Generation:** Automated XML sitemap
- **Robots.txt:** Optimized robots.txt configuration
- **Core Web Vitals:** Optimized for Google's Core Web Vitals

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Support

For support and questions:

- **Email:** support@xillix.co.ke
- **Documentation:** [docs.xillix.co.ke](https://docs.xillix.co.ke)
- **Issues:**
  [GitHub Issues](https://github.com/your-username/xillix-realestate/issues)

## Acknowledgments

- **HostPinnacle Kenya** for reliable hosting services
- **Google Maps API** for location services
- **Twilio** for SMS services
- **AWS** for file storage solutions

---

**Built with ❤️ for Kenya's Real Estate Market**
