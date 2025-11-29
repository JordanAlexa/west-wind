import axios from 'axios';
import type { Post } from '../../feed/api/posts';

const API_URL = 'http://localhost:3000/api';

export interface UserSearchResult {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
    bio: string;
}

export const searchPosts = async (query: string): Promise<Post[]> => {
    if (!query) return [];
    const response = await axios.get(`${API_URL}/search/posts`, { params: { q: query } });

    return response.data.map((p: any) => ({
        ...p,
        author: {
            ...p.author,
            banner: p.author.banner || '',
            followersCount: p.author.followersCount || 0,
            followsCount: p.author.followsCount || 0,
            postsCount: p.author.postsCount || 0
        }
    }));
};

export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
    if (!query) return [];
    const response = await axios.get(`${API_URL}/search/users`, { params: { q: query } });
    return response.data;
};
