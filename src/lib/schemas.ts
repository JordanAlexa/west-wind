import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    dob: z.string().refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 13;
    }, 'You must be at least 13 years old'),
});

export const ProfileSchema = z.object({
    display_name: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters'),
    bio: z.string().max(256, 'Bio must be less than 256 characters').optional(),
});

export const PostSchema = z.object({
    content: z.string().max(300, 'Post must be less than 300 characters'),
});
