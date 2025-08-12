'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { propertyApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PropertyFormWizard from '@/components/properties/PropertyFormWizard';
import { Property } from '@/types';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertyApi.getProperty(params.id as string);
      const propertyData = response.data;
      
      // Check if user owns this property or is admin
      if (propertyData.userId !== user?.id && user?.role !== 'ADMIN') {
        router.push('/properties/my-properties?error=Unauthorized');
        return;
      }

      setProperty(propertyData);
    } catch (err: any) {
      setError('Failed to load property details');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyUpdate = async (propertyData: any): Promise<void> => {
    try {
      await propertyApi.updateProperty(params.id as string, propertyData);
      router.push('/properties/my-properties?success=Property updated successfully');
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="AGENT">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading property...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !property) {
    return (
      <ProtectedRoute requiredRole="AGENT">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Property</h2>
              <p className="text-gray-600 mb-6">{error || 'Property not found'}</p>
              <button
                onClick={() => router.back()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="AGENT">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600 mt-2">Update your property listing details</p>
          </div>

          <PropertyFormWizard
            mode="edit"
            initialData={{
              title: property.title,
              description: property.description,
              propertyType: property.category?.toUpperCase() || 'HOUSE',
              listingType: property.type?.toUpperCase() || 'FOR_SALE',
              address: property.location,
              city: '', // Property interface doesn't have city field
              county: '', // Property interface doesn't have county field
              price: property.price.toString(),
              currency: 'KES', // Property interface doesn't have currency field
              bedrooms: property.bedrooms?.toString() || '0',
              bathrooms: property.bathrooms?.toString() || '0',
              squareFootage: property.area?.toString() || '0',
              yearBuilt: '', // Property interface doesn't have yearBuilt field
              features: property.features || [],
              amenities: [], // Property interface doesn't have amenities field
              images: [], // Initialize as empty File array since we can't convert string URLs to Files
              virtualTour: '', // Property interface doesn't have virtualTour field
              status: property.status?.toUpperCase() || 'ACTIVE',
              featured: property.featured || false
            }}
            onSubmit={handlePropertyUpdate}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}