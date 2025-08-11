import { z } from 'zod';

export const paginationSchema = z.object({
  limit: z.string().optional().transform(v => (v ? parseInt(v, 10) : 10))
    .refine(n => n! > 0 && n! <= 100, 'limit must be 1-100'),
  offset: z.string().optional().transform(v => (v ? parseInt(v, 10) : 0))
    .refine(n => n! >= 0, 'offset must be >= 0'),
});
