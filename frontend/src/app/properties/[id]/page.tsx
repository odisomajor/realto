'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Property } from '@/types';
import { formatPrice, formatArea } from '@/lib/utils';
import { usePropertyViewTracker } from '@/components/auth/BrowsingTracker';
import {
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Mock property data - replace with API call
const mockProperty: Property = {
  id: "1",
  title: "Modern 3BR Apartment in Westlands",
  description: "This luxurious apartment offers stunning city views and modern amenities in the heart of Westlands. Perfect for professionals and families looking for convenience and style.",
  price: 15000000,
  location: "Westlands, Nairobi",
  bedrooms: 3,
  bathrooms: 2,
  area: 120, // 120 square metres
  type: "sale",
  category: "residential",
  status: "available",
  images: [
    "https://picsum.photos/800/600?random=30",
    "https://picsum.photos/800/600?random=31",
    "https://picsum.photos/800/600?random=32",
    "https://picsum.photos/800/600?random=33"
  ],
  features: [
    "Swimming Pool",
    "Gym",
    "Parking",
    "Security",
    "Elevator",
    "Balcony",
    "Modern Kitchen",
    "Air Conditioning"
  ],
  agent: {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+254700000000"
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  featured: true
};

export default function PropertyDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track property view for browsing session
  usePropertyViewTracker(params.id as string);

  useEffect(() => {
    // TODO: Fetch property by ID from API
    setProperty(mockProperty);
  }, [params.id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Submit contact form to API
      console.log('Contact form submitted:', contactForm);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setContactForm({ name: '', email: '', phone: '', message: '' });
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-green-600">Properties</Link>
            <span>/</span>
            <span className="text-gray-900">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                
                {/* Navigation Arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                        index === currentImageIndex ? 'ring-2 ring-green-600' : ''
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${property.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <HomeIcon className="h-5 w-5 mr-2" />
                    <span>
                      {property.bedrooms > 0 && `${property.bedrooms} bed`}
                      {property.bedrooms > 0 && property.bathrooms > 0 && ' • '}
                      {property.bathrooms > 0 && `${property.bathrooms} bath`}
                      {(property.bedrooms > 0 || property.bathrooms > 0) && ' • '}
                      {formatArea(property.area, property.category)}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(property.price)}
                    {property.status === 'for_rent' && <span className="text-lg text-gray-600">/month</span>}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center space-x-2"
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>Save</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ShareIcon className="w-5 h-5" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <HomeIcon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Bedrooms</div>
                  <div className="font-semibold">{property.bedrooms}</div>
                </div>
                <div className="text-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Bathrooms</div>
                  <div className="font-semibold">{property.bathrooms}</div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 text-gray-600 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg">📐</span>
                  </div>
                  <div className="text-sm text-gray-600">Area</div>
                  <div className="font-semibold">{property.area} m²</div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 text-gray-600 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg">🏠</span>
                  </div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-semibold capitalize">{property.type}</div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <Input
                    label="Name"
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    placeholder="Your full name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    placeholder="your@email.com"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    required
                    placeholder="+254 700 000 000"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="I'm interested in this property..."
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Send Message
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <PhoneIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">+254 700 123 456</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">agent@xillix.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Status */}
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === 'for_sale' 
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'for_rent'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-medium">#{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated</span>
                  <span className="font-medium">
                    {new Date(property.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}