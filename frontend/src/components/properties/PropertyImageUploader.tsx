'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload,
  X,
  Image as ImageIcon,
  Star,
  Edit,
  Trash2,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Grid,
  List
} from 'lucide-react';

interface PropertyImage {
  id: string;
  file?: File;
  url: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  uploadProgress: number;
  size: number;
  type: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface PropertyImageUploaderProps {
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  allowReorder?: boolean;
  allowEdit?: boolean;
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DEFAULT_MAX_FILE_SIZE = 10; // 10MB
const DEFAULT_MAX_IMAGES = 20;

export default function PropertyImageUploader({
  images,
  onImagesChange,
  maxImages = DEFAULT_MAX_IMAGES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  allowReorder = true,
  allowEdit = true,
  className = ''
}: PropertyImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        console.warn(`File ${file.name} has unsupported type: ${file.type}`);
        return false;
      }
      
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        console.warn(`File ${file.name} is too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return false;
      }
      
      return true;
    });

    // Check total image limit
    const remainingSlots = maxImages - images.length;
    const filesToProcess = validFiles.slice(0, remainingSlots);

    const newImages: PropertyImage[] = filesToProcess.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      isPrimary: images.length === 0 && index === 0,
      order: images.length + index,
      uploadStatus: 'pending',
      uploadProgress: 0,
      size: file.size,
      type: file.type
    }));

    onImagesChange([...images, ...newImages]);

    // Start upload simulation for each new image
    newImages.forEach(image => {
      simulateUpload(image.id);
    });
  }, [images, maxImages, maxFileSize, acceptedTypes, onImagesChange]);

  const simulateUpload = useCallback((imageId: string) => {
    const updateProgress = (progress: number) => {
      onImagesChange(prevImages => 
        prevImages.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                uploadStatus: progress === 100 ? 'completed' : 'uploading',
                uploadProgress: progress 
              }
            : img
        )
      );
    };

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      updateProgress(progress);
    }, 200);
  }, [onImagesChange]);

  const removeImage = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // If removed image was primary, make the first remaining image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    
    // Reorder remaining images
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index
    }));
    
    onImagesChange(reorderedImages);
  }, [images, onImagesChange]);

  const setPrimaryImage = useCallback((imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const updateImageCaption = useCallback((imageId: string, caption: string) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, caption } : img
    );
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const handleDragStart = useCallback((e: React.DragEvent, imageId: string) => {
    setDraggedImageId(imageId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedImageId(null);
  }, []);

  const handleReorder = useCallback((draggedId: string, targetId: string) => {
    if (!allowReorder || draggedId === targetId) return;

    const draggedIndex = images.findIndex(img => img.id === draggedId);
    const targetIndex = images.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    // Update order values
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }));

    onImagesChange(reorderedImages);
  }, [images, allowReorder, onImagesChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadStatusIcon = (status: PropertyImage['uploadStatus']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const openImageEditor = (image: PropertyImage) => {
    setSelectedImage(image);
    setShowImageEditor(true);
  };

  const openImageViewer = (image: PropertyImage) => {
    setSelectedImage(image);
    setShowImageViewer(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Property Images</CardTitle>
              <CardDescription>
                Upload up to {maxImages} images. Maximum file size: {maxFileSize}MB each.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Badge variant="secondary">
                {images.length} / {maxImages}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? 'Drop images here' : 'Upload property images'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= maxImages}
            >
              Select Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
            <CardDescription>
              Manage your property images. Drag to reorder, click to edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative group ${
                    viewMode === 'grid' ? 'aspect-square' : 'flex items-center gap-4 p-4 border rounded-lg'
                  } ${draggedImageId === image.id ? 'opacity-50' : ''}`}
                  draggable={allowReorder}
                  onDragStart={(e) => handleDragStart(e, image.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedImageId) {
                      handleReorder(draggedImageId, image.id);
                    }
                  }}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.caption || `Property image ${image.order + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Upload Progress */}
                        {image.uploadStatus === 'uploading' && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="mb-2">{getUploadStatusIcon(image.uploadStatus)}</div>
                              <Progress value={image.uploadProgress} className="w-24" />
                              <p className="text-xs mt-1">{Math.round(image.uploadProgress)}%</p>
                            </div>
                          </div>
                        )}

                        {/* Primary Badge */}
                        {image.isPrimary && (
                          <Badge className="absolute top-2 left-2 bg-green-600">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}

                        {/* Status Icon */}
                        <div className="absolute top-2 right-2">
                          {getUploadStatusIcon(image.uploadStatus)}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openImageViewer(image)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {allowEdit && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openImageEditor(image)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {!image.isPrimary && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setPrimaryImage(image.id)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={image.url}
                          alt={image.caption || `Property image ${image.order + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {image.caption || `Image ${image.order + 1}`}
                          </h4>
                          {image.isPrimary && (
                            <Badge className="bg-green-600">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                          {getUploadStatusIcon(image.uploadStatus)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(image.size)} • {image.type.split('/')[1].toUpperCase()}
                        </p>
                        {image.uploadStatus === 'uploading' && (
                          <Progress value={image.uploadProgress} className="mt-2" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openImageViewer(image)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {allowEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openImageEditor(image)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!image.isPrimary && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPrimaryImage(image.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeImage(image.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Editor Dialog */}
      <Dialog open={showImageEditor} onOpenChange={setShowImageEditor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Update image details and settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption || 'Property image'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    value={selectedImage.caption || ''}
                    onChange={(e) => updateImageCaption(selectedImage.id, e.target.value)}
                    placeholder="Enter image caption..."
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="primary"
                    checked={selectedImage.isPrimary}
                    onChange={() => setPrimaryImage(selectedImage.id)}
                    className="rounded"
                  />
                  <Label htmlFor="primary">Set as primary image</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageEditor(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowImageEditor(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="max-h-96 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption || 'Property image'}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">File Size</p>
                  <p className="text-gray-600">{formatFileSize(selectedImage.size)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">File Type</p>
                  <p className="text-gray-600">{selectedImage.type}</p>
                </div>
                {selectedImage.caption && (
                  <div className="col-span-2">
                    <p className="font-medium text-gray-900">Caption</p>
                    <p className="text-gray-600">{selectedImage.caption}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageViewer(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}