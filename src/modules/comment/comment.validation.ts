import { z, ZodSchema } from 'zod';

class CommentValidation {
    static PostComment: ZodSchema = z.object({
        user_id: z.string().min(1).max(225),
        post_id: z.string().min(1).max(225),
        content: z.string().min(1).max(225)
    });

    static updateComment: ZodSchema = z.object({
        content: z.string().min(1).max(225)
    });
}

export { CommentValidation };