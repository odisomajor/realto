'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyTours } from '@/components/properties/PropertyTours'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Video,
  Home,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Settings,
  Download,
  Share2
} from 'lucide-react'

export default function ToursPage() {
  const router = useRouter()
  const [tourStats, setTourStats] = useState({
    totalTours: 8,
    upcomingTours: 3,
    completedTours: 4,
    virtualTours: 5,
    physicalTours: 3,
    averageRating: 4.6
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Tours</h1>
              <p className="text-gray-600 mt-2">
                Schedule and manage your property viewings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Schedule
              </Button>
              <Button onClick={() => router.push('/properties')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {tourStats.totalTours}
                    </p>
                    <p className="text-sm text-gray-600">Total Tours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {tourStats.upcomingTours}
                    </p>
                    <p className="text-sm text-gray-600">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {tourStats.completedTours}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Video className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {tourStats.virtualTours}
                    </p>
                    <p className="text-sm text-gray-600">Virtual</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {tourStats.physicalTours}
                    </p>
                    <p className="text-sm text-gray-600">Physical</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {tourStats.averageRating}
                    </p>
                    <p className="text-sm text-gray-600">Avg Rating</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {/* Handle schedule virtual tour */}}
                >
                  <Video className="h-6 w-6 mb-2" />
                  <span>Schedule Virtual Tour</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {/* Handle schedule physical tour */}}
                >
                  <Home className="h-6 w-6 mb-2" />
                  <span>Schedule Physical Tour</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => router.push('/properties')}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Browse Properties</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => router.push('/properties/wishlist')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span>My Wishlist</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tours Alert */}
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Upcoming Tours</h4>
                    <p className="text-sm text-gray-600">
                      You have {tourStats.upcomingTours} tours scheduled for this week
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {tourStats.upcomingTours} pending
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tour Tips */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tour Tips & Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Video className="h-5 w-5 mr-2 text-purple-500" />
                    Virtual Tours
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Ensure stable internet connection</li>
                    <li>• Test your camera and microphone beforehand</li>
                    <li>• Prepare questions about the property</li>
                    <li>• Take screenshots of important features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Home className="h-5 w-5 mr-2 text-blue-500" />
                    Physical Tours
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Arrive 5-10 minutes early</li>
                    <li>• Bring identification and pre-approval letter</li>
                    <li>• Take notes and photos (with permission)</li>
                    <li>• Check utilities, appliances, and fixtures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tours Component */}
        <PropertyTours
          userId="current-user"
          onScheduleTour={(tour) => {
            console.log('Scheduling tour:', tour)
            // Handle tour scheduling
          }}
          onCancelTour={(tourId) => {
            console.log('Cancelling tour:', tourId)
            // Handle tour cancellation
          }}
          onRescheduleTour={(tourId, newDate, newTime) => {
            console.log('Rescheduling tour:', tourId, newDate, newTime)
            // Handle tour rescheduling
          }}
        />
      </div>
    </div>
  )
}