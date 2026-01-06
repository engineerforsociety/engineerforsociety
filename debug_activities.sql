-- DEBUG SCRIPT: Check Activity Data
SELECT count(*) FROM public.user_activities;
SELECT * FROM public.user_activities LIMIT 5;
SELECT * FROM public.user_activity_feed LIMIT 5;

-- Check Triggers
SELECT tgname, tgenabled, relname 
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE relname IN ('forum_posts', 'social_posts', 'forum_comments', 'social_comments');
