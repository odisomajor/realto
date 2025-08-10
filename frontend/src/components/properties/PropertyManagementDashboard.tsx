'use client'

import React, { useState, useEffect } from 'react'
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
  DollarSign,
  CheckSquare,
  Square,
  Download,
  Upload,
  Settings,
  BarChart3,
  Users,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Property } from '@/types'

interface PropertyStats {
  views: number
  inquiries: number
  favorites: number
  lastViewed?: string
  conversionRate: number
  avgTimeOnPage: number
}

interface EnhancedProperty extends Omit<Property, 'status'> {
  stats?: PropertyStats
  status: 'active' | 'inactive' | 'sold' | 'rented' | 'pending'
  selected?: boolean
}

interface PropertyManagementDashboardProps {
  properties: EnhancedProperty[]
  onPropertiesUpdate: (properties: EnhancedProperty[]) => void
  loading?: boolean
}

export default function PropertyManagementDashboard({ 
  properties, 
  onPropertiesUpdate, 
  loading = false 
}: PropertyManagementDashboardProps) {
  const [filteredProperties, setFilteredProperties] = useState<EnhancedProperty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    filterAndSortProperties()
  }, [properties, searchTerm, statusFilter, sortBy])

  useEffect(() => {
    setShowBulkActions(selectedProperties.size > 0)
  }, [selectedProperties])

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
        case 'performance':
          return (b.stats?.conversionRate || 0) - (a.stats?.conversionRate || 0)
        default:
          return 0
      }
    })

    setFilteredProperties(filtered)
  }

  const handleSelectProperty = (propertyId: string) => {
    const newSelected = new Set(selectedProperties)
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId)
    } else {
      newSelected.add(propertyId)
    }
    setSelectedProperties(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set())
    } else {
      setSelectedProperties(new Set(filteredProperties.map(p => p.id)))
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    // Implementation for bulk status change
    console.log('Bulk status change:', Array.from(selectedProperties), newStatus)
    setSelectedProperties(new Set())
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProperties.size} properties? This action cannot be undone.`)) {
      return
    }
    // Implementation for bulk delete
    console.log('Bulk delete:', Array.from(selectedProperties))
    setSelectedProperties(new Set())
  }

  const exportProperties = () => {
    // Implementation for exporting properties to CSV/Excel
    console.log('Exporting properties...')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      sold: { label: 'Sold', className: 'bg-blue-100 text-blue-800' },
      rented: { label: 'Rented', className: 'bg-purple-100 text-purple-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return <Badge className={config.className}>{config.label}</Badge>
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

  const getPerformanceIcon = (conversionRate: number) => {
    if (conversionRate > 5) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (conversionRate < 2) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <BarChart3 className="h-4 w-4 text-yellow-600" />
  }

  // Calculate dashboard stats
  const totalProperties = properties.length
  const activeProperties = properties.filter(p => p.status === 'active').length
  const totalViews = properties.reduce((sum, p) => sum + (p.stats?.views || 0), 0)
  const totalInquiries = properties.reduce((sum, p) => sum + (p.stats?.inquiries || 0), 0)
  const avgConversionRate = properties.length > 0 
    ? properties.reduce((sum, p) => sum + (p.stats?.conversionRate || 0), 0) / properties.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
              </div>
              <Home className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{activeProperties}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{avgConversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Property Management</CardTitle>
              <CardDescription>
                Manage your property listings with advanced tools and analytics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportProperties}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Link href="/properties/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              <option value="pending">Pending</option>
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
              <option value="performance">Best Performance</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProperties.size} properties selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('active')}
                  >
                    Mark Active
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('inactive')}
                  >
                    Mark Inactive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Properties List */}
          <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={handleSelectAll}
                className="flex items-center justify-center"
              >
                {selectedProperties.size === filteredProperties.length && filteredProperties.length > 0 ? (
                  <CheckSquare className="h-5 w-5 text-green-600" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <span className="text-sm font-medium text-gray-700">
                Select All ({filteredProperties.length} properties)
              </span>
            </div>

            {/* Property Items */}
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedProperties.has(property.id) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => handleSelectProperty(property.id)}
                    className="flex items-center justify-center mt-1"
                  >
                    {selectedProperties.has(property.id) ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Property Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(property.price)}
                          </span>
                          {getStatusBadge(property.status)}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {property.stats?.views || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {property.stats?.inquiries || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {property.stats?.favorites || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          {getPerformanceIcon(property.stats?.conversionRate || 0)}
                          {property.stats?.conversionRate?.toFixed(1) || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
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
                        onClick={() => console.log('View analytics for', property.id)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first property'
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}