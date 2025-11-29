import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { createPost } from '../api/posts';
import type { Post } from '../api/posts';
import { useAuthStore } from '../../auth/stores/authStore';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({ content, mediaUrl, parentId, images }: { content: string; mediaUrl?: string; parentId?: string; images?: File[] }) => {
            let finalMediaUrl = mediaUrl;

            // Handle Image Uploads
            if (images && images.length > 0) {
                // For MVP, we only support 1 image, but let's upload all and take the first one
                const uploadPromises = images.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await axios.post(`${API_URL}/upload`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    return response.data.url;
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                if (uploadedUrls.length > 0) {
                    finalMediaUrl = uploadedUrls[0];
                }
            }

            return createPost(content, finalMediaUrl, parentId);
        },
        onMutate: async (newPost) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData<InfiniteData<{ posts: Post[], nextCursor: number | undefined }>>(['posts']);

            // Optimistically update to the new value
            if (user) {
                const optimisticPost: Post = {
                    id: `temp-${Date.now()}`,
                    content: newPost.content,
                    image: newPost.mediaUrl, // Note: This won't show the uploaded image immediately unless we use a local preview URL here. 
                    // Ideally we should pass the preview URL for optimistic update.
                    timestamp: new Date().toISOString(),
                    likes: 0,
                    replies: 0,
                    reposts: 0,
                    author: {
                        id: user.uid,
                        name: user.displayName || 'Unknown',
                        handle: user.email ? `@${user.email.split('@')[0]}` : '@user',
                        avatar: user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown',
                        banner: '',
                        followersCount: 0,
                        followsCount: 0,
                        postsCount: 0
                    }
                };

                queryClient.setQueryData<InfiniteData<{ posts: Post[], nextCursor: number | undefined }>>(['posts'], (old) => {
                    if (!old) {
                        return {
                            pages: [{ posts: [optimisticPost], nextCursor: undefined }],
                            pageParams: [0],
                        };
                    }

                    return {
                        ...old,
                        pages: old.pages.map((page, index) =>
                            index === 0
                                ? { ...page, posts: [optimisticPost, ...page.posts] }
                                : page
                        ),
                    };
                });
            }

            // Return a context object with the snapshotted value
            return { previousPosts };
        },
        onError: (err, _newPost, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousPosts) {
                queryClient.setQueryData(['posts'], context.previousPosts);
            }
            console.error('Failed to create post:', err);
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['trending-hashtags'] });
        },
    });
};
