'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Heart,
  HeartOff,
  Share2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Grid,
  List,
  Trash2,
  Plus,
  Star,
  TrendingUp,
  AlertCircle,
  Download,
  Mail,
  Phone
} from 'lucide-react'
import { Property } from '@/types'
import { formatPrice, formatArea } from '@/lib/utils'

interface WishlistItem extends Property {
  dateAdded: string
  notes?: string
  priority: 'low' | 'medium' | 'high'
  priceAlert?: {
    enabled: boolean
    targetPrice: number
  }
}

interface PropertyWishlistProps {
  userId?: string
  onPropertySelect?: (property: Property) => void
  onCompareProperties?: (properties: Property[]) => void
}

export function PropertyWishlist({
  userId,
  onPropertySelect,
  onCompareProperties
}: PropertyWishlistProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [filterBy, setFilterBy] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlistItems()
  }, [userId])

  useEffect(() => {
    filterAndSortItems()
  }, [wishlistItems, searchQuery, sortBy, filterBy])

  const fetchWishlistItems = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockItems: WishlistItem[] = [
        {
          id: '1',
          title: 'Modern Downtown Apartment',
          price: 850000,
          location: 'Downtown, City Center',
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          type: 'sale',
          category: 'apartment',
          status: 'available',
          images: ['/api/placeholder/400/300'],
          dateAdded: '2024-01-15',
          priority: 'high',
          notes: 'Perfect location, close to work',
          priceAlert: {
            enabled: true,
            targetPrice: 800000
          }
        },
        {
          id: '2',
          title: 'Luxury Villa with Pool',
          price: 2500000,
          location: 'Beverly Hills, CA',
          bedrooms: 5,
          bathrooms: 4,
          area: 4500,
          type: 'sale',
          category: 'villa',
          status: 'available',
          images: ['/api/placeholder/400/300'],
          dateAdded: '2024-01-10',
          priority: 'medium',
          notes: 'Dream home, need to save more',
          priceAlert: {
            enabled: false,
            targetPrice: 2300000
          }
        },
        {
          id: '3',
          title: 'Cozy Studio Near University',
          price: 1200,
          location: 'University District',
          bedrooms: 0,
          bathrooms: 1,
          area: 500,
          type: 'rent',
          category: 'studio',
          status: 'available',
          images: ['/api/placeholder/400/300'],
          dateAdded: '2024-01-08',
          priority: 'low',
          notes: 'Good for investment rental'
        }
      ]
      
      setWishlistItems(mockItems)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortItems = () => {
    let filtered = [...wishlistItems]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'sale' || filterBy === 'rent') {
        filtered = filtered.filter(item => item.type === filterBy)
      } else if (filterBy === 'high' || filterBy === 'medium' || filterBy === 'low') {
        filtered = filtered.filter(item => item.priority === filterBy)
      } else if (filterBy === 'alerts') {
        filtered = filtered.filter(item => item.priceAlert?.enabled)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }

  const removeFromWishlist = (propertyId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== propertyId))
    setSelectedItems(prev => prev.filter(id => id !== propertyId))
  }

  const updatePriority = (propertyId: string, priority: 'low' | 'medium' | 'high') => {
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === propertyId ? { ...item, priority } : item
      )
    )
  }

  const togglePriceAlert = (propertyId: string) => {
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === propertyId
          ? {
              ...item,
              priceAlert: {
                ...item.priceAlert!,
                enabled: !item.priceAlert?.enabled
              }
            }
          : item
      )
    )
  }

  const handleItemSelect = (propertyId: string) => {
    setSelectedItems(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const handleCompareSelected = () => {
    if (selectedItems.length < 2) return
    
    const selectedProperties = wishlistItems.filter(item =>
      selectedItems.includes(item.id)
    )
    onCompareProperties?.(selectedProperties)
  }

  const exportWishlist = () => {
    const csvContent = generateWishlistCSV()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-wishlist.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateWishlistCSV = () => {
    const headers = ['Title', 'Price', 'Location', 'Type', 'Bedrooms', 'Bathrooms', 'Area', 'Priority', 'Date Added', 'Notes']
    const rows = filteredItems.map(item => [
      item.title,
      formatPrice(item.price),
      item.location,
      item.type,
      item.bedrooms,
      item.bathrooms,
      formatArea(item.area, item.category),
      item.priority,
      item.dateAdded,
      item.notes || ''
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p className="text-gray-600">{wishlistItems.length} saved properties</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedItems.length > 1 && (
            <Button onClick={handleCompareSelected}>
              Compare ({selectedItems.length})
            </Button>
          )}
          <Button variant="outline" onClick={exportWishlist}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search saved properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Properties</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
                <option value="alerts">Price Alerts</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dateAdded">Date Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Heart className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">No Properties Found</h3>
            <p className="text-gray-600">
              {searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start adding properties to your wishlist'}
            </p>
          </div>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${
              selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
            }`}>
              <div className="relative">
                <Image
                  src={item.images[0] || '/placeholder-property.jpg'}
                  alt={item.title}
                  width={400}
                  height={viewMode === 'grid' ? 200 : 150}
                  className={`w-full object-cover ${
                    viewMode === 'grid' ? 'h-48' : 'h-32'
                  }`}
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Badge>
                  {item.priceAlert?.enabled && (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Alert
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90"
                    onClick={() => handleItemSelect(item.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                      className="h-4 w-4"
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <HeartOff className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/properties/${item.id}`}>
                    <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{item.location}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(item.price)}
                    {item.type === 'rent' && <span className="text-sm text-gray-500 ml-1">/month</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-3">
                    {item.bedrooms > 0 && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{item.bedrooms}</span>
                      </div>
                    )}
                    {item.bathrooms > 0 && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{item.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{formatArea(item.area, item.category)}</span>
                    </div>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.notes}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Added {new Date(item.dateAdded).toLocaleDateString()}</span>
                  {item.priceAlert?.enabled && (
                    <span>Alert: {formatPrice(item.priceAlert.targetPrice)}</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link href={`/properties/${item.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePriceAlert(item.id)}
                  >
                    <AlertCircle className={`h-4 w-4 ${
                      item.priceAlert?.enabled ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}