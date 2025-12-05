import { api } from '@/lib/api-client';

export interface UpdateProfileData {
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    banner_url?: string;
    postsCount?: number;
    isFollowedByViewer?: boolean;
}

export interface User {
    id: string;
    firebase_uid: string;
    name: string;
    handle: string;
    avatar: string;
    banner: string;
    bio: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
    isFollowedByViewer: boolean;
}

export const updateProfile = async (firebaseUid: string, data: UpdateProfileData) => {
    return api.put(`/users/${firebaseUid}`, data) as Promise<unknown>;
};

export const getUser = async (handle: string) => {
    // Handle can be passed with or without @
    const cleanHandle = handle.startsWith('@') ? handle : handle;
    const userData = await api.get<unknown>(`/users/${cleanHandle}`) as unknown as {
        id: number;
        firebase_uid: string;
        username: string;
        display_name: string;
        avatar_url: string;
        banner_url: string;
        bio: string;
        followersCount: number;
        followsCount: number;
        postsCount: number;
        is_followed_by_viewer: boolean;
    };

    // Transform backend data to frontend User interface
    return {
        id: userData.id.toString(),
        firebase_uid: userData.firebase_uid,
        name: userData.display_name || userData.username,
        handle: `@${userData.username}`,
        avatar: userData.avatar_url,
        banner: userData.banner_url,
        bio: userData.bio,
        followersCount: userData.followersCount || 0,
        followsCount: userData.followsCount || 0,
        postsCount: userData.postsCount || 0,
        isFollowedByViewer: userData.is_followed_by_viewer
    };
};

export const syncUser = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null; emailVerified: boolean }) => {
    return api.post('/users', {
        firebase_uid: user.uid,
        email: user.email,
        username: user.email?.split('@')[0] || 'user', // Fallback username
        display_name: user.displayName || 'User',
        avatar_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        email_verified: user.emailVerified
    }) as Promise<{ role: string }>;
};

export const getCurrentUser = async (config?: { skipErrorToast?: boolean }) => {
    return api.get<any>('/users/me', config as any) as unknown as Promise<User>;
};

export const followUser = async (targetUserId: string) => {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}') as { uid: string };
    return api.post(`/users/${targetUserId}/follow`, { firebase_uid: user.uid });
};

export const unfollowUser = async (targetUserId: string) => {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}') as { uid: string };
    return api.delete(`/users/${targetUserId}/follow`, {
        data: { firebase_uid: user.uid }
    });
};
