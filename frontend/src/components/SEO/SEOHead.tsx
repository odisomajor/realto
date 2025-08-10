'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  propertyData?: {
    title: string;
    description: string;
    price: number;
    address: string;
    city: string;
    images: string[];
    type: string;
    bedrooms?: number;
    bathrooms?: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  noIndex?: boolean;
}

const SEOHead = ({
  title = 'Xillix - Kenya Real Estate Portal | Properties for Sale & Rent',
  description = 'Find your dream property in Kenya. Browse houses, land, commercial properties, warehouses, and rentals. Trusted real estate platform with verified listings.',
  keywords = 'Kenya real estate, properties for sale, houses for rent, land for sale, commercial properties, Nairobi properties, Mombasa real estate, Kisumu properties, Nakuru real estate',
  image = '/images/og-default.jpg',
  article = false,
  propertyData = null,
  noIndex = false
}: SEOProps) => {
  const pathname = usePathname();
  const canonicalUrl = `https://xillix.co.ke${pathname}`;

  // Website structured data
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Xillix',
    url: 'https://xillix.co.ke',
    description: "Kenya's premier real estate portal",
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://xillix.co.ke/properties?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Xillix Real Estate',
      url: 'https://xillix.co.ke',
      logo: {
        '@type': 'ImageObject',
        url: 'https://xillix.co.ke/images/logo.png'
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nairobi CBD',
        addressLocality: 'Nairobi',
        addressRegion: 'Nairobi County',
        postalCode: '00100',
        addressCountry: 'Kenya'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+254-700-000-000',
        contactType: 'customer service',
        availableLanguage: ['English', 'Swahili']
      }
    }
  };

  // Property structured data
  const propertyStructuredData = propertyData ? {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: propertyData.title,
    description: propertyData.description,
    url: canonicalUrl,
    image: propertyData.images.map(img => `https://xillix.co.ke${img}`),
    offers: {
      '@type': 'Offer',
      price: propertyData.price,
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Xillix Real Estate'
      }
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: propertyData.address,
      addressLocality: propertyData.city,
      addressCountry: 'Kenya'
    },
    ...(propertyData.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: propertyData.coordinates.lat,
        longitude: propertyData.coordinates.lng
      }
    }),
    ...(propertyData.bedrooms && {
      numberOfRooms: propertyData.bedrooms
    }),
    ...(propertyData.bathrooms && {
      numberOfBathroomsTotal: propertyData.bathrooms
    }),
    propertyType: propertyData.type,
    datePosted: new Date().toISOString()
  } : null;

  // Organization structured data
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Xillix Real Estate',
    url: 'https://xillix.co.ke',
    logo: 'https://xillix.co.ke/images/logo.png',
    description: 'Leading real estate platform in Kenya offering properties for sale and rent',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nairobi CBD',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      postalCode: '00100',
      addressCountry: 'Kenya'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2921,
      longitude: 36.8219
    },
    telephone: '+254-700-000-000',
    email: 'info@xillix.co.ke',
    sameAs: [
      'https://www.facebook.com/xillix',
      'https://www.twitter.com/xillix',
      'https://www.instagram.com/xillix'
    ]
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="author" content="Xillix Real Estate" />
      <meta name="language" content="en-KE" />
      <meta name="geo.region" content="KE" />
      <meta name="geo.country" content="Kenya" />
      <meta name="geo.placename" content="Kenya" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://xillix.co.ke${image}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Xillix" />
      <meta property="og:locale" content="en_KE" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://xillix.co.ke${image}`} />
      <meta name="twitter:site" content="@xillix" />
      <meta name="twitter:creator" content="@xillix" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-TileColor" content="#10b981" />
      <meta name="application-name" content="Xillix" />
      <meta name="apple-mobile-web-app-title" content="Xillix" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />

      {propertyStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(propertyStructuredData)
          }}
        />
      )}

      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#10b981" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    </Head>
  );
};

export default SEOHead;