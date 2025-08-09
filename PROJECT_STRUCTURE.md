# Kenya Real Estate Portal - Project Structure

## Overall Architecture

```
RealEstate/
├── backend/                    # Node.js/Express API server
├── frontend/                   # React.js web application
├── mobile/                     # Android application
├── admin/                      # Admin dashboard
├── database/                   # Database schemas and migrations
├── docs/                       # Documentation
├── scripts/                    # Deployment and utility scripts
├── tests/                      # Test files
└── docker/                     # Docker configuration files
```

## Backend Structure (Node.js/Express)

```
backend/
├── src/
│   ├── controllers/           # Route controllers
│   │   ├── auth.controller.js
│   │   ├── property.controller.js
│   │   ├── user.controller.js
│   │   ├── payment.controller.js
│   │   ├── twofa.controller.js
│   │   └── admin.controller.js
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── twofa.middleware.js
│   │   ├── browsing.middleware.js
│   │   ├── validation.middleware.js
│   │   └── upload.middleware.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── PropertyType.js
│   │   ├── Transaction.js
│   │   ├── BrowsingSession.js
│   │   ├── Advertisement.js
│   │   └── Review.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── property.routes.js
│   │   ├── propertyType.routes.js
│   │   ├── user.routes.js
│   │   ├── twofa.routes.js
│   │   ├── advertisement.routes.js
│   │   └── payment.routes.js
│   ├── services/             # Business logic
│   │   ├── auth.service.js
│   │   ├── property.service.js
│   │   ├── payment.service.js
│   │   ├── twofa.service.js
│   │   ├── sms.service.js
│   │   └── notification.service.js
│   ├── utils/                # Utility functions
│   │   ├── database.js
│   │   ├── validation.js
│   │   └── helpers.js
│   ├── config/               # Configuration files
│   │   ├── database.config.js
│   │   ├── auth.config.js
│   │   └── payment.config.js
│   └── app.js                # Main application file
├── package.json
├── .env.example
└── README.md
```

## Frontend Structure (React.js/Next.js)

```
frontend/
├── public/                   # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── components/
│   │   │   ├── property/
│   │   │   │   ├── PropertyCard.jsx
│   │   │   │   ├── PropertyList.jsx
│   │   │   │   ├── PropertyDetails.jsx
│   │   │   │   ├── PropertyForm.jsx
│   │   │   │   ├── PropertyTypeFilter.jsx
│   │   │   │   └── PropertySearch.jsx
│   │   │   ├── ads/
│   │   │   │   ├── GoogleAdsSlot.jsx
│   │   │   │   ├── HeaderAd.jsx
│   │   │   │   ├── SidebarAd.jsx
│   │   │   │   └── FooterAd.jsx
│   │   ├── user/
│   │   │   ├── Profile.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Settings.jsx
│   │   └── payment/
│   │       ├── PaymentForm.jsx
│   │       └── PaymentHistory.jsx
│   ├── pages/               # Next.js pages
│   │   ├── index.js         # Home page
│   │   ├── properties/
│   │   │   ├── index.js     # Properties listing
│   │   │   ├── [id].js      # Property details
│   │   │   └── search.js    # Search results
│   │   ├── auth/
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   └── forgot-password.js
│   │   ├── dashboard/
│   │   │   ├── index.js
│   │   │   ├── properties.js
│   │   │   └── profile.js
│   │   └── api/             # API routes (Next.js)
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useProperties.js
│   │   └── usePayment.js
│   ├── context/             # React context
│   │   ├── AuthContext.js
│   │   └── PropertyContext.js
│   ├── services/            # API services
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   ├── property.service.js
│   │   └── payment.service.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validation.js
│   ├── styles/              # CSS/SCSS files
│   │   ├── globals.css
│   │   ├── components/
│   │   └── pages/
│   └── lib/                 # Configuration
│       ├── auth.js
│       └── db.js
├── package.json
├── next.config.js
└── tailwind.config.js
```

## Mobile App Structure (Android)

```
mobile/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kenyarealestate/
│   │   │   │   ├── activities/
│   │   │   │   │   ├── MainActivity.java
│   │   │   │   │   ├── PropertyDetailsActivity.java
│   │   │   │   │   ├── SearchActivity.java
│   │   │   │   │   └── ProfileActivity.java
│   │   │   │   ├── fragments/
│   │   │   │   │   ├── HomeFragment.java
│   │   │   │   │   ├── SearchFragment.java
│   │   │   │   │   ├── FavoritesFragment.java
│   │   │   │   │   └── ProfileFragment.java
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── PropertyAdapter.java
│   │   │   │   │   └── ImageAdapter.java
│   │   │   │   ├── models/
│   │   │   │   │   ├── Property.java
│   │   │   │   │   ├── User.java
│   │   │   │   │   └── Transaction.java
│   │   │   │   ├── services/
│   │   │   │   │   ├── ApiService.java
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   └── NotificationService.java
│   │   │   │   ├── utils/
│   │   │   │   │   ├── Constants.java
│   │   │   │   │   ├── NetworkUtils.java
│   │   │   │   │   └── ImageUtils.java
│   │   │   │   └── KenyaRealEstateApplication.java
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   ├── drawable/
│   │   │   │   ├── values/
│   │   │   │   └── menu/
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   ├── build.gradle
│   └── proguard-rules.pro
├── gradle/
├── build.gradle
└── settings.gradle
```

## Database Schema

```
database/
├── migrations/              # Database migration files
│   ├── 001_create_users_table.sql
│   ├── 002_create_properties_table.sql
│   ├── 003_create_transactions_table.sql
│   ├── 004_create_reviews_table.sql
│   └── 005_create_payments_table.sql
├── seeds/                   # Sample data
│   ├── counties.sql
│   ├── property_types.sql
│   └── sample_properties.sql
├── schemas/                 # Database schemas
│   ├── users.schema.sql
│   ├── properties.schema.sql
│   └── transactions.schema.sql
└── README.md
```

## Admin Dashboard Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Users/
│   │   ├── Properties/
│   │   ├── Payments/
│   │   └── Analytics/
│   ├── pages/
│   │   ├── dashboard.jsx
│   │   ├── users.jsx
│   │   ├── properties.jsx
│   │   ├── payments.jsx
│   │   └── settings.jsx
│   ├── services/
│   ├── utils/
│   └── styles/
├── package.json
└── README.md
```

## Key Technologies & Dependencies

### Backend Dependencies

```json
{
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "multer": "^1.4.5",
  "cors": "^2.8.5",
  "helmet": "^6.0.0",
  "express-rate-limit": "^6.7.0",
  "nodemailer": "^6.9.0",
  "twilio": "^4.7.0",
  "axios": "^1.3.0",
  "express-session": "^1.17.3",
  "connect-redis": "^6.1.3",
  "dotenv": "^16.0.0"
}
```

### Frontend Dependencies (package.json)

```json
{
  "name": "xillix-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "sitemap": "next-sitemap"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "next-auth": "^4.24.5",
    "@next/third-parties": "^14.0.0",
    "tailwindcss": "^3.3.6",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "framer-motion": "^10.16.16",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "yup": "^1.4.0",
    "axios": "^1.6.2",
    "react-query": "^3.39.3",
    "react-google-adsense": "^1.0.3",
    "@google-cloud/adsense": "^1.0.0",
    "next-sitemap": "^4.2.3",
    "next-seo": "^6.4.0",
    "react-intersection-observer": "^9.5.3",
    "sharp": "^0.32.6",
    "qrcode": "^1.5.3",
    "speakeasy": "^2.0.0"
  },
  "devDependencies": {
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "@types/node": "^20.10.4",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3"
  }
}
```

### Mobile Dependencies (Android)

```gradle
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.8.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.navigation:navigation-fragment:2.5.3'
    implementation 'androidx.navigation:navigation-ui:2.5.3'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.github.bumptech.glide:glide:4.14.2'
    implementation 'com.google.android.gms:play-services-maps:18.1.0'
    implementation 'com.google.android.gms:play-services-location:21.0.1'
}
```

## Development Environment Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Android Studio (for mobile development)
- Git
- Docker (optional)

### Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/xillix_realestate"
REDIS_URL="redis://localhost:6379"

# Authentication & Security
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret"

# 2FA Configuration
TOTP_SERVICE_NAME="Xillix Real Estate"
TOTP_ISSUER="Xillix"

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Email Service (SMTP)
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
GOOGLE_ADSENSE_SLOT_HEADER="1234567890"
GOOGLE_ADSENSE_SLOT_SIDEBAR="0987654321"
GOOGLE_ADSENSE_SLOT_FOOTER="1122334455"

# Domain & Hosting
DOMAIN_URL="https://xillix.co.ke"
NEXT_PUBLIC_API_URL="https://xillix.co.ke/api"
NEXT_PUBLIC_DOMAIN="xillix.co.ke"

# SEO Configuration
NEXT_PUBLIC_SITE_NAME="Xillix - Kenya Real Estate Portal"
NEXT_PUBLIC_SITE_DESCRIPTION="Find your dream property in Kenya. Browse houses, land, commercial properties, warehouses, and rentals."
NEXT_PUBLIC_DEFAULT_OG_IMAGE="/images/og-default.jpg"

# Mobile App Integration
ANDROID_APP_ID="com.xillix.realestate"
ANDROID_APP_FINGERPRINT="your-app-fingerprint"
DEEP_LINK_SCHEME="xillix"

# Analytics & Tracking
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
GOOGLE_TAG_MANAGER_ID="GTM-XXXXXXX"
FACEBOOK_PIXEL_ID="your-facebook-pixel-id"

# Payment Integration
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
```

## Deployment Architecture

### Production Environment

- **Web Server:** Nginx
- **Application Server:** PM2 (Node.js)
- **Database:** PostgreSQL with Redis cache
- **File Storage:** AWS S3 or Google Cloud Storage
- **CDN:** CloudFlare
- **Monitoring:** New Relic or DataDog
- **CI/CD:** GitHub Actions

### Staging Environment

- Mirror of production for testing
- Automated deployment from develop branch
- Integration testing environment

This project structure provides a solid foundation for building a scalable,
maintainable real estate platform that can grow with your business needs.
