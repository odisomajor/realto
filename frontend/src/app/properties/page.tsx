'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import KenyaMap from '@/components/maps/KenyaMap';
import { Property } from '@/types';
import { propertyApi } from '@/lib/api';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  MapIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

// Mock data for properties
const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern 3BR Apartment in Westlands",
    description: "Luxurious apartment with stunning city views and modern amenities",
    price: 15000000,
    location: "Westlands, Nairobi",
    bedrooms: 3,
    bathrooms: 2,
    area: 120, // 120 square metres
    type: "sale",
    category: "residential",
    status: "available",
    images: ["https://picsum.photos/400/300?random=40"],
    features: ["Parking", "Swimming Pool", "Gym", "Security"],
    agent: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+254700000000"
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    featured: true
  },
  {
    id: "2",
    title: "Spacious 4BR House in Karen",
    description: "Beautiful family home in quiet neighborhood with garden",
    price: 80000,
    location: "Karen, Nairobi",
    bedrooms: 4,
    bathrooms: 3,
    area: 250, // 250 square metres
    type: "rent",
    category: "residential",
    status: "available",
    images: ["https://picsum.photos/400/300?random=41"],
    features: ["Garden", "Parking", "Security", "Fireplace"],
    agent: {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+254700000001"
    },
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    featured: true
  },
  {
    id: "3",
    title: "Prime Land for Development in Kiambu",
    description: "Excellent investment opportunity with great potential",
    price: 25000000,
    location: "Kiambu, Kenya",
    bedrooms: 0,
    bathrooms: 0,
    area: 8094, // 2 acres in square metres
    type: "sale",
    category: "land",
    status: "available",
    images: ["https://picsum.photos/400/300?random=42"],
    features: ["Road Access", "Water Connection", "Electricity", "Title Deed"],
    agent: {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+254700000002"
    },
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    featured: true
  },
  {
    id: "4",
    title: "Commercial Office Space in CBD",
    description: "Prime office location in the heart of Nairobi",
    price: 18000000,
    location: "CBD, Nairobi",
    bedrooms: 0,
    bathrooms: 2,
    area: 80, // 80 square metres
    type: "sale",
    category: "commercial",
    status: "available",
    images: ["https://picsum.photos/400/300?random=43"],
    features: ["Elevator", "Parking", "Security", "Air Conditioning"],
    agent: {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      phone: "+254700000003"
    },
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    featured: false
  },
  {
    id: "5",
    title: "Luxury 5BR Villa in Runda",
    description: "Stunning villa with panoramic views and premium finishes",
    price: 45000000,
    location: "Runda, Nairobi",
    bedrooms: 5,
    bathrooms: 4,
    area: 400, // 400 square metres
    type: "sale",
    category: "residential",
    status: "available",
    images: ["https://picsum.photos/400/300?random=44"],
    features: ["Swimming Pool", "Garden", "Parking", "Security", "Gym", "Study Room"],
    agent: {
      id: "5",
      name: "David Brown",
      email: "david@example.com",
      phone: "+254700000004"
    },
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
    featured: false
  },
  {
    id: "6",
    title: "Agricultural Land in Nakuru",
    description: "Fertile agricultural land perfect for farming",
    price: 12000000,
    location: "Nakuru, Kenya",
    bedrooms: 0,
    bathrooms: 0,
    area: 40469, // 10 acres in square metres
    type: "sale",
    category: "land",
    status: "available",
    images: ["https://picsum.photos/400/300?random=45"],
    features: ["Water Source", "Road Access", "Fertile Soil", "Title Deed"],
    agent: {
      id: "6",
      name: "Mary Johnson",
      email: "mary@example.com",
      phone: "+254700000005"
    },
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z",
    featured: false
  },
  // Additional rental properties
  {
    id: "7",
    title: "2BR Apartment for Rent in Kilimani",
    description: "Modern apartment with great amenities in prime location",
    price: 65000,
    location: "Kilimani, Nairobi",
    bedrooms: 2,
    bathrooms: 2,
    area: 90,
    type: "rent",
    category: "residential",
    status: "available",
    images: ["https://picsum.photos/400/300?random=46"],
    features: ["Parking", "Security", "Balcony", "Modern Kitchen"],
    agent: {
      id: "7",
      name: "Alice Cooper",
      email: "alice@example.com",
      phone: "+254700000006"
    },
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-07T00:00:00Z",
    featured: false
  },
  {
    id: "8",
    title: "Studio Apartment for Rent in Parklands",
    description: "Cozy studio perfect for young professionals",
    price: 35000,
    location: "Parklands, Nairobi",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    type: "rent",
    category: "residential",
    status: "available",
    images: ["https://picsum.photos/400/300?random=47"],
    features: ["Furnished", "Security", "Parking", "WiFi"],
    agent: {
      id: "8",
      name: "Robert Lee",
      email: "robert@example.com",
      phone: "+254700000007"
    },
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z",
    featured: false
  },
  {
    id: "9",
    title: "Commercial Space for Rent in Westlands",
    description: "Prime commercial space ideal for retail business",
    price: 120000,
    location: "Westlands, Nairobi",
    bedrooms: 0,
    bathrooms: 1,
    area: 150,
    type: "rent",
    category: "commercial",
    status: "available",
    images: ["https://picsum.photos/400/300?random=48"],
    features: ["Street Facing", "Parking", "Security", "High Traffic Area"],
    agent: {
      id: "9",
      name: "Emma Davis",
      email: "emma@example.com",
      phone: "+254700000008"
    },
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-09T00:00:00Z",
    featured: false
  }
];

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '', // This will be for sale/rent
    category: '', // This will be for house/apartment/commercial/land
    status: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    location: '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Initialize filters from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setFilters(prev => ({ ...prev, type: typeParam }));
    }
  }, [searchParams]);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertyApi.getProperties();
        setProperties(response.data.properties || response.data);
        setFilteredProperties(response.data.properties || response.data);
      } catch (err: any) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again.');
        // Fallback to mock data if API fails
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(property => property.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(property => property.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(property => property.status === filters.status);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.bedrooms));
    }
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [properties, searchTerm, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      location: '',
    });
    setSearchTerm('');
  };

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
              <p className="mt-2 text-gray-600">
                {filteredProperties.length} properties found
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link href="/properties/saved-searches">
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Saved Searches
                  </Button>
                </Link>
                <Link href="/properties/compare">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                </Link>
                <Link href="/properties/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </Link>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 w-4 h-4">
                    <div className="bg-gray-400 rounded-sm"></div>
                    <div className="bg-gray-400 rounded-sm"></div>
                    <div className="bg-gray-400 rounded-sm"></div>
                    <div className="bg-gray-400 rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md ${
                    viewMode === 'map' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <MapIcon className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-green-600 hover:text-green-700"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search properties..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Listing Type (Sale/Rent) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Types</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                {/* Property Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Categories</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Status</option>
                    <option value="for_sale">For Sale</option>
                    <option value="for_rent">For Rent</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (KES)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Bedrooms
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

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    County
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Counties</option>
                    <option value="Baringo">Baringo</option>
                    <option value="Bomet">Bomet</option>
                    <option value="Bungoma">Bungoma</option>
                    <option value="Busia">Busia</option>
                    <option value="Elgeyo-Marakwet">Elgeyo-Marakwet</option>
                    <option value="Embu">Embu</option>
                    <option value="Garissa">Garissa</option>
                    <option value="Homa Bay">Homa Bay</option>
                    <option value="Isiolo">Isiolo</option>
                    <option value="Kajiado">Kajiado</option>
                    <option value="Kakamega">Kakamega</option>
                    <option value="Kericho">Kericho</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Kilifi">Kilifi</option>
                    <option value="Kirinyaga">Kirinyaga</option>
                    <option value="Kisii">Kisii</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Kitui">Kitui</option>
                    <option value="Kwale">Kwale</option>
                    <option value="Laikipia">Laikipia</option>
                    <option value="Lamu">Lamu</option>
                    <option value="Machakos">Machakos</option>
                    <option value="Makueni">Makueni</option>
                    <option value="Mandera">Mandera</option>
                    <option value="Marsabit">Marsabit</option>
                    <option value="Meru">Meru</option>
                    <option value="Migori">Migori</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Murang'a">Murang'a</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Nandi">Nandi</option>
                    <option value="Narok">Narok</option>
                    <option value="Nyamira">Nyamira</option>
                    <option value="Nyandarua">Nyandarua</option>
                    <option value="Nyeri">Nyeri</option>
                    <option value="Samburu">Samburu</option>
                    <option value="Siaya">Siaya</option>
                    <option value="Taita-Taveta">Taita-Taveta</option>
                    <option value="Tana River">Tana River</option>
                    <option value="Tharaka-Nithi">Tharaka-Nithi</option>
                    <option value="Trans Nzoia">Trans Nzoia</option>
                    <option value="Turkana">Turkana</option>
                    <option value="Uasin Gishu">Uasin Gishu</option>
                    <option value="Vihiga">Vihiga</option>
                    <option value="Wajir">Wajir</option>
                    <option value="West Pokot">West Pokot</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid/List/Map */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Properties</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : currentProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                {viewMode === 'map' ? (
                  <div className="bg-white rounded-lg shadow-sm p-6 min-h-[600px]">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Map View</h2>
                      <p className="text-sm text-gray-600">Click on counties to filter properties by location</p>
                    </div>
                    <KenyaMap 
                      properties={currentProperties}
                      onLocationFilter={(county) => handleFilterChange('location', county)}
                      selectedCounty={filters.location}
                    />
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {currentProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}

                {/* Pagination - only show for grid/list view */}
                {viewMode !== 'map' && totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}