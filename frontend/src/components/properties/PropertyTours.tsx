'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Star,
  Navigation,
  Camera,
  Headphones,
  Monitor,
  Smartphone,
  Users,
  Home,
  Building
} from 'lucide-react'
import { Property } from '@/types'
import { formatPrice } from '@/lib/utils'

interface Tour {
  id: string
  propertyId: string
  property: Property
  type: 'virtual' | 'physical'
  date: string
  time: string
  duration: number // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  attendees: {
    id: string
    name: string
    email: string
    phone: string
    role: 'buyer' | 'agent' | 'seller'
  }[]
  agent: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
  }
  notes?: string
  meetingLink?: string
  address?: string
  requirements?: string[]
  rating?: number
  feedback?: string
}

interface PropertyToursProps {
  userId?: string
  propertyId?: string
  onScheduleTour?: (tour: Partial<Tour>) => void
  onCancelTour?: (tourId: string) => void
  onRescheduleTour?: (tourId: string, newDate: string, newTime: string) => void
}

export function PropertyTours({
  userId,
  propertyId,
  onScheduleTour,
  onCancelTour,
  onRescheduleTour
}: PropertyToursProps) {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  const [scheduleForm, setScheduleForm] = useState({
    propertyId: propertyId || '',
    type: 'physical' as 'virtual' | 'physical',
    date: '',
    time: '',
    duration: 60,
    attendees: [{ id: '', name: '', email: '', phone: '', role: 'buyer' as const }],
    notes: '',
    requirements: [] as string[]
  })

  useEffect(() => {
    fetchTours()
  }, [userId, propertyId])

  useEffect(() => {
    filterTours()
  }, [tours, filterStatus, filterType])

  const fetchTours = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockTours: Tour[] = [
        {
          id: '1',
          propertyId: '1',
          property: {
            id: '1',
            title: 'Modern Downtown Apartment',
            description: 'A beautiful modern apartment in the heart of downtown',
            price: 850000,
            location: 'Downtown, City Center',
            bedrooms: 2,
            bathrooms: 2,
            area: 1200,
            type: 'sale',
            category: 'residential',
            status: 'available',
            images: ['/api/placeholder/400/300'],
            features: ['Modern Kitchen', 'Balcony', 'Parking'],
            agent: {
              id: 'agent1',
              name: 'Sarah Johnson',
              email: 'sarah@realestate.com',
              phone: '+254700000002'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          type: 'virtual',
          date: '2024-01-25',
          time: '14:00',
          duration: 45,
          status: 'scheduled',
          attendees: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+254700000001',
              role: 'buyer'
            }
          ],
          agent: {
            id: 'agent1',
            name: 'Sarah Johnson',
            email: 'sarah@realestate.com',
            phone: '+254700000002',
            avatar: '/api/placeholder/40/40'
          },
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          notes: 'Interested in the kitchen and balcony view'
        },
        {
          id: '2',
          propertyId: '2',
          property: {
            id: '2',
            title: 'Luxury Villa with Pool',
            description: 'A stunning luxury villa with pool and garden',
            price: 2500000,
            location: 'Beverly Hills, CA',
            bedrooms: 5,
            bathrooms: 4,
            area: 4500,
            type: 'sale',
            category: 'residential',
            status: 'available',
            images: ['/api/placeholder/400/300'],
            features: ['Pool', 'Garden', 'Garage', 'Security'],
            agent: {
              id: 'agent2',
              name: 'Michael Brown',
              email: 'michael@realestate.com',
              phone: '+254700000004'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          type: 'physical',
          date: '2024-01-20',
          time: '10:00',
          duration: 90,
          status: 'completed',
          attendees: [
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              phone: '+254700000003',
              role: 'buyer'
            }
          ],
          agent: {
            id: 'agent2',
            name: 'Michael Brown',
            email: 'michael@realestate.com',
            phone: '+254700000004'
          },
          address: '123 Beverly Hills Drive, CA',
          rating: 5,
          feedback: 'Excellent property and great agent. Very professional tour.'
        }
      ]
      
      setTours(mockTours)
    } catch (error) {
      console.error('Error fetching tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTours = () => {
    let filtered = [...tours]

    if (filterStatus !== 'all') {
      filtered = filtered.filter(tour => tour.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(tour => tour.type === filterType)
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })

    setFilteredTours(filtered)
  }

  const handleScheduleTour = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newTour: Partial<Tour> = {
        ...scheduleForm,
        id: Date.now().toString(),
        status: 'scheduled',
        attendees: scheduleForm.attendees.map(attendee => ({
          ...attendee,
          id: attendee.id || Date.now().toString()
        })),
        agent: {
          id: 'agent1',
          name: 'Sarah Johnson',
          email: 'sarah@realestate.com',
          phone: '+254700000002'
        }
      }

      onScheduleTour?.(newTour)
      
      // Reset form
      setScheduleForm({
        propertyId: propertyId || '',
        type: 'physical',
        date: '',
        time: '',
        duration: 60,
        attendees: [{ id: '', name: '', email: '', phone: '', role: 'buyer' }],
        notes: '',
        requirements: []
      })
      setShowScheduleForm(false)
      
      // Refresh tours
      fetchTours()
    } catch (error) {
      console.error('Error scheduling tour:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'rescheduled':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isUpcoming = (date: string, time: string) => {
    const tourDateTime = new Date(`${date} ${time}`)
    return tourDateTime > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Tours</h2>
          <p className="text-gray-600">Schedule and manage your property viewings</p>
        </div>
        <Button onClick={() => setShowScheduleForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Tour
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="virtual">Virtual Tours</option>
                <option value="physical">Physical Tours</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Tour Form */}
      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Tour</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleTour} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Type
                  </label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'virtual' | 'physical' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="physical">Physical Tour</option>
                    <option value="virtual">Virtual Tour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm(prev => ({ 
                      ...prev, 
                      duration: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendee Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={scheduleForm.attendees[0]?.name || ''}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      attendees: [{ ...prev.attendees[0], name: e.target.value }]
                    }))}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={scheduleForm.attendees[0]?.email || ''}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      attendees: [{ ...prev.attendees[0], email: e.target.value }]
                    }))}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={scheduleForm.attendees[0]?.phone || ''}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      attendees: [{ ...prev.attendees[0], phone: e.target.value }]
                    }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific requirements or questions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button type="submit">Schedule Tour</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowScheduleForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tours List */}
      {filteredTours.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Calendar className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">No Tours Found</h3>
            <p className="text-gray-600">
              {filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Schedule your first property tour'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Image */}
                  <div className="lg:w-48 flex-shrink-0">
                    <div className="relative h-32 lg:h-full rounded-lg overflow-hidden">
                      <Image
                        src={tour.property.images[0] || '/placeholder-property.jpg'}
                        alt={tour.property.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className={`${tour.type === 'virtual' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {tour.type === 'virtual' ? (
                            <><Video className="h-3 w-3 mr-1" />Virtual</>
                          ) : (
                            <><Home className="h-3 w-3 mr-1" />Physical</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {tour.property.title}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{tour.property.location}</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatPrice(tour.property.price)}
                        </div>
                      </div>
                      <Badge className={getStatusColor(tour.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(tour.status)}
                          <span className="ml-1 capitalize">{tour.status}</span>
                        </div>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(tour.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{tour.time} ({tour.duration} min)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{tour.agent.name}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{tour.attendees.length} attendee(s)</span>
                      </div>
                    </div>

                    {tour.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Notes:</strong> {tour.notes}
                        </p>
                      </div>
                    )}

                    {tour.rating && tour.feedback && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < tour.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">({tour.rating}/5)</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                          <strong>Feedback:</strong> {tour.feedback}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      {tour.status === 'scheduled' && isUpcoming(tour.date, tour.time) && (
                        <>
                          {tour.type === 'virtual' && tour.meetingLink && (
                            <Button size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Join Virtual Tour
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Agent
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Property
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
