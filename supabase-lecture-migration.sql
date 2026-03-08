-- Lecture-wise attendance migration for Supabase
-- Run this in Supabase SQL Editor once.

-- 1) Create lectures table
CREATE TABLE IF NOT EXISTS public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT lectures_time_check CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_lectures_date_time
  ON public.lectures (lecture_date, start_time);

ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lectures' AND policyname = 'Allow public read access lectures'
  ) THEN
    CREATE POLICY "Allow public read access lectures" ON public.lectures
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lectures' AND policyname = 'Allow full access lectures'
  ) THEN
    CREATE POLICY "Allow full access lectures" ON public.lectures
      FOR ALL USING (true);
  END IF;
END $$;

-- 2) Add lecture_id to attendance
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS lecture_id UUID;

-- 3) Add foreign key constraint safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'attendance'
      AND constraint_name = 'attendance_lecture_id_fkey'
  ) THEN
    ALTER TABLE public.attendance
      ADD CONSTRAINT attendance_lecture_id_fkey
      FOREIGN KEY (lecture_id) REFERENCES public.lectures(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_lecture_id
  ON public.attendance (lecture_id);

-- 4) Replace old unique constraint (student_id, date) with (student_id, lecture_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'attendance'
      AND constraint_name = 'attendance_student_id_date_key'
  ) THEN
    ALTER TABLE public.attendance DROP CONSTRAINT attendance_student_id_date_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'attendance'
      AND constraint_name = 'attendance_student_id_lecture_id_key'
  ) THEN
    ALTER TABLE public.attendance
      ADD CONSTRAINT attendance_student_id_lecture_id_key UNIQUE (student_id, lecture_id);
  END IF;
END $$;

-- 5) Permissions
GRANT SELECT ON public.lectures TO anon;
GRANT ALL ON public.lectures TO authenticated;
GRANT ALL ON public.lectures TO service_role;
