import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileTabs } from '@/features/profile/components/ProfileTabs';
import { Feed } from '@/features/feed/components/Feed';
import { Layout } from '@/components/Layout';
import { ComposerModal } from '@/features/composer/components/ComposerModal';

import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/features/profile/api/users';
import { Loader2 } from 'lucide-react';

export const Profile = () => {
    const { handle } = useParams({ from: '/profile/$handle' });
    const [activeTab, setActiveTab] = useState('posts');
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['profile', handle],
        queryFn: () => getUser(handle),
        retry: false
    });

    if (isLoading) {
        return (
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-muted" />
                </div>
            </Layout>
        );
    }

    if (error || !user) {
        return (
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="flex flex-col justify-center items-center h-screen text-muted">
                    <p className="text-xl font-bold">User not found</p>
                    <p>The profile @{handle} does not exist.</p>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="w-full min-h-screen bg-bg flex flex-col">


                    <ProfileHeader user={user} />
                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="min-h-[50vh]">
                        <Feed authorHandle={user.handle} tab={activeTab} />
                    </div>
                </div>
            </Layout>

            <ComposerModal
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
            />
        </>
    );
};
