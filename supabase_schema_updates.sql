-- Create a table for admins
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow only admins to view the admins table (recursion check potential, but simple for now)
-- Actually, we need a policy that says "if you are in this table, you can see it"
CREATE POLICY "Admins can view admins" ON public.admins
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Trigger to create a profile entry when a new user signs up via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, user_type, email_notifications)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), -- Fallback to email if no name
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'experienced', -- Default user type, can be changed later
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Policy for the admins table so you can verify who is admin easily
-- This assumes you will manually insert your user_id into this table via SQL editor
-- INSERT INTO public.admins (user_id) VALUES ('your-uuid-here');
