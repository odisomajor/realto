'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyComparison from '@/components/properties/PropertyComparison';
import { propertyApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  county?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: 'sale' | 'rent';
  category: string;
  features: string[];
  images: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  views?: number;
  favorites?: number;
  isFavorited?: boolean;
}

export default function PropertyComparisonPage() {
  const searchParams = useSearchParams();
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialProperties();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchProperties();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadInitialProperties = async () => {
    try {
      // Get property IDs from URL params
      const propertyIds = searchParams.get('properties')?.split(',') || [];
      
      if (propertyIds.length > 0) {
        const properties = await Promise.all(
          propertyIds.map(async (id) => {
            try {
              const response = await propertyApi.getProperty(id);
              return response.data.data;
            } catch (error) {
              console.error(`Error loading property ${id}:`, error);
              return null;
            }
          })
        );
        
        const validProperties = properties.filter(Boolean) as Property[];
        setComparedProperties(validProperties);
      }
    } catch (error) {
      console.error('Error loading initial properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProperties = async () => {
    try {
      setIsSearching(true);
      const response = await propertyApi.searchProperties({
        query: searchQuery,
        limit: 10
      });
      
      const results = response.data.data || [];
      // Filter out already compared properties
      const filteredResults = results.filter(
        (property: Property) => !comparedProperties.some(cp => cp._id === property._id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching properties:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addPropertyToComparison = (property: Property) => {
    if (comparedProperties.length >= 4) {
      alert('Maximum 4 properties can be compared at once');
      return;
    }

    if (comparedProperties.some(cp => cp._id === property._id)) {
      return; // Property already in comparison
    }

    setComparedProperties([...comparedProperties, property]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    
    // Update URL with new property IDs
    updateURL([...comparedProperties, property]);
  };

  const removePropertyFromComparison = (propertyId: string) => {
    const updatedProperties = comparedProperties.filter(p => p._id !== propertyId);
    setComparedProperties(updatedProperties);
    updateURL(updatedProperties);
  };

  const updateURL = (properties: Property[]) => {
    const propertyIds = properties.map(p => p._id).join(',');
    const url = new URL(window.location.href);
    
    if (propertyIds) {
      url.searchParams.set('properties', propertyIds);
    } else {
      url.searchParams.delete('properties');
    }
    
    window.history.replaceState({}, '', url.toString());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Comparison</h1>
              <p className="text-gray-600 mt-2">
                Compare properties side by side to make informed decisions
              </p>
            </div>
            
            {comparedProperties.length < 4 && (
              <Button
                onClick={() => setShowSearch(true)}
                className="flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </div>

        {/* Comparison Component */}
        <PropertyComparison
          initialProperties={comparedProperties}
          maxComparisons={4}
        />

        {/* Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Property to Comparison
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearch(false)}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search properties by title, location, or features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((property) => (
                      <div
                        key={property._id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <img
                          src={property.images[0] || '/placeholder-property.jpg'}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{property.title}</h4>
                          <p className="text-sm text-gray-600">{property.location}</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(property.price)}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{property.bedrooms} bed</span>
                            <span>{property.bathrooms} bath</span>
                            <span>{property.area.toLocaleString()} sq ft</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addPropertyToComparison(property)}
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="text-center py-8">
                    <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No properties found matching your search.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try different keywords or check your spelling.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Start typing to search for properties...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Search by title, location, features, or any other criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {comparedProperties.length === 0 && (
          <div className="text-center py-16">
            <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Properties to Compare
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add properties to your comparison to see detailed side-by-side analysis 
              of features, prices, and specifications.
            </p>
            <Button
              onClick={() => setShowSearch(true)}
              size="lg"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Your First Property
            </Button>
          </div>
        )}

        {/* Comparison Tips */}
        {comparedProperties.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Comparison Tips
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Compare similar property types for more meaningful insights</li>
              <li>• Consider location factors like proximity to amenities and transport</li>
              <li>• Look beyond price - consider value per square foot and features</li>
              <li>• Check the listing dates to understand market timing</li>
              <li>• Contact agents for properties that interest you most</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}