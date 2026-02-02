
'use client'; // This will be simulated for now since we are in dev, but usually it's 'use server'

import { createClient } from '@/lib/supabase/client';

export async function toggleProjectLike(projectId: string, userId: string) {
    const supabase = createClient();

    // Check if liked
    const { data: existingLike } = await supabase
        .from('project_likes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

    if (existingLike) {
        return await supabase
            .from('project_likes')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);
    } else {
        return await supabase
            .from('project_likes')
            .insert({ project_id: projectId, user_id: userId });
    }
}

export async function addProjectComment(projectId: string, userId: string, content: string, parentId?: string) {
    const supabase = createClient();
    return await supabase
        .from('project_comments')
        .insert({
            project_id: projectId,
            user_id: userId,
            content,
            parent_id: parentId
        });
}

export async function logProjectShare(projectId: string, userId: string | null, platform: string) {
    const supabase = createClient();
    return await supabase
        .from('project_shares')
        .insert({
            project_id: projectId,
            user_id: userId,
            share_platform: platform
        });
}
