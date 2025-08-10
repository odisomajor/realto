'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export interface PropertyImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order: number;
}

interface PropertyImageManagerProps {
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
  onImageUpload?: (files: FileList) => Promise<string[]>;
  maxImages?: number;
  className?: string;
}

export default function PropertyImageManager({
  images,
  onImagesChange,
  onImageUpload,
  maxImages = 10,
  className = ''
}: PropertyImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !onImageUpload) return;

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls = await onImageUpload(files);
      
      const newImages: PropertyImage[] = uploadedUrls.map((url, index) => ({
        id: `new-${Date.now()}-${index}`,
        url,
        order: images.length + index,
        isPrimary: images.length === 0 && index === 0 // First image is primary if no images exist
      }));

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (imageId: string) => {
    const updatedImages = images
      .filter(img => img.id !== imageId)
      .map((img, index) => ({ ...img, order: index }));
    
    // If removed image was primary, make first image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    
    onImagesChange(updatedImages);
  };

  const handleSetPrimary = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    onImagesChange(updatedImages);
  };

  const handleMoveImage = (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[currentIndex], updatedImages[newIndex]] = 
    [updatedImages[newIndex], updatedImages[currentIndex]];

    // Update order values
    updatedImages.forEach((img, index) => {
      img.order = index;
    });

    onImagesChange(updatedImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const updatedImages = [...images];
    const draggedImage = updatedImages[draggedIndex];
    
    // Remove dragged image
    updatedImages.splice(draggedIndex, 1);
    
    // Insert at new position
    updatedImages.splice(dropIndex, 0, draggedImage);
    
    // Update order values
    updatedImages.forEach((img, index) => {
      img.order = index;
    });

    onImagesChange(updatedImages);
    setDraggedIndex(null);
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative group cursor-move border-2 border-dashed border-gray-200 rounded-lg overflow-hidden ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="aspect-square relative">
              <img
                src={image.url}
                alt={image.alt || `Property image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <StarIconSolid className="w-3 h-3 mr-1" />
                  Primary
                </div>
              )}

              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                  {/* Set as Primary */}
                  {!image.isPrimary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetPrimary(image.id)}
                      className="bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <StarIcon className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Move Up */}
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveImage(image.id, 'up')}
                      className="bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Move Down */}
                  {index < images.length - 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveImage(image.id, 'down')}
                      className="bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowDownIcon className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Remove */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveImage(image.id)}
                    className="bg-white text-red-600 hover:bg-red-50"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : (
              <>
                <PlusIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Add Image</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <PhotoIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Image Guidelines:</p>
            <ul className="space-y-1 text-xs">
              <li>• Upload high-quality images (minimum 800x600px)</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Maximum file size: 5MB per image</li>
              <li>• Drag and drop to reorder images</li>
              <li>• Click the star icon to set as primary image</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
