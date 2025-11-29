import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface UpdateProfileData {
    display_name: string;
    bio: string;
    avatar_url?: string;
    banner_url?: string;
}

export interface User {
    id: string;
    firebase_uid: string;
    name: string;
    handle: string;
    avatar?: string;
    banner?: string;
    bio?: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
}

export const updateProfile = async (firebaseUid: string, data: UpdateProfileData) => {
    const response = await axios.put(`${API_URL}/users/${firebaseUid}`, data);
    return response.data;
};

export const getUser = async (handle: string) => {
    // Handle can be passed with or without @
    const cleanHandle = handle.startsWith('@') ? handle : handle;
    const response = await axios.get(`${API_URL}/users/${cleanHandle}`);
    const userData = response.data;

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
        postsCount: userData.postsCount || 0
    };
};
export const syncUser = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) => {
    const response = await axios.post(`${API_URL}/users`, {
        firebase_uid: user.uid,
        email: user.email,
        username: user.email?.split('@')[0] || 'user', // Fallback username
        display_name: user.displayName || 'User',
        avatar_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
    });
    return response.data;
};
