import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Hashtag {
    tag: string;
    count: number;
}

export const getTrendingHashtags = async (): Promise<Hashtag[]> => {
    const response = await axios.get(`${API_URL}/hashtags/trending`);
    return response.data;
};
