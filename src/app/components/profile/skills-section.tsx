
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { EditSkillsModal } from './edit-skills-modal';

type SkillsSectionProps = {
    skills: string[] | null;
    isOwnProfile: boolean;
};

export function SkillsSection({ skills, isOwnProfile }: SkillsSectionProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills</CardTitle>
                    {isOwnProfile && (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {skills && skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground py-6">
                            <p>No skills added yet.</p>
                             {isOwnProfile && (
                                <Button variant="link" onClick={() => setIsEditModalOpen(true)}>Add your skills</Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            {isOwnProfile && (
                <EditSkillsModal
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    currentSkills={skills || []}
                />
            )}
        </>
    );
}
