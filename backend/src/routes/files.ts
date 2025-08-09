import { Router } from 'express';
import * as fileController from '@/controllers/fileController';
import { authenticate, authorize, optionalAuthenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { fileService } from '@/services/fileService';
import {
  fileIdValidation,
  propertyIdValidation,
  categoryValidation,
  filenameValidation,
  imageOptionsValidation,
  fileListValidation,
  thumbnailValidation,
  bulkDeleteValidation,
  avatarUploadValidation,
  propertyImagesValidation,
  fileUploadValidation,
  multipleFileUploadValidation,
  fileServeValidation,
  fileMetadataValidation,
  fileStatsValidation,
  fileSearchValidation
} from '@/validators/fileValidators';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         originalName:
 *           type: string
 *         filename:
 *           type: string
 *         path:
 *           type: string
 *         url:
 *           type: string
 *           format: uri
 *         mimetype:
 *           type: string
 *         size:
 *           type: integer
 *         category:
 *           type: string
 *           enum: [image, document, other]
 *         metadata:
 *           type: object
 *           properties:
 *             width:
 *               type: integer
 *             height:
 *               type: integer
 *             format:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ImageProcessingOptions:
 *       type: object
 *       properties:
 *         width:
 *           type: integer
 *           minimum: 1
 *           maximum: 4000
 *         height:
 *           type: integer
 *           minimum: 1
 *           maximum: 4000
 *         quality:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         format:
 *           type: string
 *           enum: [jpeg, png, webp]
 *         thumbnail:
 *           type: boolean
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a single file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               options:
 *                 type: string
 *                 description: JSON string of image processing options
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FileUpload'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/upload',
  authenticate,
  fileService.getMulterConfig('all').single('file'),
  fileUploadValidation,
  validate,
  fileController.uploadFile
);

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               options:
 *                 type: string
 *                 description: JSON string of image processing options
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileUpload'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/upload-multiple',
  authenticate,
  fileService.getMulterConfig('all').array('files', 10),
  multipleFileUploadValidation,
  validate,
  fileController.uploadFiles
);

/**
 * @swagger
 * /api/files/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       format: uri
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/avatar',
  authenticate,
  fileService.getMulterConfig('image').single('avatar'),
  avatarUploadValidation,
  validate,
  fileController.uploadAvatar
);

/**
 * @swagger
 * /api/files/properties/{propertyId}/images:
 *   post:
 *     summary: Upload property images
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Property images uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/properties/:propertyId/images',
  authenticate,
  authorize(['AGENT', 'ADMIN', 'SUPER_ADMIN']),
  fileService.getMulterConfig('image').array('images', 20),
  propertyImagesValidation,
  validate,
  fileController.uploadPropertyImages
);

/**
 * @swagger
 * /api/files/{fileId}:
 *   get:
 *     summary: Get file information by ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FileUpload'
 *                 message:
 *                   type: string
 *       404:
 *         description: File not found
 */
router.get(
  '/:fileId',
  optionalAuthenticate,
  fileIdValidation,
  validate,
  fileController.getFile
);

/**
 * @swagger
 * /api/files/{fileId}/metadata:
 *   get:
 *     summary: Get file metadata
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File metadata retrieved successfully
 *       404:
 *         description: File not found
 */
router.get(
  '/:fileId/metadata',
  optionalAuthenticate,
  fileMetadataValidation,
  validate,
  fileController.getFileMetadata
);

/**
 * @swagger
 * /api/files/{category}/{filename}:
 *   get:
 *     summary: Serve file content
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [images, documents, thumbnails]
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get(
  '/:category/:filename',
  fileServeValidation,
  validate,
  fileController.serveFile
);

/**
 * @swagger
 * /api/files/{fileId}/thumbnail:
 *   post:
 *     summary: Generate thumbnail for image
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *           minimum: 50
 *           maximum: 1000
 *           default: 200
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *           minimum: 50
 *           maximum: 1000
 *           default: 200
 *     responses:
 *       200:
 *         description: Thumbnail generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
router.post(
  '/:fileId/thumbnail',
  authenticate,
  thumbnailValidation,
  validate,
  fileController.generateThumbnail
);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: List files with filters
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [image, document, all]
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUpload'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  fileListValidation,
  validate,
  fileController.listFiles
);

/**
 * @swagger
 * /api/files/search:
 *   get:
 *     summary: Search files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: mimetype
 *         schema:
 *           type: string
 *         description: MIME type filter
 *       - in: query
 *         name: minSize
 *         schema:
 *           type: integer
 *         description: Minimum file size in bytes
 *       - in: query
 *         name: maxSize
 *         schema:
 *           type: integer
 *         description: Maximum file size in bytes
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [image, document, all]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/search',
  authenticate,
  fileSearchValidation,
  validate,
  fileController.listFiles
);

/**
 * @swagger
 * /api/files/stats:
 *   get:
 *     summary: Get file statistics
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [image, document, all]
 *     responses:
 *       200:
 *         description: File statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFiles:
 *                       type: integer
 *                     totalSize:
 *                       type: integer
 *                     imageCount:
 *                       type: integer
 *                     documentCount:
 *                       type: integer
 *                     recentUploads:
 *                       type: integer
 *                     storageUsed:
 *                       type: string
 *                     storageLimit:
 *                       type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/stats',
  authenticate,
  fileStatsValidation,
  validate,
  fileController.getFileStats
);

/**
 * @swagger
 * /api/files/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: File not found
 */
router.delete(
  '/:fileId',
  authenticate,
  fileIdValidation,
  validate,
  fileController.deleteFile
);

/**
 * @swagger
 * /api/files/bulk-delete:
 *   post:
 *     summary: Delete multiple files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileIds
 *             properties:
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 50
 *     responses:
 *       200:
 *         description: Files deletion results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileId:
 *                         type: string
 *                         format: uuid
 *                       success:
 *                         type: boolean
 *                       error:
 *                         type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/bulk-delete',
  authenticate,
  bulkDeleteValidation,
  validate,
  fileController.deleteFiles
);

export default router;