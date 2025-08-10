'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  MapPin, 
  Home, 
  Bath, 
  Maximize, 
  DollarSign,
  Calendar,
  Star,
  Heart,
  Eye,
  MessageSquare,
  Plus,
  Minus
} from 'lucide-react'
import { Property } from '@/types'

interface PropertyComparisonProps {
  properties: Property[]
  onRemoveProperty: (propertyId: string) => void
  onAddProperty?: () => void
  className?: string
}

interface ComparisonFeature {
  label: string
  key: keyof Property | string
  type: 'text' | 'number' | 'currency' | 'date' | 'array' | 'custom'
  formatter?: (value: any) => string
}

const comparisonFeatures: ComparisonFeature[] = [
  { label: 'Price', key: 'price', type: 'currency' },
  { label: 'Location', key: 'location', type: 'text' },
  { label: 'Property Type', key: 'type', type: 'text' },
  { label: 'Category', key: 'category', type: 'text' },
  { label: 'Bedrooms', key: 'bedrooms', type: 'number' },
  { label: 'Bathrooms', key: 'bathrooms', type: 'number' },
  { label: 'Area (sq m)', key: 'area', type: 'number' },
  { label: 'Features', key: 'features', type: 'array' },
  { label: 'Listed Date', key: 'createdAt', type: 'date' },
]

export default function PropertyComparison({ 
  properties, 
  onRemoveProperty, 
  onAddProperty,
  className = '' 
}: PropertyComparisonProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    comparisonFeatures.slice(0, 6).map(f => f.key as string)
  )

  const formatValue = (value: any, type: ComparisonFeature['type'], formatter?: (value: any) => string): string => {
    if (value === null || value === undefined) return 'N/A'
    
    if (formatter) return formatter(value)
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      case 'date':
        return new Date(value).toLocaleDateString('en-KE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      case 'array':
        return Array.isArray(value) ? value.join(', ') : 'N/A'
      case 'number':
        return value.toString()
      default:
        return value.toString()
    }
  }

  const getComparisonResult = (feature: ComparisonFeature, properties: Property[]) => {
    if (feature.type !== 'number' && feature.type !== 'currency') return null
    
    const values = properties.map(p => {
      const value = p[feature.key as keyof Property]
      return typeof value === 'number' ? value : 0
    })
    
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    
    return values.map(value => {
      if (value === maxValue && feature.key === 'price') return 'highest'
      if (value === minValue && feature.key === 'price') return 'lowest'
      if (value === maxValue) return 'best'
      if (value === minValue) return 'worst'
      return 'neutral'
    })
  }

  const getComparisonBadge = (result: string) => {
    switch (result) {
      case 'best':
        return <Badge className="bg-green-100 text-green-800 text-xs">Best</Badge>
      case 'worst':
        return <Badge className="bg-red-100 text-red-800 text-xs">Lowest</Badge>
      case 'highest':
        return <Badge className="bg-red-100 text-red-800 text-xs">Highest</Badge>
      case 'lowest':
        return <Badge className="bg-green-100 text-green-800 text-xs">Lowest</Badge>
      default:
        return null
    }
  }

  const toggleFeature = (featureKey: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureKey)
        ? prev.filter(key => key !== featureKey)
        : [...prev, featureKey]
    )
  }

  if (properties.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Home className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties to Compare</h3>
          <p className="text-gray-600 mb-6">
            Add properties to your comparison list to see them side by side
          </p>
          {onAddProperty && (
            <Button onClick={onAddProperty}>
              <Plus className="h-4 w-4 mr-2" />
              Add Properties
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Comparison</h2>
          <p className="text-gray-600">Compare up to 4 properties side by side</p>
        </div>
        
        {/* Feature Selection */}
        <div className="flex flex-wrap gap-2">
          {comparisonFeatures.map((feature) => (
            <button
              key={feature.key}
              onClick={() => toggleFeature(feature.key as string)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedFeatures.includes(feature.key as string)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {feature.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Property Headers */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
            <div></div> {/* Empty cell for feature labels */}
            {properties.map((property) => (
              <Card key={property.id} className="relative">
                <button
                  onClick={() => onRemoveProperty(property.id)}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
                
                <CardContent className="p-4">
                  <div className="aspect-video relative mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={property.images?.[0] || '/placeholder-property.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-xs text-gray-600 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.location}
                  </div>
                  
                  <div className="text-lg font-bold text-green-600">
                    {formatValue(property.price, 'currency')}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Property Button */}
            {properties.length < 4 && onAddProperty && (
              <Card className="border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
                <CardContent className="p-4 h-full flex items-center justify-center">
                  <button
                    onClick={onAddProperty}
                    className="flex flex-col items-center text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <Plus className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">Add Property</span>
                  </button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comparison Rows */}
          <div className="space-y-2">
            {comparisonFeatures
              .filter(feature => selectedFeatures.includes(feature.key as string))
              .map((feature) => {
                const comparisonResults = getComparisonResult(feature, properties)
                
                return (
                  <div
                    key={feature.key}
                    className="grid gap-4 py-3 border-b border-gray-100"
                    style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}
                  >
                    <div className="font-medium text-gray-900 flex items-center">
                      {feature.label}
                    </div>
                    
                    {properties.map((property, index) => (
                      <div key={property.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {formatValue(property[feature.key as keyof Property], feature.type, feature.formatter)}
                        </span>
                        {comparisonResults && comparisonResults[index] && (
                          <div className="ml-2">
                            {getComparisonBadge(comparisonResults[index])}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
          </div>

          {/* Action Buttons */}
          <div className="mt-8">
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div></div>
              {properties.map((property) => (
                <div key={property.id} className="space-y-2">
                  <Button className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Agent
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      {properties.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Insights</CardTitle>
            <CardDescription>Key differences between selected properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Price Range</span>
                </div>
                <div className="text-sm text-blue-800">
                  {formatValue(Math.min(...properties.map(p => p.price)), 'currency')} - {formatValue(Math.max(...properties.map(p => p.price)), 'currency')}
                </div>
              </div>

              {/* Area Range */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Maximize className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-900">Area Range</span>
                </div>
                <div className="text-sm text-green-800">
                  {Math.min(...properties.map(p => p.area || 0))} - {Math.max(...properties.map(p => p.area || 0))} sq m
                </div>
              </div>

              {/* Common Features */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-900">Common Features</span>
                </div>
                <div className="text-sm text-purple-800">
                  {properties.length > 1 ? 
                    properties[0].features?.filter(feature => 
                      properties.every(p => p.features?.includes(feature))
                    ).slice(0, 2).join(', ') || 'None'
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
