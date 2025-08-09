'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { propertyApi } from '@/lib/api'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { toast } from 'react-hot-toast'

interface Property {
  id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  zipCode: string
  type: string
  status: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  agent: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true)
        const response = await propertyApi.getFavorites()
        setFavorites(response.data.data || [])
      } catch (error) {
        console.error('Error fetching favorites:', error)
        toast.error('Failed to load favorite properties')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      await propertyApi.toggleFavorite(propertyId)
      // Remove from favorites list
      setFavorites(favorites.filter(property => property.id !== propertyId))
      toast.success('Property removed from favorites')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Favorite Properties</h1>
        <p className="mt-2 text-lg text-gray-600">
          View and manage your saved properties
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No favorite properties yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Browse properties and click the heart icon to add them to your favorites
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/properties')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Browse Properties
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onFavoriteToggle={() => handleToggleFavorite(property.id)}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FavoritesPageWrapper() {
  return (
    <ProtectedRoute>
      <FavoritesPage />
    </ProtectedRoute>
  )
}