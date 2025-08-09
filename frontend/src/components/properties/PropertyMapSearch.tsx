'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Eye,
  Phone,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Property } from '@/types'

interface PropertyMapSearchProps {
  properties: Property[]
  onPropertySelect: (property: Property) => void
  onSearch: (filters: any) => void
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
}

interface MapProperty extends Property {
  coordinates: {
    lat: number
    lng: number
  }
}

export function PropertyMapSearch({
  properties,
  onPropertySelect,
  onSearch,
  initialCenter = { lat: -1.2921, lng: 36.8219 }, // Nairobi coordinates
  initialZoom = 12
}: PropertyMapSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState(initialCenter)
  const [mapZoom, setMapZoom] = useState(initialZoom)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'terrain'>('standard')
  const [isDrawingArea, setIsDrawingArea] = useState(false)
  const [selectedArea, setSelectedArea] = useState<any>(null)

  // Mock map properties with coordinates
  const mapProperties: MapProperty[] = properties.map((property, index) => ({
    ...property,
    coordinates: {
      lat: initialCenter.lat + (Math.random() - 0.5) * 0.1,
      lng: initialCenter.lng + (Math.random() - 0.5) * 0.1
    }
  }))

  const [filteredProperties, setFilteredProperties] = useState<MapProperty[]>(mapProperties)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000000 })
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [bedrooms, setBedrooms] = useState<number[]>([])

  useEffect(() => {
    // Filter properties based on current filters
    let filtered = mapProperties

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query)
      )
    }

    if (propertyTypes.length > 0) {
      filtered = filtered.filter(property => 
        propertyTypes.includes(property.type)
      )
    }

    if (bedrooms.length > 0) {
      filtered = filtered.filter(property => 
        bedrooms.includes(property.bedrooms)
      )
    }

    filtered = filtered.filter(property => 
      property.price >= priceRange.min && property.price <= priceRange.max
    )

    setFilteredProperties(filtered)
  }, [searchQuery, propertyTypes, bedrooms, priceRange])

  const handlePropertyClick = (property: MapProperty) => {
    setSelectedProperty(property)
    onPropertySelect(property)
  }

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18))
  }

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 8))
  }

  const handleResetView = () => {
    setMapCenter(initialCenter)
    setMapZoom(initialZoom)
    setSelectedProperty(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} sq ft`
  }

  const getPriceColor = (price: number) => {
    if (price < 5000000) return 'bg-green-500'
    if (price < 15000000) return 'bg-yellow-500'
    if (price < 30000000) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Search Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by location, property name, or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDrawingArea(!isDrawingArea)}
                className={isDrawingArea ? 'bg-blue-100 text-blue-700' : ''}
              >
                Draw Area
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min || ''}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max || ''}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['apartment', 'house', 'villa', 'townhouse'].map(type => (
                        <Badge
                          key={type}
                          variant={propertyTypes.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            setPropertyTypes(prev => 
                              prev.includes(type) 
                                ? prev.filter(t => t !== type)
                                : [...prev, type]
                            )
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map(bed => (
                        <Badge
                          key={bed}
                          variant={bedrooms.includes(bed) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            setBedrooms(prev => 
                              prev.includes(bed) 
                                ? prev.filter(b => b !== bed)
                                : [...prev, bed]
                            )
                          }}
                        >
                          {bed}+ bed
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Card className="shadow-lg">
          <CardContent className="p-2">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Style Selector */}
        <Card className="shadow-lg">
          <CardContent className="p-2">
            <div className="flex flex-col gap-2">
              {(['standard', 'satellite', 'terrain'] as const).map(style => (
                <Button
                  key={style}
                  variant={mapStyle === style ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMapStyle(style)}
                  className="text-xs"
                >
                  {style}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Counter */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {filteredProperties.length} properties found
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden"
      >
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-green-200 via-blue-200 to-gray-200"></div>
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Property Markers */}
        {filteredProperties.map((property, index) => {
          const x = 50 + (property.coordinates.lng - initialCenter.lng) * 2000
          const y = 50 + (initialCenter.lat - property.coordinates.lat) * 2000
          
          return (
            <div
              key={property.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                hoveredProperty === property.id ? 'scale-110 z-20' : 'z-10'
              }`}
              style={{
                left: `${Math.max(5, Math.min(95, x))}%`,
                top: `${Math.max(5, Math.min(95, y))}%`
              }}
              onMouseEnter={() => setHoveredProperty(property.id)}
              onMouseLeave={() => setHoveredProperty(null)}
              onClick={() => handlePropertyClick(property)}
            >
              {/* Price Marker */}
              <div className={`${getPriceColor(property.price)} text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg`}>
                {formatPrice(property.price).replace('KES', 'K')}
              </div>
              
              {/* Property Preview on Hover */}
              {hoveredProperty === property.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border p-3 z-30">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1">{property.location}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          {property.bathrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Square className="h-3 w-3" />
                          {formatArea(property.area)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Selected Area Overlay */}
        {selectedArea && (
          <div 
            className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 rounded-lg"
            style={{
              left: `${selectedArea.x}%`,
              top: `${selectedArea.y}%`,
              width: `${selectedArea.width}%`,
              height: `${selectedArea.height}%`
            }}
          />
        )}
      </div>

      {/* Property Details Sidebar */}
      {selectedProperty && (
        <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl z-20 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Property Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProperty(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Property Image */}
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <Home className="h-12 w-12 text-gray-400" />
            </div>

            {/* Property Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedProperty.title}</h4>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedProperty.location}
                </p>
              </div>

              <div className="text-2xl font-bold text-green-600">
                {formatPrice(selectedProperty.price)}
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Bed className="h-4 w-4" />
                  </div>
                  <div className="font-semibold">{selectedProperty.bedrooms}</div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Bath className="h-4 w-4" />
                  </div>
                  <div className="font-semibold">{selectedProperty.bathrooms}</div>
                  <div className="text-xs text-gray-500">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Square className="h-4 w-4" />
                  </div>
                  <div className="font-semibold">{formatArea(selectedProperty.area)}</div>
                  <div className="text-xs text-gray-500">Area</div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                <p className="text-gray-600 text-sm">{selectedProperty.description}</p>
              </div>

              {/* Features */}
              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Features</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}