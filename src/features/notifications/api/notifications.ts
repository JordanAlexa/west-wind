import { api } from '@/lib/api-client';

export interface Notification {
    type: 'like' | 'reply' | 'mention' | 'follow';
    created_at: string;
    actor: {
        id: string;
        name: string;
        handle: string;
        avatar: string;
    };
    post?: {
        id: string;
        content: string;
        image?: string;
    };
    reply?: {
        id: string;
        content: string;
    };
}

export const getNotifications = async ({ type }: { type?: 'mentions' } = {}): Promise<Notification[]> => {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    if (!user.uid) throw new Error('User not authenticated');

    return api.get<any>('/notifications', {
        params: {
            firebase_uid: user.uid,
            type
        }
    }) as unknown as Promise<Notification[]>;
};

export const getUnreadCount = async (): Promise<number> => {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    if (!user.uid) return 0;

    const data = await api.get<any>('/notifications/unread-count', {
        params: { firebase_uid: user.uid }
    }) as any;
    return data.count;
};

export const markNotificationsRead = async (): Promise<void> => {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    if (!user.uid) return;

    await api.post('/notifications/mark-read', {
        firebase_uid: user.uid
    });
};
