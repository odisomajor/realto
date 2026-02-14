'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types';
import { usePropertyViewTracker } from '@/components/auth/BrowsingTracker';
import PropertyDetails from '@/components/properties/PropertyDetails';
import { 
  MapPin,
  ChevronRight,
  ArrowRight,
  Bed,
  Bath,
  Square
} from 'lucide-react';

interface PropertyDetailClientProps {
  initialProperty?: Property;
  id: string;
}

export default function PropertyDetailClient({ initialProperty, id }: PropertyDetailClientProps) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(initialProperty || null);
  const [loading, setLoading] = useState(!initialProperty && false); // If no initial property, we assume it's not found or handled by parent
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);

  // Track property view for browsing session
  usePropertyViewTracker(id);

  useEffect(() => {
    if (initialProperty) {
      setProperty(initialProperty);
    }
  }, [initialProperty]);

  const handleContactAgent = (message: string) => {
    console.log('Contacting agent with message:', message);
    // Implement contact agent functionality
  };

  const handleScheduleTour = (date: string, time: string, type: 'virtual' | 'physical') => {
    console.log('Scheduling tour:', { date, time, type });
    // Implement tour scheduling functionality
  };

  const handleSaveProperty = (propertyId: string) => {
    console.log('Saving property:', propertyId);
    // Implement save property functionality
  };

  const handleShareProperty = (propertyId: string) => {
    console.log('Sharing property:', propertyId);
    // Implement share property functionality
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push('/properties')}
            className="hover:text-green-600 transition-colors"
          >
            Properties
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{property.title}</span>
        </nav>

        {/* Property Details Component */}
        <PropertyDetails
          property={property}
          onContactAgent={handleContactAgent}
          onScheduleTour={handleScheduleTour}
          onSaveProperty={handleSaveProperty}
          onShareProperty={handleShareProperty}
        />

        {/* Related Properties Section */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Similar Properties</h2>
              <Button 
                variant="outline"
                onClick={() => router.push('/properties')}
                className="flex items-center space-x-2"
              >
                <span>View All Properties</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((relatedProperty) => (
                <Card 
                  key={relatedProperty.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/properties/${relatedProperty.id}`)}
                >
                  <div className="relative">
                    <img
                      src={relatedProperty.images[0]}
                      alt={relatedProperty.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        relatedProperty.status === 'available' 
                          ? 'bg-green-500' 
                          : relatedProperty.status === 'sold' 
                          ? 'bg-red-500' 
                          : 'bg-yellow-500'
                      }`}
                    >
                      {relatedProperty.status}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {relatedProperty.title}
                    </h3>
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      {formatPrice(relatedProperty.price)}
                    </p>
                    <p className="text-gray-600 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {relatedProperty.location}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {relatedProperty.bedrooms}
                        </span>
                        <span className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          {relatedProperty.bathrooms}
                        </span>
                        <span className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          {relatedProperty.area}m²
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
