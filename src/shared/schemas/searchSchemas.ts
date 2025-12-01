import { z } from 'zod';

export const searchUsersSchema = z.object({
    query: z.object({
        q: z.string().optional()
    })
});

export const searchPostsSchema = z.object({
    query: z.object({
        q: z.string().optional()
    })
});

export type SearchUsersDTO = z.infer<typeof searchUsersSchema>;
export type SearchPostsDTO = z.infer<typeof searchPostsSchema>;
