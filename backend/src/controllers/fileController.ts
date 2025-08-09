import { Request, Response } from 'express';
import { fileService, ImageProcessingOptions } from '@/services/fileService';
import { catchAsync } from '@/utils/catchAsync';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import path from 'path';
import fs from 'fs/promises';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Upload single file
export const uploadFile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file provided', 400);
  }

  const { propertyId } = req.body;
  const userId = req.user!.id;

  // Parse image processing options if provided
  let options: ImageProcessingOptions | undefined;
  if (req.body.options) {
    try {
      options = JSON.parse(req.body.options);
    } catch (error) {
      logger.warn('Invalid image processing options provided');
    }
  }

  const result = await fileService.uploadFile(req.file, userId, propertyId, options);

  logger.info(`File uploaded: ${result.id} by user ${userId}`);

  res.status(201).json({
    success: true,
    data: result,
    message: 'File uploaded successfully'
  });
});

// Upload multiple files
export const uploadFiles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError('No files provided', 400);
  }

  const { propertyId } = req.body;
  const userId = req.user!.id;

  // Parse image processing options if provided
  let options: ImageProcessingOptions | undefined;
  if (req.body.options) {
    try {
      options = JSON.parse(req.body.options);
    } catch (error) {
      logger.warn('Invalid image processing options provided');
    }
  }

  const results = await fileService.uploadFiles(req.files, userId, propertyId, options);

  logger.info(`${results.length} files uploaded by user ${userId}`);

  res.status(201).json({
    success: true,
    data: results,
    message: `${results.length} files uploaded successfully`
  });
});

// Get file by ID
export const getFile = catchAsync(async (req: Request, res: Response) => {
  const { fileId } = req.params;

  const file = await fileService.getFile(fileId);

  if (!file) {
    throw new AppError('File not found', 404);
  }

  res.json({
    success: true,
    data: file,
    message: 'File retrieved successfully'
  });
});

// Serve file content
export const serveFile = catchAsync(async (req: Request, res: Response) => {
  const { category, filename } = req.params;
  
  // Validate category
  if (!['images', 'documents', 'thumbnails'].includes(category)) {
    throw new AppError('Invalid file category', 400);
  }

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const filePath = path.join(uploadDir, category, filename);

  try {
    // Check if file exists
    await fs.access(filePath);

    // Get file stats for headers
    const stats = await fs.stat(filePath);
    const mimeType = getMimeType(filename);

    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);

    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === `"${stats.mtime.getTime()}-${stats.size}"`) {
      return res.status(304).end();
    }

    // Stream file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    throw new AppError('File not found', 404);
  }
});

// Generate thumbnail
export const generateThumbnail = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { fileId } = req.params;
  const { width = 200, height = 200 } = req.query;

  const file = await fileService.getFile(fileId);

  if (!file) {
    throw new AppError('File not found', 404);
  }

  if (file.category !== 'image') {
    throw new AppError('Thumbnails can only be generated for images', 400);
  }

  const thumbnailPath = await fileService.generateThumbnail(
    file.path,
    parseInt(width as string),
    parseInt(height as string)
  );

  const thumbnailUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/files/thumbnails/${path.basename(thumbnailPath)}`;

  res.json({
    success: true,
    data: {
      thumbnailUrl,
      width: parseInt(width as string),
      height: parseInt(height as string)
    },
    message: 'Thumbnail generated successfully'
  });
});

// List files
export const listFiles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const {
    category,
    propertyId,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = req.query;

  const userId = req.user!.id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);

  const filters = {
    category: category as 'image' | 'document' | 'all',
    userId: isAdmin ? undefined : userId, // Admins can see all files
    propertyId: propertyId as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    page: parseInt(page as string),
    limit: parseInt(limit as string)
  };

  const result = await fileService.listFiles(filters);

  res.json({
    success: true,
    data: result,
    message: 'Files retrieved successfully'
  });
});

// Delete file
export const deleteFile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { fileId } = req.params;
  const userId = req.user!.id;

  await fileService.deleteFile(fileId, userId);

  logger.info(`File deleted: ${fileId} by user ${userId}`);

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});

// Delete multiple files
export const deleteFiles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { fileIds } = req.body;
  const userId = req.user!.id;

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new AppError('File IDs array is required', 400);
  }

  const results = [];
  for (const fileId of fileIds) {
    try {
      await fileService.deleteFile(fileId, userId);
      results.push({ fileId, success: true });
    } catch (error) {
      logger.error(`Error deleting file ${fileId}:`, error);
      results.push({ 
        fileId, 
        success: false, 
        error: error instanceof AppError ? error.message : 'Unknown error' 
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  
  logger.info(`${successCount}/${fileIds.length} files deleted by user ${userId}`);

  res.json({
    success: true,
    data: results,
    message: `${successCount}/${fileIds.length} files deleted successfully`
  });
});

// Get file metadata
export const getFileMetadata = catchAsync(async (req: Request, res: Response) => {
  const { fileId } = req.params;

  const file = await fileService.getFile(fileId);

  if (!file) {
    throw new AppError('File not found', 404);
  }

  // Return only metadata without file content
  const metadata = {
    id: file.id,
    originalName: file.originalName,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    category: file.category,
    metadata: file.metadata,
    url: file.url
  };

  res.json({
    success: true,
    data: metadata,
    message: 'File metadata retrieved successfully'
  });
});

// Upload avatar
export const uploadAvatar = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No avatar file provided', 400);
  }

  const userId = req.user!.id;

  // Validate that it's an image
  if (!req.file.mimetype.startsWith('image/')) {
    throw new AppError('Avatar must be an image file', 400);
  }

  // Process avatar with specific options
  const options: ImageProcessingOptions = {
    width: 300,
    height: 300,
    quality: 85,
    format: 'webp'
  };

  const result = await fileService.uploadFile(req.file, userId, undefined, options);

  // Generate thumbnail
  await fileService.generateThumbnail(result.path, 100, 100);

  logger.info(`Avatar uploaded: ${result.id} by user ${userId}`);

  res.status(201).json({
    success: true,
    data: {
      avatarUrl: result.url,
      thumbnailUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/files/thumbnails/${path.basename(result.filename, path.extname(result.filename))}_thumb.webp`
    },
    message: 'Avatar uploaded successfully'
  });
});

// Upload property images
export const uploadPropertyImages = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError('No image files provided', 400);
  }

  const { propertyId } = req.params;
  const userId = req.user!.id;

  // Validate that all files are images
  for (const file of req.files) {
    if (!file.mimetype.startsWith('image/')) {
      throw new AppError(`File ${file.originalname} is not an image`, 400);
    }
  }

  // Process images with property-specific options
  const options: ImageProcessingOptions = {
    width: 1200,
    height: 800,
    quality: 85,
    format: 'webp'
  };

  const results = await fileService.uploadFiles(req.files, userId, propertyId, options);

  // Generate thumbnails for all images
  for (const result of results) {
    try {
      await fileService.generateThumbnail(result.path, 300, 200);
    } catch (error) {
      logger.warn(`Failed to generate thumbnail for ${result.id}:`, error);
    }
  }

  logger.info(`${results.length} property images uploaded for property ${propertyId} by user ${userId}`);

  res.status(201).json({
    success: true,
    data: results.map(result => ({
      ...result,
      thumbnailUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/files/thumbnails/${path.basename(result.filename, path.extname(result.filename))}_thumb.webp`
    })),
    message: `${results.length} property images uploaded successfully`
  });
});

// Get file statistics
export const getFileStats = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);

  // This would be implemented with database queries
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    imageCount: 0,
    documentCount: 0,
    recentUploads: 0, // Last 7 days
    storageUsed: '0 MB',
    storageLimit: '100 MB'
  };

  res.json({
    success: true,
    data: stats,
    message: 'File statistics retrieved successfully'
  });
});

// Helper function to get MIME type from filename
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.json': 'application/json'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}