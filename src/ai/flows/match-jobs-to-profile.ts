'use server';

/**
 * @fileOverview Matches job postings to a user profile using AI.
 *
 * - matchJobsToProfile - A function that takes a user profile and a list of job postings, and returns a list of matched job postings.
 * - MatchJobsToProfileInput - The input type for the matchJobsToProfile function.
 * - MatchedJob - The return type for a matched job posting.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserProfileSchema = z.object({
  name: z.string().describe('The user\'s name.'),
  skills: z.array(z.string()).describe('A list of the user\'s skills.'),
  experience: z
    .string()
    .describe('A summary of the user\'s work experience.'),
  interests: z.string().describe('The user\'s interests.'),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

const JobPostingSchema = z.object({
  id: z.string().describe('The unique identifier of the job posting.'),
  title: z.string().describe('The title of the job.'),
  description: z.string().describe('A detailed description of the job.'),
  requirements: z.string().describe('The required skills and experience.'),
});

export type JobPosting = z.infer<typeof JobPostingSchema>;

const MatchJobsToProfileInputSchema = z.object({
  userProfile: UserProfileSchema.describe('The user profile to match against.'),
  jobPostings: z
    .array(JobPostingSchema)
    .describe('A list of job postings to match.'),
});

export type MatchJobsToProfileInput = z.infer<typeof MatchJobsToProfileInputSchema>;

const MatchedJobSchema = JobPostingSchema.extend({
  matchScore: z
    .number()
    .describe('A score indicating how well the job matches the profile.'),
  reason: z.string().describe('The reason why the job was matched.'),
});

export type MatchedJob = z.infer<typeof MatchedJobSchema>;

export async function matchJobsToProfile(
  input: MatchJobsToProfileInput
): Promise<MatchedJob[]> {
  return matchJobsToProfileFlow(input);
}

const matchJobsToProfilePrompt = ai.definePrompt({
  name: 'matchJobsToProfilePrompt',
  input: {schema: MatchJobsToProfileInputSchema},
  output: {schema: z.array(MatchedJobSchema)},
  prompt: `You are an AI job matcher. You will be given a user profile and a list of job postings. You will return a list of job postings that match the user profile, along with a match score and a reason for the match.

User Profile:
Name: {{{userProfile.name}}}
Skills: {{#each userProfile.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Experience: {{{userProfile.experience}}}
Interests: {{{userProfile.interests}}}

Job Postings:
{{#each jobPostings}}
ID: {{{id}}}
Title: {{{title}}}
Description: {{{description}}}
Requirements: {{{requirements}}}
{{/each}}

For each job posting, generate a matchScore between 0 and 1, and a reason for the match, return the result as a MatchedJob object.
Return all matches as a JSON array.
`,
});

const matchJobsToProfileFlow = ai.defineFlow(
  {
    name: 'matchJobsToProfileFlow',
    inputSchema: MatchJobsToProfileInputSchema,
    outputSchema: z.array(MatchedJobSchema),
  },
  async input => {
    const {output} = await matchJobsToProfilePrompt(input);
    return output!;
  }
);
