'use client';

import { useRouter } from 'next/navigation';
import { propertyApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PropertyFormWizard from '@/components/properties/PropertyFormWizard';

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePropertyCreate = async (propertyData: any) => {
    try {
      const response = await propertyApi.createProperty(propertyData);
      router.push(`/properties/${response.data.data.id}?success=Property created successfully`);
      return response;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  };

  return (
    <ProtectedRoute requiredRole="AGENT">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="text-gray-600 mt-2">Create a new property listing with our step-by-step wizard</p>
          </div>

          <PropertyFormWizard
            mode="create"
            onSubmit={handlePropertyCreate}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
