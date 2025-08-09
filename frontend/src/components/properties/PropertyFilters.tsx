'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Home, 
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PropertyFiltersProps {
  onFiltersChange: (filters: PropertyFilters) => void;
  initialFilters?: Partial<PropertyFilters>;
  className?: string;
}

export interface PropertyFilters {
  search: string;
  type: 'all' | 'sale' | 'rent';
  category: 'all' | 'residential' | 'commercial' | 'land';
  priceMin: string;
  priceMax: string;
  bedrooms: string;
  bathrooms: string;
  areaMin: string;
  areaMax: string;
  location: string;
  county: string;
  features: string[];
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'area-large' | 'area-small' | 'popular';
  radius: string; // for location-based search
}

const defaultFilters: PropertyFilters = {
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
};

const kenyaCounties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

const commonFeatures = [
  'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Terrace',
  'Security', 'Elevator', 'Air Conditioning', 'Furnished', 'Pet Friendly',
  'Internet', 'Generator', 'Borehole', 'Solar Power', 'CCTV'
];

export default function PropertyFilters({ onFiltersChange, initialFilters, className }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<PropertyFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === 'features') {
        return acc + (value as string[]).length;
      }
      if (key === 'sortBy') return acc; // Don't count sort as active filter
      return acc + (value && value !== 'all' && value !== '' ? 1 : 0);
    }, 0);
    setActiveFiltersCount(count);

    // Notify parent of filter changes
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const clearFilter = (key: keyof PropertyFilters) => {
    if (key === 'features') {
      setFilters(prev => ({ ...prev, features: [] }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [key]: key === 'type' || key === 'category' ? 'all' : '' 
      }));
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title, location, or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filters.type === 'sale' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('type', filters.type === 'sale' ? 'all' : 'sale')}
          >
            For Sale
          </Button>
          <Button
            variant={filters.type === 'rent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('type', filters.type === 'rent' ? 'all' : 'rent')}
          >
            For Rent
          </Button>
          <Button
            variant={filters.category === 'residential' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('category', filters.category === 'residential' ? 'all' : 'residential')}
          >
            Residential
          </Button>
          <Button
            variant={filters.category === 'commercial' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('category', filters.category === 'commercial' ? 'all' : 'commercial')}
          >
            Commercial
          </Button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Price Range (KES)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    placeholder="Min price"
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  />
                  {filters.priceMin && (
                    <button
                      onClick={() => clearFilter('priceMin')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Max price"
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  />
                  {filters.priceMax && (
                    <button
                      onClick={() => clearFilter('priceMax')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {(filters.priceMin || filters.priceMax) && (
                <p className="text-xs text-gray-500 mt-1">
                  {filters.priceMin && `Min: KES ${formatCurrency(filters.priceMin)}`}
                  {filters.priceMin && filters.priceMax && ' - '}
                  {filters.priceMax && `Max: KES ${formatCurrency(filters.priceMax)}`}
                </p>
              )}
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bed className="inline h-4 w-4 mr-1" />
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bath className="inline h-4 w-4 mr-1" />
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Area Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Maximize className="inline h-4 w-4 mr-1" />
                Area (sq meters)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Min area"
                  type="number"
                  value={filters.areaMin}
                  onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                />
                <Input
                  placeholder="Max area"
                  type="number"
                  value={filters.areaMax}
                  onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  County
                </label>
                <select
                  value={filters.county}
                  onChange={(e) => handleFilterChange('county', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Counties</option>
                  {kenyaCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Location
                </label>
                <Input
                  placeholder="e.g., Westlands, Karen"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline h-4 w-4 mr-1" />
                Features
              </label>
              <div className="flex flex-wrap gap-2">
                {commonFeatures.map(feature => (
                  <button
                    key={feature}
                    onClick={() => handleFeatureToggle(feature)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.features.includes(feature)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
              {filters.features.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.features.map(feature => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {feature}
                      <button
                        onClick={() => handleFeatureToggle(feature)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="area-large">Area: Largest First</option>
                <option value="area-small">Area: Smallest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.type !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {filters.type === 'sale' ? 'For Sale' : 'For Rent'}
                  <button
                    onClick={() => clearFilter('type')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  {filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}
                  <button
                    onClick={() => clearFilter('category')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.priceMin && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Min: KES {formatCurrency(filters.priceMin)}
                  <button
                    onClick={() => clearFilter('priceMin')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.priceMax && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Max: KES {formatCurrency(filters.priceMax)}
                  <button
                    onClick={() => clearFilter('priceMax')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.county && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  {filters.county}
                  <button
                    onClick={() => clearFilter('county')}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.bedrooms && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                  {filters.bedrooms}+ beds
                  <button
                    onClick={() => clearFilter('bedrooms')}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.bathrooms && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                  {filters.bathrooms}+ baths
                  <button
                    onClick={() => clearFilter('bathrooms')}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}