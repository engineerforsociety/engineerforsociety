
'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Clock, Loader2, Globe, ServerCrash, Search, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { PostJobModal } from '@/app/components/post-job-modal';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type JobPosting = {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  job_title: string;
  location: string | null;
  is_remote: boolean;
  employment_type: string;
  created_at: string;
  experience_level: string; // Added for filtering
};

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    employment_type: '',
    experience_level: '',
    is_remote: '', // 'true', 'false', or ''
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('job_postings')
          .select('id, company_name, company_logo_url, job_title, location, is_remote, employment_type, created_at, experience_level')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          throw error;
        }
        setAllJobs(data || []);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load job postings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [supabase]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        job.job_title.toLowerCase().includes(searchLower) ||
        job.company_name.toLowerCase().includes(searchLower) ||
        (job.location && job.location.toLowerCase().includes(searchLower));

      const matchesEmployment = !filters.employment_type || job.employment_type === filters.employment_type;
      const matchesExperience = !filters.experience_level || job.experience_level === filters.experience_level;
      const matchesRemote = !filters.is_remote || job.is_remote.toString() === filters.is_remote;

      return matchesSearch && matchesEmployment && matchesExperience && matchesRemote;
    });
  }, [allJobs, searchQuery, filters]);

  const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      employment_type: '',
      experience_level: '',
      is_remote: '',
    });
  };

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
        
        {/* Filter and Search Section */}
        <Card>
          <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:flex gap-4">
              <Select value={filters.employment_type} onValueChange={(value) => handleFilterChange('employment_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.experience_level} onValueChange={(value) => handleFilterChange('experience_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid-level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.is_remote} onValueChange={(value) => handleFilterChange('is_remote', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="true">Remote</SelectItem>
                  <SelectItem value="false">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              <X className="mr-2 h-4 w-4" /> Clear
            </Button>
          </CardContent>
        </Card>

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
        ) : filteredJobs.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold">No job postings found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your search filters or check back later.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(renderJobCard)}
          </div>
        )}
      </div>
    </>
  );
}
