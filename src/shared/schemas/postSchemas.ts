import { z } from 'zod';

export const createPostSchema = z.object({
    body: z.object({
        firebase_uid: z.string().min(1, 'Firebase UID is required'),
        content: z.string().min(1, 'Content is required'),
        media_url: z.string().url().optional().nullable(),
        parent_id: z.string().uuid().optional().nullable()
    })
});

export const getFeedSchema = z.object({
    query: z.object({
        hashtag: z.string().optional(),
        firebase_uid: z.string().optional(),
        author_handle: z.string().optional(),
        tab: z.enum(['replies', 'media', 'videos', 'likes', 'posts']).optional()
    })
});

export const getThreadSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid Post ID')
    }),
    query: z.object({
        firebase_uid: z.string().optional()
    })
});

export const deletePostSchema = z.object({
    params: z.object({
        postId: z.string().uuid('Invalid Post ID')
    }),
    body: z.object({
        firebase_uid: z.string().min(1, 'Firebase UID is required')
    })
});

export const editPostSchema = z.object({
    params: z.object({
        postId: z.string().uuid('Invalid Post ID')
    }),
    body: z.object({
        firebase_uid: z.string().min(1, 'Firebase UID is required'),
        content: z.string().min(1, 'Content is required')
    })
});

export const likePostSchema = z.object({
    body: z.object({
        firebase_uid: z.string().min(1, 'Firebase UID is required'),
        post_id: z.string().uuid('Invalid Post ID')
    })
});

export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type GetFeedDTO = z.infer<typeof getFeedSchema>;
export type GetThreadDTO = z.infer<typeof getThreadSchema>;
export type DeletePostDTO = z.infer<typeof deletePostSchema>;
export type EditPostDTO = z.infer<typeof editPostSchema>;
export type LikePostDTO = z.infer<typeof likePostSchema>;
