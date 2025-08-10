'use client'

import { useState } from 'react'
import { PropertyMortgageCalculator } from '@/components/properties/PropertyMortgageCalculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator,
  TrendingUp,
  Building,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Phone,
  Mail,
  Star,
  Info,
  DollarSign,
  Percent
} from 'lucide-react'

// Mock property data - in real app, this would come from API
const mockProperty = {
  id: '1',
  title: 'Modern 4-Bedroom Villa in Karen',
  price: 15000000,
  location: 'Karen, Nairobi',
  type: 'Villa',
  bedrooms: 4,
  bathrooms: 3,
  area: 350,
  images: ['/api/placeholder/400/300'],
  agent: {
    name: 'Sarah Johnson',
    phone: '+254 700 123 456',
    email: 'sarah@realestate.com',
    rating: 4.8,
    reviews: 124
  },
  features: [
    'Swimming Pool',
    'Garden',
    'Parking',
    'Security',
    'Modern Kitchen',
    'Master En-suite'
  ]
}

const currentRates = {
  prime: 12.5,
  commercial: 14.0,
  mortgage: 11.5,
  savings: 8.0
}

const lenderOptions = [
  {
    name: 'KCB Bank',
    rate: 11.5,
    maxLTV: 90,
    processingFee: 1.5,
    logo: '/api/placeholder/60/30'
  },
  {
    name: 'Equity Bank',
    rate: 12.0,
    maxLTV: 85,
    processingFee: 1.0,
    logo: '/api/placeholder/60/30'
  },
  {
    name: 'Standard Chartered',
    rate: 11.8,
    maxLTV: 80,
    processingFee: 2.0,
    logo: '/api/placeholder/60/30'
  },
  {
    name: 'ABSA Bank',
    rate: 12.2,
    maxLTV: 85,
    processingFee: 1.5,
    logo: '/api/placeholder/60/30'
  }
]

export default function MortgageCalculatorPage() {
  const [selectedProperty, setSelectedProperty] = useState(mockProperty)
  const [calculation, setCalculation] = useState<any>(null)
  const [showComparison, setShowComparison] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateAffordability = (monthlyPayment: number) => {
    // Assuming 28% rule - monthly payment should not exceed 28% of gross income
    const requiredIncome = monthlyPayment / 0.28
    return requiredIncome
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mortgage Calculator</h1>
          <p className="text-gray-600">
            Calculate your monthly mortgage payments and explore financing options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calculator */}
          <div className="lg:col-span-2">
            <PropertyMortgageCalculator
              propertyPrice={selectedProperty.price}
              onCalculationChange={setCalculation}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedProperty.title}</h3>
                  <div className="text-2xl font-bold text-green-600 mb-3">
                    {formatCurrency(selectedProperty.price)}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedProperty.location}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {selectedProperty.bedrooms}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {selectedProperty.bathrooms}
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        {selectedProperty.area}m²
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Interest Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-green-600" />
                  Current Interest Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prime Rate</span>
                  <span className="font-semibold">{currentRates.prime}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mortgage Rate</span>
                  <span className="font-semibold text-green-600">{currentRates.mortgage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Commercial Rate</span>
                  <span className="font-semibold">{currentRates.commercial}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Savings Rate</span>
                  <span className="font-semibold">{currentRates.savings}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Affordability Indicator */}
            {calculation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Affordability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Required Monthly Income</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(calculateAffordability(calculation.monthlyPayment))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Debt-to-Income Ratio</div>
                    <div className="text-lg font-semibold">28%</div>
                    <div className="text-xs text-gray-500">Recommended maximum</div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <strong>Tip:</strong> Consider additional costs like maintenance, 
                        utilities, and property management fees.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agent Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Property Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {selectedProperty.agent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{selectedProperty.agent.name}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedProperty.agent.rating} ({selectedProperty.agent.reviews} reviews)
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {selectedProperty.agent.phone}
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lender Comparison */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Compare Lenders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {lenderOptions.map((lender, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={lender.logo}
                        alt={lender.name}
                        className="w-12 h-6 object-contain"
                      />
                      <div className="font-semibold">{lender.name}</div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Rate</span>
                        <span className="font-semibold text-green-600">{lender.rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max LTV</span>
                        <span className="font-semibold">{lender.maxLTV}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fee</span>
                        <span className="font-semibold">{lender.processingFee}%</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4" size="sm" variant="outline">
                      Get Quote
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <strong>Note:</strong> Interest rates and terms are subject to change and 
                    depend on your credit score, income, and other factors. Contact lenders 
                    directly for personalized quotes.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
