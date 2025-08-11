'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BuildingOfficeIcon,
  UsersIcon,
  TrophyIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AboutPage() {
  const stats = [
    { label: 'Properties Listed', value: '10,000+', icon: BuildingOfficeIcon },
    { label: 'Happy Clients', value: '5,000+', icon: UsersIcon },
    { label: 'Years Experience', value: '15+', icon: TrophyIcon },
    { label: 'Cities Covered', value: '20+', icon: MapPinIcon }
  ]

  const values = [
    {
      title: 'Trust & Transparency',
      description: 'We believe in honest dealings and transparent processes. Every property listing is verified and every transaction is handled with complete transparency.',
      icon: ShieldCheckIcon
    },
    {
      title: 'Customer First',
      description: 'Our clients are at the heart of everything we do. We go above and beyond to ensure their real estate journey is smooth and successful.',
      icon: HeartIcon
    },
    {
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to provide the best real estate experience, from virtual tours to AI-powered property matching.',
      icon: LightBulbIcon
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service, from property curation to customer support and after-sales service.',
      icon: StarIcon
    }
  ]

  const team = [
    {
      name: 'Sarah Wanjiku',
      role: 'Chief Executive Officer',
      image: '/images/team/ceo.jpg',
      description: 'With over 15 years in real estate, Sarah leads our vision of making property ownership accessible to all Kenyans.'
    },
    {
      name: 'Michael Ochieng',
      role: 'Head of Operations',
      image: '/images/team/operations.jpg',
      description: 'Michael ensures our operations run smoothly across all our locations, maintaining our high service standards.'
    },
    {
      name: 'Grace Muthoni',
      role: 'Head of Sales',
      image: '/images/team/sales.jpg',
      description: 'Grace leads our sales team with a focus on understanding client needs and matching them with perfect properties.'
    }
  ]

  const features = [
    'Verified property listings',
    'Professional photography',
    'Virtual property tours',
    'Legal documentation support',
    'Mortgage assistance',
    '24/7 customer support',
    'Market analysis reports',
    'Investment advisory services'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Xillix
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Kenya's leading real estate platform, connecting dreams with properties since 2009
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100">
                <Link href="/properties">Browse Properties</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2009, Xillix began with a simple mission: to make real estate accessible, 
                  transparent, and efficient for everyone in Kenya. What started as a small team of 
                  passionate real estate professionals has grown into the country's most trusted property platform.
                </p>
                <p>
                  Over the years, we've helped thousands of families find their dream homes, assisted 
                  investors in building their portfolios, and supported businesses in finding the perfect 
                  commercial spaces. Our commitment to excellence and innovation has made us a household 
                  name in Kenyan real estate.
                </p>
                <p>
                  Today, we continue to evolve, embracing new technologies and expanding our services 
                  to serve our clients better. From Nairobi to Mombasa, from Kisumu to Nakuru, 
                  we're here to make your real estate journey seamless and successful.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-green-600 rounded-lg p-8 text-white">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-700 rounded-full"></div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-500 rounded-full"></div>
                <h3 className="text-2xl font-bold mb-4">15+ Years of Excellence</h3>
                <p>
                  Serving Kenya's real estate needs with dedication, integrity, and innovation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These values guide everything we do and shape our commitment to our clients
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <value.icon className="h-12 w-12 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to your real estate success
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-16 w-16 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-green-600 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600 mb-4">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg">
                  To democratize real estate in Kenya by providing a transparent, efficient, 
                  and technology-driven platform that connects property seekers with their 
                  perfect homes and investment opportunities.
                </p>
              </CardContent>
            </Card>
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600 mb-4">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg">
                  To be East Africa's leading real estate platform, known for innovation, 
                  trust, and exceptional service, making property ownership accessible to 
                  every Kenyan family and business.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Xillix?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive real estate services that set us apart from the competition
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Property?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have found their perfect homes through Xillix
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100">
              <Link href="/properties">Start Your Search</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}