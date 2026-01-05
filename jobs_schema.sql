
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Job Postings Table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  posted_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  salary_min NUMERIC(10, 2),
  salary_max NUMERIC(10, 2),
  salary_currency TEXT DEFAULT 'USD',
  required_skills TEXT[],
  application_url TEXT,
  application_email TEXT,
  is_featured BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

-- Index for job status
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);

-- Trigger for updating 'updated_at' on job_postings
DROP TRIGGER IF EXISTS update_job_postings_updated_at ON public.job_postings;
CREATE TRIGGER update_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for Job Postings
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active job postings" ON public.job_postings;
CREATE POLICY "Public can view active job postings" ON public.job_postings
FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can create job postings" ON public.job_postings;
CREATE POLICY "Users can create job postings" ON public.job_postings
FOR INSERT WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Users can update their own job postings" ON public.job_postings;
CREATE POLICY "Users can update their own job postings" ON public.job_postings
FOR UPDATE USING (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Users can delete their own job postings" ON public.job_postings;
CREATE POLICY "Users can delete their own job postings" ON public.job_postings
FOR DELETE USING (auth.uid() = posted_by);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  job_id uuid REFERENCES public.job_postings(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (job_id, applicant_id),
  PRIMARY KEY (id)
);

-- Trigger for updating 'updated_at' on job_applications
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for Job Applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.job_applications;
CREATE POLICY "Applicants can view their own applications" ON public.job_applications
FOR SELECT USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Users can create applications for themselves" ON public.job_applications;
CREATE POLICY "Users can create applications for themselves" ON public.job_applications
FOR INSERT WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Job posters can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Job posters can view applications for their jobs" ON public.job_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_postings
    WHERE job_postings.id = job_applications.job_id
    AND job_postings.posted_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Job posters can update application status" ON public.job_applications;
CREATE POLICY "Job posters can update application status" ON public.job_applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM job_postings
    WHERE job_postings.id = job_applications.job_id
    AND job_postings.posted_by = auth.uid()
  )
);
