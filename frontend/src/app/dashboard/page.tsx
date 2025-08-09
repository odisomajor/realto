'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { propertyApi, inquiryApi } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
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
  Sparkles
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
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({})
  const [recentProperties, setRecentProperties] = useState([])
  const [recentInquiries, setRecentInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        if (user?.role === 'AGENT') {
          // Fetch agent-specific data
          const [propertiesRes, inquiriesRes] = await Promise.all([
            propertyApi.getMyProperties(),
            inquiryApi.getInquiries()
          ])
          
          setRecentProperties(propertiesRes.data.slice(0, 5))
          setRecentInquiries(inquiriesRes.data.slice(0, 5))
          
          setStats({
            totalProperties: propertiesRes.data.length,
            totalInquiries: inquiriesRes.data.length,
            totalViews: propertiesRes.data.reduce((sum: number, prop: any) => sum + (prop.viewCount || 0), 0)
          })
        } else {
          // Fetch user-specific data
          const [favoritesRes, inquiriesRes] = await Promise.all([
            propertyApi.getFavorites(),
            inquiryApi.getInquiries()
          ])
          
          setStats({
            totalFavorites: favoritesRes.data.length,
            totalInquiries: inquiriesRes.data.length
          })
          setRecentInquiries(inquiriesRes.data.slice(0, 5))
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
  }, [user])

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

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'AGENT' 
              ? 'Manage your properties and track inquiries' 
              : 'Discover your dream property and track your favorites'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'AGENT' ? (
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
                  <div className="text-2xl font-bold">{user?.propertyViewCount || 0}</div>
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
            {user?.role === 'AGENT' ? (
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
              <>
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
        <Tabs defaultValue={user?.role === 'AGENT' ? 'properties' : 'favorites'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={user?.role === 'AGENT' ? 'properties' : 'favorites'}>
              {user?.role === 'AGENT' ? 'Recent Properties' : 'Favorite Properties'}
            </TabsTrigger>
            <TabsTrigger value="inquiries">Recent Inquiries</TabsTrigger>
          </TabsList>
          
          <TabsContent value={user?.role === 'AGENT' ? 'properties' : 'favorites'} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {user?.role === 'AGENT' ? 'Your Recent Properties' : 'Your Favorite Properties'}
                </CardTitle>
                <CardDescription>
                  {user?.role === 'AGENT' 
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
                      {user?.role === 'AGENT' 
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
                  {user?.role === 'AGENT' 
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
                              {user?.role === 'AGENT' 
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
                      {user?.role === 'AGENT' 
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
    </ProtectedRoute>
  )
}