// ============================================================================
// File: server/middleware/uploadMiddleware.js
// 1. What this file does:
//    Handles file uploads when a user attaches a receipt (photo or PDF).
//    It checks the file size (under 5MB) and file type before saving.
// 2. Why this file exists:
//    Express cannot read incoming files by default. This file uses Multer to
//    receive the file and saves it either to Cloudinary (cloud) or a local folder.
// 3. Important points to remember:
//    - Allows images (JPG, PNG, WEBP, SVG) and PDF documents.
//    - Rejects files larger than 5MB to save server space.
//    - If Cloudinary is setup, uploads to the cloud; otherwise saves in 'server/uploads/'.
//    - removeReceiptAsset: Helper that deletes the file when a purchase is deleted.
// 4. How it connects to other parts:
//    - Used as a middleware step in 'routes/purchaseRoutes.js' when saving purchases.
// ============================================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure local uploads directory exists for fallback
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer memory storage allows direct buffering before routing to Cloudinary or disk
const storage = multer.memoryStorage();

// File filter: Only allow image formats and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, WEBP, SVG images and PDF documents are allowed.'
      ),
      false
    );
  }
};

// 5MB max file size limit
const uploadReceipt = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

/**
 * Uploads a file buffer to Cloudinary or writes to local disk.
 * @param {Express.Multer.File} file
 * @returns {Promise<{ receiptUrl: string, receiptPublicId: string, receiptFileType: string }>}
 */
const processReceiptUpload = async (file) => {
  if (!file) {
    return { receiptUrl: '', receiptPublicId: '', receiptFileType: 'none' };
  }

  const isPdf = file.mimetype === 'application/pdf';
  const fileType = isPdf ? 'pdf' : 'image';

  // Strategy A: Upload to Cloudinary if credentials are configured
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'expirymate/receipts',
          resource_type: isPdf ? 'raw' : 'image'
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload stream error:', error);
            return reject(new Error('Cloudinary upload failed: ' + error.message));
          }
          resolve({
            receiptUrl: result.secure_url,
            receiptPublicId: result.public_id,
            receiptFileType: fileType
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Strategy B: Fallback to local uploads directory in development
  const fileExt = path.extname(file.originalname) || (isPdf ? '.pdf' : '.jpg');
  const uniqueName = `receipt-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  const filePath = path.join(uploadDir, uniqueName);

  await fs.promises.writeFile(filePath, file.buffer);

  // Accessible via Express static route: /uploads/:filename
  const localUrl = `/uploads/${uniqueName}`;

  return {
    receiptUrl: localUrl,
    receiptPublicId: '', // No Cloudinary public ID for local files
    receiptFileType: fileType
  };
};

/**
 * Deletes a receipt asset from Cloudinary or local disk.
 * @param {string} publicId Cloudinary public_id
 * @param {string} receiptUrl URL or path of the receipt
 */
const removeReceiptAsset = async (publicId, receiptUrl) => {
  try {
    if (publicId && isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`[Cloudinary] Asset removed: ${publicId}`);
    } else if (receiptUrl && receiptUrl.startsWith('/uploads/')) {
      const localFilePath = path.join(__dirname, '..', receiptUrl);
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
        console.log(`[Storage] Local receipt file removed: ${localFilePath}`);
      }
    }
  } catch (error) {
    console.error(`[Storage] Failed to delete asset (${publicId || receiptUrl}):`, error.message);
  }
};

module.exports = {
  uploadReceipt,
  processReceiptUpload,
  removeReceiptAsset
};
