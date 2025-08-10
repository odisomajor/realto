'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyNotifications } from '@/components/properties/PropertyNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell,
  BellOff,
  Settings,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  Home,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Plus
} from 'lucide-react'

interface NotificationStats {
  total: number
  unread: number
  thisWeek: number
  highPriority: number
  byType: {
    price_change: number
    new_listing: number
    market_update: number
    inquiry: number
    favorite: number
    view: number
  }
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
  badge?: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId] = useState('user-123') // Mock user ID

  // Mock stats data
  const mockStats: NotificationStats = {
    total: 47,
    unread: 12,
    thisWeek: 23,
    highPriority: 5,
    byType: {
      price_change: 8,
      new_listing: 15,
      market_update: 6,
      inquiry: 9,
      favorite: 5,
      view: 4
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setStats(mockStats)
      } catch (error) {
        console.error('Error fetching notification stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleNotificationClick = (notification: any) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const handleSettingsUpdate = (preferences: any[]) => {
    console.log('Notification preferences updated:', preferences)
    // Here you would typically save to API
  }

  const quickActions: QuickAction[] = [
    {
      id: 'create-alert',
      title: 'Create Price Alert',
      description: 'Get notified when property prices change',
      icon: DollarSign,
      action: () => router.push('/properties/advanced-search'),
      badge: 'Popular'
    },
    {
      id: 'saved-searches',
      title: 'Manage Saved Searches',
      description: 'View and edit your saved property searches',
      icon: Search,
      action: () => router.push('/properties/saved-searches')
    },
    {
      id: 'market-insights',
      title: 'Market Insights',
      description: 'Get weekly market updates and trends',
      icon: TrendingUp,
      action: () => router.push('/properties/insights')
    },
    {
      id: 'property-alerts',
      title: 'New Listing Alerts',
      description: 'Be first to know about new properties',
      icon: Home,
      action: () => router.push('/properties/advanced-search')
    }
  ]

  const notificationTypes = [
    {
      type: 'price_change',
      label: 'Price Changes',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      count: stats?.byType.price_change || 0
    },
    {
      type: 'new_listing',
      label: 'New Listings',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      count: stats?.byType.new_listing || 0
    },
    {
      type: 'market_update',
      label: 'Market Updates',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      count: stats?.byType.market_update || 0
    },
    {
      type: 'inquiry',
      label: 'Inquiries',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      count: stats?.byType.inquiry || 0
    },
    {
      type: 'favorite',
      label: 'Favorites',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      count: stats?.byType.favorite || 0
    },
    {
      type: 'view',
      label: 'Property Views',
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      count: stats?.byType.view || 0
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-600" />
                Notifications & Alerts
                {stats && stats.unread > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.unread} unread
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated with property alerts, market insights, and activity notifications
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => router.push('/properties/advanced-search')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.thisWeek} this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">
                    {((stats.unread / stats.total) * 100).toFixed(1)}% of total
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Zap className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-red-600">Requires attention</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600">Recent activity</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notification Types Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Notification Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notificationTypes.map(type => {
                const Icon = type.icon
                return (
                  <div key={type.type} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${type.bgColor}`}>
                      <Icon className={`h-4 w-4 ${type.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.count} notifications</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map(action => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="p-4 border rounded-lg hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      {action.badge && (
                        <Badge variant="outline" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Notifications Component */}
        <PropertyNotifications
          userId={userId}
          onNotificationClick={handleNotificationClick}
          onSettingsUpdate={handleSettingsUpdate}
        />

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Notification Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Stay Informed</h4>
                <p className="text-sm text-gray-600">
                  Enable notifications to never miss important property updates and market changes
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Customize Alerts</h4>
                <p className="text-sm text-gray-600">
                  Tailor your notification preferences to receive only the updates that matter to you
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Market Insights</h4>
                <p className="text-sm text-gray-600">
                  Get weekly market reports and trends to make informed property decisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
