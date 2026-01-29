"use server";

import { summarizeDocument, SummarizeDocumentInput } from "@/ai/flows/summarize-document";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';



const ResourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  resource_type: z.string(),
  category: z.string(),
  discipline: z.string(),
  skill_level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  source_type: z.enum(['External Website', 'Google Drive', 'GitHub', 'YouTube', 'Research Portal']),
  external_url: z.string().url("Must be a valid URL"),
  embed_url: z.string().optional(),
  author_org: z.string().optional(),
  year: z.string().optional(),
  license: z.string().optional(),
  is_original_creator: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

const SummarizeSchema = z.object({
  documentContent: z.string().min(100, "Document content must be at least 100 characters long."),
});

type SummarizeState = {
  summary?: string;
  error?: string;
};

export async function getSummary(
  prevState: SummarizeState,
  formData: FormData
): Promise<SummarizeState> {
  const validatedFields = SummarizeSchema.safeParse({
    documentContent: formData.get("documentContent"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.documentContent?.[0] || 'Invalid input.',
    };
  }

  try {
    const input: SummarizeDocumentInput = {
      documentContent: validatedFields.data.documentContent,
    };
    const result = await summarizeDocument(input);
    return { summary: result.summary };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate summary. Please try again." };
  }
}

// Use a direct client for service-role-like access if needed, or just anon key for public data
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// High-performance cached function for ALL approved resources
// Defined at module level to ensure correct memoization
export const getCachedAllResources = unstable_cache(
  async () => {
    console.time('fetch-resources-db');
    const { data, error } = await supabaseAdmin
      .from('resources')
      .select(`
        id,
        title,
        description,
        resource_type,
        category,
        discipline,
        author_id,
        author_org,
        external_url,
        embed_url,
        upvote_count,
        bookmark_count,
        view_count,
        created_at,
        year,
        license,
        skill_level,
        is_premium,
        tags,
        slug,
        profiles:author_id (full_name, avatar_url)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    console.timeEnd('fetch-resources-db');

    if (error) {
      console.error('Supabase error fetching resources:', error);
      return [];
    }

    return data || [];
  },
  ['resources-master-list'],
  {
    revalidate: 60, // ISR: 1 minute revalidation
    tags: ['resources']
  }
);

/**
 * Optimized fetchResources that leverages a single master cache.
 * Even with filters, it will hit the master cache and filter in memory,
 * which is orders of magnitude faster than a DB query + cache miss.
 */
export async function fetchResources(filters?: { category?: string; discipline?: string; query?: string }) {
  const allResources = await getCachedAllResources();

  if (!filters) return allResources;

  const { category, discipline, query } = filters;

  // High-speed in-memory filtering
  return allResources.filter((r: any) => {
    const matchesCategory = !category || category === 'All' || r.category === category;
    const matchesDiscipline = !discipline || discipline === 'All' || r.discipline === discipline;
    const matchesQuery = !query || r.title.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesDiscipline && matchesQuery;
  });
}



// High-performance cached function for a SINGLE resource by slug
export const getCachedResourceBySlug = unstable_cache(
  async (slug: string) => {
    const { data, error } = await supabaseAdmin
      .from('resources')
      .select(`
        id,
        title,
        description,
        resource_type,
        category,
        discipline,
        author_id,
        author_org,
        external_url,
        embed_url,
        upvote_count,
        bookmark_count,
        view_count,
        created_at,
        year,
        license,
        skill_level,
        is_premium,
        tags,
        slug,
        profiles:author_id (full_name, avatar_url)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching resource by slug:', error);
      return null;
    }

    return data;
  },
  ['resource-single-detail'],
  {
    revalidate: 60,
    tags: ['resources']
  }
);

export async function fetchResourceBySlug(slug: string) {
  return getCachedResourceBySlug(slug);
}


export async function createResource(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to contribute resources.");
  }

  // Validate data with Zod
  const validatedData = ResourceSchema.parse(data);

  const { error } = await supabase.from('resources').insert({
    ...validatedData,
    author_id: user.id,
    status: 'approved' // Auto-approve for now so user can see their results immediately
  });

  if (error) {
    console.error('Error creating resource:', error);
    throw error;
  }

  return { success: true };
}

export async function toggleInteraction(resourceId: string, interactionType: 'upvote' | 'bookmark') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  // Check if interaction exists
  const { data: existing } = await supabase
    .from('resource_interactions')
    .select('id')
    .eq('resource_id', resourceId)
    .eq('user_id', user.id)
    .eq('interaction_type', interactionType)
    .single();

  if (existing) {
    // Delete interaction
    const { error } = await supabase
      .from('resource_interactions')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return { active: false };
  } else {
    // Insert interaction
    const { error } = await supabase
      .from('resource_interactions')
      .insert({
        resource_id: resourceId,
        user_id: user.id,
        interaction_type: interactionType
      });
    if (error) throw error;
    return { active: true };
  }
}

export async function deleteResource(resourceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', resourceId)
    .eq('author_id', user.id); // Security: ensures only author can delete

  if (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }

  return { success: true };
}

export async function updateResource(resourceId: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required");

  // Validate data with Zod
  const validatedData = ResourceSchema.parse(data);

  const { error } = await supabase
    .from('resources')
    .update({
      ...validatedData,
      updated_at: new Date().toISOString()
    })
    .eq('id', resourceId)
    .eq('author_id', user.id); // Security: ensures only author can update

  if (error) {
    console.error('Error updating resource:', error);
    throw error;
  }

  return { success: true };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function fetchLinkMetadata(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) return null;

    const html = await response.text();

    const getMeta = (property: string) => {
      const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
      const match = html.match(regex);
      if (match) return match[1];

      // Try name attribute if property fails
      const regexName = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
      const matchName = html.match(regexName);
      return matchName ? matchName[1] : null;
    };

    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);

    let image = getMeta("og:image") || "";
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url);
      image = new URL(image, urlObj.origin).href;
    }

    return {
      title: getMeta("og:title") || (titleMatch ? titleMatch[1] : ""),
      description: getMeta("og:description") || getMeta("description") || "",
      image: image,
      url: url,
    };
  } catch (error) {
    console.error("Link metadata fetch error:", error);
    return null;
  }
}
