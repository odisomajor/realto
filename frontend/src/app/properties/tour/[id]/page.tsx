'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { propertyApi } from '@/lib/api'
import { PropertyTour } from '@/components/properties/PropertyTour'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Phone,
  Mail,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { Property } from '@/types/property'

export default function PropertyTourPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await propertyApi.getProperty(propertyId)
      setProperty(response.data)
    } catch (error) {
      console.error('Error fetching property:', error)
      setError('Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      await propertyApi.toggleFavorite(propertyId)
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this property: ${property?.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      alert('Property URL copied to clipboard!')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">
              <MessageCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Property Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              {error || 'The property you are looking for could not be found.'}
            </p>
            <Button onClick={() => router.push('/properties')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Virtual Tour
                </h1>
                <p className="text-gray-600">{property.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFavorite}
                className={isFavorite ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Link href={`/properties/${propertyId}`}>
                <Button size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Property Tour */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tour Component */}
          <div className="lg:col-span-3">
            <PropertyTour propertyId={propertyId} />
          </div>
          
          {/* Property Info Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatCurrency(property.price)}
                  </div>
                  <Badge variant={property.category === 'sale' ? 'default' : 'secondary'}>
                    For {property.category === 'sale' ? 'Sale' : 'Rent'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bed className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">{property.bedrooms}</div>
                    <div className="text-xs text-gray-500">Beds</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bath className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">{property.bathrooms}</div>
                    <div className="text-xs text-gray-500">Baths</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Square className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">{property.area}</div>
                    <div className="text-xs text-gray-500">sqft</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Agent Info */}
            {property.agent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {property.agent.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{property.agent.name}</div>
                      <div className="text-sm text-gray-500">{property.agent.company}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      {property.agent.phone}
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      {property.agent.email}
                    </Button>
                  </div>
                  
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Schedule Tour */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Physical Tour</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Interested in seeing this property in person? Schedule a tour with the agent.
                </p>
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Tour
                </Button>
              </CardContent>
            </Card>
            
            {/* Property Features */}
            {property.features && property.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}