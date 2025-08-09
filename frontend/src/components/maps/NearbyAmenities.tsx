'use client';

import { useEffect, useState } from 'react';
import { geocodingApi } from '@/lib/api';
import { loadGoogleMaps } from '@/lib/google-maps';
import { 
  AcademicCapIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Amenity {
  id: string;
  name: string;
  type: string;
  distance: number;
  rating?: number;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isOpen?: boolean;
  priceLevel?: number;
}

interface NearbyAmenitiesProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  radius?: number; // in meters
  className?: string;
}

const AMENITY_TYPES = {
  school: {
    icon: AcademicCapIcon,
    label: 'Schools',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    searchTypes: ['school', 'university', 'primary_school', 'secondary_school']
  },
  hospital: {
    icon: HeartIcon,
    label: 'Healthcare',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    searchTypes: ['hospital', 'pharmacy', 'doctor', 'dentist']
  },
  shopping: {
    icon: ShoppingBagIcon,
    label: 'Shopping',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    searchTypes: ['shopping_mall', 'supermarket', 'store', 'grocery_or_supermarket']
  },
  business: {
    icon: BuildingOfficeIcon,
    label: 'Business',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    searchTypes: ['bank', 'atm', 'post_office', 'gas_station']
  }
};

export default function NearbyAmenities({
  coordinates,
  radius = 2000, // 2km default
  className = ""
}: NearbyAmenitiesProps) {
  const [amenities, setAmenities] = useState<{ [key: string]: Amenity[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('school');

  useEffect(() => {
    const fetchNearbyAmenities = async () => {
      if (!coordinates) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch amenities for each category using backend API
        const amenityPromises = Object.entries(AMENITY_TYPES).map(async ([category, config]) => {
          try {
            const response = await geocodingApi.findNearbyAmenities(
              coordinates.lat,
              coordinates.lng,
              config.searchTypes[0], // Use first search type as primary
              radius
            );
            
            const categoryAmenities: Amenity[] = response.data.data
              .slice(0, 10) // Limit to 10 results per category
              .map((place: any) => ({
                id: place.place_id || Math.random().toString(),
                name: place.name || 'Unknown',
                type: category,
                distance: place.distance || 0,
                rating: place.rating,
                address: place.vicinity || place.formatted_address || '',
                coordinates: {
                  lat: place.geometry?.location?.lat || coordinates.lat,
                  lng: place.geometry?.location?.lng || coordinates.lng
                },
                isOpen: place.opening_hours?.open_now,
                priceLevel: place.price_level
              }))
              .sort((a, b) => a.distance - b.distance);

            return { category, amenities: categoryAmenities };
          } catch (error) {
            console.error(`Error fetching ${category}:`, error);
            return { category, amenities: [] };
          }
        });

        const results = await Promise.all(amenityPromises);
        
        // Transform results into the expected format
        const allAmenities: { [key: string]: Amenity[] } = {};
        results.forEach(result => {
          allAmenities[result.category] = result.amenities;
        });

        setAmenities(allAmenities);
      } catch (error) {
        console.error('Error fetching nearby amenities:', error);
        setError('Failed to load nearby amenities');
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyAmenities();
  }, [coordinates, radius]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">☆</span>
      );
    }

    return stars;
  };

  const getPriceLevelText = (level?: number): string => {
    if (!level) return '';
    return '₹'.repeat(level);
  };



  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Amenities</h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading nearby amenities...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(AMENITY_TYPES).map(([category, config]) => {
              const Icon = config.icon;
              const count = amenities[category]?.length || 0;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? `${config.bgColor} ${config.color} border-2 border-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                  {count > 0 && (
                    <span className="bg-white/80 text-xs px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Amenities list */}
          <div className="space-y-3">
            {amenities[selectedCategory]?.length > 0 ? (
              amenities[selectedCategory].map((amenity) => {
                const config = AMENITY_TYPES[amenity.type as keyof typeof AMENITY_TYPES];
                const Icon = config.icon;

                return (
                  <div
                    key={amenity.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {amenity.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                          <MapPinIcon className="h-4 w-4" />
                          {formatDistance(amenity.distance)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {amenity.address}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        {amenity.rating && (
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {renderStars(amenity.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({amenity.rating})
                            </span>
                          </div>
                        )}
                        
                        {amenity.priceLevel && (
                          <div className="text-sm text-gray-600">
                            {getPriceLevelText(amenity.priceLevel)}
                          </div>
                        )}
                        
                        {amenity.isOpen !== undefined && (
                          <div className={`flex items-center gap-1 text-sm ${
                            amenity.isOpen ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <ClockIcon className="h-4 w-4" />
                            {amenity.isOpen ? 'Open' : 'Closed'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPinIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No {AMENITY_TYPES[selectedCategory as keyof typeof AMENITY_TYPES].label.toLowerCase()} found nearby</p>
              </div>
            )}
          </div>

          {/* Summary */}
          {Object.values(amenities).some(arr => arr.length > 0) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {Object.entries(AMENITY_TYPES).map(([category, config]) => {
                  const count = amenities[category]?.length || 0;
                  const closest = amenities[category]?.[0];
                  
                  return (
                    <div key={category} className="text-sm">
                      <div className={`font-medium ${config.color}`}>
                        {count}
                      </div>
                      <div className="text-gray-600">
                        {config.label}
                      </div>
                      {closest && (
                        <div className="text-xs text-gray-500 mt-1">
                          Closest: {formatDistance(closest.distance)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}