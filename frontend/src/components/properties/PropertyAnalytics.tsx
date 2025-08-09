'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Clock,
  MapPin,
  Phone
} from 'lucide-react'

interface PropertyAnalyticsProps {
  propertyId: string
  className?: string
}

interface AnalyticsData {
  views: {
    total: number
    thisWeek: number
    lastWeek: number
    trend: 'up' | 'down' | 'stable'
  }
  inquiries: {
    total: number
    thisWeek: number
    pending: number
    responded: number
  }
  favorites: {
    total: number
    thisWeek: number
  }
  demographics: {
    topLocations: string[]
    peakHours: string[]
    deviceTypes: { mobile: number; desktop: number; tablet: number }
  }
  recentActivity: Array<{
    type: 'view' | 'inquiry' | 'favorite'
    timestamp: string
    location?: string
    message?: string
  }>
}

export default function PropertyAnalytics({ propertyId, className = '' }: PropertyAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [propertyId, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Mock analytics data - replace with actual API call
      const mockData: AnalyticsData = {
        views: {
          total: Math.floor(Math.random() * 1000) + 100,
          thisWeek: Math.floor(Math.random() * 50) + 10,
          lastWeek: Math.floor(Math.random() * 40) + 8,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        inquiries: {
          total: Math.floor(Math.random() * 25) + 5,
          thisWeek: Math.floor(Math.random() * 8) + 1,
          pending: Math.floor(Math.random() * 5) + 1,
          responded: Math.floor(Math.random() * 15) + 3
        },
        favorites: {
          total: Math.floor(Math.random() * 80) + 10,
          thisWeek: Math.floor(Math.random() * 12) + 2
        },
        demographics: {
          topLocations: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
          peakHours: ['9:00 AM', '2:00 PM', '7:00 PM'],
          deviceTypes: {
            mobile: 65,
            desktop: 30,
            tablet: 5
          }
        },
        recentActivity: [
          {
            type: 'inquiry',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            location: 'Nairobi',
            message: 'Interested in scheduling a viewing'
          },
          {
            type: 'favorite',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            location: 'Mombasa'
          },
          {
            type: 'view',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            location: 'Kisumu'
          },
          {
            type: 'inquiry',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Nakuru',
            message: 'What is the availability?'
          },
          {
            type: 'view',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Nairobi'
          }
        ]
      }
      
      setAnalytics(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'inquiry':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'favorite':
        return <Heart className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">Unable to load analytics data</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Property Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.views.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(analytics.views.trend)}
              <span className="ml-1">
                {analytics.views.thisWeek} this week vs {analytics.views.lastWeek} last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.inquiries.total}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-orange-600">
                {analytics.inquiries.pending} pending
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {analytics.inquiries.responded} responded
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.favorites.total}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.favorites.thisWeek} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demographics and Device Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Viewer Locations</CardTitle>
            <CardDescription>Where your viewers are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.demographics.topLocations.map((location, index) => (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium">{location}</span>
                  </div>
                  <Badge variant="outline">
                    {Math.floor(Math.random() * 30) + 10}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
            <CardDescription>How viewers access your property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mobile</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analytics.demographics.deviceTypes.mobile}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{analytics.demographics.deviceTypes.mobile}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Desktop</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${analytics.demographics.deviceTypes.desktop}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{analytics.demographics.deviceTypes.desktop}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tablet</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${analytics.demographics.deviceTypes.tablet}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{analytics.demographics.deviceTypes.tablet}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions with your property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {activity.type === 'view' ? 'Property Viewed' : 
                       activity.type === 'inquiry' ? 'New Inquiry' : 'Added to Favorites'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  {activity.location && (
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {activity.location}
                    </div>
                  )}
                  {activity.message && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{activity.message}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}