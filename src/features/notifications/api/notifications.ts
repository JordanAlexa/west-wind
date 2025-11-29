import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

    const response = await axios.get(`${API_URL}/notifications`, {
        params: {
            firebase_uid: user.uid,
            type
        }
    });
    return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    if (!user.uid) return 0;

    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        params: { firebase_uid: user.uid }
    });
    return response.data.count;
};

export const markNotificationsRead = async (): Promise<void> => {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    if (!user.uid) return;

    await axios.post(`${API_URL}/notifications/mark-read`, {
        firebase_uid: user.uid
    });
};
