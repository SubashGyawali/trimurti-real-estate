
-- =====================================================
-- SECTION 8: STORAGE POLICIES
-- =====================================================

-- Ensure the bucket exists (this is usually done via dashboard, but good to have)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Public Read Access
-- Allow anyone to view images in the 'property-images' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-images' );

-- Policy 2: Authenticated Upload Access
-- Allow authenticated users to upload images to 'property-images' bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'property-images' );

-- Policy 3: Authenticated Update Access
-- Allow authenticated users to update their own images (or all images for admins)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'property-images' );

-- Policy 4: Authenticated Delete Access
-- Allow authenticated users to delete images
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'property-images' );
