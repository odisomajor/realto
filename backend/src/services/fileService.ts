import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/errors';
import { redisClient } from '@/config/redis';

// File upload configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export interface FileUploadResult {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
  category: 'image' | 'document' | 'other';
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    pages?: number;
  };
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  thumbnail?: boolean;
}

export interface FileFilter {
  category?: 'image' | 'document' | 'all';
  userId?: string;
  propertyId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

class FileService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = UPLOAD_DIR;
    this.ensureUploadDirectories();
  }

  private async ensureUploadDirectories(): Promise<void> {
    try {
      const directories = [
        this.uploadDir,
        path.join(this.uploadDir, 'images'),
        path.join(this.uploadDir, 'documents'),
        path.join(this.uploadDir, 'thumbnails'),
        path.join(this.uploadDir, 'temp')
      ];

      for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
      }
    } catch (error) {
      logger.error('Error creating upload directories:', error);
      throw new AppError('Failed to initialize file upload directories', 500);
    }
  }

  // Configure multer for file uploads
  public getMulterConfig(category: 'image' | 'document' | 'all' = 'all') {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const subDir = this.getSubDirectory(file.mimetype);
        cb(null, path.join(this.uploadDir, subDir));
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
      }
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (this.isAllowedFileType(file.mimetype, category)) {
        cb(null, true);
      } else {
        cb(new AppError(`File type ${file.mimetype} is not allowed`, 400));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10 // Maximum 10 files per request
      }
    });
  }

  private getSubDirectory(mimetype: string): string {
    if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      return 'images';
    } else if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
      return 'documents';
    }
    return 'other';
  }

  private isAllowedFileType(mimetype: string, category: 'image' | 'document' | 'all'): boolean {
    switch (category) {
      case 'image':
        return ALLOWED_IMAGE_TYPES.includes(mimetype);
      case 'document':
        return ALLOWED_DOCUMENT_TYPES.includes(mimetype);
      case 'all':
        return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(mimetype);
      default:
        return false;
    }
  }

  // Upload single file
  public async uploadFile(
    file: Express.Multer.File,
    userId: string,
    propertyId?: string,
    options?: ImageProcessingOptions
  ): Promise<FileUploadResult> {
    try {
      const fileId = uuidv4();
      const category = this.getFileCategory(file.mimetype);
      
      let processedFile = file;
      let metadata: any = {};

      // Process image if needed
      if (category === 'image' && options) {
        processedFile = await this.processImage(file, options);
        metadata = await this.getImageMetadata(processedFile.path);
      }

      // Save file record to database (placeholder - implement with your ORM)
      const fileRecord = await this.saveFileRecord({
        id: fileId,
        originalName: file.originalname,
        filename: processedFile.filename,
        path: processedFile.path,
        mimetype: file.mimetype,
        size: processedFile.size,
        category,
        userId,
        propertyId,
        metadata
      });

      // Generate public URL
      const url = this.generateFileUrl(processedFile.filename, category);

      return {
        id: fileId,
        originalName: file.originalname,
        filename: processedFile.filename,
        path: processedFile.path,
        url,
        mimetype: file.mimetype,
        size: processedFile.size,
        category,
        metadata
      };
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw new AppError('Failed to upload file', 500);
    }
  }

  // Upload multiple files
  public async uploadFiles(
    files: Express.Multer.File[],
    userId: string,
    propertyId?: string,
    options?: ImageProcessingOptions
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, userId, propertyId, options);
        results.push(result);
      } catch (error) {
        logger.error(`Error uploading file ${file.originalname}:`, error);
        // Continue with other files, but log the error
      }
    }

    return results;
  }

  // Process image (resize, compress, format conversion)
  private async processImage(
    file: Express.Multer.File,
    options: ImageProcessingOptions
  ): Promise<Express.Multer.File> {
    try {
      const { width, height, quality = 80, format = 'jpeg' } = options;
      
      let sharpInstance = sharp(file.path);

      // Resize if dimensions provided
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Set format and quality
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
      }

      // Generate new filename with format extension
      const ext = `.${format}`;
      const newFilename = file.filename.replace(path.extname(file.filename), ext);
      const newPath = path.join(path.dirname(file.path), newFilename);

      // Process and save
      await sharpInstance.toFile(newPath);

      // Remove original file if different
      if (newPath !== file.path) {
        await fs.unlink(file.path);
      }

      // Get new file stats
      const stats = await fs.stat(newPath);

      return {
        ...file,
        filename: newFilename,
        path: newPath,
        size: stats.size
      };
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new AppError('Failed to process image', 500);
    }
  }

  // Generate thumbnail
  public async generateThumbnail(
    filePath: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> {
    try {
      const filename = path.basename(filePath, path.extname(filePath));
      const thumbnailPath = path.join(this.uploadDir, 'thumbnails', `${filename}_thumb.webp`);

      await sharp(filePath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      throw new AppError('Failed to generate thumbnail', 500);
    }
  }

  // Get image metadata
  private async getImageMetadata(filePath: string): Promise<any> {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        channels: metadata.channels
      };
    } catch (error) {
      logger.error('Error getting image metadata:', error);
      return {};
    }
  }

  // Delete file
  public async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      // Get file record from database
      const fileRecord = await this.getFileRecord(fileId);
      
      if (!fileRecord) {
        throw new AppError('File not found', 404);
      }

      // Check permissions (user can only delete their own files, or admin can delete any)
      if (fileRecord.userId !== userId && !this.isAdmin(userId)) {
        throw new AppError('Insufficient permissions to delete file', 403);
      }

      // Delete physical file
      try {
        await fs.unlink(fileRecord.path);
      } catch (error) {
        logger.warn(`Physical file not found: ${fileRecord.path}`);
      }

      // Delete thumbnail if exists
      if (fileRecord.category === 'image') {
        const thumbnailPath = this.getThumbnailPath(fileRecord.filename);
        try {
          await fs.unlink(thumbnailPath);
        } catch (error) {
          logger.warn(`Thumbnail not found: ${thumbnailPath}`);
        }
      }

      // Delete from database
      await this.deleteFileRecord(fileId);

      logger.info(`File deleted: ${fileId}`);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get file by ID
  public async getFile(fileId: string): Promise<FileUploadResult | null> {
    try {
      const fileRecord = await this.getFileRecord(fileId);
      
      if (!fileRecord) {
        return null;
      }

      return {
        id: fileRecord.id,
        originalName: fileRecord.originalName,
        filename: fileRecord.filename,
        path: fileRecord.path,
        url: this.generateFileUrl(fileRecord.filename, fileRecord.category),
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        category: fileRecord.category,
        metadata: fileRecord.metadata
      };
    } catch (error) {
      logger.error('Error getting file:', error);
      throw new AppError('Failed to retrieve file', 500);
    }
  }

  // List files with filters
  public async listFiles(filters: FileFilter): Promise<{
    files: FileUploadResult[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;

      // This would be implemented with your ORM
      const { files, total } = await this.getFilesFromDatabase(filters, limit, offset);

      const formattedFiles = files.map(file => ({
        id: file.id,
        originalName: file.originalName,
        filename: file.filename,
        path: file.path,
        url: this.generateFileUrl(file.filename, file.category),
        mimetype: file.mimetype,
        size: file.size,
        category: file.category,
        metadata: file.metadata
      }));

      return {
        files: formattedFiles,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error listing files:', error);
      throw new AppError('Failed to list files', 500);
    }
  }

  // Generate file URL
  private generateFileUrl(filename: string, category: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/files/${category}/${filename}`;
  }

  // Get file category
  private getFileCategory(mimetype: string): 'image' | 'document' | 'other' {
    if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      return 'image';
    } else if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
      return 'document';
    }
    return 'other';
  }

  // Get thumbnail path
  private getThumbnailPath(filename: string): string {
    const name = path.basename(filename, path.extname(filename));
    return path.join(this.uploadDir, 'thumbnails', `${name}_thumb.webp`);
  }

  // Cleanup temporary files
  public async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          logger.info(`Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up temp files:', error);
    }
  }

  // Validate file
  public validateFile(file: Express.Multer.File, category: 'image' | 'document' | 'all' = 'all'): void {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(`File size exceeds maximum limit of ${MAX_FILE_SIZE} bytes`, 400);
    }

    if (!this.isAllowedFileType(file.mimetype, category)) {
      throw new AppError(`File type ${file.mimetype} is not allowed`, 400);
    }
  }

  // Database operations (implement with your ORM)
  private async saveFileRecord(fileData: any): Promise<any> {
    // Implement with Prisma or your ORM
    // This is a placeholder
    return fileData;
  }

  private async getFileRecord(fileId: string): Promise<any> {
    // Implement with Prisma or your ORM
    // This is a placeholder
    return null;
  }

  private async deleteFileRecord(fileId: string): Promise<void> {
    // Implement with Prisma or your ORM
    // This is a placeholder
  }

  private async getFilesFromDatabase(filters: FileFilter, limit: number, offset: number): Promise<{
    files: any[];
    total: number;
  }> {
    // Implement with Prisma or your ORM
    // This is a placeholder
    return { files: [], total: 0 };
  }

  private isAdmin(userId: string): boolean {
    // Implement admin check
    // This is a placeholder
    return false;
  }
}

export const fileService = new FileService();