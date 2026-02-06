/**
 * Client-side wrapper for Cloudinary image operations
 * These functions call our API routes which handle the actual Cloudinary SDK operations
 */

/**
 * Upload a property image to Cloudinary via our API
 * @param file - The File object to upload
 * @returns Promise with the public URL of the uploaded image
 */
export async function uploadPropertyImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}

/**
 * Delete a property image from Cloudinary via our API
 * @param imageUrl - The full Cloudinary URL of the image to delete
 */
export async function deletePropertyImage(imageUrl: string): Promise<void> {
  const response = await fetch('/api/upload/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Delete failed');
  }
}
