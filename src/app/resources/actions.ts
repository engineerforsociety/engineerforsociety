"use server";

import { summarizeDocument, SummarizeDocumentInput } from "@/ai/flows/summarize-document";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ResourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  resource_type: z.string(),
  category: z.string(),
  discipline: z.string(),
  file_url: z.string().optional(),
  external_url: z.string().optional(),
  github_url: z.string().optional(),
  youtube_url: z.string().optional(),
  ieee_url: z.string().optional(),
  embed_url: z.string().optional(),
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

export async function fetchResources(filters?: { category?: string; discipline?: string; query?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from('resources')
    .select(`
            *,
            profiles:author_id (full_name, avatar_url)
        `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters?.discipline && filters.discipline !== 'All') {
    query = query.eq('discipline', filters.discipline);
  }

  if (filters?.query) {
    query = query.ilike('title', `%${filters.query}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }

  return data;
}

export async function createResource(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to contribute resources.");
  }

  const { error } = await supabase.from('resources').insert({
    ...data,
    author_id: user.id,
    status: 'approved' // Auto-approve for now so user can see their results immediately
  });

  if (error) {
    console.error('Error creating resource:', error);
    throw error;
  }

  return { success: true };
}
