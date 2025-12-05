import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useNotifications, useMarkNotificationsRead } from '@/features/notifications/hooks/useNotifications';
import { NotificationItem } from '@/features/notifications/components/NotificationItem';
import { Loader2 } from 'lucide-react';
import { ComposerModal } from '@/features/composer/components/ComposerModal';

export const Notifications = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'mentions'>('all');
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const { data: notifications, isLoading } = useNotifications(activeTab === 'mentions' ? 'mentions' : undefined);
    const { mutate: markRead } = useMarkNotificationsRead();

    useEffect(() => {
        markRead();
    }, [markRead]);

    return (
        <>
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="w-full min-h-screen bg-bg flex flex-col">
                    <div className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-border">
                        <h1 className="font-bold text-xl px-4 py-3 text-text">Notifications</h1>
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-3 text-sm font-medium hover:bg-surface-hover transition-colors relative ${activeTab === 'all' ? 'text-text' : 'text-muted'
                                    }`}
                            >
                                All
                                {activeTab === 'all' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full mx-12" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('mentions')}
                                className={`flex-1 py-3 text-sm font-medium hover:bg-surface-hover transition-colors relative ${activeTab === 'mentions' ? 'text-text' : 'text-muted'
                                    }`}
                            >
                                Mentions
                                {activeTab === 'mentions' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full mx-12" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : notifications?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted">
                                <p className="text-lg font-medium">No notifications yet</p>
                                <p className="text-sm">When you get notifications, they'll show up here.</p>
                            </div>
                        ) : (
                            notifications?.map((notification, index) => (
                                <NotificationItem key={`${notification.type}-${notification.created_at}-${index}`} notification={notification} />
                            ))
                        )}
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
