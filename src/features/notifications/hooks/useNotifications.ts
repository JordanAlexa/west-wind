import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markNotificationsRead } from '../api/notifications';

export const useNotifications = (type?: 'mentions') => {
    return useQuery({
        queryKey: ['notifications', type],
        queryFn: () => getNotifications({ type }),
        refetchInterval: 30000, // Poll every 30 seconds
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadCount,
        refetchInterval: 15000, // Poll every 15 seconds
    });
};

export const useMarkNotificationsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });
};
