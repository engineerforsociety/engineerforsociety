-- =====================================================
-- SEARCH FEATURES & AUTO-SUGGESTIONS SETUP
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create search_history table to track user searches
CREATE TABLE IF NOT EXISTS search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    category TEXT,
    discipline TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast search history lookup
CREATE INDEX IF NOT EXISTS idx_search_history_user_id 
ON search_history(user_id);

CREATE INDEX IF NOT EXISTS idx_search_history_query 
ON search_history(search_query);

CREATE INDEX IF NOT EXISTS idx_search_history_created 
ON search_history(created_at DESC);

-- 3. Create materialized view for popular searches
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_searches AS
SELECT 
    search_query,
    COUNT(*) as search_count,
    AVG(result_count) as avg_results,
    MAX(created_at) as last_searched
FROM search_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY search_query
HAVING COUNT(*) > 2
ORDER BY search_count DESC
LIMIT 50;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_searches_query 
ON popular_searches(search_query);

-- 4. Create function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
    search_term TEXT,
    suggestion_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    suggestion TEXT,
    match_type TEXT,
    relevance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    -- Combine multiple suggestion sources
    WITH title_matches AS (
        SELECT DISTINCT 
            title as suggestion,
            'resource_title' as match_type,
            3 as relevance_score
        FROM resources
        WHERE status = 'approved'
        AND title ILIKE '%' || search_term || '%'
        LIMIT 5
    ),
    tag_matches AS (
        SELECT DISTINCT 
            unnest(tags) as suggestion,
            'tag' as match_type,
            2 as relevance_score
        FROM resources
        WHERE status = 'approved'
        AND tags && ARRAY[search_term]::TEXT[]
        LIMIT 3
    ),
    popular_matches AS (
        SELECT DISTINCT
            search_query as suggestion,
            'popular_search' as match_type,
            1 as relevance_score
        FROM popular_searches
        WHERE search_query ILIKE '%' || search_term || '%'
        LIMIT 3
    )
    SELECT * FROM title_matches
    UNION ALL
    SELECT * FROM tag_matches
    UNION ALL
    SELECT * FROM popular_matches
    ORDER BY relevance_score DESC, suggestion ASC
    LIMIT suggestion_limit;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to log search
CREATE OR REPLACE FUNCTION log_search(
    p_user_id UUID,
    p_search_query TEXT,
    p_result_count INTEGER,
    p_category TEXT DEFAULT NULL,
    p_discipline TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO search_history (user_id, search_query, result_count, category, discipline)
    VALUES (p_user_id, p_search_query, p_result_count, p_category, p_discipline);
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to refresh popular searches (run periodically)
CREATE OR REPLACE FUNCTION refresh_popular_searches()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_searches;
END;
$$ LANGUAGE plpgsql;

-- 7. Enable RLS on search_history
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own search history
CREATE POLICY "Users can view own search history"
ON search_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own searches
CREATE POLICY "Users can insert own searches"
ON search_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 8. Create trending searches view (last 7 days)
CREATE OR REPLACE VIEW trending_searches AS
SELECT 
    search_query,
    COUNT(*) as search_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(result_count) as avg_results
FROM search_history
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY search_query
HAVING COUNT(*) > 1
ORDER BY search_count DESC
LIMIT 20;

-- 9. Improve full-text search with ts_vector
-- Add tsvector column for better search performance
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(author_org, '')), 'C')
) STORED;

-- Create GIN index on search_vector
CREATE INDEX IF NOT EXISTS idx_resources_search_vector 
ON resources USING GIN(search_vector);

-- 10. Create smart search function
CREATE OR REPLACE FUNCTION search_resources(
    search_query TEXT,
    p_category TEXT DEFAULT NULL,
    p_discipline TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    discipline TEXT,
    resource_type TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.description,
        r.category,
        r.discipline,
        r.resource_type,
        ts_rank(r.search_vector, websearch_to_tsquery('english', search_query)) as rank
    FROM resources r
    WHERE r.status = 'approved'
    AND r.search_vector @@ websearch_to_tsquery('english', search_query)
    AND (p_category IS NULL OR r.category = p_category)
    AND (p_discipline IS NULL OR r.discipline = p_discipline)
    ORDER BY rank DESC, r.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION & TESTING
-- =====================================================

-- Test search suggestions
SELECT * FROM get_search_suggestions('python', 5);

-- Test smart search
SELECT * FROM search_resources('machine learning', NULL, NULL, 10);

-- View trending searches
SELECT * FROM trending_searches;

-- Refresh popular searches (run this daily via cron job or manually)
SELECT refresh_popular_searches();

-- =====================================================
-- CLEANUP (if you want to reset)
-- =====================================================
-- DROP TABLE IF EXISTS search_history CASCADE;
-- DROP MATERIALIZED VIEW IF EXISTS popular_searches CASCADE;
-- DROP FUNCTION IF EXISTS get_search_suggestions CASCADE;
-- DROP FUNCTION IF EXISTS log_search CASCADE;
-- DROP VIEW IF EXISTS trending_searches CASCADE;

-- =====================================================
-- DONE! Search features are now ready! 🎉
-- =====================================================
