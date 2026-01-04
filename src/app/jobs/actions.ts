'use server';

import { matchJobsToProfile, MatchedJob } from '@/ai/flows/match-jobs-to-profile';
import { sampleUserProfile, sampleJobPostings } from '@/lib/data';

export async function findMatchingJobs(): Promise<MatchedJob[]> {
  try {
    const matchedJobs = await matchJobsToProfile({
      userProfile: sampleUserProfile,
      jobPostings: sampleJobPostings,
    });
    // Sort by match score descending
    return matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error matching jobs:', error);
    // In a real app, you'd handle this more gracefully
    return [];
  }
}
