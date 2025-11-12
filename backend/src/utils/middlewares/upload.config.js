import dotenv from "dotenv";

dotenv.config();

// Determine if we should use Cloudinary
const useCloudinary = process.env.VERCEL === '1' || process.env.USE_CLOUDINARY === 'true';

// Export upload middleware based on environment
let uploadCompanyLogo, uploadProductImage;

if (useCloudinary) {
  console.log("☁️  Using Cloudinary for file storage (Vercel/Production)");
  const cloudinaryUpload = await import("./upload.cloudinary.js");
  uploadCompanyLogo = cloudinaryUpload.uploadCompanyLogo;
  uploadProductImage = cloudinaryUpload.uploadProductImage;
} else {
  console.log("💾 Using local file storage (Development)");
  const localUpload = await import("./upload.middleware.js");
  uploadCompanyLogo = localUpload.uploadCompanyLogo;
  uploadProductImage = localUpload.uploadProductImage;
}

export { uploadCompanyLogo, uploadProductImage };
