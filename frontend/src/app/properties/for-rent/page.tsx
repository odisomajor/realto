'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyFilters, { PropertyFilters as PropertyFiltersType } from '@/components/properties/PropertyFilters';
import PropertyCard from '@/components/properties/PropertyCard';
import GoogleMap from '@/components/maps/GoogleMap';
import { Button } from '@/components/ui/Button';
import { Grid, Map, Filter } from 'lucide-react';
import { propertyApi } from '@/lib/api';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'sale' | 'rent';
  category: 'residential' | 'commercial' | 'land';
  status: 'available' | 'sold' | 'rented' | 'pending' | 'under-construction';
  features: string[];
  images: string[];
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

function ForRentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentFilters, setCurrentFilters] = useState<PropertyFiltersType>({
    search: '',
    type: 'rent',
    category: 'all',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    areaMin: '',
    areaMax: '',
    location: '',
    county: '',
    features: [],
    sortBy: 'newest',
    radius: '10'
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyApi.getProperties();
      const rentProperties = response.data.data.filter((property: Property) => 
        property.type === 'rent'
      );
      setProperties(rentProperties);
      setFilteredProperties(rentProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again.');
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filterProperties = useCallback((filters: PropertyFiltersType) => {
    let filtered = [...properties];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchLower) ||
        property.location?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(property => property.price >= minPrice);
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(property => property.price <= maxPrice);
      }
    }

    if (filters.bedrooms) {
      const bedroomCount = parseInt(filters.bedrooms);
      if (!isNaN(bedroomCount)) {
        filtered = filtered.filter(property => property.bedrooms >= bedroomCount);
      }
    }

    if (filters.bathrooms) {
      const bathroomCount = parseInt(filters.bathrooms);
      if (!isNaN(bathroomCount)) {
        filtered = filtered.filter(property => property.bathrooms >= bathroomCount);
      }
    }

    if (filters.location) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    }

    setFilteredProperties(filtered);
  }, [properties]);

  useEffect(() => {
    if (properties.length > 0) {
      filterProperties(currentFilters);
    }
  }, [properties, currentFilters, filterProperties]);

  const handleSearch = useCallback((filters: PropertyFiltersType) => {
    setCurrentFilters(filters);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rental properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProperties}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties for Rent</h1>
          <p className="text-gray-600">Find your perfect rental property</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>
              <PropertyFilters
                onFiltersChange={handleSearch}
                initialFilters={currentFilters}
              />
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {filteredProperties.length} properties found
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Map
                </Button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <GoogleMap
                  properties={filteredProperties}
                  onPropertySelect={(property) => router.push(`/properties/${property.id}`)}
                  center={filteredProperties.length > 0 ? {
                    lat: filteredProperties[0].latitude || 0,
                    lng: filteredProperties[0].longitude || 0
                  } : { lat: -1.2921, lng: 36.8219 }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No rental properties found matching your criteria.</p>
                <Button 
                  onClick={() => setCurrentFilters({
                    search: '',
                    type: 'rent',
                    category: 'all',
                    priceMin: '',
                    priceMax: '',
                    bedrooms: '',
                    bathrooms: '',
                    areaMin: '',
                    areaMax: '',
                    location: '',
                    county: '',
                    features: [],
                    sortBy: 'newest',
                    radius: '10'
                  })}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForRentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <ForRentPageContent />
    </Suspense>
  );
}