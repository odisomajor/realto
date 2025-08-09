'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Filter,
  Search,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Home,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Zap,
  Star,
  TrendingUp,
  Heart,
  Share2
} from 'lucide-react'

interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
}

interface NotificationPreference {
  id: string
  type: 'price_change' | 'new_listing' | 'market_update' | 'inquiry' | 'favorite' | 'view' | 'similar_property'
  label: string
  description: string
  settings: NotificationSettings
  enabled: boolean
  frequency: 'instant' | 'daily' | 'weekly' | 'monthly'
}

interface Notification {
  id: string
  type: 'price_change' | 'new_listing' | 'market_update' | 'inquiry' | 'favorite' | 'view' | 'similar_property'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  propertyId?: string
  propertyTitle?: string
  propertyImage?: string
  actionUrl?: string
  metadata?: Record<string, any>
}

interface PropertyNotificationsProps {
  userId: string
  propertyId?: string
  onNotificationClick?: (notification: Notification) => void
  onSettingsUpdate?: (preferences: NotificationPreference[]) => void
}

export function PropertyNotifications({
  userId,
  propertyId,
  onNotificationClick,
  onSettingsUpdate
}: PropertyNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications')
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  // Mock data for development
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'price_change',
      title: 'Price Drop Alert',
      message: 'The price of "Modern 3BR Apartment in Kilimani" has dropped by KES 500,000',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      propertyId: 'prop-1',
      propertyTitle: 'Modern 3BR Apartment in Kilimani',
      propertyImage: '/api/placeholder/300/200',
      actionUrl: '/properties/prop-1',
      metadata: { oldPrice: 15000000, newPrice: 14500000 }
    },
    {
      id: '2',
      type: 'new_listing',
      title: 'New Property Match',
      message: 'A new property matching your saved search "3BR Houses in Karen" is now available',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      propertyId: 'prop-2',
      propertyTitle: 'Luxury Villa in Karen',
      propertyImage: '/api/placeholder/300/200',
      actionUrl: '/properties/prop-2'
    },
    {
      id: '3',
      type: 'inquiry',
      title: 'New Inquiry Received',
      message: 'Someone is interested in your property "Penthouse in Westlands"',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'high',
      propertyId: 'prop-3',
      propertyTitle: 'Penthouse in Westlands',
      actionUrl: '/properties/prop-3/inquiries'
    },
    {
      id: '4',
      type: 'market_update',
      title: 'Market Insights',
      message: 'Property prices in Kilimani have increased by 8.5% this quarter',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      actionUrl: '/properties/insights'
    },
    {
      id: '5',
      type: 'favorite',
      title: 'Property Favorited',
      message: '3 people have added your property to their favorites this week',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      propertyId: 'prop-3',
      propertyTitle: 'Penthouse in Westlands'
    }
  ]

  const mockPreferences: NotificationPreference[] = [
    {
      id: 'price_change',
      type: 'price_change',
      label: 'Price Changes',
      description: 'Get notified when property prices change',
      settings: { email: true, sms: true, push: true, inApp: true },
      enabled: true,
      frequency: 'instant'
    },
    {
      id: 'new_listing',
      type: 'new_listing',
      label: 'New Listings',
      description: 'Notifications for new properties matching your criteria',
      settings: { email: true, sms: false, push: true, inApp: true },
      enabled: true,
      frequency: 'daily'
    },
    {
      id: 'market_update',
      type: 'market_update',
      label: 'Market Updates',
      description: 'Weekly market insights and trends',
      settings: { email: true, sms: false, push: false, inApp: true },
      enabled: true,
      frequency: 'weekly'
    },
    {
      id: 'inquiry',
      type: 'inquiry',
      label: 'Property Inquiries',
      description: 'When someone inquires about your properties',
      settings: { email: true, sms: true, push: true, inApp: true },
      enabled: true,
      frequency: 'instant'
    },
    {
      id: 'favorite',
      type: 'favorite',
      label: 'Favorites & Views',
      description: 'When someone favorites or views your properties',
      settings: { email: false, sms: false, push: true, inApp: true },
      enabled: true,
      frequency: 'daily'
    },
    {
      id: 'similar_property',
      type: 'similar_property',
      label: 'Similar Properties',
      description: 'Recommendations for similar properties',
      settings: { email: true, sms: false, push: false, inApp: true },
      enabled: false,
      frequency: 'weekly'
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        setNotifications(mockNotifications)
        setPreferences(mockPreferences)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, propertyId])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_change':
        return <DollarSign className="h-5 w-5 text-green-600" />
      case 'new_listing':
        return <Home className="h-5 w-5 text-blue-600" />
      case 'market_update':
        return <TrendingUp className="h-5 w-5 text-purple-600" />
      case 'inquiry':
        return <MessageSquare className="h-5 w-5 text-orange-600" />
      case 'favorite':
        return <Heart className="h-5 w-5 text-red-600" />
      case 'view':
        return <Eye className="h-5 w-5 text-indigo-600" />
      case 'similar_property':
        return <Star className="h-5 w-5 text-yellow-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-200 text-red-800'
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      case 'low':
        return 'bg-blue-100 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const updatePreference = (id: string, updates: Partial<NotificationPreference>) => {
    const updatedPreferences = preferences.map(pref => 
      pref.id === id ? { ...pref, ...updates } : pref
    )
    setPreferences(updatedPreferences)
    
    if (onSettingsUpdate) {
      onSettingsUpdate(updatedPreferences)
    }
  }

  const updatePreferenceSettings = (id: string, setting: keyof NotificationSettings, value: boolean) => {
    const updatedPreferences = preferences.map(pref => 
      pref.id === id 
        ? { ...pref, settings: { ...pref.settings, [setting]: value } }
        : pref
    )
    setPreferences(updatedPreferences)
    
    if (onSettingsUpdate) {
      onSettingsUpdate(updatedPreferences)
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'high' && notification.priority === 'high')
    
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Stay updated with property alerts and market insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {activeTab === 'notifications' && (
        <>
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'unread', label: 'Unread' },
                    { value: 'high', label: 'High Priority' }
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={filter === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(option.value as any)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                  <p className="text-gray-600">
                    {filter === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : "No notifications match your current filter."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map(notification => (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {notification.title}
                              {!notification.read && (
                                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            {notification.propertyTitle && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <Home className="h-3 w-3" />
                                {notification.propertyTitle}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(notification.timestamp)}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {notification.propertyImage && (
                              <img
                                src={notification.propertyImage}
                                alt={notification.propertyTitle}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Global Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Email</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="font-medium">SMS</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Push</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">In-App</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {preferences.map(preference => (
                  <div key={preference.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(preference.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">{preference.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{preference.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preference.enabled}
                        onCheckedChange={(checked) => 
                          updatePreference(preference.id, { enabled: checked })
                        }
                      />
                    </div>
                    
                    {preference.enabled && (
                      <div className="space-y-4 ml-8">
                        {/* Delivery Methods */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Delivery Methods
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${preference.id}-email`}
                                checked={preference.settings.email}
                                onChange={(e) => 
                                  updatePreferenceSettings(preference.id, 'email', e.target.checked)
                                }
                                className="rounded"
                              />
                              <Label htmlFor={`${preference.id}-email`} className="text-sm">
                                Email
                              </Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${preference.id}-sms`}
                                checked={preference.settings.sms}
                                onChange={(e) => 
                                  updatePreferenceSettings(preference.id, 'sms', e.target.checked)
                                }
                                className="rounded"
                              />
                              <Label htmlFor={`${preference.id}-sms`} className="text-sm">
                                SMS
                              </Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${preference.id}-push`}
                                checked={preference.settings.push}
                                onChange={(e) => 
                                  updatePreferenceSettings(preference.id, 'push', e.target.checked)
                                }
                                className="rounded"
                              />
                              <Label htmlFor={`${preference.id}-push`} className="text-sm">
                                Push
                              </Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${preference.id}-inApp`}
                                checked={preference.settings.inApp}
                                onChange={(e) => 
                                  updatePreferenceSettings(preference.id, 'inApp', e.target.checked)
                                }
                                className="rounded"
                              />
                              <Label htmlFor={`${preference.id}-inApp`} className="text-sm">
                                In-App
                              </Label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Frequency */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Frequency
                          </Label>
                          <select
                            value={preference.frequency}
                            onChange={(e) => 
                              updatePreference(preference.id, { 
                                frequency: e.target.value as any 
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="instant">Instant</option>
                            <option value="daily">Daily Digest</option>
                            <option value="weekly">Weekly Summary</option>
                            <option value="monthly">Monthly Report</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VolumeX className="h-5 w-5 text-gray-600" />
                Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Quiet Hours</h4>
                    <p className="text-sm text-gray-600">
                      Pause non-urgent notifications during specified hours
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quietStart">Start Time</Label>
                    <Input
                      id="quietStart"
                      type="time"
                      defaultValue="22:00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quietEnd">End Time</Label>
                    <Input
                      id="quietEnd"
                      type="time"
                      defaultValue="08:00"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}