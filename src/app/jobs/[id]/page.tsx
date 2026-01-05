
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound, useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, MapPin, Building, Clock, Loader2, Globe, ServerCrash, ArrowLeft, Send, Upload, FileText, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditJobModal } from '@/app/components/edit-job-modal';

type JobPosting = {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  job_title: string;
  job_description: string;
  location: string | null;
  is_remote: boolean;
  employment_type: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: string[];
  application_url: string | null;
  application_email: string | null;
  posted_by: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
};

type JobApplication = {
    job_id: string;
    applicant_id: string;
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [job, setJob] = useState<JobPosting | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchJobAndUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);

        const { data: jobData, error: jobError } = await supabase
          .from('job_postings')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (jobError || !jobData) {
          throw new Error('Job not found');
        }
        setJob(jobData as JobPosting);

        if (userData.user) {
            const { data: applicationData, error: applicationError } = await supabase
                .from('job_applications')
                .select('job_id')
                .eq('job_id', id)
                .eq('applicant_id', userData.user.id)
                .maybeSingle();
            
            if (applicationError) throw applicationError;
            
            if(applicationData) {
                setHasApplied(true);
            }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndUser();
  }, [id, supabase]);

  const handleApply = async () => {
    if (!user) {
        toast({ title: "Authentication required", description: "You must be logged in to apply.", variant: "destructive" });
        return;
    }
    setIsApplyModalOpen(true);
  };
  
  const handleApplicationSubmit = async () => {
    if (!user || !job) return;
    
    setIsSubmitting(true);
    try {
        // Step 1: Upload resume if it exists
        let resume_url = null;
        if (resumeFile) {
            const filePath = `${user.id}/${job.id}-${resumeFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, resumeFile, { upsert: true });

            if (uploadError) throw new Error(`Resume upload failed: ${uploadError.message}`);
            
            const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
            resume_url = urlData.publicUrl;
        }

        // Step 2: Insert application record
        const { error: insertError } = await supabase
            .from('job_applications')
            .insert({
                job_id: job.id,
                applicant_id: user.id,
                cover_letter: coverLetter,
                resume_url: resume_url,
            });
        
        if (insertError) {
             if (insertError.code === '23505') { // unique_violation
                throw new Error("You have already applied for this job.");
            }
            throw insertError;
        }

        toast({ title: "Application Submitted!", description: "Your application has been successfully sent." });
        setHasApplied(true);
        setIsApplyModalOpen(false);

    } catch (error: any) {
        console.error("Application submission error:", error);
        toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if (!job) return;

    try {
        const { error } = await supabase
            .from('job_postings')
            .delete()
            .eq('id', job.id);

        if (error) throw error;
        
        toast({ title: "Job Deleted", description: "The job posting has been successfully removed." });
        router.push('/jobs');
        router.refresh();
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to delete job.", variant: "destructive"});
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error || !job) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-lg text-center p-8">
                <ServerCrash className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Job Not Found</h1>
                <p className="text-muted-foreground mt-2">{error || "The job posting you are looking for does not exist or has been removed."}</p>
                <Button asChild className="mt-6">
                    <Link href="/jobs">Back to Jobs</Link>
                </Button>
            </Card>
        </div>
    );
  }
  
  const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true });
  const isOwner = user?.id === job.posted_by;

  return (
    <>
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" asChild>
            <Link href="/jobs" className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all jobs
            </Link>
        </Button>
        {isOwner && (
            <div className='flex gap-2'>
                 <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this job posting.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 flex-shrink-0">
                {job.company_logo_url ? (
                  <Image src={job.company_logo_url} alt={`${job.company_name} logo`} fill className="rounded-lg object-contain" />
                ) : (
                  <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
                    <Building className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <CardTitle className="text-2xl md:text-3xl font-bold">{job.job_title}</CardTitle>
                <CardDescription className="text-lg font-medium text-foreground">{job.company_name}</CardDescription>
              </div>
            </div>
            {job.profiles && (
                <div className="flex items-center gap-3 border-t pt-4">
                     <Avatar className="h-10 w-10">
                        <AvatarImage src={job.profiles.avatar_url} />
                        <AvatarFallback>{job.profiles.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Posted by</p>
                        <p className="font-semibold">{job.profiles.full_name}</p>
                    </div>
                </div>
            )}
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    {job.is_remote ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    <span>{job.is_remote ? 'Remote' : job.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{job.employment_type.replace('_', '-')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatTime(job.created_at)}</span>
                </div>
            </div>
            
            <Separator />

            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <h3 className="font-semibold text-foreground">Job Description</h3>
                <p className="whitespace-pre-wrap">{job.job_description}</p>
            </div>
            
            {(job.salary_min || job.salary_max) && (
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Salary</h3>
                    <p className="text-muted-foreground">
                        ${job.salary_min?.toLocaleString() || 'N/A'} - ${job.salary_max?.toLocaleString() || 'N/A'} USD
                    </p>
                </div>
            )}

            {job.required_skills && job.required_skills.length > 0 && (
                <div>
                    <h3 className="font-semibold text-foreground mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {job.required_skills.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-6">
            {hasApplied ? (
                 <Button disabled className="w-full md:w-auto">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Applied
                </Button>
            ) : job.application_url ? (
                <Button asChild className="w-full md:w-auto">
                    <a href={job.application_url} target="_blank" rel="noopener noreferrer">Apply on company site</a>
                </Button>
            ) : job.application_email ? (
                 <Button asChild className="w-full md:w-auto">
                    <a href={`mailto:${job.application_email}?subject=Application for ${job.job_title}`}>Apply via Email</a>
                </Button>
            ) : (
                <Button onClick={handleApply} className="w-full md:w-auto">
                    Apply Now
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
    <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Apply for {job.job_title}</DialogTitle>
                <DialogDescription>Submit your application directly through Engineer For Society.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                    <Textarea id="cover-letter" rows={5} placeholder="Briefly explain why you're a great fit for this role..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="resume">Resume (PDF, DOCX)</Label>
                    <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files ? e.target.files[0] : null)} />
                    {resumeFile && <p className="text-xs text-muted-foreground">Selected: {resumeFile.name}</p>}
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
                <Button onClick={handleApplicationSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Application
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    {isOwner && job && (
        <EditJobModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            job={job}
        />
    )}
    </>
  );
}
