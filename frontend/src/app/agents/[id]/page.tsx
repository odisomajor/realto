'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  StarIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import PropertyCard from '@/components/properties/PropertyCard';
import { Agent, Property } from '@/types';

// Mock agent data - replace with API call
const mockAgent: Agent = {
  id: "1",
  name: "John Doe",
  email: "john@premiumrealty.co.ke",
  phone: "+254700000000",
  avatar: "https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff&size=200",
  bio: "Experienced real estate professional with over 8 years in the Kenyan property market. Specializing in luxury residential properties and commercial investments in Nairobi and surrounding areas.",
  company: {
    name: "Premium Realty Kenya",
    address: "Westlands Square, 4th Floor, Suite 401, Nairobi",
    phone: "+254711000000",
    location: "Westlands, Nairobi",
    website: "https://premiumrealty.co.ke",
    logo: "https://picsum.photos/100/50?random=20"
  },
  specializations: ["Luxury Homes", "Commercial Properties", "Investment Properties", "Land Sales"],
  experience: 8,
  propertiesListed: 156,
  propertiesSold: 89,
  rating: 4.8,
  reviews: 47,
  featured: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

// Mock properties by this agent
const agentProperties: Property[] = [
  {
    id: "1",
    title: "Modern 3BR Apartment in Westlands",
    description: "Luxurious apartment with stunning city views",
    price: 15000000,
    location: "Westlands, Nairobi",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    type: "sale",
    category: "residential",
    status: "available",
    images: ["https://picsum.photos/400/300?random=21"],
    features: ["Parking", "Swimming Pool", "Gym", "Security"],
    agent: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+254700000000"
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    featured: true
  },
  {
    id: "4",
    title: "Commercial Office Space in CBD",
    description: "Prime office location in the heart of Nairobi",
    price: 18000000,
    location: "CBD, Nairobi",
    bedrooms: 0,
    bathrooms: 2,
    area: 80,
    type: "sale",
    category: "commercial",
    status: "available",
    images: ["https://picsum.photos/400/300?random=22"],
    features: ["Elevator", "Parking", "Security", "Air Conditioning"],
    agent: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+254700000000"
    },
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    featured: false
  }
];

interface AgentPageProps {
  params: {
    id: string;
  };
}

export default function AgentPage({ params }: AgentPageProps) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // In a real app, fetch agent data based on params.id
  const agent = mockAgent;
  const properties = agentProperties;

  if (!agent) {
    notFound();
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-5 w-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarSolidIcon className="h-5 w-5 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }

    return stars;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link href="/agents" className="text-gray-500 hover:text-gray-700">
                  Agents
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900">{agent.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Profile */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Agent Photo */}
                  <div className="flex-shrink-0">
                    <Image
                      src={agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=3b82f6&color=fff&size=200`}
                      alt={agent.name}
                      width={200}
                      height={200}
                      className="w-48 h-48 rounded-lg object-cover"
                    />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {agent.name}
                    </h1>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {renderStars(agent.rating)}
                      </div>
                      <span className="ml-2 text-gray-600">
                        {agent.rating.toFixed(1)} ({agent.reviews} reviews)
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 mb-6">
                      {agent.bio}
                    </p>

                    {/* Specializations */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {agent.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{agent.experience}</div>
                        <div className="text-sm text-gray-500">Years Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{agent.propertiesListed}</div>
                        <div className="text-sm text-gray-500">Properties Listed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{agent.propertiesSold}</div>
                        <div className="text-sm text-gray-500">Properties Sold</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">{agent.company.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">{agent.company.address}</div>
                          <div className="text-sm text-gray-500">{agent.company.location}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <a href={`tel:${agent.company.phone}`} className="text-green-600 hover:text-green-800">
                          {agent.company.phone}
                        </a>
                      </div>
                      
                      {agent.company.website && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <a 
                            href={agent.company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {agent.company.logo && (
                    <div className="flex justify-center md:justify-end">
                      <Image
                        src={agent.company.logo}
                        alt={`${agent.company.name} logo`}
                        width={150}
                        height={75}
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Properties Listed */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Properties Listed by {agent.name}
              </h2>
              
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No properties currently listed by this agent.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Contact Form Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Contact {agent.name}</CardTitle>
                <CardDescription>
                  Get in touch to discuss your property needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <Input
                    label="Your Name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                  
                  <Input
                    label="Phone"
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Tell us about your property requirements..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <PhoneIcon className="h-5 w-5 mr-2" />
                      Call Now
                    </a>
                    
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      Send Email
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}