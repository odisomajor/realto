import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  metadataBase: new URL('https://xillix.co.ke'),
  title: {
    default: 'Xillix - Kenya Real Estate Portal | Properties for Sale & Rent',
    template: '%s | Xillix - Kenya Real Estate Portal'
  },
  description: 'Find your dream property in Kenya. Browse houses, land, commercial properties, warehouses, and rentals. Trusted real estate platform with verified listings across Nairobi, Mombasa, Kisumu, and all major cities.',
  keywords: [
    'Kenya real estate',
    'properties for sale',
    'houses for rent',
    'land for sale',
    'commercial properties',
    'Nairobi properties',
    'Mombasa real estate',
    'Kisumu properties',
    'Nakuru real estate',
    'property portal Kenya',
    'real estate listings',
    'buy property Kenya',
    'rent house Kenya'
  ],
  authors: [{ name: 'Xillix Real Estate' }],
  creator: 'Xillix Real Estate',
  publisher: 'Xillix Real Estate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://xillix.co.ke',
    siteName: 'Xillix',
    title: 'Xillix - Kenya Real Estate Portal | Properties for Sale & Rent',
    description: 'Find your dream property in Kenya. Browse houses, land, commercial properties, warehouses, and rentals. Trusted real estate platform with verified listings.',
    images: [
      {
        url: '/images/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'Xillix - Kenya Real Estate Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xillix - Kenya Real Estate Portal | Properties for Sale & Rent',
    description: 'Find your dream property in Kenya. Browse houses, land, commercial properties, warehouses, and rentals.',
    images: ['/images/og-default.svg'],
    creator: '@xillix',
    site: '@xillix',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://xillix.co.ke',
    languages: {
      'en-KE': 'https://xillix.co.ke',
      'sw-KE': 'https://xillix.co.ke/sw',
    },
  },
  category: 'real estate',
  classification: 'Real Estate Portal',
  other: {
    'geo.region': 'KE',
    'geo.country': 'Kenya',
    'geo.placename': 'Kenya',
    'ICBM': '-1.2921, 36.8219',
    'DC.title': 'Xillix - Kenya Real Estate Portal',
    'DC.creator': 'Xillix Real Estate',
    'DC.subject': 'Real Estate, Properties, Kenya',
    'DC.description': 'Find your dream property in Kenya. Browse houses, land, commercial properties, warehouses, and rentals.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Additional meta tags */}
        <meta name="theme-color" content="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="application-name" content="Xillix" />
        <meta name="apple-mobile-web-app-title" content="Xillix" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
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
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+254-700-000-000',
                contactType: 'customer service',
                availableLanguage: ['English', 'Swahili']
              },
              sameAs: [
                'https://www.facebook.com/xillix',
                'https://www.twitter.com/xillix',
                'https://www.instagram.com/xillix'
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
