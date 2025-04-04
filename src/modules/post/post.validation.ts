import { z, ZodSchema } from 'zod';

class PostValidation {
    static Update: ZodSchema = z.object({
        post_id: z.string().min(1).max(225).optional(),
        media_url: z.string().min(1).max(225).optional(),
        content: z.string().min(1).max(225).optional()
    });
}

export { PostValidation };