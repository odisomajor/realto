'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { propertyApi } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Property } from '@/types'

interface PropertyStats {
  views: number
  inquiries: number
  favorites: number
  lastViewed?: string
}

interface EnhancedProperty extends Property {
  stats?: PropertyStats
  status: 'active' | 'inactive' | 'sold' | 'rented'
}

export default function MyPropertiesPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<EnhancedProperty[]>([])
  const [filteredProperties, setFilteredProperties] = useState<EnhancedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

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
      const enhancedProperties = response.data.map((property: Property) => ({
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
      <ProtectedRoute allowedRoles={['AGENT']}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['AGENT']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
            <p className="text-gray-600">
              Manage your property listings and track performance
            </p>
          </div>
          <Link href="/properties/new">
            <Button className="flex items-center gap-2 mt-4 sm:mt-0">
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Filters and Search */}
        <Card className="mb-8">
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
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        {filteredProperties.length > 0 ? (
          <div className="space-y-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Property Image */}
                    <div className="lg:w-80 h-48 lg:h-auto relative">
                      <Image
                        src={property.images?.[0] || '/placeholder-property.jpg'}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(property.status)}
                      </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex-1 p-6">
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
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/properties/edit/${property.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
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
      </div>
    </ProtectedRoute>
  )
}