'use client'

import { useAuth } from '@/contexts/AuthContext'
import PropertyRecommendations from '@/components/properties/PropertyRecommendations'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RecommendationsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-yellow-500" />
                Property Recommendations
              </h1>
              <p className="text-gray-600">
                Discover properties tailored to your preferences and search history
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Component */}
        <PropertyRecommendations />
      </div>
    </ProtectedRoute>
  )
}