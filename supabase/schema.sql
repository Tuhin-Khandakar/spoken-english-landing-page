-- ============================================================
-- Markiety English LMS - Master Schema Upgrade
-- ============================================================

-- 1. Course Resources (PDFs, Notes, Links)
CREATE TABLE IF NOT EXISTS course_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'PDF Notes', -- PDF Notes | Resource Link | Class Recording
  link TEXT NOT NULL,
  batch TEXT DEFAULT 'Batch #04',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Syllabus (Week-by-week structure)
CREATE TABLE IF NOT EXISTS syllabus_weeks (
  week_number INT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topics TEXT[] -- Array of topics covered
);

-- 3. Certificates (To track issued ones)
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  certificate_url TEXT, -- If we generate a static file
  UNIQUE(student_id)
);

-- Seed syllabus data (8 Weeks)
INSERT INTO syllabus_weeks (week_number, title, description, topics) VALUES
(1, 'Foundation & Tongue Training', 'Fixing pronunciation and building core sentence structure.', ARRAY['Phonetic Precision', 'The Silent English Formula', 'Visualizing Tenses']),
(2, 'The Conversational Flow', 'Mastering small talk and daily life scenarios.', ARRAY['Natural Fillers', 'Emotional Expressiveness', 'Scenario Drills']),
(3, 'Thinking in English', 'Advanced logic and debate techniques.', ARRAY['Critical Thinking', 'Building Narratives', 'Persuasive Language']),
(4, 'Professional Excellence', 'Interviews, presentations, and professional etiquette.', ARRAY['Presentation Secrets', 'Interview Mastery', 'Business Etiquette']),
(5, 'The Art of Storytelling', 'Captivate audiences with narrative structures.', ARRAY['Climax Building', 'Vocal Variety', 'Expressive Vocab']),
(6, 'Public Speaking Mastery', 'Delivering speeches and managing Q&A.', ARRAY['Stage Presence', 'Handling Rejection', 'Audience Engagement']),
(7, 'Global Accent Neutralization', 'Refining clarity for global communication.', ARRAY['Intonation Patterns', 'Connected Speech', 'Pacing & Clarity']),
(8, 'Capstone & Graduation', 'Live presentations and certificate issuance.', ARRAY['Real-world Simulation', 'Final Feedback', 'Graduation Ceremony'])
ON CONFLICT (week_number) DO UPDATE SET 
title = EXCLUDED.title, 
description = EXCLUDED.description, 
topics = EXCLUDED.topics;

-- RLS & Permissions
ALTER TABLE course_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;

GRANT ALL ON course_resources TO anon, authenticated;
GRANT ALL ON syllabus_weeks TO anon, authenticated;
GRANT ALL ON certificates TO anon, authenticated;
