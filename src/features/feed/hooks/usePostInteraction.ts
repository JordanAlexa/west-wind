import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike, type Post } from '../api/posts';
import { feedApi } from '../api/feed';

export const usePostInteraction = (post: Post) => {
    const queryClient = useQueryClient();

    const likeMutation = useMutation({
        mutationFn: async () => {
            await toggleLike(post.id, !!post.likedByViewer);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            await queryClient.cancelQueries({ queryKey: ['post-thread', post.id] });

            const previousPosts = queryClient.getQueryData(['posts']);
            const previousThread = queryClient.getQueryData(['post-thread', post.id]);

            // Helper to update a single post
            const updatePost = (p: Post) => {
                if (p.id === post.id) {
                    const isLiked = !!p.likedByViewer;
                    return {
                        ...p,
                        likedByViewer: !isLiked,
                        likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1
                    };
                }
                return p;
            };

            // Optimistically update feed
            queryClient.setQueryData(['posts'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        posts: page.posts.map(updatePost),
                    })),
                };
            });

            // Optimistically update thread view if active
            if (previousThread) {
                queryClient.setQueryData(['post-thread', post.id], (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        post: updatePost(old.post),
                        replies: old.replies.map(updatePost)
                    };
                });
            }

            return { previousPosts, previousThread };
        },
        onError: (_err, _newTodo, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['posts'], context.previousPosts);
            }
            if (context?.previousThread) {
                queryClient.setQueryData(['post-thread', post.id], context.previousThread);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post-thread', post.id] });
        },
    });

    const repostMutation = useMutation({
        mutationFn: async () => {
            await feedApi.repostPost(post.id);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            const previousPosts = queryClient.getQueryData(['posts']);

            queryClient.setQueryData(['posts'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        posts: page.posts.map((p: Post) => {
                            if (p.id === post.id) {
                                return { ...p, reposts: p.reposts + 1 };
                            }
                            return p;
                        }),
                    })),
                };
            });

            return { previousPosts };
        },
        onError: (_err, _newTodo, context) => {
            queryClient.setQueryData(['posts'], context?.previousPosts);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });

    return {
        like: likeMutation.mutate,
        repost: repostMutation.mutate,
        isLiking: likeMutation.isPending,
        isReposting: repostMutation.isPending,
    };
};
