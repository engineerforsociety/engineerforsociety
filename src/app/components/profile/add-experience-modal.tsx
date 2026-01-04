
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
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AddExperienceModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
};

export function AddExperienceModal({ isOpen, onOpenChange }: AddExperienceModalProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        company_name: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
    });

    const handleSave = async () => {
        if (!formData.title || !formData.company_name) {
            toast({ title: 'Important', description: 'Title and Company Name are required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('experiences')
                .insert({
                    profile_id: user.id,
                    title: formData.title,
                    company_name: formData.company_name,
                    location: formData.location,
                    start_date: formData.start_date || null,
                    end_date: formData.is_current ? null : (formData.end_date || null),
                    is_current: formData.is_current,
                    description: formData.description,
                });

            if (error) throw error;

            toast({ title: 'Success', description: 'Experience added successfully!' });
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Experience</DialogTitle>
                    <DialogDescription>Share your work history with the community.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Job Title *</Label>
                        <Input id="title" placeholder="Ex: Senior Software Engineer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input id="company" placeholder="Ex: Engineer For Society" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="Ex: Dhaka, Bangladesh" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                        </div>
                        {!formData.is_current && (
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input id="endDate" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="current" checked={formData.is_current} onCheckedChange={(checked) => setFormData({ ...formData, is_current: !!checked })} />
                        <Label htmlFor="current">I am currently working in this role</Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea id="desc" placeholder="Describe your responsibilities and achievements..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Experience
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
