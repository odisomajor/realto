'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { propertyApi, inquiryApi } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import UserProfile from '@/components/auth/UserProfile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home, 
  Plus, 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Calendar,
  Sparkles,
  User,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProperties?: number
  totalViews?: number
  totalInquiries?: number
  totalFavorites?: number
  totalUsers?: number
  recentActivity?: any[]
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({})
  const [recentProperties, setRecentProperties] = useState([])
  const [recentInquiries, setRecentInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)

  const isAgent = user?.role === 'AGENT' || user?.role === 'ADMIN'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        if (isAgent) {
          // Fetch agent-specific data
          const [propertiesRes, inquiriesRes] = await Promise.all([
            propertyApi.getMyProperties(),
            inquiryApi.getInquiries()
          ])
          
          const properties = propertiesRes.data.data || []
          const inquiries = inquiriesRes.data.inquiries || []

          setRecentProperties(properties.slice(0, 5))
          setRecentInquiries(inquiries.slice(0, 5))
          
          setStats({
            totalProperties: propertiesRes.data.pagination?.total || properties.length,
            totalInquiries: inquiriesRes.data.pagination?.total || inquiries.length,
            totalViews: properties.reduce((sum: number, prop: any) => sum + (prop.views || 0), 0)
          })
        } else {
          // Fetch user-specific data
          const [favoritesRes, inquiriesRes] = await Promise.all([
            propertyApi.getFavorites(),
            inquiryApi.getUserInquiries()
          ])
          
          const favorites = favoritesRes.data.favorites || []
          const inquiries = inquiriesRes.data.inquiries || []

          setStats({
            totalFavorites: favoritesRes.data.pagination?.total || favorites.length,
            totalInquiries: inquiriesRes.data.pagination?.total || inquiries.length
          })
          setRecentInquiries(inquiries.slice(0, 5))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, isAgent])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (showProfile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
                <Button
                  variant="outline"
                  onClick={() => setShowProfile(false)}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <UserProfile onClose={() => setShowProfile(false)} />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              {isAgent 
                ? 'Manage your properties and track inquiries' 
                : 'Discover your dream property and track your favorites'
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAgent ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProperties || 0}</div>
                  <p className="text-xs text-muted-foreground">Properties listed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
                  <p className="text-xs text-muted-foreground">Property views</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInquiries || 0}</div>
                  <p className="text-xs text-muted-foreground">New inquiries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh 0</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFavorites || 0}</div>
                  <p className="text-xs text-muted-foreground">Saved properties</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInquiries || 0}</div>
                  <p className="text-xs text-muted-foreground">Property inquiries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Searches</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Profile visits</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {isAgent ? (
              <>
                <Link href="/properties/new">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Property
                  </Button>
                </Link>
                <Link href="/properties/my-properties">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Manage Properties
                  </Button>
                </Link>
                <Link href="/inquiries">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    View Inquiries
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/properties">
                  <Button className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Recommendations
                  </Button>
                </Link>
                <Link href="/properties?filter=favorites">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    My Favorites
                  </Button>
                </Link>
                <Link href="/inquiries">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    My Inquiries
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue={isAgent ? 'properties' : 'favorites'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={isAgent ? 'properties' : 'favorites'}>
              {isAgent ? 'Recent Properties' : 'Favorite Properties'}
            </TabsTrigger>
            <TabsTrigger value="inquiries">Recent Inquiries</TabsTrigger>
          </TabsList>
          
          <TabsContent value={isAgent ? 'properties' : 'favorites'} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAgent ? 'Your Recent Properties' : 'Your Favorite Properties'}
                </CardTitle>
                <CardDescription>
                  {isAgent 
                    ? 'Properties you\'ve recently added' 
                    : 'Properties you\'ve saved for later'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentProperties.length > 0 ? (
                  <div className="space-y-4">
                    {recentProperties.map((property: any) => (
                      <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Home className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">{property.title}</h3>
                            <p className="text-sm text-gray-600">{property.location}</p>
                            <p className="text-sm font-medium text-green-600">
                              KSh {property.price?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/properties/${property.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isAgent 
                        ? 'No properties added yet. Start by adding your first property!' 
                        : 'No favorite properties yet. Browse properties to add some favorites!'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inquiries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>
                  {isAgent 
                    ? 'Inquiries about your properties' 
                    : 'Your property inquiries'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {recentInquiries.map((inquiry: any) => (
                      <div key={inquiry.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{inquiry.subject || 'Property Inquiry'}</h3>
                            <p className="text-sm text-gray-600">
                              {isAgent 
                                ? `From: ${inquiry.user?.firstName} ${inquiry.user?.lastName}` 
                                : `Property: ${inquiry.property?.title}`
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={inquiry.status === 'PENDING' ? 'default' : 'secondary'}>
                            {inquiry.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isAgent 
                        ? 'No inquiries yet. They\'ll appear here when users contact you about your properties.' 
                        : 'No inquiries yet. Contact agents about properties you\'re interested in!'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* User Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Profile</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center space-x-2"
                >
                  <span>Close</span>
                </Button>
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}