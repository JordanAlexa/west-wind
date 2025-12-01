import { z } from 'zod';

export const syncUserSchema = z.object({
    body: z.object({
        firebase_uid: z.string().min(1, 'Firebase UID is required'),
        email: z.string().email('Invalid email address'),
        username: z.string().min(1, 'Username is required'),
        display_name: z.string().optional().nullable(),
        avatar_url: z.string().url().optional().or(z.literal('')).nullable()
    })
});

export const updateUserSchema = z.object({
    params: z.object({
        firebase_uid: z.string().min(1, 'Firebase UID is required')
    }),
    body: z.object({
        username: z.string().min(1, 'Username is required').optional(),
        display_name: z.string().optional(),
        bio: z.string().optional(),
        avatar_url: z.string().url().optional().nullable(),
        banner_url: z.string().url().optional().nullable()
    })
});

export const getUserProfileSchema = z.object({
    params: z.object({
        handle: z.string().min(1, 'Handle is required')
    })
});

export type SyncUserDTO = z.infer<typeof syncUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type GetUserProfileDTO = z.infer<typeof getUserProfileSchema>;
