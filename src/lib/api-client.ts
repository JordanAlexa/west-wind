import Axios, { type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
    if (config.headers) {
        config.headers.Accept = 'application/json';
    }
    // Assuming auth token is handled via HttpOnly cookies or similar mechanism
    config.withCredentials = true;
    return config;
}

export const api = Axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Default to relative path (uses Vite proxy)
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message;

        // Check for custom config to skip toast
        // @ts-ignore
        if (!error.config?.skipErrorToast) {
            toast.error(message);
        }

        if (error.response?.status === 401) {
            // Optional: Redirect to login or handle session expiry
            // window.location.href = '/login';
        }

        return Promise.reject(error);
    },
);
