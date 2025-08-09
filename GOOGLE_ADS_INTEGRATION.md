# Google Ads Integration - Kenya Real Estate Portal

## Overview

This document outlines the comprehensive Google Ads integration strategy for the
Kenya Real Estate Portal, including ad placement, implementation, and revenue
optimization.

## Ad Placement Strategy

### 3 Strategic Ad Slots Per Page

#### 1. Header Banner Advertisement

**Location:** Top of every page, below navigation **Dimensions:**

- Desktop: 728x90 (Leaderboard) or 970x250 (Large Leaderboard)
- Mobile: 320x50 (Mobile Banner) **Visibility:** High - First thing users see
  **Pages:** All pages (home, listings, property details, user dashboard)

#### 2. Sidebar Advertisement

**Location:** Right sidebar on property-related pages **Dimensions:**

- Desktop: 300x250 (Medium Rectangle) or 300x600 (Half Page)
- Mobile: 300x250 (stacked below content) **Visibility:** Medium-High - Visible
  during property browsing **Pages:** Property listings, search results,
  property details

#### 3. Footer/Content Advertisement

**Location:** Between content sections or footer area **Dimensions:**

- Desktop: 728x90 (Leaderboard) or 336x280 (Large Rectangle)
- Mobile: 320x100 (Large Mobile Banner) **Visibility:** Medium - Visible during
  content consumption **Pages:** Property details, blog articles, user dashboard

## Technical Implementation

### Google AdSense Setup

#### 1. Account Configuration

```javascript
// Google AdSense Configuration
const adsenseConfig = {
  client: process.env.GOOGLE_ADSENSE_CLIENT_ID, // ca-pub-xxxxxxxxxx
  slots: {
    header: process.env.GOOGLE_ADSENSE_SLOT_HEADER,
    sidebar: process.env.GOOGLE_ADSENSE_SLOT_SIDEBAR,
    footer: process.env.GOOGLE_ADSENSE_SLOT_FOOTER
  },
  testMode: process.env.NODE_ENV === 'development'
};
```

#### 2. React Components Implementation

**Header Ad Component:**

```jsx
// components/ads/HeaderAd.jsx
import { useEffect } from 'react';

const HeaderAd = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className='w-full flex justify-center py-4 bg-gray-50'>
      <ins
        className='adsbygoogle'
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER}
        data-ad-format='auto'
        data-full-width-responsive='true'
      />
    </div>
  );
};

export default HeaderAd;
```

**Sidebar Ad Component:**

```jsx
// components/ads/SidebarAd.jsx
import { useEffect } from 'react';

const SidebarAd = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className='sticky top-4 mb-6'>
      <div className='text-xs text-gray-500 mb-2 text-center'>
        Advertisement
      </div>
      <ins
        className='adsbygoogle'
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
        data-ad-format='rectangle'
      />
    </div>
  );
};

export default SidebarAd;
```

**Footer Ad Component:**

```jsx
// components/ads/FooterAd.jsx
import { useEffect } from 'react';

const FooterAd = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className='w-full flex justify-center py-6 border-t border-gray-200'>
      <div className='max-w-4xl w-full'>
        <div className='text-xs text-gray-500 mb-2 text-center'>
          Advertisement
        </div>
        <ins
          className='adsbygoogle'
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER}
          data-ad-format='auto'
          data-full-width-responsive='true'
        />
      </div>
    </div>
  );
};

export default FooterAd;
```

#### 3. AdSense Script Integration

**Next.js \_document.js:**

```jsx
// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Google AdSense */}
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin='anonymous'
          />
          {/* AdSense Auto Ads (Optional) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (adsbygoogle = window.adsbygoogle || []).push({
                  google_ad_client: "${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}",
                  enable_page_level_ads: true
                });
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

### Ad Management System

#### 1. Ad Performance Tracking

```javascript
// services/adTracking.service.js
class AdTrackingService {
  static trackAdView(adSlot, page) {
    // Track ad impressions
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ad_impression', {
        ad_slot: adSlot,
        page: page,
        timestamp: new Date().toISOString()
      });
    }
  }

  static trackAdClick(adSlot, page) {
    // Track ad clicks
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ad_click', {
        ad_slot: adSlot,
        page: page,
        timestamp: new Date().toISOString()
      });
    }
  }

  static getAdPerformance() {
    // Fetch ad performance data from Google AdSense API
    return fetch('/api/ads/performance').then(response => response.json());
  }
}

export default AdTrackingService;
```

#### 2. Ad Blocker Detection

```javascript
// utils/adBlockDetection.js
export const detectAdBlocker = () => {
  return new Promise(resolve => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    document.body.appendChild(testAd);

    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
};

// Usage in component
useEffect(() => {
  detectAdBlocker().then(isBlocked => {
    if (isBlocked) {
      // Show message to disable ad blocker
      setShowAdBlockerMessage(true);
    }
  });
}, []);
```

## Page-Specific Ad Implementation

### 1. Home Page Layout

```jsx
// pages/index.js
import HeaderAd from '../components/ads/HeaderAd';
import FooterAd from '../components/ads/FooterAd';

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <HeaderAd />

      <main>
        <HeroSection />
        <FeaturedProperties />
        <PropertyTypes />
        <Testimonials />
      </main>

      <FooterAd />
      <Footer />
    </div>
  );
};
```

### 2. Property Listings Page Layout

```jsx
// pages/properties/index.js
import HeaderAd from '../../components/ads/HeaderAd';
import SidebarAd from '../../components/ads/SidebarAd';
import FooterAd from '../../components/ads/FooterAd';

const PropertiesPage = () => {
  return (
    <div>
      <Navbar />
      <HeaderAd />

      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col lg:flex-row gap-8'>
          <main className='lg:w-2/3'>
            <SearchFilters />
            <PropertyList />
          </main>

          <aside className='lg:w-1/3'>
            <SidebarAd />
            <SavedSearches />
            <RecentlyViewed />
          </aside>
        </div>
      </div>

      <FooterAd />
      <Footer />
    </div>
  );
};
```

### 3. Property Details Page Layout

```jsx
// pages/properties/[id].js
import HeaderAd from '../../components/ads/HeaderAd';
import SidebarAd from '../../components/ads/SidebarAd';
import FooterAd from '../../components/ads/FooterAd';

const PropertyDetailsPage = ({ property }) => {
  return (
    <div>
      <Navbar />
      <HeaderAd />

      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col lg:flex-row gap-8'>
          <main className='lg:w-2/3'>
            <PropertyGallery images={property.images} />
            <PropertyInfo property={property} />
            <PropertyDescription description={property.description} />
            <PropertyMap location={property.location} />
            <SimilarProperties />
          </main>

          <aside className='lg:w-1/3'>
            <ContactForm />
            <SidebarAd />
            <PropertyStats />
            <AgentInfo />
          </aside>
        </div>
      </div>

      <FooterAd />
      <Footer />
    </div>
  );
};
```

## Revenue Optimization

### 1. Ad Placement Testing

```javascript
// A/B testing for ad placements
const adPlacementTests = {
  headerPosition: ['top', 'below-nav', 'above-content'],
  sidebarPosition: ['top-sidebar', 'middle-sidebar', 'sticky-sidebar'],
  footerPosition: ['above-footer', 'in-footer', 'below-content']
};

// Track performance for each placement
const trackPlacementPerformance = (placement, performance) => {
  // Send data to analytics
  gtag('event', 'ad_placement_performance', {
    placement: placement,
    ctr: performance.ctr,
    revenue: performance.revenue,
    impressions: performance.impressions
  });
};
```

### 2. Responsive Ad Sizing

```css
/* Responsive ad styles */
.ad-container {
  width: 100%;
  text-align: center;
  margin: 20px 0;
}

.ad-container ins {
  display: block;
  margin: 0 auto;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .sidebar-ad {
    margin: 20px 0;
    width: 100%;
  }

  .header-ad {
    padding: 10px;
  }
}
```

### 3. Ad Loading Optimization

```javascript
// Lazy loading for ads
const LazyAd = ({ adSlot, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={adRef} className={className}>
      {isVisible && <AdComponent adSlot={adSlot} />}
    </div>
  );
};
```

## Compliance and Best Practices

### 1. AdSense Policy Compliance

- **Content Guidelines:** Ensure all property listings comply with AdSense
  content policies
- **Click Fraud Prevention:** Implement measures to prevent invalid clicks
- **User Experience:** Maintain good user experience with non-intrusive ad
  placements
- **Mobile Optimization:** Ensure ads are mobile-friendly and responsive

### 2. GDPR Compliance

```javascript
// Cookie consent for ads
const AdConsentManager = () => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ad-consent');
    setHasConsent(consent === 'true');
  }, []);

  const handleConsent = accepted => {
    localStorage.setItem('ad-consent', accepted.toString());
    setHasConsent(accepted);

    if (accepted) {
      // Initialize ads
      window.adsbygoogle = window.adsbygoogle || [];
    }
  };

  if (!hasConsent) {
    return <ConsentBanner onConsent={handleConsent} />;
  }

  return null;
};
```

### 3. Performance Monitoring

```javascript
// Ad performance monitoring
const AdPerformanceMonitor = () => {
  useEffect(() => {
    // Monitor ad loading times
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name.includes('googlesyndication')) {
          gtag('event', 'ad_load_time', {
            duration: entry.duration,
            ad_network: 'google_adsense'
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  return null;
};
```

## Expected Revenue Model

### Revenue Projections

- **Page Views:** 100,000+ monthly page views
- **Ad Impressions:** 300,000+ monthly (3 ads per page)
- **Estimated CPM:** $1-3 (Kenya market)
- **Monthly Revenue:** $300-900 from Google Ads
- **Annual Revenue:** $3,600-10,800 from Google Ads

### Revenue Optimization Strategies

1. **High-Quality Content:** Focus on valuable property listings and content
2. **SEO Optimization:** Increase organic traffic
3. **User Engagement:** Improve time on site and page views per session
4. **Mobile Optimization:** Ensure excellent mobile experience
5. **Ad Placement Testing:** Continuously test and optimize ad positions

This comprehensive Google Ads integration will provide a steady revenue stream
while maintaining excellent user experience on the Kenya Real Estate Portal.
