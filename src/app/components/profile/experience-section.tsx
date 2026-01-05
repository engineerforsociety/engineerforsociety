
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Briefcase, Plus, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { AddExperienceModal } from './add-experience-modal';

type Experience = {
    id: string;
    title: string;
    company_name: string;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
};

type ExperienceSectionProps = {
    experiences: Experience[];
    isOwnProfile: boolean;
};

export function ExperienceSection({ experiences, isOwnProfile }: ExperienceSectionProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const formatDate = (date: string | null) => {
        if (!date) return '';
        return format(new Date(date), 'MMM yyyy');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Experience</CardTitle>
                    {isOwnProfile && (
                        <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {experiences.length > 0 ? (
                        <ul className="space-y-6">
                            {experiences.map((exp, index) => (
                                <li key={exp.id} className="flex gap-4">
                                    <Briefcase className="h-8 w-8 text-muted-foreground mt-1" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold">{exp.title}</h3>
                                                <p className="text-sm">{exp.company_name} · {exp.location}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                                                </p>
                                            </div>
                                            {isOwnProfile && (
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {exp.description && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">{exp.description}</p>}
                                        {index < experiences.length - 1 && <Separator className="mt-6" />}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted-foreground py-6">
                            <p>No work experience added yet.</p>
                            {isOwnProfile && (
                                <Button variant="link" onClick={() => setIsAddModalOpen(true)}>Add experience</Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            {isOwnProfile && (
                <AddExperienceModal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
            )}
        </>
    );
}
