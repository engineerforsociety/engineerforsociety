
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EditIntroModal } from './edit-intro-modal';

type ProfileHeaderActionsProps = {
    isOwnProfile: boolean;
    profile: any;
};

export function ProfileHeaderActions({ isOwnProfile, profile }: ProfileHeaderActionsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!isOwnProfile) return null;

    return (
        <>
            <Button onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
            <EditIntroModal
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                profile={profile}
            />
        </>
    );
}
