'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { findMatchingJobs } from '@/app/jobs/actions';
import type { MatchedJob } from '@/ai/flows/match-jobs-to-profile';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Star, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { sampleJobPostings, sampleUserProfile } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function JobMatcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleMatchJobs = async () => {
    setIsLoading(true);
    setError(null);
    setMatchedJobs([]);
    try {
      const jobs = await findMatchingJobs();
      setMatchedJobs(jobs);
    } catch (e) {
      setError('Failed to fetch job matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.8) return 'bg-emerald-500';
    if (score > 0.6) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Job Matcher</CardTitle>
          <CardDescription>
            Based on your profile skills ({sampleUserProfile.skills.slice(0,3).join(', ')}...) and experience, we can find the most relevant jobs from our partners.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleMatchJobs} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Matching...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Find Matching Jobs
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-3/4 bg-muted rounded-md" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-4 w-full bg-muted rounded-md mb-2" />
                        <div className="h-4 w-5/6 bg-muted rounded-md" />
                    </CardContent>
                    <CardFooter>
                         <div className="h-8 w-24 bg-muted rounded-md" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      )}

      {matchedJobs.length > 0 && (
        <div className="space-y-4">
            <Alert variant="default" className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle className="text-emerald-800 dark:text-emerald-300">Matching Complete!</AlertTitle>
                <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                    We found {matchedJobs.length} potential matches for you. Here are the top results.
                </AlertDescription>
            </Alert>
          {matchedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.requirements}</CardDescription>
                    </div>
                     <Badge variant="secondary" className="whitespace-nowrap">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" /> {(job.matchScore * 100).toFixed(0)}% Match
                    </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{job.description}</p>
                <div className="text-sm p-3 bg-muted/50 rounded-md border">
                    <p className="font-semibold text-foreground mb-1">AI Match Reason:</p>
                    <p className="text-muted-foreground">{job.reason}</p>
                </div>
              </CardContent>
               <CardFooter className="flex justify-end">
                    <Button>Apply Now</Button>
               </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {matchedJobs.length === 0 && !isLoading && (
        <div className="text-center py-12">
            <h3 className="text-xl font-medium">Original Job Postings</h3>
            <p className="text-muted-foreground mb-4">Click the button above to see which are the best fit for you.</p>
            <div className="space-y-4">
                 {sampleJobPostings.map((job) => (
                    <Card key={job.id} className="text-left">
                        <CardHeader>
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription>{job.requirements}</CardDescription>
                        </CardHeader>
                    </Card>
                 ))}
            </div>
        </div>
      )}
    </div>
  );
}
