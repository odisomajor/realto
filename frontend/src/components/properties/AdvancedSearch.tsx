'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { geocodingApi } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export interface SearchFilters {
  query?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  radius?: number; // in kilometers
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: 'sale' | 'rent' | '';
  category?: 'residential' | 'commercial' | 'land' | '';
  features?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'distance';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  className?: string;
  showLocationSearch?: boolean;
}

const PROPERTY_FEATURES = [
  'Parking', 'Swimming Pool', 'Gym', 'Security', 'Garden', 'Balcony',
  'Elevator', 'Air Conditioning', 'Fireplace', 'Study Room', 'Servant Quarter',
  'Generator', 'Borehole', 'Solar Panels', 'CCTV', 'Electric Fence'
];

const PRICE_RANGES = {
  sale: [
    { label: 'Under 5M', min: 0, max: 5000000 },
    { label: '5M - 10M', min: 5000000, max: 10000000 },
    { label: '10M - 20M', min: 10000000, max: 20000000 },
    { label: '20M - 50M', min: 20000000, max: 50000000 },
    { label: '50M+', min: 50000000, max: undefined }
  ],
  rent: [
    { label: 'Under 30K', min: 0, max: 30000 },
    { label: '30K - 50K', min: 30000, max: 50000 },
    { label: '50K - 100K', min: 50000, max: 100000 },
    { label: '100K - 200K', min: 100000, max: 200000 },
    { label: '200K+', min: 200000, max: undefined }
  ]
};

export default function AdvancedSearch({
  onSearch,
  initialFilters = {},
  className = '',
  showLocationSearch = true
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Debounced location search
  useEffect(() => {
    if (!filters.location || filters.location.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoadingLocation(true);
        const response = await geocodingApi.geocodeAddress(filters.location!);
        
        if (response.data.success && response.data.data) {
          setLocationSuggestions([response.data.data]);
          setShowLocationSuggestions(true);
        }
      } catch (error) {
        console.error('Location search error:', error);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingLocation(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.location]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLocationSelect = (suggestion: any) => {
    setFilters(prev => ({
      ...prev,
      location: suggestion.formatted_address,
      coordinates: {
        lat: suggestion.geometry.location.lat,
        lng: suggestion.geometry.location.lng
      }
    }));
    setShowLocationSuggestions(false);
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = filters.features || [];
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    handleFilterChange('features', updatedFeatures);
  };

  const handlePriceRangeSelect = (range: any) => {
    setFilters(prev => ({
      ...prev,
      priceMin: range.min,
      priceMax: range.max
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== '' && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Basic Search Bar */}
      <div className="p-4 border-b">
        <div className="flex gap-3">
          {/* Text Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search properties..."
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Location Search */}
          {showLocationSearch && (
            <div className="flex-1 relative">
              <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Location in Kenya..."
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="pl-10"
              />
              
              {/* Location Suggestions */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium">{suggestion.formatted_address}</div>
                      {suggestion.county && (
                        <div className="text-sm text-gray-500">{suggestion.county}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {isLoadingLocation && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button onClick={handleSearch} className="px-6">
            Search
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Property Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('propertyType', '')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !filters.propertyType ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('propertyType', 'sale')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.propertyType === 'sale' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  For Sale
                </button>
                <button
                  onClick={() => handleFilterChange('propertyType', 'rent')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.propertyType === 'rent' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !filters.category ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('category', 'residential')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filters.category === 'residential' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <HomeIcon className="h-4 w-4" />
                  Residential
                </button>
                <button
                  onClick={() => handleFilterChange('category', 'commercial')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filters.category === 'commercial' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  Commercial
                </button>
                <button
                  onClick={() => handleFilterChange('category', 'land')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.category === 'land' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Land
                </button>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
              {(filters.propertyType === 'rent' ? PRICE_RANGES.rent : PRICE_RANGES.sale).map((range, index) => (
                <button
                  key={index}
                  onClick={() => handlePriceRangeSelect(range)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.priceMin === range.min && filters.priceMax === range.max
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {/* Custom Price Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleFilterChange('bedrooms', num === 0 ? undefined : num)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.bedrooms === num || (num === 0 && !filters.bedrooms)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num === 0 ? 'Any' : num === 5 ? '5+' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => handleFilterChange('bathrooms', num === 0 ? undefined : num)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.bathrooms === num || (num === 0 && !filters.bathrooms)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num === 0 ? 'Any' : num === 4 ? '4+' : num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Radius */}
          {filters.coordinates && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {filters.radius || 10} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.radius || 10}
                onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          )}

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {PROPERTY_FEATURES.map(feature => (
                <button
                  key={feature}
                  onClick={() => handleFeatureToggle(feature)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    filters.features?.includes(feature)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'date_desc'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              {filters.coordinates && <option value="distance">Distance</option>}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSearch} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}