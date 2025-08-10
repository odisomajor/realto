'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyWishlist } from '@/components/properties/PropertyWishlist'
import PropertyComparison from '@/components/properties/PropertyComparison'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart,
  TrendingUp,
  Bell,
  Search,
  ArrowLeft,
  Share2,
  Download,
  Settings
} from 'lucide-react'
import { Property } from '@/types'

export default function WishlistPage() {
  const router = useRouter()
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([])
  const [wishlistStats, setWishlistStats] = useState({
    totalProperties: 12,
    averagePrice: 1250000,
    priceAlerts: 5,
    recentlyViewed: 3,
    priceDrops: 2
  })

  const handleCompareProperties = (properties: Property[]) => {
    setComparisonProperties(properties)
    setShowComparison(true)
  }

  const handleRemoveFromComparison = (propertyId: string) => {
    setComparisonProperties(prev => 
      prev.filter(property => property.id !== propertyId)
    )
    if (comparisonProperties.length <= 1) {
      setShowComparison(false)
    }
  }

  if (showComparison) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowComparison(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wishlist
            </Button>
          </div>
          
          <PropertyComparison
            properties={comparisonProperties}
            onRemoveProperty={handleRemoveFromComparison}
            onAddProperty={() => setShowComparison(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">
                Manage your saved properties and track price changes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share List
              </Button>
              <Button onClick={() => router.push('/properties/advanced-search')}>
                <Search className="h-4 w-4 mr-2" />
                Find More Properties
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {wishlistStats.totalProperties}
                    </p>
                    <p className="text-sm text-gray-600">Saved Properties</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(wishlistStats.averagePrice / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-600">Average Price</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Bell className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {wishlistStats.priceAlerts}
                    </p>
                    <p className="text-sm text-gray-600">Price Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-semibold text-sm">
                      {wishlistStats.recentlyViewed}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {wishlistStats.recentlyViewed}
                    </p>
                    <p className="text-sm text-gray-600">Recently Viewed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {wishlistStats.priceDrops}
                    </p>
                    <p className="text-sm text-gray-600">Price Drops</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => router.push('/properties/advanced-search')}
                >
                  <Search className="h-6 w-6 mb-2" />
                  <span>Find Similar Properties</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => router.push('/properties/notifications')}
                >
                  <Bell className="h-6 w-6 mb-2" />
                  <span>Manage Alerts</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => router.push('/properties/mortgage-calculator')}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Calculate Mortgage</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm">Price dropped on "Modern Downtown Apartment"</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    -$25,000
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm">New similar property found: "Luxury Condo Downtown"</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    New
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm">Price alert triggered for "Cozy Studio Near University"</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Alert
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wishlist Component */}
        <PropertyWishlist
          userId="current-user"
          onCompareProperties={handleCompareProperties}
        />
      </div>
    </div>
  )
}
