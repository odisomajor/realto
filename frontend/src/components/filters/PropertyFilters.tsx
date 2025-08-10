'use client'

import { useState } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// Kenya counties list based on the 2010 Constitution
const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru',
  'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi',
  'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho',
  'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya',
  'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
]

interface PropertyFiltersProps {
  onFilterChange: (filters: any) => void
}

export default function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  })
  
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  
  const filteredCounties = KENYA_COUNTIES.filter(county =>
    county.toLowerCase().includes(locationSearch.toLowerCase())
  )

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleLocationSelect = (county: string) => {
    handleFilterChange('location', county)
    setLocationSearch(county)
    setLocationDropdownOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: ''
    }
    setFilters(clearedFilters)
    setLocationSearch('')
    onFilterChange(clearedFilters)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filter Properties</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-green-600 hover:text-green-800"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Location Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location (County)
          </label>
          <div className="relative">
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value)
                setLocationDropdownOpen(true)
                if (e.target.value === '') {
                  handleFilterChange('location', '')
                }
              }}
              onFocus={() => setLocationDropdownOpen(true)}
              placeholder="Search counties..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            
            {locationDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredCounties.length > 0 ? (
                  filteredCounties.map((county) => (
                    <button
                      key={county}
                      onClick={() => handleLocationSelect(county)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {county}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No counties found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (KSH)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>
    </div>
  )
}
