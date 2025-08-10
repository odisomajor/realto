'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { propertyApi } from '@/lib/api';
import LocationPicker from '@/components/maps/LocationPicker';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  location: string;
  county: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  bedrooms: string;
  bathrooms: string;
  area: string;
  type: 'sale' | 'rent';
  category: 'residential' | 'commercial' | 'land';
  features: string[];
  images: string[];
}

export default function NewPropertyPage() {
  return (
    <ProtectedRoute requiredRole="AGENT">
      <PropertySubmissionForm />
    </ProtectedRoute>
  );
}

function PropertySubmissionForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    location: '',
    county: '',
    coordinates: undefined,
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'sale',
    category: 'residential',
    features: [],
    images: []
  });

  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');

  const handleLocationSelect = (location: { address: string; coordinates: { lat: number; lng: number; }; county?: string; city?: string; }) => {
    setFormData(prev => ({
      ...prev,
      coordinates: location.coordinates,
      location: location.address,
      county: location.county || prev.county
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Please ensure all files are images under 5MB.');
    }

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('image', file);
        
        // Mock upload - replace with actual upload service
        const mockUrl = `https://picsum.photos/800/600?random=${Date.now()}-${Math.random()}`;
        uploadedUrls.push(mockUrl);
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return uploadedUrls;
    } catch (error) {
      throw new Error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages();

      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area),
        images: uploadedImageUrls,
        agentId: user?.id
      };

      const response = await propertyApi.createProperty(propertyData);
      
      // Clean up preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      router.push(`/properties/${response.data.id}?success=Property created successfully`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const kenyaCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
    'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
    'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
    'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-2">Create a new property listing for your clients</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Fill in the information below to create a new property listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe the property, its features, and what makes it special..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (KES)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select County</option>
                    {kenyaCounties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location and Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Location
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (sq meters)
                  </label>
                  <Input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <Input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <Input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Google Maps Location Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Location on Map *
                </label>
                <div className="h-96 border border-gray-300 rounded-md overflow-hidden">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={formData.coordinates ? {
                      address: formData.location,
                      coordinates: formData.coordinates,
                      county: formData.county
                    } : undefined}
                  />
                </div>
                {formData.coordinates && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Features
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature (e.g., Swimming Pool)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Images
                </label>
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload up to 10 images. Max 5MB per image. Supported formats: JPG, PNG, WebP
                  </p>
                </div>
                
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {uploadingImages && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Uploading images...</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading || uploadingImages}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading || uploadingImages}
                  disabled={isLoading || uploadingImages || imageFiles.length === 0}
                >
                  {uploadingImages ? 'Uploading Images...' : isLoading ? 'Creating Property...' : 'Create Property'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
