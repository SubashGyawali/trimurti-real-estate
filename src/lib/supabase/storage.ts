import { createClient } from './client';

const BUCKET_NAME = 'property-images';

export async function uploadPropertyImage(file: File) {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading image:', error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function deletePropertyImage(imageUrl: string) {
    const supabase = createClient();

    // Extract the file path from the public URL
    // Example: https://xyz.supabase.co/storage/v1/object/public/property-images/filename.jpg
    // We need to extract 'filename.jpg'

    try {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];

        if (!fileName) {
            throw new Error('Invalid image URL');
        }

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);

        if (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    } catch (err) {
        console.error('Error processing delete request:', err);
        throw err;
    }
}
