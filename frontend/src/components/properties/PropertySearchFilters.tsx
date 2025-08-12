'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Home, DollarSign, Calendar, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import LocationSearch from '../search/LocationSearch';

interface PropertySearchFiltersProps {
  onFiltersChange: (filters: PropertyFilters) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  totalResults?: number;
  isLoading?: boolean;
}

export interface PropertyFilters {
  search: string;
  category: string;
  listingType: string;
  priceRange: {
    min: number;
    max: number;
  };
  bedrooms: string;
  bathrooms: string;
  location: string;
  features: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  status: string;
}

const initialFilters: PropertyFilters = {
  search: '',
  category: '',
  listingType: '',
  priceRange: { min: 0, max: 10000000 },
  bedrooms: '',
  bathrooms: '',
  location: '',
  features: [],
  dateRange: { start: '', end: '' },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  status: ''
};

const categories = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'LAND', label: 'Land' },
  { value: 'INDUSTRIAL', label: 'Industrial' }
];

const listingTypes = [
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'LEASE', label: 'For Lease' }
];

const bedroomOptions = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' }
];

const bathroomOptions = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' }
];

const sortOptions = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'price', label: 'Price' },
  { value: 'title', label: 'Title' },
  { value: 'views', label: 'Views' },
  { value: 'updatedAt', label: 'Last Updated' }
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'INACTIVE', label: 'Inactive' }
];

const commonFeatures = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Garden',
  'Balcony',
  'Air Conditioning',
  'Furnished',
  'Pet Friendly',
  'Security',
  'Elevator'
];

export default function PropertySearchFilters({
  onFiltersChange,
  onViewModeChange,
  viewMode,
  totalResults = 0,
  isLoading = false
}: PropertySearchFiltersProps) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    onFiltersChange(filters);
    
    // Count active filters
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.listingType) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000000) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.location) count++;
    if (filters.features.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.status) count++;
    
    setActiveFiltersCount(count);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: numValue
      }
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
    setFilters(initialFilters);
  };

  const clearFilter = (filterKey: keyof PropertyFilters) => {
    if (filterKey === 'priceRange') {
      setFilters(prev => ({
        ...prev,
        priceRange: { min: 0, max: 10000000 }
      }));
    } else if (filterKey === 'dateRange') {
      setFilters(prev => ({
        ...prev,
        dateRange: { start: '', end: '' }
      }));
    } else if (filterKey === 'features') {
      setFilters(prev => ({
        ...prev,
        features: []
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterKey]: filterKey === 'sortBy' ? 'createdAt' : filterKey === 'sortOrder' ? 'desc' : ''
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties by title, location, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange('listingType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {listingTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Summary and Advanced Toggle */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {isLoading ? 'Searching...' : `${totalResults} properties found`}
              </span>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
              {showAdvanced ? <X className="h-3 w-3" /> : <Filter className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Price Range (KES)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max === 10000000 ? '' : filters.priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    className="text-sm"
                  />
                </div>
                {(filters.priceRange.min > 0 || filters.priceRange.max < 10000000) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('priceRange')}
                    className="text-xs text-red-600 mt-1 p-0 h-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="inline h-4 w-4 mr-1" />
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  {bedroomOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {filters.bedrooms && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('bedrooms')}
                    className="text-xs text-red-600 mt-1 p-0 h-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  {bathroomOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {filters.bathrooms && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('bathrooms')}
                    className="text-xs text-red-600 mt-1 p-0 h-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location
                </label>
                <LocationSearch
                  value={filters.location}
                  onLocationSelect={(location) => handleFilterChange('location', location)}
                  placeholder="Search counties, cities, areas..."
                />
                {filters.location && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('location')}
                    className="text-xs text-red-600 mt-1 p-0 h-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {filters.status && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('status')}
                    className="text-xs text-red-600 mt-1 p-0 h-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date Added
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="text-sm"
                  />
                </div>
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('dateRange')}
                    className="text-xs text-red-600 mt-1 p-0 h-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Features & Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {commonFeatures.map(feature => (
                  <Button
                    key={feature}
                    variant={filters.features.includes(feature) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeatureToggle(feature)}
                    className="text-xs"
                  >
                    {feature}
                    {filters.features.includes(feature) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
              {filters.features.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('features')}
                  className="text-xs text-red-600 mt-2 p-0 h-auto"
                >
                  Clear all features
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Search: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('search')}
                className="p-0 h-auto ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.category && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              {categories.find(c => c.value === filters.category)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('category')}
                className="p-0 h-auto ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.listingType && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              {listingTypes.find(t => t.value === filters.listingType)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('listingType')}
                className="p-0 h-auto ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {/* Add more active filter displays as needed */}
        </div>
      )}
    </div>
  );
}