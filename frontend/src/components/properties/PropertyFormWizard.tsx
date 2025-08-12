'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import LocationPicker from '@/components/maps/LocationPicker'
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  X, 
  Plus,
  MapPin,
  Home,
  DollarSign,
  Camera,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface PropertyFormData {
  // Basic Information
  title: string
  description: string
  propertyType: string
  listingType: string
  
  // Location
  address: string
  city: string
  county: string
  coordinates?: {
    lat: number
    lng: number
  }
  
  // Pricing
  price: string
  currency: string
  
  // Property Details
  bedrooms: string
  bathrooms: string
  squareFootage: string
  yearBuilt: string
  
  // Features & Amenities
  features: string[]
  amenities: string[]
  
  // Media
  images: File[]
  virtualTour: string
  
  // Additional Info
  status: string
  featured: boolean
}

interface ValidationErrors {
  [key: string]: string
}

interface PropertyFormWizardProps {
  initialData?: Partial<PropertyFormData>
  onSubmit: (data: PropertyFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', icon: FileText },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'details', title: 'Property Details', icon: Home },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
  { id: 'media', title: 'Photos & Media', icon: Camera },
  { id: 'review', title: 'Review & Submit', icon: Check }
]

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'House' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'LAND', label: 'Land' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'CONTAINER', label: 'Container' }
]

const LISTING_TYPES = [
  { value: 'FOR_SALE', label: 'For Sale' },
  { value: 'FOR_RENT', label: 'For Rent' },
  { value: 'UPCOMING', label: 'Upcoming Project' }
]

const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
]

const COMMON_FEATURES = [
  'Swimming Pool', 'Garden', 'Parking', 'Security', 'Balcony', 'Terrace',
  'Fireplace', 'Air Conditioning', 'Heating', 'Furnished', 'Pet Friendly',
  'Gym', 'Elevator', 'Storage', 'Laundry', 'Internet', 'Cable TV'
]

const COMMON_AMENITIES = [
  'Shopping Center', 'School', 'Hospital', 'Public Transport', 'Restaurant',
  'Bank', 'Pharmacy', 'Gas Station', 'Park', 'Beach', 'Golf Course',
  'Airport', 'Highway Access', 'Water Supply', 'Electricity', 'Sewerage'
]

export default function PropertyFormWizard({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}: PropertyFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    propertyType: '',
    listingType: '',
    address: '',
    city: '',
    county: '',
    coordinates: undefined,
    price: '',
    currency: 'KES',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    yearBuilt: '',
    features: [],
    amenities: [],
    images: [],
    virtualTour: '',
    status: 'ACTIVE',
    featured: false,
    ...initialData
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  const updateFormData = useCallback((updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear related errors when field is updated
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }, [])

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: ValidationErrors = {}

    switch (stepIndex) {
      case 0: // Basic Information
        if (!formData.title.trim()) newErrors.title = 'Title is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.propertyType) newErrors.propertyType = 'Property type is required'
        if (!formData.listingType) newErrors.listingType = 'Listing type is required'
        break
      
      case 1: // Location
        if (!formData.address.trim()) newErrors.address = 'Address is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.county) newErrors.county = 'County is required'
        break
      
      case 2: // Property Details
        if (formData.propertyType !== 'LAND') {
          if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) {
            newErrors.bedrooms = 'Valid number of bedrooms is required'
          }
          if (!formData.bathrooms || parseInt(formData.bathrooms) < 0) {
            newErrors.bathrooms = 'Valid number of bathrooms is required'
          }
        }
        if (!formData.squareFootage || parseFloat(formData.squareFootage) <= 0) {
          newErrors.squareFootage = 'Valid square footage is required'
        }
        break
      
      case 3: // Pricing
        if (!formData.price || parseFloat(formData.price) <= 0) {
          newErrors.price = 'Valid price is required'
        }
        break
      
      case 4: // Media
        if (formData.images.length === 0) {
          newErrors.images = 'At least one image is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleLocationSelect = (location: {
    address: string
    coordinates: { lat: number; lng: number }
    county?: string
    city?: string
  }) => {
    updateFormData({
      coordinates: location.coordinates,
      address: location.address,
      county: location.county || formData.county,
      city: location.city || formData.city
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        images: 'Some files were rejected. Please ensure all files are images under 5MB.'
      }))
    }

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    
    updateFormData({
      images: [...formData.images, ...validFiles]
    })
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    updateFormData({
      images: formData.images.filter((_, i) => i !== index)
    })
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const addFeature = (feature: string) => {
    if (!formData.features.includes(feature)) {
      updateFormData({
        features: [...formData.features, feature]
      })
    }
  }

  const removeFeature = (feature: string) => {
    updateFormData({
      features: formData.features.filter(f => f !== feature)
    })
  }

  const addAmenity = (amenity: string) => {
    if (!formData.amenities.includes(amenity)) {
      updateFormData({
        amenities: [...formData.amenities, amenity]
      })
    }
  }

  const removeAmenity = (amenity: string) => {
    updateFormData({
      amenities: formData.amenities.filter(a => a !== amenity)
    })
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      await onSubmit(formData)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Enter property title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Describe your property..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateFormData({ propertyType: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.propertyType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select property type</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.propertyType && (
                  <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type *
                </label>
                <select
                  value={formData.listingType}
                  onChange={(e) => updateFormData({ listingType: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.listingType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select listing type</option>
                  {LISTING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.listingType && (
                  <p className="text-red-500 text-sm mt-1">{errors.listingType}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 1: // Location
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => updateFormData({ address: e.target.value })}
                placeholder="Enter property address"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                  placeholder="Enter city"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <select
                  value={formData.county}
                  onChange={(e) => updateFormData({ county: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.county ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select county</option>
                  {KENYA_COUNTIES.map(county => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
                {errors.county && (
                  <p className="text-red-500 text-sm mt-1">{errors.county}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location on Map
              </label>
              <div className="border rounded-lg overflow-hidden">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={formData.coordinates ? {
                    address: formData.address,
                    coordinates: formData.coordinates,
                    county: formData.county,
                    city: formData.city
                  } : undefined}
                  height="300px"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Click on the map to set the exact location of your property
              </p>
            </div>
          </div>
        )

      case 2: // Property Details
        return (
          <div className="space-y-6">
            {formData.propertyType !== 'LAND' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => updateFormData({ bedrooms: e.target.value })}
                    placeholder="Number of bedrooms"
                    className={errors.bedrooms ? 'border-red-500' : ''}
                  />
                  {errors.bedrooms && (
                    <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => updateFormData({ bathrooms: e.target.value })}
                    placeholder="Number of bathrooms"
                    className={errors.bathrooms ? 'border-red-500' : ''}
                  />
                  {errors.bathrooms && (
                    <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.squareFootage}
                  onChange={(e) => updateFormData({ squareFootage: e.target.value })}
                  placeholder="Square footage"
                  className={errors.squareFootage ? 'border-red-500' : ''}
                />
                {errors.squareFootage && (
                  <p className="text-red-500 text-sm mt-1">{errors.squareFootage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Built
                </label>
                <Input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.yearBuilt}
                  onChange={(e) => updateFormData({ yearBuilt: e.target.value })}
                  placeholder="Year built"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => addFeature(feature)}
                    disabled={formData.features.includes(feature)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.features.includes(feature)
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map(feature => (
                    <Badge
                      key={feature}
                      className="bg-green-100 text-green-800 flex items-center gap-1"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-1 hover:text-green-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nearby Amenities
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_AMENITIES.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => addAmenity(amenity)}
                    disabled={formData.amenities.includes(amenity)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.amenities.includes(amenity)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map(amenity => (
                    <Badge
                      key={amenity}
                      className="bg-blue-100 text-blue-800 flex items-center gap-1"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 3: // Pricing
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="flex">
                <select
                  value={formData.currency}
                  onChange={(e) => updateFormData({ currency: e.target.value })}
                  className="px-3 py-2 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <Input
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) => updateFormData({ price: e.target.value })}
                  placeholder="Enter price"
                  className={`rounded-l-none ${errors.price ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                {formData.listingType === 'FOR_RENT' 
                  ? 'Enter monthly rent amount'
                  : 'Enter total sale price'
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => updateFormData({ featured: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Feature this property (additional cost may apply)
              </label>
            </div>
          </div>
        )

      case 4: // Media
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Upload Property Images
                  </p>
                  <p className="text-sm text-gray-600">
                    Drag and drop or click to select images (Max 5MB each)
                  </p>
                </label>
              </div>
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>

            {imagePreviewUrls.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Images ({imagePreviewUrls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`Property image ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Virtual Tour URL (Optional)
              </label>
              <Input
                type="url"
                value={formData.virtualTour}
                onChange={(e) => updateFormData({ virtualTour: e.target.value })}
                placeholder="https://example.com/virtual-tour"
              />
              <p className="text-sm text-gray-600 mt-1">
                Add a link to a virtual tour or 360° view of your property
              </p>
            </div>
          </div>
        )

      case 5: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Your Property Listing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Title:</span> {formData.title}</p>
                    <p><span className="font-medium">Type:</span> {PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.label}</p>
                    <p><span className="font-medium">Listing:</span> {LISTING_TYPES.find(t => t.value === formData.listingType)?.label}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Address:</span> {formData.address}</p>
                    <p><span className="font-medium">City:</span> {formData.city}</p>
                    <p><span className="font-medium">County:</span> {formData.county}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {formData.propertyType !== 'LAND' && (
                      <>
                        <p><span className="font-medium">Bedrooms:</span> {formData.bedrooms}</p>
                        <p><span className="font-medium">Bathrooms:</span> {formData.bathrooms}</p>
                      </>
                    )}
                    <p><span className="font-medium">Square Footage:</span> {formData.squareFootage} sq ft</p>
                    {formData.yearBuilt && (
                      <p><span className="font-medium">Year Built:</span> {formData.yearBuilt}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pricing</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Price:</span> {formData.currency} {parseFloat(formData.price).toLocaleString()}</p>
                    <p><span className="font-medium">Featured:</span> {formData.featured ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {formData.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map(feature => (
                      <Badge key={feature} className="bg-green-100 text-green-800">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.amenities.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Nearby Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map(amenity => (
                      <Badge key={amenity} className="bg-blue-100 text-blue-800">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Images</h4>
                <p className="text-sm text-gray-600">
                  {formData.images.length} image(s) uploaded
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Before you submit
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please review all information carefully. Once submitted, your property will be reviewed by our team before going live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : isActive
                      ? 'border-green-600 text-green-600'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      isActive ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-16 h-0.5 ml-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep === STEPS.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Submitting...' : `${mode === 'edit' ? 'Update' : 'Submit'} Property`}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={isLoading}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}