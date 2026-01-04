
-- 1. Create Experience Table
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT,
    employment_type TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Education Table
CREATE TABLE IF NOT EXISTS public.educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    grade TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;

-- 4. Set Policies for Experiences
DROP POLICY IF EXISTS "Experiences are viewable by everyone" ON public.experiences;
CREATE POLICY "Experiences are viewable by everyone" ON public.experiences
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own experiences" ON public.experiences;
CREATE POLICY "Users can manage their own experiences" ON public.experiences
    FOR ALL USING (auth.uid() = profile_id);

-- 5. Set Policies for Educations
DROP POLICY IF EXISTS "Educations are viewable by everyone" ON public.educations;
CREATE POLICY "Educations are viewable by everyone" ON public.educations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own educations" ON public.educations;
CREATE POLICY "Users can manage their own educations" ON public.educations
    FOR ALL USING (auth.uid() = profile_id);

-- 6. Add skills handle if not exists as array
-- (The user's schema already has skills text[] null)
