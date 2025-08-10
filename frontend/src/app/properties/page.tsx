'use client';

import { useState, useEffect } from 'react';
import PropertyFilters, { PropertyFilters as PropertyFiltersType } from '@/components/properties/PropertyFilters';
import { propertyApi, geocodingApi } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';
import GoogleMap from '@/components/maps/GoogleMap';
import { Button } from '@/components/ui/Button';
import { 
  MapIcon, 
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { 
  Calculator, 
  Filter, 
  Plus, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Share2, 
  Eye,
  Bell,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  status: 'available' | 'sold' | 'rented' | 'pending';
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
  distance?: number; // Added for distance-based sorting
}

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentFilters, setCurrentFilters] = useState<PropertyFiltersType>({
    search: '',
    type: 'all',
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

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyApi.getProperties();
      const propertiesData = response.data.data || [];
      setProperties(propertiesData);
      setFilteredProperties(propertiesData);
    } catch (err) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: PropertyFiltersType) => {
    try {
      setCurrentFilters(filters);
      let filtered = [...properties];

      // Text search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(property =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query) ||
          property.features.some(feature => feature.toLowerCase().includes(query))
        );
      }

      // Property type filter
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(property => property.type === filters.type);
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(property => property.category === filters.category);
      }

      // Price filters
      if (filters.priceMin || filters.priceMax) {
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
      }

      // Bedroom filter
      if (filters.bedrooms) {
        const bedroomCount = parseInt(filters.bedrooms);
        if (!isNaN(bedroomCount)) {
          filtered = filtered.filter(property => property.bedrooms >= bedroomCount);
        }
      }

      // Bathroom filter
      if (filters.bathrooms) {
        const bathroomCount = parseInt(filters.bathrooms);
        if (!isNaN(bathroomCount)) {
          filtered = filtered.filter(property => property.bathrooms >= bathroomCount);
        }
      }

      // Area filter
      if (filters.areaMin || filters.areaMax) {
        if (filters.areaMin) {
          const minArea = parseFloat(filters.areaMin);
          if (!isNaN(minArea)) {
            filtered = filtered.filter(property => property.area >= minArea);
          }
        }
        if (filters.areaMax) {
          const maxArea = parseFloat(filters.areaMax);
          if (!isNaN(maxArea)) {
            filtered = filtered.filter(property => property.area <= maxArea);
          }
        }
      }

      // County filter
      if (filters.county) {
        filtered = filtered.filter(property => 
          property.location.toLowerCase().includes(filters.county!.toLowerCase())
        );
      }

      // Features filter
      if (filters.features && filters.features.length > 0) {
        filtered = filtered.filter(property =>
          filters.features!.every(feature => property.features.includes(feature))
        );
      }

      // Location-based filtering with radius
      if (filters.location && filters.location.trim()) {
        // For now, just filter by location string match
        // In a real app, you'd use coordinates and radius
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
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'area-large':
              return b.area - a.area;
            case 'area-small':
              return a.area - b.area;
            default:
              return 0;
          }
        });
      }

      setFilteredProperties(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to apply search filters');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-2">
              Discover your perfect home from our extensive collection
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push('/properties/mortgage-calculator')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Mortgage Calculator
            </Button>
            <Button 
              onClick={() => router.push('/properties/advanced-search')}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              Advanced Search
            </Button>
            <Button 
              onClick={() => router.push('/properties/wishlist')}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Heart className="h-5 w-5 mr-2" />
              My Wishlist
            </Button>
            
            <Button
              onClick={() => router.push('/properties/tours')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Property Tours
            </Button>
            <Button 
              onClick={() => router.push('/properties/notifications')}
              variant="outline"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              List Property
            </Button>
          </div>
        </div>

        {/* Property Filters Component */}
        <PropertyFilters
          onFiltersChange={handleSearch}
          className="mb-6"
        />

        {/* View Toggle and Results Count */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {filteredProperties.length} properties found
              {currentFilters.location && (
                <span className="text-sm text-gray-500 ml-2">
                  in {currentFilters.location}
                </span>
              )}
            </span>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon className="h-5 w-5" />
              Map
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard property={property} />
                {property.distance !== undefined && property.distance < Infinity && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    {property.distance.toFixed(1)} km away
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <GoogleMap
              properties={filteredProperties}
              height="600px"
              showSearch={false}
              center={undefined}
            />
          </div>
        )}

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
            <Button onClick={() => handleSearch({
              search: '',
              type: 'all',
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
            })} className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
