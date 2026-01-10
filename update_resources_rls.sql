-- RLS Policies for Resource Management
-- Ensures only architects/creators can edit or delete their own resources

-- 1. Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update/delete policies if they exist (to avoid duplication)
DROP POLICY IF EXISTS "Authors can update own resources" ON public.resources;
DROP POLICY IF EXISTS "Authors can delete own resources" ON public.resources;

-- 3. Create Update Policy
CREATE POLICY "Authors can update own resources"
ON public.resources
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 4. Create Delete Policy
CREATE POLICY "Authors can delete own resources"
ON public.resources
FOR DELETE
USING (auth.uid() = author_id);

-- 5. Confirmation for user
-- These policies ensure that even if someone bypasses the UI, the database
-- will reject any update or delete attempts not coming from the original author.
