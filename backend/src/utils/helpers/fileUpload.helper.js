/**
 * Helper function to get the correct file URL
 * Works with both local storage (development) and Cloudinary (production/Vercel)
 * 
 * @param {Object} file - The multer file object
 * @param {Object} req - Express request object
 * @param {string} folder - Folder name (company-logos or product-images)
 * @returns {string} - The complete URL to the uploaded file
 */
export const getFileUrl = (file, req, folder) => {
  // Check if running on Vercel (Cloudinary)
  if (process.env.VERCEL || process.env.USE_CLOUDINARY === 'true') {
    // Cloudinary URL is already in file.path
    return file.path;
  } else {
    // Local storage - construct URL
    return `${req.protocol}://${req.get("host")}/uploads/${folder}/${file.filename}`;
  }
};

/**
 * Extract public_id from Cloudinary URL for deletion
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
export const getCloudinaryPublicId = (url) => {
  if (!url || !url.includes('cloudinary')) {
    return null;
  }
  
  try {
    // Extract public_id from URL
    // Example: https://res.cloudinary.com/cloud/image/upload/v123456/payflow/company-logos/logo-123.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    const pathParts = parts[1].split('/');
    // Remove version if present (v123456)
    const startIndex = pathParts[0].startsWith('v') ? 1 : 0;
    
    // Join folder and filename, remove extension
    const publicIdWithExt = pathParts.slice(startIndex).join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};
