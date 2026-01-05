
'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type PostJobModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
};

export function PostJobModal({ isOpen, onOpenChange }: PostJobModalProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();
    const router = useRouter();

    const [formData, setFormData] = useState({
        job_title: '',
        company_name: '',
        location: '',
        employment_type: '',
        experience_level: '',
        is_remote: false,
        job_description: '',
        application_url: '',
        application_email: '',
        salary_min: '',
        salary_max: '',
        required_skills: '',
    });

    const handleSave = async () => {
        if (!formData.job_title || !formData.company_name || !formData.employment_type || !formData.experience_level) {
            toast({ title: 'Missing Fields', description: 'Please fill in all required fields (*).', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const insertData = {
                posted_by: user.id,
                job_title: formData.job_title,
                company_name: formData.company_name,
                location: formData.location,
                employment_type: formData.employment_type,
                experience_level: formData.experience_level,
                is_remote: formData.is_remote,
                job_description: formData.job_description,
                application_url: formData.application_url || null,
                application_email: formData.application_email || null,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                required_skills: formData.required_skills ? formData.required_skills.split(',').map(s => s.trim()) : [],
            };

            const { error } = await supabase.from('job_postings').insert(insertData);

            if (error) throw error;

            toast({ title: 'Success', description: 'Job posted successfully!' });
            onOpenChange(false);
            router.refresh(); // Refresh the page to show the new job
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to post job.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Post a New Job</DialogTitle>
                    <DialogDescription>Fill out the details below to find the perfect candidate.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="job-title">Job Title *</Label>
                            <Input id="job-title" placeholder="e.g., Software Engineer" value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name *</Label>
                            <Input id="company-name" placeholder="e.g., Engineer For Society" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="job-description">Job Description *</Label>
                        <Textarea id="job-description" placeholder="Describe the role, responsibilities, and qualifications..." rows={6} value={formData.job_description} onChange={(e) => setFormData({ ...formData, job_description: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employment-type">Employment Type *</Label>
                            <Select value={formData.employment_type} onValueChange={(value) => setFormData({ ...formData, employment_type: value })}>
                                <SelectTrigger id="employment-type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full_time">Full-time</SelectItem>
                                    <SelectItem value="part_time">Part-time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                    <SelectItem value="freelance">Freelance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience-level">Experience Level *</Label>
                            <Select value={formData.experience_level} onValueChange={(value) => setFormData({ ...formData, experience_level: value })}>
                                <SelectTrigger id="experience-level">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entry">Entry</SelectItem>
                                    <SelectItem value="mid">Mid-level</SelectItem>
                                    <SelectItem value="senior">Senior</SelectItem>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="executive">Executive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g., San Francisco, CA" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="is_remote" checked={formData.is_remote} onCheckedChange={(checked) => setFormData({ ...formData, is_remote: !!checked })} />
                        <Label htmlFor="is_remote">This is a remote position</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="salary-min">Salary Minimum (USD)</Label>
                            <Input id="salary-min" type="number" placeholder="e.g., 100000" value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary-max">Salary Maximum (USD)</Label>
                            <Input id="salary-max" type="number" placeholder="e.g., 150000" value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="required-skills">Required Skills</Label>
                        <Input id="required-skills" placeholder="e.g., React, Node.js, Python" value={formData.required_skills} onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })} />
                        <p className="text-xs text-muted-foreground">Separate skills with a comma.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Application Method</Label>
                        <Input placeholder="Application URL" value={formData.application_url} onChange={(e) => setFormData({ ...formData, application_url: e.target.value, application_email: '' })}/>
                        <div className="flex items-center gap-2">
                            <div className="flex-grow border-t"></div>
                            <span className="text-xs text-muted-foreground">OR</span>
                            <div className="flex-grow border-t"></div>
                        </div>
                        <Input type="email" placeholder="Application Email" value={formData.application_email} onChange={(e) => setFormData({ ...formData, application_email: e.target.value, application_url: '' })}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Job
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
