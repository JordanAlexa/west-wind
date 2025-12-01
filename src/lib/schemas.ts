import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    // password: z.string().min(8, 'Password must be at least 8 characters'), // Removed for passwordless auth
    username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    display_name: z.string().min(1, 'Display name is required'),
    dob: z.string().refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 13;
    }, 'You must be at least 13 years old'),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
});

export const ProfileSchema = z.object({
    display_name: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters'),
    bio: z.string().max(256, 'Bio must be less than 256 characters').optional(),
});

export const PostSchema = z.object({
    content: z.string().max(300, 'Post must be less than 300 characters'),
});
