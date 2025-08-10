'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Home,
  Heart,
  Eye,
  MessageSquare,
  Calendar,
  Bell,
  TrendingUp,
  DollarSign,
  Search,
  Settings,
  Star,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plus,
  ArrowRight,
  BarChart3,
  FileText,
  Shield,
  CreditCard,
  Download,
  Upload,
  Filter,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Zap,
  Target,
  Compass,
  Activity
} from 'lucide-react'

interface DashboardStats {
  propertiesViewed: number
  savedProperties: number
  inquiriesSent: number
  toursScheduled: number
  searchesSaved: number
  alertsActive: number
}

interface RecentActivity {
  id: string
  type: 'view' | 'save' | 'inquiry' | 'tour' | 'search' | 'alert'
  title: string
  description: string
  timestamp: string
  propertyId?: string
  actionUrl?: string
}

interface SavedProperty {
  id: string
  title: string
  price: number
  location: string
  image: string
  bedrooms: number
  bathrooms: number
  area: number
  priceChange?: {
    amount: number
    percentage: number
    direction: 'up' | 'down'
  }
}

interface UserDashboardProps {
  userId: string
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  // Mock data
  const mockStats: DashboardStats = {
    propertiesViewed: 127,
    savedProperties: 23,
    inquiriesSent: 15,
    toursScheduled: 8,
    searchesSaved: 12,
    alertsActive: 6
  }

  const mockRecentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'view',
      title: 'Viewed Property',
      description: 'Modern Downtown Condo - $850,000',
      timestamp: '2024-01-15T10:30:00Z',
      propertyId: 'prop-1',
      actionUrl: '/properties/prop-1'
    },
    {
      id: '2',
      type: 'save',
      title: 'Saved Property',
      description: 'Luxury Villa in Hills - $1,200,000',
      timestamp: '2024-01-14T15:45:00Z',
      propertyId: 'prop-2',
      actionUrl: '/properties/prop-2'
    },
    {
      id: '3',
      type: 'inquiry',
      title: 'Sent Inquiry',
      description: 'Beachfront Property - $950,000',
      timestamp: '2024-01-13T09:20:00Z',
      propertyId: 'prop-3',
      actionUrl: '/properties/prop-3'
    },
    {
      id: '4',
      type: 'tour',
      title: 'Scheduled Tour',
      description: 'Family Home - $675,000',
      timestamp: '2024-01-12T14:15:00Z',
      propertyId: 'prop-4',
      actionUrl: '/properties/prop-4'
    },
    {
      id: '5',
      type: 'search',
      title: 'Saved Search',
      description: '3BR homes under $800k in Downtown',
      timestamp: '2024-01-11T11:30:00Z',
      actionUrl: '/properties/saved-searches'
    }
  ]

  const mockSavedProperties: SavedProperty[] = [
    {
      id: 'prop-1',
      title: 'Modern Downtown Condo',
      price: 850000,
      location: 'Downtown, San Francisco',
      image: '/api/placeholder/300/200',
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      priceChange: {
        amount: -25000,
        percentage: -2.9,
        direction: 'down'
      }
    },
    {
      id: 'prop-2',
      title: 'Luxury Villa in Hills',
      price: 1200000,
      location: 'Pacific Heights, San Francisco',
      image: '/api/placeholder/300/200',
      bedrooms: 4,
      bathrooms: 3,
      area: 2800,
      priceChange: {
        amount: 50000,
        percentage: 4.3,
        direction: 'up'
      }
    },
    {
      id: 'prop-3',
      title: 'Beachfront Property',
      price: 950000,
      location: 'Ocean Beach, San Francisco',
      image: '/api/placeholder/300/200',
      bedrooms: 3,
      bathrooms: 2,
      area: 1800
    }
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        setStats(mockStats)
        setRecentActivity(mockRecentActivity)
        setSavedProperties(mockSavedProperties)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [userId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return Eye
      case 'save': return Heart
      case 'inquiry': return MessageSquare
      case 'tour': return Calendar
      case 'search': return Search
      case 'alert': return Bell
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'text-blue-600 bg-blue-100'
      case 'save': return 'text-red-600 bg-red-100'
      case 'inquiry': return 'text-green-600 bg-green-100'
      case 'tour': return 'text-purple-600 bg-purple-100'
      case 'search': return 'text-orange-600 bg-orange-100'
      case 'alert': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const quickActions = [
    {
      title: 'Search Properties',
      description: 'Find your dream home',
      icon: Search,
      action: () => router.push('/properties'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Advanced Search',
      description: 'Use AI-powered filters',
      icon: Filter,
      action: () => router.push('/properties/advanced-search'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Market Insights',
      description: 'View market trends',
      icon: TrendingUp,
      action: () => router.push('/properties/insights'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Mortgage Calculator',
      description: 'Calculate payments',
      icon: DollarSign,
      action: () => router.push('/properties/mortgage-calculator'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">
              You have {stats?.alertsActive || 0} active alerts and {stats?.savedProperties || 0} saved properties
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => router.push('/properties/notifications')}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => router.push('/profile')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Properties Viewed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.propertiesViewed}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.savedProperties}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inquiries Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inquiriesSent}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tours Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.toursScheduled}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Searches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.searchesSaved}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.alertsActive}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-4 rounded-lg text-white transition-all hover:scale-105 ${action.color}`}
                >
                  <Icon className="h-8 w-8 mb-3" />
                  <h4 className="font-semibold mb-1">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/activity')}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map(activity => {
                const Icon = getActivityIcon(activity.type)
                const colorClass = getActivityColor(activity.type)
                
                return (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Saved Properties */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Saved Properties
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/properties/saved')}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedProperties.slice(0, 3).map(property => (
                <div 
                  key={property.id} 
                  className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/properties/${property.id}`)}
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{property.location}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-semibold text-green-600">
                        {formatPrice(property.price)}
                      </span>
                      {property.priceChange && (
                        <Badge 
                          variant={property.priceChange.direction === 'up' ? 'destructive' : 'default'}
                          className={`text-xs ${
                            property.priceChange.direction === 'up' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {property.priceChange.direction === 'up' ? '+' : ''}
                          {property.priceChange.percentage}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Insights Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Market Insights
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/properties/insights')}>
              View Full Report
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">+5.2%</div>
              <div className="text-sm text-gray-600">Average Price Change</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">847</div>
              <div className="text-sm text-gray-600">New Listings</div>
              <div className="text-xs text-gray-500 mt-1">This week</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">23 days</div>
              <div className="text-sm text-gray-600">Average Days on Market</div>
              <div className="text-xs text-gray-500 mt-1">Your area</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
