import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser, type User } from '../api/users';
import { toast } from 'sonner';

export const useFollow = (user: User) => {
    const queryClient = useQueryClient();

    const followMutation = useMutation({
        mutationFn: async () => {
            if (user.isFollowedByViewer) {
                await unfollowUser(user.id);
            } else {
                await followUser(user.id);
            }
        },
        onMutate: async () => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['profile', user.handle] });

            // Snapshot the previous value
            const previousUser = queryClient.getQueryData(['profile', user.handle]);

            // Optimistically update to the new value
            queryClient.setQueryData(['profile', user.handle], (old: User | undefined) => {
                if (!old) return old;
                const isFollowing = !old.isFollowedByViewer;
                return {
                    ...old,
                    isFollowedByViewer: isFollowing,
                    followersCount: isFollowing ? (old.followersCount || 0) + 1 : Math.max(0, (old.followersCount || 0) - 1)
                };
            });

            // Return a context object with the snapshotted value
            return { previousUser };
        },
        onError: (_err, _newTodo, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousUser) {
                queryClient.setQueryData(['profile', user.handle], context.previousUser);
            }
            toast.error('Failed to update follow status');
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: ['profile', user.handle] });
        },
    });

    return {
        toggleFollow: followMutation.mutate,
        isPending: followMutation.isPending
    };
};
