
-- ============================================================
-- Markiety English LMS - Storage Bucket Setup
-- ============================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('feedback', 'feedback', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies (Production-Ready)

-- AVATARS Policies
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'avatars');


-- FEEDBACK Policies
DROP POLICY IF EXISTS "Feedback files are publicly readable" ON storage.objects;
CREATE POLICY "Feedback files are publicly readable" ON storage.objects 
  FOR SELECT USING (bucket_id = 'feedback');

DROP POLICY IF EXISTS "Admins can upload feedback files" ON storage.objects;
CREATE POLICY "Admins can upload feedback files" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'feedback');

DROP POLICY IF EXISTS "Admins can update feedback files" ON storage.objects;
CREATE POLICY "Admins can update feedback files" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'feedback');
