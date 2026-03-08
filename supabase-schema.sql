-- Attendance System Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all required tables

-- ============================================
-- Students Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    roll_no TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_students_created_at ON public.students(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read access (for public attendance view)
CREATE POLICY "Allow public read access" ON public.students
    FOR SELECT
    USING (true);

-- Policy: Allow all operations for authenticated users (teachers)
CREATE POLICY "Allow authenticated full access" ON public.students
    FOR ALL
    USING (true);


-- ============================================
-- Attendance Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access" ON public.attendance
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated full access
CREATE POLICY "Allow authenticated full access" ON public.attendance
    FOR ALL
    USING (true);


-- ============================================
-- Tasks Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access" ON public.tasks
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated full access
CREATE POLICY "Allow authenticated full access" ON public.tasks
    FOR ALL
    USING (true);


-- ============================================
-- Grant Permissions
-- ============================================
-- Grant access to anon role (public users)
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.attendance TO anon;
GRANT SELECT ON public.tasks TO anon;

-- Grant full access to authenticated role (would be used if you enable Supabase auth)
GRANT ALL ON public.students TO authenticated;
GRANT ALL ON public.attendance TO authenticated;
GRANT ALL ON public.tasks TO authenticated;

-- Grant access to service role (used by your anon key for inserts/updates)
GRANT ALL ON public.students TO service_role;
GRANT ALL ON public.attendance TO service_role;
GRANT ALL ON public.tasks TO service_role;


-- ============================================
-- Verification Queries
-- ============================================
-- Run these after creating tables to verify setup:

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
