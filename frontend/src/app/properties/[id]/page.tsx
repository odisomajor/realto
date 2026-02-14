import { Metadata } from 'next';
import PropertyDetailClient from '@/components/properties/PropertyDetailClient';
import { Property } from '@/types';

// Fetch property data from API
async function getProperty(id: string): Promise<Property | null> {
  try {
    // Use internal URL for server-side fetching
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/properties/${id}`, {
      next: { revalidate: 0 }, // Disable cache for now to ensure fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch property: ${res.statusText}`);
    }
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  // read route params
  const { id } = await params
  
  // fetch data
  const property = await getProperty(id)
 
  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }
 
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return {
    title: `${property.title} - ${formatPrice(property.price)} | Xillix`,
    description: property.description,
    openGraph: {
      title: `${property.title} - ${formatPrice(property.price)}`,
      description: property.description,
      images: property.images.map(img => ({
        url: `https://xillix.co.ke${img}`,
        width: 1200,
        height: 630,
        alt: property.title,
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.title} - ${formatPrice(property.price)}`,
      description: property.description,
      images: property.images.map(img => `https://xillix.co.ke${img}`),
    },
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return <PropertyDetailClient id={id} initialProperty={undefined} />;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images.map(img => `https://xillix.co.ke${img}`),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Xillix Real Estate'
      }
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location,
      addressCountry: 'Kenya'
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    datePosted: property.createdAt,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailClient id={id} initialProperty={property} />
    </>
  );
}
