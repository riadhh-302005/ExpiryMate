// ============================================================================
// File: server/config/cloudinary.js
// 1. What this file does:
//    Sets up Cloudinary for uploading receipt photos and PDFs to the cloud.
// 2. Why this file exists:
//    It keeps all cloud storage setup in one place. If Cloudinary credentials
//    are not provided, it safely falls back to saving files on your local computer.
// 3. Important points to remember:
//    - isCloudinaryConfigured(): Checks if your .env file has Cloudinary keys.
//    - If keys are missing, files save locally in the 'server/uploads' folder so
//      the app always works without any setup hassle.
// 4. How it connects to other parts:
//    - Used by 'middleware/uploadMiddleware.js' when users upload receipts.
//    - Used by 'controllers/purchaseController.js' to delete receipts when an item is deleted.
// ============================================================================

const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('[Cloudinary] Configured successfully with cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Cloudinary] Credentials not detected. Falling back to local disk storage in /uploads');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured
};
