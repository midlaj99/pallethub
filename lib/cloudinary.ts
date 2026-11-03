import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'm6chrnwr',
  api_key: process.env.CLOUDINARY_API_KEY || '889673673621873',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Mb-KHly6TmTbGmZrVj-hLjorQWw',
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Uploads a base64 data URI or image buffer to Cloudinary.
 * Applies automatic WebP/AVIF format selection and quality optimization for ultra-fast CDN delivery.
 */
export async function uploadImageToCloudinary(
  fileData: string,
  folder: string = 'palettehubb/products'
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: 'image',
    fetch_format: 'auto',
    quality: 'auto:good',
    transformation: [
      { width: 1200, crop: 'limit' }, // Constrain max dimension to save storage & ensure fast loading
    ],
  });

  // Generate an optimized CDN delivery URL using Cloudinary f_auto,q_auto transformations
  const optimizedUrl = cloudinary.url(result.public_id, {
    fetch_format: 'auto',
    quality: 'auto:good',
    secure: true,
  });

  return {
    url: optimizedUrl,
    secure_url: optimizedUrl,
    public_id: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

/**
 * Deletes an image from Cloudinary by its public_id or full URL.
 */
export async function deleteImageFromCloudinary(publicIdOrUrl: string): Promise<boolean> {
  try {
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.includes('cloudinary.com')) {
      const match = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      if (match && match[1]) {
        publicId = match[1];
      }
    }
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    return false;
  }
}

export default cloudinary;
