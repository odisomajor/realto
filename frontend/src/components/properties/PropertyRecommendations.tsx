'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import PropertyCard from './PropertyCard'
import { 
  Sparkles, 
  TrendingUp,
  MapPin,
  Heart,
  Eye,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react'
import { Property } from '@/types'
import Link from 'next/link'

interface RecommendationCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  properties: Property[]
  reason: string
}

export default function PropertyRecommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      
      // Mock recommendation data - replace with actual API call
      const mockRecommendations: RecommendationCategory[] = [
        {
          id: 'similar-viewed',
          title: 'Similar to Properties You Viewed',
          description: 'Based on your recent property views',
          icon: <Eye className="h-5 w-5" />,
          reason: 'You viewed 3 similar properties in Westlands',
          properties: [
            {
              id: '1',
              title: 'Modern 3BR Apartment in Westlands',
              description: 'Luxurious apartment with stunning city views',
              price: 15000000,
              location: 'Westlands, Nairobi',
              bedrooms: 3,
              bathrooms: 2,
              area: 120,
              type: 'sale',
              category: 'residential',
              status: 'available',
              images: ['https://picsum.photos/400/300?random=40'],
              features: ['Parking', 'Swimming Pool', 'Gym', 'Security'],
              agent: {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+254700000000'
              },
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              featured: true
            },
            {
              id: '2',
              title: 'Elegant 2BR Apartment in Kilimani',
              description: 'Modern living with premium amenities',
              price: 12000000,
              location: 'Kilimani, Nairobi',
              bedrooms: 2,
              bathrooms: 2,
              area: 95,
              type: 'sale',
              category: 'residential',
              status: 'available',
              images: ['https://picsum.photos/400/300?random=41'],
              features: ['Parking', 'Balcony', 'Security', 'Elevator'],
              agent: {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+254700000001'
              },
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
              featured: false
            }
          ]
        },
        {
          id: 'price-range',
          title: 'Within Your Budget',
          description: 'Properties matching your price preferences',
          icon: <TrendingUp className="h-5 w-5" />,
          reason: 'Based on properties you\'ve saved and inquired about',
          properties: [
            {
              id: '3',
              title: 'Cozy 2BR House in Kasarani',
              description: 'Affordable family home in growing neighborhood',
              price: 8500000,
              location: 'Kasarani, Nairobi',
              bedrooms: 2,
              bathrooms: 2,
              area: 80,
              type: 'sale',
              category: 'residential',
              status: 'available',
              images: ['https://picsum.photos/400/300?random=42'],
              features: ['Garden', 'Parking', 'Security'],
              agent: {
                id: '3',
                name: 'Mike Johnson',
                email: 'mike@example.com',
                phone: '+254700000002'
              },
              createdAt: '2024-01-03T00:00:00Z',
              updatedAt: '2024-01-03T00:00:00Z',
              featured: false
            }
          ]
        },
        {
          id: 'location-based',
          title: 'Popular in Your Area',
          description: 'Trending properties near your preferred locations',
          icon: <MapPin className="h-5 w-5" />,
          reason: 'You\'ve shown interest in Nairobi properties',
          properties: [
            {
              id: '4',
              title: 'Luxury 4BR Villa in Runda',
              description: 'Premium villa with exceptional amenities',
              price: 35000000,
              location: 'Runda, Nairobi',
              bedrooms: 4,
              bathrooms: 3,
              area: 300,
              type: 'sale',
              category: 'residential',
              status: 'available',
              images: ['https://picsum.photos/400/300?random=43'],
              features: ['Swimming Pool', 'Garden', 'Gym', 'Security'],
              agent: {
                id: '4',
                name: 'Sarah Wilson',
                email: 'sarah@example.com',
                phone: '+254700000003'
              },
              createdAt: '2024-01-04T00:00:00Z',
              updatedAt: '2024-01-04T00:00:00Z',
              featured: true
            }
          ]
        },
        {
          id: 'recently-added',
          title: 'Fresh Listings',
          description: 'New properties that match your interests',
          icon: <Clock className="h-5 w-5" />,
          reason: 'Recently listed properties in your preferred categories',
          properties: [
            {
              id: '5',
              title: 'Modern Studio in Parklands',
              description: 'Perfect for young professionals',
              price: 6500000,
              location: 'Parklands, Nairobi',
              bedrooms: 1,
              bathrooms: 1,
              area: 45,
              type: 'sale',
              category: 'residential',
              status: 'available',
              images: ['https://picsum.photos/400/300?random=44'],
              features: ['Parking', 'Security', 'Modern Kitchen'],
              agent: {
                id: '5',
                name: 'David Brown',
                email: 'david@example.com',
                phone: '+254700000004'
              },
              createdAt: '2024-01-05T00:00:00Z',
              updatedAt: '2024-01-05T00:00:00Z',
              featured: false
            }
          ]
        }
      ]
      
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshRecommendations = async () => {
    setRefreshing(true)
    await fetchRecommendations()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended for You
            </h2>
            <p className="text-gray-600">
              Personalized property suggestions based on your preferences
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRecommendations}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Recommendation Categories */}
      {recommendations.map((category) => (
        <div key={category.id} className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.properties.length} properties
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{category.reason}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {category.properties.length > 3 && (
                <div className="mt-6 text-center">
                  <Link href={`/properties?category=${category.id}`}>
                    <Button variant="outline">
                      View All {category.properties.length} Properties
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Personalization Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Improve Your Recommendations
              </h3>
              <p className="text-gray-600 mb-4">
                The more you interact with properties, the better our recommendations become. 
                Here's how to get more personalized suggestions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Save properties you like</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">View property details</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Search in preferred areas</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Recommendations State */}
      {recommendations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Building Your Recommendations
            </h3>
            <p className="text-gray-600 mb-6">
              Start browsing properties to get personalized recommendations tailored to your preferences
            </p>
            <Link href="/properties">
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
