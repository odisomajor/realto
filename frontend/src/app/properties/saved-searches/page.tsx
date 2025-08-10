'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Bell, 
  BellOff,
  Edit,
  Trash2,
  Plus,
  Filter,
  MapPin,
  Home,
  Calendar,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface SavedSearch {
  id: string
  name: string
  filters: {
    location?: string
    minPrice?: number
    maxPrice?: number
    propertyType?: string
    bedrooms?: number
    bathrooms?: number
    category?: string
  }
  alertsEnabled: boolean
  createdAt: string
  lastNotified?: string
  matchCount: number
}

export default function SavedSearchesPage() {
  const { user } = useAuth()
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)

  useEffect(() => {
    fetchSavedSearches()
  }, [])

  const fetchSavedSearches = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockSearches: SavedSearch[] = [
        {
          id: '1',
          name: 'Family Home in Nairobi',
          filters: {
            location: 'Nairobi',
            minPrice: 5000000,
            maxPrice: 15000000,
            propertyType: 'House',
            bedrooms: 3,
            category: 'residential'
          },
          alertsEnabled: true,
          createdAt: '2024-01-15',
          lastNotified: '2024-01-20',
          matchCount: 12
        },
        {
          id: '2',
          name: 'Investment Apartments',
          filters: {
            location: 'Mombasa',
            maxPrice: 8000000,
            propertyType: 'Apartment',
            category: 'residential'
          },
          alertsEnabled: false,
          createdAt: '2024-01-10',
          matchCount: 8
        },
        {
          id: '3',
          name: 'Commercial Space CBD',
          filters: {
            location: 'Nairobi CBD',
            propertyType: 'Office',
            category: 'commercial'
          },
          alertsEnabled: true,
          createdAt: '2024-01-05',
          lastNotified: '2024-01-18',
          matchCount: 5
        }
      ]
      setSavedSearches(mockSearches)
    } catch (error) {
      console.error('Error fetching saved searches:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAlerts = async (searchId: string) => {
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === searchId 
          ? { ...search, alertsEnabled: !search.alertsEnabled }
          : search
      )
    )
  }

  const deleteSearch = async (searchId: string) => {
    if (confirm('Are you sure you want to delete this saved search?')) {
      setSavedSearches(prev => prev.filter(search => search.id !== searchId))
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

  const formatFilters = (filters: SavedSearch['filters']) => {
    const parts = []
    
    if (filters.location) parts.push(filters.location)
    if (filters.propertyType) parts.push(filters.propertyType)
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = [
        filters.minPrice ? formatCurrency(filters.minPrice) : '',
        filters.maxPrice ? formatCurrency(filters.maxPrice) : ''
      ].filter(Boolean).join(' - ')
      if (priceRange) parts.push(priceRange)
    }
    if (filters.bedrooms) parts.push(`${filters.bedrooms} bed`)
    if (filters.bathrooms) parts.push(`${filters.bathrooms} bath`)
    
    return parts.join(' • ')
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
          <p className="text-gray-600">
            Manage your property search alerts and get notified of new matches
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/properties">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              New Search
            </Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Save Current Search
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
              </div>
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.filter(s => s.alertsEnabled).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.reduce((sum, s) => sum + s.matchCount, 0)}
                </p>
              </div>
              <Home className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">New matches</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Searches List */}
      {savedSearches.length > 0 ? (
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {search.name}
                      </h3>
                      <Badge variant={search.alertsEnabled ? "default" : "secondary"}>
                        {search.alertsEnabled ? (
                          <>
                            <Bell className="h-3 w-3 mr-1" />
                            Alerts On
                          </>
                        ) : (
                          <>
                            <BellOff className="h-3 w-3 mr-1" />
                            Alerts Off
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {search.matchCount} matches
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {formatFilters(search.filters)}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(search.createdAt).toLocaleDateString()}
                      </div>
                      {search.lastNotified && (
                        <div className="flex items-center gap-1">
                          <Bell className="h-4 w-4" />
                          Last alert {new Date(search.lastNotified).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/properties?search=${encodeURIComponent(JSON.stringify(search.filters))}`}>
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAlerts(search.id)}
                    >
                      {search.alertsEnabled ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSearch(search)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSearch(search.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Saved Searches Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Save your property searches to get notified when new matching properties are listed
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/properties">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Start Searching
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Saved Searches Work</CardTitle>
          <CardDescription>Get the most out of property alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Search & Save</h3>
              <p className="text-sm text-gray-600">
                Perform a property search and save your criteria for future use
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Get Alerts</h3>
              <p className="text-sm text-gray-600">
                Receive email notifications when new properties match your criteria
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Home className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Find Your Home</h3>
              <p className="text-sm text-gray-600">
                Never miss out on the perfect property that matches your needs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
