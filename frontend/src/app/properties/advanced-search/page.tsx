'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyAdvancedSearch } from '@/components/properties/PropertyAdvancedSearch'
import PropertyCard from '@/components/properties/PropertyCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  MapPin,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Bookmark,
  Share2,
  Download,
  RefreshCw,
  Grid3X3,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'

interface Property {
  id: string
  title: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  images: string[]
  features: string[]
  description: string
  agent: {
    name: string
    phone: string
    email: string
    image: string
  }
  status: 'available' | 'sold' | 'rented'
  yearBuilt: number
  listingDate: string
  views: number
  favorites: number
}

interface SearchFilters {
  query: string
  location: string
  propertyType: string[]
  priceRange: { min: number; max: number }
  bedrooms: number[]
  bathrooms: number[]
  areaRange: { min: number; max: number }
  features: string[]
  yearBuilt: { min: number; max: number }
  listingAge: number
  keywords: string[]
  radius: number
  sortBy: string
  viewType: 'list' | 'map' | 'grid'
}

export default function AdvancedSearchPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null)
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: SearchFilters; date: string }>>([])
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    averagePrice: 0,
    searchTime: 0,
    newListings: 0
  })

  // Mock properties data
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern 3BR Apartment in Kilimani',
      price: 15000000,
      location: 'Kilimani, Nairobi',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'apartment',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      features: ['parking', 'wifi', 'security', 'pool', 'gym'],
      description: 'Beautiful modern apartment with stunning city views',
      agent: {
        name: 'Sarah Johnson',
        phone: '+254 700 123456',
        email: 'sarah@realestate.com',
        image: '/api/placeholder/100/100'
      },
      status: 'available',
      yearBuilt: 2020,
      listingDate: '2024-01-15',
      views: 245,
      favorites: 18
    },
    {
      id: '2',
      title: 'Luxury Villa in Karen',
      price: 45000000,
      location: 'Karen, Nairobi',
      bedrooms: 5,
      bathrooms: 4,
      area: 350,
      type: 'villa',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      features: ['parking', 'garden', 'security', 'pool', 'backup_power'],
      description: 'Spacious luxury villa with beautiful gardens',
      agent: {
        name: 'Michael Chen',
        phone: '+254 700 789012',
        email: 'michael@realestate.com',
        image: '/api/placeholder/100/100'
      },
      status: 'available',
      yearBuilt: 2018,
      listingDate: '2024-01-10',
      views: 189,
      favorites: 32
    },
    {
      id: '3',
      title: 'Penthouse in Westlands',
      price: 35000000,
      location: 'Westlands, Nairobi',
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
      type: 'penthouse',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      features: ['parking', 'wifi', 'security', 'pool', 'gym', 'balcony'],
      description: 'Stunning penthouse with panoramic city views',
      agent: {
        name: 'Grace Wanjiku',
        phone: '+254 700 345678',
        email: 'grace@realestate.com',
        image: '/api/placeholder/100/100'
      },
      status: 'available',
      yearBuilt: 2021,
      listingDate: '2024-01-12',
      views: 312,
      favorites: 45
    }
  ]

  const handleSearch = async (filters: SearchFilters) => {
    setLoading(true)
    setCurrentFilters(filters)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Filter properties based on search criteria
      let filteredProperties = mockProperties.filter(property => {
        // Basic filters
        if (filters.query && !property.title.toLowerCase().includes(filters.query.toLowerCase()) &&
            !property.description.toLowerCase().includes(filters.query.toLowerCase())) {
          return false
        }
        
        if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false
        }
        
        if (filters.propertyType.length > 0 && !filters.propertyType.includes(property.type)) {
          return false
        }
        
        if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
          return false
        }
        
        if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(property.bedrooms.toString())) {
          return false
        }
        
        if (filters.bathrooms.length > 0 && !filters.bathrooms.includes(property.bathrooms.toString())) {
          return false
        }
        
        if (property.area < filters.areaRange.min || property.area > filters.areaRange.max) {
          return false
        }
        
        if (filters.features.length > 0) {
          const hasAllFeatures = filters.features.every(feature => 
            property.features.includes(feature)
          )
          if (!hasAllFeatures) return false
        }
        
        if (property.yearBuilt < filters.yearBuilt.min || property.yearBuilt > filters.yearBuilt.max) {
          return false
        }
        
        return true
      })
      
      // Sort properties
      switch (filters.sortBy) {
        case 'price_asc':
          filteredProperties.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          filteredProperties.sort((a, b) => b.price - a.price)
          break
        case 'date_desc':
          filteredProperties.sort((a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime())
          break
        case 'area_desc':
          filteredProperties.sort((a, b) => b.area - a.area)
          break
        default:
          // Keep original order for relevance
          break
      }
      
      setProperties(filteredProperties)
      setSearchStats({
        totalResults: filteredProperties.length,
        averagePrice: filteredProperties.length > 0 
          ? Math.round(filteredProperties.reduce((sum, p) => sum + p.price, 0) / filteredProperties.length)
          : 0,
        searchTime: Math.random() * 2 + 0.5,
        newListings: Math.floor(Math.random() * 5) + 1
      })
      setSearchPerformed(true)
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSearch = (filters: SearchFilters, name: string) => {
    const newSavedSearch = {
      name,
      filters,
      date: new Date().toISOString()
    }
    setSavedSearches(prev => [...prev, newSavedSearch])
    
    // Show success message
    alert(`Search "${name}" saved successfully!`)
  }

  const loadSavedSearch = (savedSearch: { name: string; filters: SearchFilters; date: string }) => {
    handleSearch(savedSearch.filters)
    setShowSavedSearches(false)
  }

  const exportResults = () => {
    const data = {
      filters: currentFilters,
      results: properties,
      stats: searchStats,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `property-search-results-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-purple-600" />
                Advanced Property Search
              </h1>
              <p className="text-gray-600 mt-2">
                Find your perfect property with AI-powered search and advanced filters
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSavedSearches(!showSavedSearches)}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Saved Searches ({savedSearches.length})
              </Button>
              
              {searchPerformed && (
                <Button variant="outline" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Saved Searches */}
        {showSavedSearches && savedSearches.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-blue-600" />
                Your Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSearches.map((savedSearch, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2">{savedSearch.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Saved on {new Date(savedSearch.date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => loadSavedSearch(savedSearch)}
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Load
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSavedSearches(prev => prev.filter((_, i) => i !== index))
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Component */}
        <PropertyAdvancedSearch
          onSearch={handleSearch}
          onSaveSearch={handleSaveSearch}
          showAISearch={true}
        />

        {/* Search Results */}
        {loading && (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Searching Properties...</h3>
              <p className="text-gray-600">
                Using AI to find the best matches for your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {searchPerformed && !loading && (
          <>
            {/* Search Stats */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {searchStats.totalResults}
                    </div>
                    <div className="text-sm text-gray-600">Properties Found</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(searchStats.averagePrice)}
                    </div>
                    <div className="text-sm text-gray-600">Average Price</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {searchStats.searchTime.toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-600">Search Time</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {searchStats.newListings}
                    </div>
                    <div className="text-sm text-gray-600">New This Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Header */}
            {properties.length > 0 && (
              <div className="mt-8 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Search Results ({properties.length})
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Properties matching your search criteria
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={currentFilters?.viewType === 'list' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentFilters?.viewType === 'grid' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={currentFilters?.viewType === 'map' ? 'default' : 'outline'}
                    size="sm"
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Properties Grid */}
            {properties.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onFavorite={(id) => console.log('Favorited:', id)}
                    onShare={(id) => console.log('Shared:', id)}
                    onClick={(id) => router.push(`/properties/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card className="mt-8">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-4">
                    No properties match your current search criteria. Try adjusting your filters.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Search
                    </Button>
                    <Button onClick={() => router.push('/properties')}>
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Properties
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Getting Started */}
        {!searchPerformed && !loading && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Getting Started with Advanced Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">AI-Powered Search</h4>
                  <p className="text-sm text-gray-600">
                    Describe what you're looking for in natural language and let AI find perfect matches
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <SlidersHorizontal className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Advanced Filters</h4>
                  <p className="text-sm text-gray-600">
                    Use detailed filters for property type, price, location, features, and more
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bookmark className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Save Searches</h4>
                  <p className="text-sm text-gray-600">
                    Save your search criteria and get notified when new matching properties are listed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}