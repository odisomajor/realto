import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPinIcon, HomeIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/Card'
import { Property } from '@/types'
import { formatPrice, formatArea } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const {
    id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    type,
    images,
    status,
  } = property

  const primaryImage = images[0] || '/placeholder-property.jpg'

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/properties/${id}`}>
        <div className="relative">
          <Image
            src={primaryImage}
            alt={title}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                type === 'sale' 
                  ? 'bg-green-100 text-green-800' 
                  : type === 'rent'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
              {type === 'sale' ? 'For Sale' : type === 'rent' ? 'For Rent' : 'Upcoming Project'}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'available' 
                ? 'bg-green-100 text-green-800'
                : status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : status === 'under-construction'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status === 'under-construction' ? 'Under Construction' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/properties/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
            {title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-green-600">
            <BanknotesIcon className="h-5 w-5 mr-1" />
            <span className="text-xl font-bold">
              {type === 'upcoming' ? `From ${formatPrice(price)}` : formatPrice(price)}
            </span>
            {type === 'rent' && <span className="text-sm text-gray-500 ml-1">/month</span>}
            {type === 'upcoming' && <span className="text-sm text-gray-500 ml-1">expected</span>}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {bedrooms > 0 && (
              <div className="flex items-center">
                <HomeIcon className="h-4 w-4 mr-1" />
                <span>{bedrooms} bed</span>
              </div>
            )}
            {bathrooms > 0 && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
                </svg>
                <span>{bathrooms} bath</span>
              </div>
            )}
          </div>
          <div className="text-gray-500">
            {formatArea(area, property.category)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyCard
