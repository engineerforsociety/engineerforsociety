"use server";

import { summarizeDocument, SummarizeDocumentInput } from "@/ai/flows/summarize-document";
import { z } from "zod";

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
