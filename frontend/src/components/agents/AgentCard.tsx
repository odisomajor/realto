import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  StarIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Card, CardContent } from '@/components/ui/Card'
import { Agent } from '@/types'
import { useAuth } from '@/lib/auth'

interface AgentCardProps {
  agent: Agent
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const { isAuthenticated, hasHydrated } = useAuth()
  const {
    id,
    name,
    avatar,
    bio,
    company,
    specializations,
    experience,
    propertiesListed,
    propertiesSold,
    rating,
    reviews,
    phone,
    email
  } = agent

  // Prevent hydration mismatch by not showing auth-dependent content until hydrated
  const showAuthContent = hasHydrated && isAuthenticated

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarSolidIcon className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      )
    }

    return stars
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Agent Avatar */}
          <div className="flex-shrink-0">
            <Image
              src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=80`}
              alt={name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/agents/${id}`}>
              <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors cursor-pointer">
                {name}
              </h3>
            </Link>
            
            {/* Rating */}
            <div className="flex items-center mt-1 mb-2">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {rating.toFixed(1)} ({reviews} reviews)
              </span>
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {bio}
              </p>
            )}

            {/* Specializations */}
            <div className="flex flex-wrap gap-1 mb-3">
              {specializations.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {spec}
                </span>
              ))}
              {specializations.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{specializations.length - 3} more
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{experience}</div>
                <div className="text-xs text-gray-500">Years Exp.</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{propertiesListed}</div>
                <div className="text-xs text-gray-500">Listed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{propertiesSold}</div>
                <div className="text-xs text-gray-500">Sold</div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center mb-2">
            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="font-medium text-gray-900">{company.name}</span>
          </div>
          
          {showAuthContent ? (
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span>{company.location}</span>
              </div>
              
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span>{company.phone}</span>
              </div>
              
              {company.website && (
                <div className="flex items-center">
                  <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          ) : hasHydrated ? (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Contact information available to logged-in users</p>
              <Link
                href="/auth/login"
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Sign in to view details
              </Link>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <Link
            href={`/agents/${id}`}
            className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            View Properties
          </Link>
          {showAuthContent ? (
            <a
              href={`tel:${phone}`}
              className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Call Now
            </a>
          ) : hasHydrated ? (
            <Link
              href="/auth/login"
              className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Sign in to Call
            </Link>
          ) : (
            <div className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AgentCard
