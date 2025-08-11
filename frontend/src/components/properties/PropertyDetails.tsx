'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/Input'
import GoogleMap from '@/components/maps/GoogleMap'
import { 
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Heart,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Star,
  Building,
  Car,
  Wifi,
  Shield,
  Zap,
  Droplets,
  TreePine,
  Dumbbell,
  ShoppingCart,
  GraduationCap,
  Hospital,
  MapPinIcon,
  Eye,
  Calculator,
  FileText,
  Video,
  Home,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PropertyDetailsProps {
  property: Property
  onContactAgent?: (message: string) => void
  onScheduleTour?: (date: string, time: string, type: 'virtual' | 'physical') => void
  onSaveProperty?: (propertyId: string) => void
  onShareProperty?: (propertyId: string) => void
  className?: string
}

interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
  tourDate: string
  tourTime: string
  tourType: 'virtual' | 'physical'
}

export default function PropertyDetails({
  property,
  onContactAgent,
  onScheduleTour,
  onSaveProperty,
  onShareProperty,
  className = ''
}: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showTourForm, setShowTourForm] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
    tourDate: '',
    tourTime: '',
    tourType: 'physical'
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} sq ft`
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onContactAgent) {
      onContactAgent(contactForm.message)
    }
    setShowContactForm(false)
    // Reset form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      tourDate: '',
      tourTime: '',
      tourType: 'physical'
    })
  }

  const handleTourSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onScheduleTour) {
      onScheduleTour(contactForm.tourDate, contactForm.tourTime, contactForm.tourType)
    }
    setShowTourForm(false)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    if (onSaveProperty) {
      onSaveProperty(property.id)
    }
  }

  const handleShare = () => {
    if (onShareProperty) {
      onShareProperty(property.id)
    }
  }

  const getFeatureIcon = (feature: string) => {
    const featureIcons: { [key: string]: any } = {
      'parking': Car,
      'wifi': Wifi,
      'security': Shield,
      'electricity': Zap,
      'water': Droplets,
      'garden': TreePine,
      'gym': Dumbbell,
      'shopping': ShoppingCart,
      'school': GraduationCap,
      'hospital': Hospital,
      'pool': Droplets,
      'balcony': Building,
      'furnished': Home
    }
    
    const IconComponent = featureIcons[feature.toLowerCase()] || CheckCircle
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Image Gallery */}
      <div className="relative mb-8">
        <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
          <Image
            src={property.images[currentImageIndex] || '/placeholder-property.jpg'}
            alt={property.title}
            fill
            className="object-cover"
          />
          
          {/* Navigation Arrows */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            <Camera className="h-4 w-4 inline mr-1" />
            {currentImageIndex + 1} / {property.images.length}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className={`bg-white/90 ${isSaved ? 'text-red-500' : 'text-gray-700'}`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="bg-white/90 text-gray-700"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge 
              variant={property.status === 'available' ? 'default' : 'secondary'}
              className={`${
                property.status === 'available' 
                  ? 'bg-green-500 text-white' 
                  : property.status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {property.images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 ${
                  index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <Image
                  src={image}
                  alt={`${property.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              {property.featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{property.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">
                {formatPrice(property.price)}
                {property.type === 'rent' && <span className="text-lg text-gray-500">/month</span>}
              </div>
              
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-1" />
                  <span>{property.bedrooms} beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-1" />
                  <span>{property.bathrooms} baths</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-5 w-5 mr-1" />
                  <span>{formatArea(property.area)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-semibold capitalize">{property.type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-semibold capitalize">{property.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-semibold capitalize">{property.status}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bedrooms:</span>
                  <p className="font-semibold">{property.bedrooms}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bathrooms:</span>
                  <p className="font-semibold">{property.bathrooms}</p>
                </div>
                <div>
                  <span className="text-gray-600">Area:</span>
                  <p className="font-semibold">{formatArea(property.area)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </CardContent>
          </Card>

          {/* Features & Amenities */}
          {property.features && property.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getFeatureIcon(feature)}
                      <span className="text-gray-700 capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Map */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              {property.coordinates ? (
                <>
                  <div className="mb-2 text-sm text-gray-600">
                    Debug: Coordinates - Lat: {property.coordinates.lat}, Lng: {property.coordinates.lng}
                  </div>
                  <GoogleMap
                    properties={[property]}
                    center={property.coordinates}
                    zoom={15}
                    height="300px"
                    className="w-full"
                  />
                </>
              ) : (
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive map will be displayed here</p>
                    <p className="text-sm">{property.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {property.agent.avatar ? (
                    <Image
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {property.agent.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{property.agent.name}</h4>
                  <p className="text-sm text-gray-600">Real Estate Agent</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowContactForm(true)}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowTourForm(true)}
                variant="outline"
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Tour
              </Button>
              
              <Button variant="outline" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Mortgage Calculator
              </Button>
              
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Request Documents
              </Button>
              
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Market Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Property Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Property Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Views
                  </span>
                  <span className="font-semibold">1,234</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Saves
                  </span>
                  <span className="font-semibold">89</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Days on Market
                  </span>
                  <span className="font-semibold">15</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Contact Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  required
                />
                <Input
                  placeholder="Your Phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                />
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Your message..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                />
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Send Message</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowContactForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tour Form Modal */}
      {showTourForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule Property Tour</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTourSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={contactForm.tourType === 'physical' ? 'default' : 'outline'}
                    onClick={() => setContactForm({...contactForm, tourType: 'physical'})}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Physical
                  </Button>
                  <Button
                    type="button"
                    variant={contactForm.tourType === 'virtual' ? 'default' : 'outline'}
                    onClick={() => setContactForm({...contactForm, tourType: 'virtual'})}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Virtual
                  </Button>
                </div>
                
                <Input
                  type="date"
                  value={contactForm.tourDate}
                  onChange={(e) => setContactForm({...contactForm, tourDate: e.target.value})}
                  required
                />
                
                <Input
                  type="time"
                  value={contactForm.tourTime}
                  onChange={(e) => setContactForm({...contactForm, tourTime: e.target.value})}
                  required
                />
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Schedule Tour</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowTourForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
