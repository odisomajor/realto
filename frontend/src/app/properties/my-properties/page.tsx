'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { propertyApi } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  MessageSquare,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Home,
  DollarSign,
  BarChart3,
  Settings,
  Grid,
  List,
  SortAsc
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Property } from '@/types'
import PropertyManagementDashboard from '@/components/properties/PropertyManagementDashboard'
import PropertyAnalyticsEnhanced from '@/components/properties/PropertyAnalyticsEnhanced'
import PropertyBulkActions from '@/components/properties/PropertyBulkActions'

interface PropertyStats {
  views: number
  inquiries: number
  favorites: number
  lastViewed?: string
}

interface EnhancedProperty extends Omit<Property, 'status'> {
  stats?: PropertyStats
  status: 'active' | 'inactive' | 'sold' | 'rented'
}

export default function MyPropertiesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<EnhancedProperty[]>([])
  const [filteredProperties, setFilteredProperties] = useState<EnhancedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [activeTab, setActiveTab] = useState('properties')

  useEffect(() => {
    fetchMyProperties()
  }, [])

  useEffect(() => {
    filterAndSortProperties()
  }, [properties, searchTerm, statusFilter, sortBy])

  const fetchMyProperties = async () => {
    try {
      setLoading(true)
      const response = await propertyApi.getMyProperties()
      
      // Enhance properties with mock stats for demo
      const enhancedProperties = response.data.data.map((property: Property) => ({
        ...property,
        status: Math.random() > 0.8 ? 'sold' : Math.random() > 0.6 ? 'inactive' : 'active',
        stats: {
          views: Math.floor(Math.random() * 500) + 10,
          inquiries: Math.floor(Math.random() * 20) + 1,
          favorites: Math.floor(Math.random() * 50) + 1,
          lastViewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }))
      
      setProperties(enhancedProperties)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProperties = () => {
    let filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter
      return matchesSearch && matchesStatus
    })

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'price-high':
          return b.price - a.price
        case 'price-low':
          return a.price - b.price
        case 'views':
          return (b.stats?.views || 0) - (a.stats?.views || 0)
        default:
          return 0
      }
    })

    setFilteredProperties(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      sold: { label: 'Sold', className: 'bg-blue-100 text-blue-800' },
      rented: { label: 'Rented', className: 'bg-purple-100 text-purple-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    try {
      await propertyApi.deleteProperty(propertyId)
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Failed to delete property. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="AGENT">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="AGENT">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Management</h1>
            <p className="text-gray-600">
              Manage your property listings and analytics
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Link href="/properties/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <Home className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.reduce((sum, p) => sum + (p.stats?.views || 0), 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.reduce((sum, p) => sum + (p.stats?.inquiries || 0), 0)}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Bulk Actions */}
            {selectedProperties.length > 0 && (
              <PropertyBulkActions
                selectedProperties={selectedProperties}
                onBulkAction={async (action: string, propertyIds: string[]) => {
                  try {
                    switch (action) {
                      case 'delete':
                        if (window.confirm(`Are you sure you want to delete ${propertyIds.length} properties?`)) {
                          await Promise.all(propertyIds.map(id => propertyApi.deleteProperty(id)));
                          setProperties(properties.filter(p => !propertyIds.includes(p.id)));
                          setSelectedProperties([]);
                        }
                        break;
                      case 'activate':
                        setProperties(properties.map(p => 
                          propertyIds.includes(p.id) ? { ...p, status: 'active' } : p
                        ));
                        setSelectedProperties([]);
                        break;
                      case 'deactivate':
                        setProperties(properties.map(p => 
                          propertyIds.includes(p.id) ? { ...p, status: 'inactive' } : p
                        ));
                        setSelectedProperties([]);
                        break;
                    }
                  } catch (error) {
                    console.error('Error performing bulk action:', error);
                  }
                }}
                onClearSelection={() => setSelectedProperties([])}
              />
            )}

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
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
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Properties List */}
            {filteredProperties.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                {filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {viewMode === 'list' ? (
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Selection Checkbox */}
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              checked={selectedProperties.includes(property.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProperties([...selectedProperties, property.id]);
                                } else {
                                  setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                                }
                              }}
                              className="mt-1 rounded"
                            />
                          </div>

                          {/* Property Image */}
                          <div className="lg:w-80 h-48 lg:h-auto relative">
                            <Image
                              src={property.images?.[0] || '/placeholder-property.jpg'}
                              alt={property.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                            <div className="absolute top-4 left-4">
                              {getStatusBadge(property.status)}
                            </div>
                          </div>
                          
                          {/* Property Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {property.title}
                                </h3>
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {property.location}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                  <span>{property.bedrooms} beds</span>
                                  <span>{property.bathrooms} baths</span>
                                  <span>{property.area} m²</span>
                                </div>
                                <div className="flex items-center text-green-600 font-semibold text-lg">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {formatCurrency(property.price)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => router.push(`/properties/${property.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => router.push(`/properties/edit/${property.id}`)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteProperty(property.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Property Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center mb-1">
                                  <Eye className="h-4 w-4 text-blue-600 mr-1" />
                                  <span className="font-semibold">{property.stats?.views || 0}</span>
                                </div>
                                <p className="text-xs text-gray-600">Views</p>
                              </div>
                              
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center mb-1">
                                  <MessageSquare className="h-4 w-4 text-purple-600 mr-1" />
                                  <span className="font-semibold">{property.stats?.inquiries || 0}</span>
                                </div>
                                <p className="text-xs text-gray-600">Inquiries</p>
                              </div>
                              
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center mb-1">
                                  <Heart className="h-4 w-4 text-red-600 mr-1" />
                                  <span className="font-semibold">{property.stats?.favorites || 0}</span>
                                </div>
                                <p className="text-xs text-gray-600">Favorites</p>
                              </div>
                              
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center mb-1">
                                  <Calendar className="h-4 w-4 text-green-600 mr-1" />
                                  <span className="text-xs font-semibold">{formatDate(property.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-600">Listed</p>
                              </div>
                            </div>
                            
                            {/* Property Description */}
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {property.description}
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Grid View
                        <div className="space-y-4">
                          <div className="aspect-video relative">
                            <Image
                              src={property.images?.[0] || '/placeholder-property.jpg'}
                              alt={property.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                            <div className="absolute top-4 left-4">
                              {getStatusBadge(property.status)}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedProperties.includes(property.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProperties([...selectedProperties, property.id]);
                                  } else {
                                    setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                                  }
                                }}
                                className="rounded"
                              />
                              <h3 className="font-semibold text-gray-900 truncate flex-1">
                                {property.title}
                              </h3>
                            </div>
                            
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(property.price)}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{property.stats?.views || 0} views</span>
                              <span>{property.stats?.inquiries || 0} inquiries</span>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/properties/${property.id}`)}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/properties/edit/${property.id}`)}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Start by adding your first property listing'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Link href="/properties/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Property
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <PropertyManagementDashboard
              properties={properties}
              onPropertyUpdate={(updatedProperty) => {
                setProperties(properties.map(p => 
                  p.id === updatedProperty.id ? updatedProperty : p
                ));
              }}
              onBulkAction={async (action: string, propertyIds: string[]) => {
                try {
                  switch (action) {
                    case 'delete':
                      if (window.confirm(`Are you sure you want to delete ${propertyIds.length} properties?`)) {
                        await Promise.all(propertyIds.map(id => propertyApi.deleteProperty(id)));
                        setProperties(properties.filter(p => !propertyIds.includes(p.id)));
                      }
                      break;
                    case 'activate':
                      setProperties(properties.map(p => 
                        propertyIds.includes(p.id) ? { ...p, status: 'active' } : p
                      ));
                      break;
                    case 'deactivate':
                      setProperties(properties.map(p => 
                        propertyIds.includes(p.id) ? { ...p, status: 'inactive' } : p
                      ));
                      break;
                  }
                } catch (error) {
                  console.error('Error performing bulk action:', error);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <PropertyAnalyticsEnhanced
              userId={user?.id}
              dateRange="30d"
              propertyType="all"
              location="all"
            />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
