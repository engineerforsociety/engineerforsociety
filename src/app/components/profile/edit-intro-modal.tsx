
'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type EditIntroModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    profile: any;
};

export function EditIntroModal({ isOpen, onOpenChange, profile }: EditIntroModalProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        full_name: '',
        job_title: '',
        company: '',
        industry: '',
        location: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                job_title: profile.job_title || '',
                company: profile.company || '',
                industry: profile.engineering_field || '',
                location: profile.location || '',
            });
        }
    }, [profile, isOpen]);

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    job_title: formData.job_title,
                    company: formData.company,
                    engineering_field: formData.industry,
                    location: formData.location,
                    is_onboarding_complete: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

            toast({ title: 'Success', description: 'Intro updated successfully!' });
            onOpenChange(false);
            window.location.reload();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Intro</DialogTitle>
                    <DialogDescription>Update your basic profile information.</DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto p-1 text-left">
                    <div className="space-y-6 pr-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full name *</Label>
                            <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="job_title">Headline / Job Title</Label>
                            <Input id="job_title" value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Current Position</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company / Organization</Label>
                                    <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Engineering Field / Industry</Label>
                                    <Input id="industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
                            <div className="space-y-2">
                                <Label htmlFor="location">City, Country</Label>
                                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
