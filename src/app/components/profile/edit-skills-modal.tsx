
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Loader2, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EditSkillsModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    currentSkills: string[];
};

export function EditSkillsModal({ isOpen, onOpenChange, currentSkills }: EditSkillsModalProps) {
    const [skills, setSkills] = useState<string[]>(currentSkills || []);
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        setSkills(currentSkills || []);
    }, [currentSkills, isOpen]);

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({ skills })
                .eq('id', user.id);

            if (error) throw error;

            toast({ title: 'Success', description: 'Skills updated successfully!' });
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Skills</DialogTitle>
                    <DialogDescription>Add or remove skills to showcase your expertise.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex gap-2">
                        <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill (e.g. React, Python)"
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button size="icon" onClick={addSkill} type="button">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[100px] p-3 border rounded-lg bg-muted/30">
                        {skills.length === 0 && <p className="text-sm text-muted-foreground italic">No skills added yet.</p>}
                        {skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1 flex items-center gap-1.5">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
