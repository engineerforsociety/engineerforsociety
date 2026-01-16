-- =====================================================
-- RESOURCES PAGE PERFORMANCE OPTIMIZATION
-- =====================================================
-- Purpose: Add indexes to speed up resource queries
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add index on status column (most common filter)
CREATE INDEX IF NOT EXISTS idx_resources_status 
ON resources(status) 
WHERE status = 'approved';

-- 2. Add index on category for filtering
CREATE INDEX IF NOT EXISTS idx_resources_category 
ON resources(category) 
WHERE status = 'approved';

-- 3. Add index on discipline for filtering
CREATE INDEX IF NOT EXISTS idx_resources_discipline 
ON resources(discipline) 
WHERE status = 'approved';

-- 4. Add compound index for common query patterns
CREATE INDEX IF NOT EXISTS idx_resources_status_created 
ON resources(status, created_at DESC) 
WHERE status = 'approved';

-- 5. Add compound index for category + created_at
CREATE INDEX IF NOT EXISTS idx_resources_category_created 
ON resources(category, created_at DESC) 
WHERE status = 'approved';

-- 6. Add compound index for discipline + created_at
CREATE INDEX IF NOT EXISTS idx_resources_discipline_created 
ON resources(discipline, created_at DESC) 
WHERE status = 'approved';

-- 7. Add GIN index for full-text search on title
CREATE INDEX IF NOT EXISTS idx_resources_title_search 
ON resources USING GIN(to_tsvector('english', title));

-- 8. Add index on slug for single resource lookups
CREATE INDEX IF NOT EXISTS idx_resources_slug 
ON resources(slug);

-- 9. Add index on author_id for join optimization
CREATE INDEX IF NOT EXISTS idx_resources_author_id 
ON resources(author_id);

-- 10. Optimize resource_interactions table
CREATE INDEX IF NOT EXISTS idx_resource_interactions_resource_id 
ON resource_interactions(resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_resource 
ON resource_interactions(user_id, resource_id, interaction_type);

-- 11. Create materialized view for aggregated counts (optional but very fast)
-- This will cache the aggregated counts
CREATE MATERIALIZED VIEW IF NOT EXISTS resources_with_counts AS
SELECT 
    r.*,
    COUNT(DISTINCT CASE WHEN ri.interaction_type = 'upvote' THEN ri.id END) as upvote_count,
    COUNT(DISTINCT CASE WHEN ri.interaction_type = 'bookmark' THEN ri.id END) as bookmark_count,
    COALESCE(r.view_count, 0) as view_count
FROM resources r
LEFT JOIN resource_interactions ri ON r.id = ri.resource_id
WHERE r.status = 'approved'
GROUP BY r.id;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_resources_with_counts_id 
ON resources_with_counts(id);

-- Create indexes on materialized view for fast filtering
CREATE INDEX IF NOT EXISTS idx_rvc_category ON resources_with_counts(category);
CREATE INDEX IF NOT EXISTS idx_rvc_discipline ON resources_with_counts(discipline);
CREATE INDEX IF NOT EXISTS idx_rvc_created ON resources_with_counts(created_at DESC);

-- 12. Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_resources_counts()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY resources_with_counts;
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger to auto-refresh on changes (optional - can be done via cron job)
-- Note: You might want to refresh this periodically instead of on every change
-- For now, we'll skip the trigger and refresh it via revalidation

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('resources', 'resource_interactions', 'resources_with_counts')
ORDER BY tablename, indexname;

-- Check materialized view
SELECT COUNT(*) as total_resources FROM resources_with_counts;

-- Sample query to test performance
EXPLAIN ANALYZE
SELECT * FROM resources_with_counts
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 50;

-- =====================================================
-- REFRESH COMMAND (Run this periodically or after data changes)
-- =====================================================
-- REFRESH MATERIALIZED VIEW CONCURRENTLY resources_with_counts;
