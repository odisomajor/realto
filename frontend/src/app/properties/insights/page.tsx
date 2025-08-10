'use client'

import { useState } from 'react'
import { PropertyMarketInsights } from '@/components/properties/PropertyMarketInsights'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  MapPin, 
  Building, 
  DollarSign,
  Search,
  Filter,
  Download,
  Share2,
  Bell
} from 'lucide-react'

export default function PropertyInsightsPage() {
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    priceRange: { min: 0, max: 0 }
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleLocationChange = (location: string) => {
    setFilters(prev => ({ ...prev, location }))
  }

  const handlePropertyTypeChange = (propertyType: string) => {
    setFilters(prev => ({ ...prev, propertyType }))
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, priceRange: { min, max } }))
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      propertyType: '',
      priceRange: { min: 0, max: 0 }
    })
  }

  const exportReport = () => {
    // Implementation for exporting market report
    console.log('Exporting market report...')
  }

  const shareInsights = () => {
    // Implementation for sharing insights
    if (navigator.share) {
      navigator.share({
        title: 'Property Market Insights',
        text: 'Check out these property market insights and trends',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const subscribeToAlerts = () => {
    // Implementation for subscribing to market alerts
    console.log('Subscribing to market alerts...')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Property Market Insights
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive analysis of property market trends, pricing, and investment opportunities
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button
                variant="outline"
                onClick={subscribeToAlerts}
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
              
              <Button
                variant="outline"
                onClick={shareInsights}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Market Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Enter location..."
                      value={filters.location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <Select value={filters.propertyType} onValueChange={handlePropertyTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => handlePriceRangeChange(
                      parseInt(e.target.value) || 0,
                      filters.priceRange.max
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.priceRange.max || ''}
                    onChange={(e) => handlePriceRangeChange(
                      filters.priceRange.min,
                      parseInt(e.target.value) || 0
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Activity</p>
                  <p className="text-2xl font-bold text-gray-900">High</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-gray-900">KES 13.1M</p>
                  <p className="text-xs text-green-600">+2.7% this quarter</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hot Locations</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-xs text-gray-600">Karen, Westlands, Runda</p>
                </div>
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Best ROI</p>
                  <p className="text-2xl font-bold text-gray-900">9.1%</p>
                  <p className="text-xs text-gray-600">Villa properties</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights Component */}
        <PropertyMarketInsights
          location={filters.location || undefined}
          propertyType={filters.propertyType || undefined}
          priceRange={filters.priceRange.min > 0 || filters.priceRange.max > 0 ? filters.priceRange : undefined}
        />

        {/* Additional Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Market Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Market Reports</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download detailed quarterly and annual market analysis reports
                </p>
                <Button variant="outline" size="sm">
                  Download Reports
                </Button>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Price Alerts</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get notified when market conditions change in your areas of interest
                </p>
                <Button variant="outline" size="sm">
                  Set Up Alerts
                </Button>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Investment Guide</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Learn about property investment strategies and market timing
                </p>
                <Button variant="outline" size="sm">
                  View Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> Market insights and predictions are based on historical data and current trends. 
            Property investments carry risks and past performance does not guarantee future results. 
            Please consult with financial advisors before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
