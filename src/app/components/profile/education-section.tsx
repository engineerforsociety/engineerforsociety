
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, Plus, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { AddEducationModal } from './add-education-modal';

type Education = {
    id: string;
    school_name: string;
    degree: string | null;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
    grade: string | null;
    description: string | null;
};

type EducationSectionProps = {
    educations: Education[];
    isOwnProfile: boolean;
};

export function EducationSection({ educations, isOwnProfile }: EducationSectionProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const formatDate = (date: string | null) => {
        if (!date) return '';
        return format(new Date(date), 'yyyy');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    {isOwnProfile && (
                        <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {educations.length > 0 ? (
                        <ul className="space-y-6">
                            {educations.map((edu, index) => (
                                <li key={edu.id} className="flex gap-4">
                                    <GraduationCap className="h-8 w-8 text-muted-foreground mt-1" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold">{edu.school_name}</h3>
                                                <p className="text-sm">{edu.degree}, {edu.field_of_study}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                                                </p>
                                            </div>
                                            {isOwnProfile && (
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {edu.grade && <p className="text-sm mt-2">Grade: {edu.grade}</p>}
                                        {edu.description && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">{edu.description}</p>}
                                        {index < educations.length - 1 && <Separator className="mt-6" />}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted-foreground py-6">
                            <p>No education history added yet.</p>
                            {isOwnProfile && (
                                <Button variant="link" onClick={() => setIsAddModalOpen(true)}>Add education</Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            {isOwnProfile && (
                <AddEducationModal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
            )}
        </>
    );
}
