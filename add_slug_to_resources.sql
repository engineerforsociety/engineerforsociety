-- Add slug column to resources table
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_resource_slug()
RETURNS TRIGGER AS $$
DECLARE
    new_slug TEXT;
    counter INTEGER := 0;
    base_slug TEXT;
BEGIN
    -- Convert title to slug format
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    new_slug := base_slug;
    
    -- Check for uniqueness and append counter if necessary
    WHILE EXISTS (SELECT 1 FROM public.resources WHERE slug = new_slug AND id <> NEW.id) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := new_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate slug on insert or title update
DROP TRIGGER IF EXISTS tr_generate_resource_slug ON public.resources;
CREATE TRIGGER tr_generate_resource_slug
BEFORE INSERT OR UPDATE OF title ON public.resources
FOR EACH ROW EXECUTE FUNCTION generate_resource_slug();

-- Update existing rows to have a slug
UPDATE public.resources SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
