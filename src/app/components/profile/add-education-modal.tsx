
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
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AddEducationModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
};

export function AddEducationModal({ isOpen, onOpenChange }: AddEducationModalProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        school_name: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        grade: '',
        description: '',
    });

    const handleSave = async () => {
        if (!formData.school_name) {
            toast({ title: 'Important', description: 'School name is required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('educations')
                .insert({
                    profile_id: user.id,
                    school_name: formData.school_name,
                    degree: formData.degree,
                    field_of_study: formData.field_of_study,
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null,
                    grade: formData.grade,
                    description: formData.description,
                });

            if (error) throw error;

            toast({ title: 'Success', description: 'Education added successfully!' });
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
                    <DialogTitle>Add Education</DialogTitle>
                    <DialogDescription>Add your academic background here.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="school">School/University *</Label>
                        <Input id="school" placeholder="Ex: Stanford University" value={formData.school_name} onChange={(e) => setFormData({ ...formData, school_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="degree">Degree</Label>
                        <Input id="degree" placeholder="Ex: Bachelor's" value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="field">Field of Study</Label>
                        <Input id="field" placeholder="Ex: Computer Science" value={formData.field_of_study} onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date (Expected)</Label>
                            <Input id="endDate" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="grade">Grade/GPA</Label>
                        <Input id="grade" placeholder="Ex: 3.8/4.0" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea id="desc" placeholder="Activities, societies, and honors..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Education
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
