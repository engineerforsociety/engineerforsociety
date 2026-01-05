
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Clock, Loader2, Edit, Trash2, Plus, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { PostJobModal } from '@/app/components/post-job-modal';
import { EditJobModal } from '@/app/components/edit-job-modal';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type JobPosting = {
    id: string;
    company_name: string;
    job_title: string;
    job_description: string;
    location: string | null;
    is_remote: boolean;
    employment_type: string;
    experience_level: string;
    created_at: string;
    status: string;
    salary_min: number | null;
    salary_max: number | null;
    required_skills: string[];
    application_url: string | null;
    application_email: string | null;
};

export default function ManageJobsPage() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

    const supabase = createClient();
    const { toast } = useToast();
    const router = useRouter();

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('job_postings')
                .select('*')
                .eq('posted_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (err: any) {
            console.error('Error fetching your jobs:', err);
            toast({ title: 'Error', description: 'Failed to load your job postings.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyJobs();
    }, [supabase]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('job_postings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setJobs(jobs.filter(job => job.id !== id));
            toast({ title: 'Deleted', description: 'Job posting removed successfully.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to delete job.', variant: 'destructive' });
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (job: JobPosting) => {
        setSelectedJob(job);
        setIsEditModalOpen(true);
    };

    const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true });

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <Link href="/jobs" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Jobs
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Manage Your Jobs</h1>
                            <p className="text-muted-foreground">Edit, remove, or post new job opportunities.</p>
                        </div>
                    </div>
                </div>
                <Button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Post a New Job
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading your postings...</p>
                </div>
            ) : jobs.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Briefcase className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h2 className="text-xl font-semibold">You haven't posted any jobs yet</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">Share opportunities with the community and find the right talent for your team.</p>
                    <Button onClick={() => setIsPostModalOpen(true)} variant="outline" className="mt-6">
                        Create Your First Posting
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <Card key={job.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg line-clamp-1">{job.job_title}</CardTitle>
                                        <CardDescription className="font-medium text-foreground">{job.company_name}</CardDescription>
                                    </div>
                                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {job.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{job.is_remote ? 'Remote' : job.location || 'Location not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Posted {formatTime(job.created_at)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="outline" className="capitalize text-[10px]">{job.employment_type.replace('_', ' ')}</Badge>
                                    <Badge variant="outline" className="capitalize text-[10px]">{job.experience_level}</Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(job)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleDelete(job.id)}
                                    disabled={deletingId === job.id}
                                >
                                    {deletingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="mr-2 h-4 w-4" /> Delete</>}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modals */}
            <PostJobModal
                isOpen={isPostModalOpen}
                onOpenChange={(open) => {
                    setIsPostModalOpen(open);
                    if (!open) fetchMyJobs();
                }}
            />

            {selectedJob && (
                <EditJobModal
                    isOpen={isEditModalOpen}
                    onOpenChange={(open) => {
                        setIsEditModalOpen(open);
                        if (!open) {
                            fetchMyJobs();
                            setSelectedJob(null);
                        }
                    }}
                    job={selectedJob}
                />
            )}
        </div>
    );
}
