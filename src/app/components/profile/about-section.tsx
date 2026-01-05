
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { EditAboutModal } from './edit-about-modal';

type AboutSectionProps = {
    bio: string | null;
    isOwnProfile: boolean;
};

export function AboutSection({ bio, isOwnProfile }: AboutSectionProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>About</CardTitle>
                    {isOwnProfile && (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {bio ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bio}</p>
                    ) : (
                        <div className="text-center text-muted-foreground py-6">
                            <p>No bio added yet.</p>
                            {isOwnProfile && (
                                <Button variant="link" onClick={() => setIsEditModalOpen(true)}>Add your bio</Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            {isOwnProfile && (
                <EditAboutModal
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    currentBio={bio || ''}
                />
            )}
        </>
    );
}
