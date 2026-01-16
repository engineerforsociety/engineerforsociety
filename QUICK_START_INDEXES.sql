-- =====================================================
-- QUICK START: Resources Page Optimization
-- =====================================================
-- Copy this entire file and run it in Supabase SQL Editor
-- This will create all necessary indexes for fast queries
-- =====================================================

-- 1. Status-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_resources_status 
ON resources(status) 
WHERE status = 'approved';

-- 2. Category filtering with sort
CREATE INDEX IF NOT EXISTS idx_resources_category_created 
ON resources(category, created_at DESC) 
WHERE status = 'approved';

-- 3. Discipline filtering with sort
CREATE INDEX IF NOT EXISTS idx_resources_discipline_created 
ON resources(discipline, created_at DESC) 
WHERE status = 'approved';

-- 4. Combined status + date sort
CREATE INDEX IF NOT EXISTS idx_resources_status_created 
ON resources(status, created_at DESC) 
WHERE status = 'approved';

-- 5. Full-text search on title
CREATE INDEX IF NOT EXISTS idx_resources_title_search 
ON resources USING GIN(to_tsvector('english', title));

-- 6. Slug lookup (for individual resource pages)
CREATE INDEX IF NOT EXISTS idx_resources_slug 
ON resources(slug);

-- 7. Author lookup
CREATE INDEX IF NOT EXISTS idx_resources_author_id 
ON resources(author_id);

-- 8. Resource interactions optimization
CREATE INDEX IF NOT EXISTS idx_resource_interactions_resource_id 
ON resource_interactions(resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_resource 
ON resource_interactions(user_id, resource_id, interaction_type);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this query to verify indexes were created:

SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('resources', 'resource_interactions')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- You should see 9 indexes starting with 'idx_'

-- =====================================================
-- TEST PERFORMANCE
-- =====================================================
-- Test query speed (should be < 50ms with indexes):

EXPLAIN ANALYZE
SELECT 
    id, title, category, discipline, created_at,
    upvote_count, bookmark_count
FROM resources
WHERE status = 'approved'
  AND category = 'Code & Tools'
ORDER BY created_at DESC
LIMIT 50;

-- Look for "Index Scan" in the output (good!)
-- Avoid "Seq Scan" (bad - means index not used)

-- =====================================================
-- DONE! Your /resources page is now optimized! 🚀
-- =====================================================
