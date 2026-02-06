import cloudinary, { CLOUDINARY_FOLDER } from './config';

export interface UploadResult {
  publicUrl: string;
  publicId: string;
}

/**
 * Upload an image to Cloudinary
 * @param buffer - Image buffer data
 * @param filename - Original filename (used for logging)
 * @returns Promise with public URL and public ID
 */
export async function uploadPropertyImage(buffer: Buffer, filename: string): Promise<UploadResult> {
  // Generate unique public_id with timestamp and random string
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const publicId = `${CLOUDINARY_FOLDER}/${uniqueId}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        // Apply automatic optimizations
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            publicUrl: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Extract public_id from a Cloudinary URL
 * URL format: https://res.cloudinary.com/{cloud}/image/upload/{version}/{public_id}.{format}
 */
function extractPublicId(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');

    // Find index of 'upload' and get everything after it
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL: missing "upload" segment');
    }

    // Skip version (v1234567890) if present - versions start with 'v' followed by digits
    let startIndex = uploadIndex + 1;
    if (pathParts[startIndex] && /^v\d+$/.test(pathParts[startIndex])) {
      startIndex++;
    }

    // Join the remaining parts to get public_id with extension
    const publicIdWithExt = pathParts.slice(startIndex).join('/');

    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', imageUrl, error);
    throw error;
  }
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl - The full Cloudinary URL of the image to delete
 */
export async function deletePropertyImage(imageUrl: string): Promise<void> {
  // Skip if not a Cloudinary URL
  if (!imageUrl.includes('res.cloudinary.com')) {
    console.log('Skipping non-Cloudinary URL:', imageUrl);
    return;
  }

  try {
    const publicId = extractPublicId(imageUrl);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.error('Cloudinary delete unexpected result:', result);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

/**
 * Delete multiple images from Cloudinary
 * Best-effort: continues even if some deletions fail
 * @param imageUrls - Array of Cloudinary image URLs to delete
 */
export async function deleteMultipleImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map(url =>
    deletePropertyImage(url).catch(err => {
      console.error(`Failed to delete ${url}:`, err);
      // Don't throw, continue with other deletions
    })
  );

  await Promise.all(deletePromises);
}
