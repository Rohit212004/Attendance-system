-- Multi-class support migration for Supabase
-- Run this in Supabase SQL Editor after running supabase-lecture-migration.sql

-- 1) Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_name
  ON public.classes (name);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to classes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'classes' AND policyname = 'Allow public read access classes'
  ) THEN
    CREATE POLICY "Allow public read access classes" ON public.classes
      FOR SELECT USING (true);
  END IF;
END $$;

-- Allow full access to classes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'classes' AND policyname = 'Allow full access classes'
  ) THEN
    CREATE POLICY "Allow full access classes" ON public.classes
      FOR ALL USING (true);
  END IF;
END $$;

-- 2) Add class_id to students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS class_id UUID;

-- Add foreign key constraint for students.class_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'students_class_id_fkey'
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.classes(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_class_id
  ON public.students (class_id);

-- 3) Add class_id to lectures table
ALTER TABLE public.lectures
  ADD COLUMN IF NOT EXISTS class_id UUID;

-- Add foreign key constraint for lectures.class_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'lectures_class_id_fkey'
  ) THEN
    ALTER TABLE public.lectures
      ADD CONSTRAINT lectures_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.classes(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lectures_class_id
  ON public.lectures (class_id);

-- 4) Update unique constraint on attendance to include class context
-- Drop old constraint if exists
ALTER TABLE public.attendance
  DROP CONSTRAINT IF EXISTS attendance_student_lecture_unique;

-- Add new constraint (student can only have one attendance record per lecture)
-- The class is implicit through student and lecture relationships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'attendance_student_lecture_unique'
  ) THEN
    ALTER TABLE public.attendance
      ADD CONSTRAINT attendance_student_lecture_unique
      UNIQUE (student_id, lecture_id);
  END IF;
END $$;
