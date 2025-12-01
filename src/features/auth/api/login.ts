import { api } from '@/lib/api-client';

export const loginWithIdToken = async (idToken: string) => {
    return api.post('/auth/login', { idToken });
};

export const logout = async () => {
    return api.post('/auth/logout');
};
