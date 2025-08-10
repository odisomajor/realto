'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [propertyType, setPropertyType] = useState('sale')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('location', searchQuery)
    if (propertyType) params.set('type', propertyType)
    
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Kenya's Property Marketplace
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
            Discover the perfect property for sale or rent in Kenya's most desirable locations
          </p>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            {isClient ? (
              <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {/* Property Type Selector */}
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I want to
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setPropertyType('sale')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          propertyType === 'sale'
                            ? 'bg-green-600 text-white'
                            : 'text-gray-700 hover:text-green-600'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyType('rent')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          propertyType === 'rent'
                            ? 'bg-green-600 text-white'
                            : 'text-gray-700 hover:text-green-600'
                        }`}
                      >
                        Rent
                      </button>
                    </div>
                  </div>

                  {/* Location Search */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Enter city, neighborhood, or area"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="flex-shrink-0">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto px-8"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {/* Property Type Selector */}
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I want to
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white"
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700"
                      >
                        Rent
                      </button>
                    </div>
                  </div>

                  {/* Location Search */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter city, neighborhood, or area"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 text-gray-900"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full md:w-auto"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                      Search
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-green-100">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-green-100">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-green-100">Expert Agents</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
