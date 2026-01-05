
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Clock, Loader2, Globe, ServerCrash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { PostJobModal } from '@/app/components/post-job-modal';
import Image from 'next/image';
import { sampleUserProfile } from '@/lib/data';

type JobPosting = {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  job_title: string;
  location: string | null;
  is_remote: boolean;
  employment_type: string;
  created_at: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_postings')
          .select('id, company_name, company_logo_url, job_title, location, is_remote, employment_type, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        setJobs(data || []);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load job postings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [supabase]);
  
  const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true });

  const renderJobCard = (job: JobPosting) => (
    <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 flex-shrink-0">
            {job.company_logo_url ? (
              <Image src={job.company_logo_url} alt={`${job.company_name} logo`} fill className="rounded-lg object-contain" />
            ) : (
              <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className='flex-1'>
            <CardTitle className="text-lg">{job.job_title}</CardTitle>
            <CardDescription className="text-sm font-medium text-foreground">{job.company_name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {job.is_remote ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
            <span>{job.is_remote ? 'Remote' : job.location || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatTime(job.created_at)}</span>
          </div>
        </div>
        <div>
          <Badge variant="secondary" className="capitalize">{job.employment_type.replace('_', '-')}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/jobs/${job.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <PostJobModal isOpen={isJobModalOpen} onOpenChange={setIsJobModalOpen} />
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Briefcase className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Job Board
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                  Find your next opportunity in engineering.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsJobModalOpen(true)} size="lg">
            Post a Job
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader><div className="h-6 w-3/4 bg-muted rounded-md" /></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded-md" />
                        <div className="h-4 w-5/6 bg-muted rounded-md" />
                    </CardContent>
                    <CardFooter>
                         <div className="h-10 w-full bg-muted rounded-md" />
                    </CardFooter>
                </Card>
            ))}
        </div>
        ) : error ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
                <ServerCrash className="h-16 w-16 text-destructive mb-4" />
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
            </Card>
        ) : jobs.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold">No active job postings</h2>
            <p className="text-muted-foreground mt-2">Check back later or be the first to post a job!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(renderJobCard)}
          </div>
        )}
      </div>
    </>
  );
}
