'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Search,
  MapPin,
  Filter,
  Sliders,
  Map,
  List,
  Star,
  Zap,
  Clock,
  TrendingUp,
  Home,
  Building,
  TreePine,
  Car,
  Wifi,
  Shield,
  Waves,
  Dumbbell,
  GraduationCap,
  ShoppingCart,
  Hospital,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react'

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

interface PropertyAdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onSaveSearch?: (filters: SearchFilters, name: string) => void
  initialFilters?: Partial<SearchFilters>
  showAISearch?: boolean
}

export function PropertyAdvancedSearch({
  onSearch,
  onSaveSearch,
  initialFilters = {},
  showAISearch = true
}: PropertyAdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    propertyType: [],
    priceRange: { min: 0, max: 50000000 },
    bedrooms: [],
    bathrooms: [],
    areaRange: { min: 0, max: 1000 },
    features: [],
    yearBuilt: { min: 1950, max: new Date().getFullYear() },
    listingAge: 365,
    keywords: [],
    radius: 10,
    sortBy: 'relevance',
    viewType: 'list',
    ...initialFilters
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [isAISearching, setIsAISearching] = useState(false)
  const [savedSearchName, setSavedSearchName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment', icon: Building },
    { value: 'house', label: 'House', icon: Home },
    { value: 'villa', label: 'Villa', icon: TreePine },
    { value: 'townhouse', label: 'Townhouse', icon: Building },
    { value: 'penthouse', label: 'Penthouse', icon: Star },
    { value: 'studio', label: 'Studio', icon: Home },
    { value: 'duplex', label: 'Duplex', icon: Building },
    { value: 'commercial', label: 'Commercial', icon: Building }
  ]

  const features = [
    { value: 'parking', label: 'Parking', icon: Car },
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'security', label: '24/7 Security', icon: Shield },
    { value: 'pool', label: 'Swimming Pool', icon: Waves },
    { value: 'gym', label: 'Gym/Fitness', icon: Dumbbell },
    { value: 'garden', label: 'Garden', icon: TreePine },
    { value: 'balcony', label: 'Balcony', icon: Home },
    { value: 'furnished', label: 'Furnished', icon: Home },
    { value: 'air_conditioning', label: 'Air Conditioning', icon: Home },
    { value: 'elevator', label: 'Elevator', icon: Building },
    { value: 'backup_power', label: 'Backup Power', icon: Zap },
    { value: 'water_backup', label: 'Water Backup', icon: Waves }
  ]

  const nearbyAmenities = [
    { value: 'schools', label: 'Schools', icon: GraduationCap },
    { value: 'shopping', label: 'Shopping Centers', icon: ShoppingCart },
    { value: 'hospitals', label: 'Hospitals', icon: Hospital },
    { value: 'transport', label: 'Public Transport', icon: Car },
    { value: 'restaurants', label: 'Restaurants', icon: Home },
    { value: 'parks', label: 'Parks', icon: TreePine }
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'area_desc', label: 'Largest First' },
    { value: 'area_asc', label: 'Smallest First' }
  ]

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleArrayToggle = (key: keyof SearchFilters, value: string | number) => {
    const currentArray = filters[key] as (string | number)[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    handleFilterChange(key, newArray)
  }

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return

    setIsAISearching(true)
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Parse AI query and update filters
      const parsedFilters = parseAIQuery(aiQuery)
      setFilters({ ...filters, ...parsedFilters })
      
      // Add AI query as keyword
      const keywords = [...filters.keywords]
      if (!keywords.includes(aiQuery)) {
        keywords.push(aiQuery)
      }
      handleFilterChange('keywords', keywords)
      
    } catch (error) {
      console.error('AI search error:', error)
    } finally {
      setIsAISearching(false)
    }
  }

  const parseAIQuery = (query: string): Partial<SearchFilters> => {
    const parsed: Partial<SearchFilters> = {}
    const lowerQuery = query.toLowerCase()

    // Extract property type
    if (lowerQuery.includes('apartment') || lowerQuery.includes('flat')) {
      parsed.propertyType = ['apartment']
    } else if (lowerQuery.includes('house') || lowerQuery.includes('home')) {
      parsed.propertyType = ['house']
    } else if (lowerQuery.includes('villa')) {
      parsed.propertyType = ['villa']
    }

    // Extract bedrooms
    const bedroomMatch = lowerQuery.match(/(\d+)\s*bed/)
    if (bedroomMatch) {
      parsed.bedrooms = [parseInt(bedroomMatch[1])]
    }

    // Extract price range
    const priceMatch = lowerQuery.match(/under\s*(\d+(?:k|m|million|thousand))/i)
    if (priceMatch) {
      const amount = priceMatch[1].toLowerCase()
      let maxPrice = 0
      if (amount.includes('k') || amount.includes('thousand')) {
        maxPrice = parseInt(amount) * 1000
      } else if (amount.includes('m') || amount.includes('million')) {
        maxPrice = parseInt(amount) * 1000000
      }
      if (maxPrice > 0) {
        parsed.priceRange = { min: 0, max: maxPrice }
      }
    }

    // Extract location
    const locationKeywords = ['in', 'near', 'around', 'at']
    for (const keyword of locationKeywords) {
      const regex = new RegExp(`${keyword}\\s+([a-zA-Z\\s]+)`, 'i')
      const match = lowerQuery.match(regex)
      if (match) {
        parsed.location = match[1].trim()
        break
      }
    }

    return parsed
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleSaveSearch = () => {
    if (savedSearchName.trim() && onSaveSearch) {
      onSaveSearch(filters, savedSearchName)
      setSavedSearchName('')
      setShowSaveDialog(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      propertyType: [],
      priceRange: { min: 0, max: 50000000 },
      bedrooms: [],
      bathrooms: [],
      areaRange: { min: 0, max: 1000 },
      features: [],
      yearBuilt: { min: 1950, max: new Date().getFullYear() },
      listingAge: 365,
      keywords: [],
      radius: 10,
      sortBy: 'relevance',
      viewType: 'list'
    })
  }

  const removeKeyword = (keyword: string) => {
    const newKeywords = filters.keywords.filter(k => k !== keyword)
    handleFilterChange('keywords', newKeywords)
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
    <div className="space-y-6">
      {/* AI-Powered Search */}
      {showAISearch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Powered Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Try: '3 bedroom house in Karen under 15M with pool and parking'"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                />
              </div>
              <Button 
                onClick={handleAISearch}
                disabled={isAISearching || !aiQuery.trim()}
              >
                {isAISearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isAISearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Describe what you're looking for in natural language and let AI find the perfect matches
            </p>
          </CardContent>
        </Card>
      )}

      {/* Basic Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Property Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">Search Keywords</Label>
              <Input
                id="query"
                placeholder="Property title, description, or features..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="City, neighborhood, or address..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Property Types */}
          <div className="space-y-3">
            <Label>Property Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {propertyTypes.map(type => {
                const Icon = type.icon
                const isSelected = filters.propertyType.includes(type.value)
                return (
                  <button
                    key={type.value}
                    onClick={() => handleArrayToggle('propertyType', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label>Price Range</Label>
            <div className="px-3">
              <Slider
                value={[filters.priceRange.min, filters.priceRange.max]}
                onValueChange={([min, max]) => handleFilterChange('priceRange', { min, max })}
                max={50000000}
                min={0}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{formatCurrency(filters.priceRange.min)}</span>
                <span>{formatCurrency(filters.priceRange.max)}</span>
              </div>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Bedrooms</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleArrayToggle('bedrooms', num)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      filters.bedrooms.includes(num)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {num}+
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Bathrooms</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleArrayToggle('bathrooms', num)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      filters.bathrooms.includes(num)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {num}+
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Sliders className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
              {showAdvanced ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-6 border-t pt-6">
              {/* Area Range */}
              <div className="space-y-3">
                <Label>Area (Square Meters)</Label>
                <div className="px-3">
                  <Slider
                    value={[filters.areaRange.min, filters.areaRange.max]}
                    onValueChange={([min, max]) => handleFilterChange('areaRange', { min, max })}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{filters.areaRange.min}m²</span>
                    <span>{filters.areaRange.max}m²</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <Label>Features & Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map(feature => {
                    const Icon = feature.icon
                    const isSelected = filters.features.includes(feature.value)
                    return (
                      <button
                        key={feature.value}
                        onClick={() => handleArrayToggle('features', feature.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <div className="text-sm font-medium">{feature.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Year Built */}
              <div className="space-y-3">
                <Label>Year Built</Label>
                <div className="px-3">
                  <Slider
                    value={[filters.yearBuilt.min, filters.yearBuilt.max]}
                    onValueChange={([min, max]) => handleFilterChange('yearBuilt', { min, max })}
                    max={new Date().getFullYear()}
                    min={1950}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{filters.yearBuilt.min}</span>
                    <span>{filters.yearBuilt.max}</span>
                  </div>
                </div>
              </div>

              {/* Search Radius */}
              <div className="space-y-3">
                <Label>Search Radius (km)</Label>
                <div className="px-3">
                  <Slider
                    value={[filters.radius]}
                    onValueChange={([radius]) => handleFilterChange('radius', radius)}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 mt-2">
                    {filters.radius} km
                  </div>
                </div>
              </div>

              {/* Listing Age */}
              <div className="space-y-3">
                <Label>Listed Within</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 1, label: '1 Day' },
                    { value: 7, label: '1 Week' },
                    { value: 30, label: '1 Month' },
                    { value: 365, label: 'Any Time' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('listingAge', option.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        filters.listingAge === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Keywords */}
          {filters.keywords.length > 0 && (
            <div className="space-y-2">
              <Label>Active Search Terms</Label>
              <div className="flex flex-wrap gap-2">
                {filters.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sort & View Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>View Type</Label>
              <div className="flex gap-2">
                {[
                  { value: 'list', icon: List, label: 'List' },
                  { value: 'grid', icon: Filter, label: 'Grid' },
                  { value: 'map', icon: Map, label: 'Map' }
                ].map(view => {
                  const Icon = view.icon
                  return (
                    <button
                      key={view.value}
                      onClick={() => handleFilterChange('viewType', view.value)}
                      className={`flex-1 p-2 rounded-lg border transition-all ${
                        filters.viewType === view.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-sm">{view.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Search Properties
            </Button>
            <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
              <Target className="h-4 w-4 mr-2" />
              Save Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <Card>
          <CardHeader>
            <CardTitle>Save This Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchName">Search Name</Label>
              <Input
                id="searchName"
                placeholder="e.g., 3BR Houses in Karen"
                value={savedSearchName}
                onChange={(e) => setSavedSearchName(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveSearch} disabled={!savedSearchName.trim()}>
                Save Search
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
