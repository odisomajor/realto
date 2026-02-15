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
      // In a real application, we would upload images first and get their URLs
      // For now, we'll convert File objects to base64 strings or placeholders if not implemented
      const formattedData = {
        ...propertyData,
        price: parseFloat(propertyData.price),
        bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : null,
        bathrooms: propertyData.bathrooms ? parseFloat(propertyData.bathrooms) : null,
        squareFootage: propertyData.squareFootage ? parseInt(propertyData.squareFootage) : null,
        yearBuilt: propertyData.yearBuilt ? parseInt(propertyData.yearBuilt) : null,
        // Ensure coordinates are properly formatted if they exist
        latitude: propertyData.coordinates?.lat,
        longitude: propertyData.coordinates?.lng,
        // Handle images - in a real app this would involve file upload to S3/Cloudinary
        // For this demo, we'll extract base64 or skip if they are File objects
        images: [] // Placeholder until image upload is implemented
      };

      const response = await propertyApi.createProperty(formattedData);
      router.push(`/properties/${response.data.data.id}?success=Property created successfully`);
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
