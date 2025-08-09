'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { propertyApi } from '@/lib/api'
import PropertyComparison from '@/components/properties/PropertyComparison'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Home,
  ArrowLeft,
  Filter
} from 'lucide-react'
import { Property } from '@/types'
import Link from 'next/link'

export default function PropertyComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([])
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    // Get property IDs from URL params
    const propertyIds = searchParams.get('properties')?.split(',') || []
    fetchProperties(propertyIds)
  }, [searchParams])

  const fetchProperties = async (propertyIds: string[]) => {
    try {
      setLoading(true)
      
      // Fetch all properties for selection
      const allPropertiesResponse = await propertyApi.getProperties()
      setAvailableProperties(allPropertiesResponse.data)
      
      // Fetch specific properties for comparison
      if (propertyIds.length > 0) {
        const comparisonPropsPromises = propertyIds.map(id => 
          propertyApi.getProperty(id).catch(() => null)
        )
        const comparisonPropsResults = await Promise.all(comparisonPropsPromises)
        const validProperties = comparisonPropsResults
          .filter(result => result !== null)
          .map(result => result!.data)
        
        setComparisonProperties(validProperties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPropertyToComparison = (property: Property) => {
    if (comparisonProperties.length >= 4) {
      alert('You can compare up to 4 properties at once')
      return
    }
    
    if (comparisonProperties.find(p => p.id === property.id)) {
      alert('This property is already in your comparison')
      return
    }
    
    const newProperties = [...comparisonProperties, property]
    setComparisonProperties(newProperties)
    updateURL(newProperties)
    setShowAddModal(false)
  }

  const removePropertyFromComparison = (propertyId: string) => {
    const newProperties = comparisonProperties.filter(p => p.id !== propertyId)
    setComparisonProperties(newProperties)
    updateURL(newProperties)
  }

  const updateURL = (properties: Property[]) => {
    const propertyIds = properties.map(p => p.id).join(',')
    const newURL = propertyIds ? `/properties/compare?properties=${propertyIds}` : '/properties/compare'
    router.replace(newURL)
  }

  const filteredAvailableProperties = availableProperties.filter(property => 
    !comparisonProperties.find(cp => cp.id === property.id) &&
    (property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     property.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Comparison</h1>
            <p className="text-gray-600">
              Compare properties side by side to make the best decision
            </p>
          </div>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} disabled={comparisonProperties.length >= 4}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Comparison Component */}
      <PropertyComparison
        properties={comparisonProperties}
        onRemoveProperty={removePropertyFromComparison}
        onAddProperty={() => setShowAddModal(true)}
      />

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add Property to Comparison</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {filteredAvailableProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAvailableProperties.slice(0, 20).map((property) => (
                    <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={property.images?.[0] || '/placeholder-property.jpg'}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                              {property.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-green-600 text-sm">
                                {formatCurrency(property.price)}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => addPropertyToComparison(property)}
                                className="text-xs"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No properties found matching your search' : 'No properties available'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {comparisonProperties.length}/4 properties selected for comparison
                </p>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {comparisonProperties.length === 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use Property Comparison</CardTitle>
            <CardDescription>Get the most out of our comparison tool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Add Properties</h3>
                <p className="text-sm text-gray-600">
                  Select up to 4 properties you want to compare side by side
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Filter className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Compare Features</h3>
                <p className="text-sm text-gray-600">
                  View detailed comparisons of price, location, size, and features
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Home className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Make Decision</h3>
                <p className="text-sm text-gray-600">
                  Use insights and highlights to choose the perfect property
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}