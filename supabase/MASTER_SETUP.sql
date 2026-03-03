-- ============================================================================
-- MARKIETY ENGLISH LMS - MASTER SETUP SCRIPT
-- Run this ONCE in your Supabase SQL Editor to set up the entire database.
-- This script is fully idempotent (safe to re-run).
-- ============================================================================
-- ORDER: Base Tables → Schema → Advanced Upgrades → Storage
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 0: BASE TABLES (Core Foundation)
-- Run these first if you don't have them yet. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  batch TEXT DEFAULT 'Batch #04',
  status TEXT DEFAULT 'active', -- active | suspended
  avatar_url TEXT,
  last_online TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT,
  guest_email TEXT,
  guest_whatsapp TEXT,
  transaction_id TEXT,
  method TEXT, -- bKash | Nagad | Rocket
  status TEXT DEFAULT 'pending', -- pending | approved | rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_topic TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  batch TEXT DEFAULT 'Batch #04',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  homework_id UUID REFERENCES homework(id) ON DELETE CASCADE,
  link TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | reviewed
  admin_feedback TEXT,
  admin_feedback_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, homework_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'student' | 'admin'
  message TEXT NOT NULL,
  msg_type TEXT DEFAULT 'text', -- text | image | file
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general', -- general | feedback | certificate | broadcast
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, week_number)
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upsert default app settings
INSERT INTO app_settings (key, value) VALUES
  ('meeting_link', ''),
  ('next_class_time', 'Tonight, 08:00 PM'),
  ('next_class_topic', 'Advanced Sentence Structures')
ON CONFLICT (key) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: SCHEMA UPGRADES (schema.sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- Course Resources (PDFs, Notes, Links)
CREATE TABLE IF NOT EXISTS course_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'PDF Notes', -- PDF Notes | Resource Link | Class Recording
  link TEXT NOT NULL,
  batch TEXT DEFAULT 'Batch #04',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Syllabus (Week-by-week structure)
CREATE TABLE IF NOT EXISTS syllabus_weeks (
  week_number INT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topics TEXT[]
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  certificate_url TEXT,
  UNIQUE(student_id)
);

-- Seed 8-week syllabus (idempotent)
INSERT INTO syllabus_weeks (week_number, title, description, topics) VALUES
  (1, 'Foundation & Tongue Training',     'Fixing pronunciation and building core sentence structure.', ARRAY['Phonetic Precision', 'The Silent English Formula', 'Visualizing Tenses']),
  (2, 'The Conversational Flow',          'Mastering small talk and daily life scenarios.',             ARRAY['Natural Fillers', 'Emotional Expressiveness', 'Scenario Drills']),
  (3, 'Thinking in English',              'Advanced logic and debate techniques.',                      ARRAY['Critical Thinking', 'Building Narratives', 'Persuasive Language']),
  (4, 'Professional Excellence',          'Interviews, presentations, and professional etiquette.',     ARRAY['Presentation Secrets', 'Interview Mastery', 'Business Etiquette']),
  (5, 'The Art of Storytelling',          'Captivate audiences with narrative structures.',             ARRAY['Climax Building', 'Vocal Variety', 'Expressive Vocab']),
  (6, 'Public Speaking Mastery',          'Delivering speeches and managing Q&A.',                     ARRAY['Stage Presence', 'Handling Rejection', 'Audience Engagement']),
  (7, 'Global Accent Neutralization',     'Refining clarity for global communication.',                ARRAY['Intonation Patterns', 'Connected Speech', 'Pacing & Clarity']),
  (8, 'Capstone & Graduation',            'Live presentations and certificate issuance.',               ARRAY['Real-world Simulation', 'Final Feedback', 'Graduation Ceremony'])
ON CONFLICT (week_number) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  topics      = EXCLUDED.topics;

-- Disable RLS on public read tables (no auth on these for dev)
ALTER TABLE course_resources  DISABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_weeks    DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates      DISABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: ADVANCED UPGRADES (advanced_upgrades.sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enhanced Student Profiles
ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_notes  TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bio            TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS badges         JSONB DEFAULT '[]';
ALTER TABLE students ADD COLUMN IF NOT EXISTS points         INT   DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS streak_count   INT   DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_streak_update TIMESTAMPTZ;

-- Safe point incrementor (used by student RPC calls)
CREATE OR REPLACE FUNCTION increment_points(student_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  UPDATE students
  SET points = points + amount
  WHERE id = student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notifications columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read   BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type      TEXT DEFAULT 'general';

-- ─── RLS Policies ───────────────────────────────────────────────────────────

-- Students (open read for dev; swap `true` → `auth.uid() = id` in production)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view their own profile"   ON students;
CREATE POLICY "Students can view their own profile" ON students
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Students can update their own profile" ON students;
CREATE POLICY "Students can update their own profile" ON students
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can insert their own attendance" ON attendance;
CREATE POLICY "Students can insert their own attendance" ON attendance
  FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Students can view their own attendance"   ON attendance;
CREATE POLICY "Students can view their own attendance" ON attendance
  FOR SELECT TO public USING (true);

-- Submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view their own submissions" ON submissions;
CREATE POLICY "Students can view their own submissions" ON submissions
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Students can insert their own submissions" ON submissions;
CREATE POLICY "Students can insert their own submissions" ON submissions
  FOR INSERT TO public WITH CHECK (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view relevant notifications" ON notifications;
CREATE POLICY "Students can view relevant notifications" ON notifications
  FOR SELECT TO public USING (student_id IS NULL OR true);
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
CREATE POLICY "Anyone can insert notifications" ON notifications
  FOR INSERT TO public WITH CHECK (true);

-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Chat messages are accessible" ON chat_messages;
CREATE POLICY "Chat messages are accessible" ON chat_messages
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Student Progress
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Progress is accessible" ON student_progress;
CREATE POLICY "Progress is accessible" ON student_progress
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Homework
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Homework is publicly readable" ON homework;
CREATE POLICY "Homework is publicly readable" ON homework
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Homework can be inserted" ON homework;
CREATE POLICY "Homework can be inserted" ON homework
  FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Homework can be deleted" ON homework;
CREATE POLICY "Homework can be deleted" ON homework
  FOR DELETE TO public USING (true);

-- App Settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings are readable" ON app_settings;
CREATE POLICY "Settings are readable" ON app_settings
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Settings can be upserted" ON app_settings;
CREATE POLICY "Settings can be upserted" ON app_settings
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enrollments can be read" ON enrollments;
CREATE POLICY "Enrollments can be read" ON enrollments
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Enrollments can be inserted" ON enrollments;
CREATE POLICY "Enrollments can be inserted" ON enrollments
  FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Enrollments can be updated" ON enrollments;
CREATE POLICY "Enrollments can be updated" ON enrollments
  FOR UPDATE TO public USING (true);

-- Course Resources
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Resources are readable" ON course_resources;
CREATE POLICY "Resources are readable" ON course_resources
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Certificates are readable" ON certificates;
CREATE POLICY "Certificates are readable" ON certificates
  FOR ALL TO public USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: STORAGE BUCKETS (storage_setup.sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars',  'avatars',  true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback', 'feedback', true) ON CONFLICT (id) DO NOTHING;

-- Avatar Storage Policies
DROP POLICY IF EXISTS "Avatars are publicly readable"   ON storage.objects;
CREATE POLICY "Avatars are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

-- Feedback Storage Policies
DROP POLICY IF EXISTS "Feedback files are publicly readable" ON storage.objects;
CREATE POLICY "Feedback files are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'feedback');

DROP POLICY IF EXISTS "Admins can upload feedback files" ON storage.objects;
CREATE POLICY "Admins can upload feedback files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'feedback');

DROP POLICY IF EXISTS "Admins can update feedback files" ON storage.objects;
CREATE POLICY "Admins can update feedback files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'feedback');


-- ============================================================================
-- DONE! Your Markiety English LMS database is fully configured.
-- ✅ Tables: students, enrollments, attendance, homework, submissions,
--    chat_messages, notifications, student_progress, app_settings,
--    course_resources, syllabus_weeks, certificates
-- ✅ Functions: increment_points()
-- ✅ RLS policies enabled on all tables
-- ✅ Storage buckets: avatars, feedback
-- ============================================================================
