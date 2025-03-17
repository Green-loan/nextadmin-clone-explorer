
-- Ensure the users table has profile_picture field
ALTER TABLE IF EXISTS users_account 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create storage bucket for user uploads (add this to your Supabase project)
-- Note: In Supabase Studio under Storage, create a bucket named 'users' with public access

-- Create a policy to allow users to upload their own profile pictures
-- In Supabase Studio, go to Storage > Buckets > users > Policies and add:
-- 1. For profile picture uploads:
/*
CREATE POLICY "Allow authenticated users to upload their own profile pictures" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'users' AND 
  (storage.foldername(name))[1] = 'profile-pictures'
);
*/

-- 2. For accessing profile pictures:
/*
CREATE POLICY "Allow public access to profile pictures" 
ON storage.objects FOR SELECT 
TO public 
USING (
  bucket_id = 'users' AND 
  (storage.foldername(name))[1] = 'profile-pictures'
);
*/
