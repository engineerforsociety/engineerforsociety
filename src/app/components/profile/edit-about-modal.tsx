
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
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EditAboutModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    currentBio: string;
};

export function EditAboutModal({ isOpen, onOpenChange, currentBio }: EditAboutModalProps) {
    const [bio, setBio] = useState(currentBio);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        setBio(currentBio);
    }, [currentBio, isOpen]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({ bio })
                .eq('id', user.id);

            if (error) throw error;

            toast({ title: 'Success', description: 'Bio updated successfully!' });
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
                    <DialogTitle>Edit About</DialogTitle>
                    <DialogDescription>Tell the community about yourself, your goals, and interests.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="bio">Your Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Ex: I am a software engineer passionate about..."
                            rows={8}
                        />
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
