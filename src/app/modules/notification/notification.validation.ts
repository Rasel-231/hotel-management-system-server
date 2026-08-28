import { z } from 'zod';

export const NotificationValidation = {
  list: z.object({
    query: z
      .object({
        isRead: z.enum(['true', 'false']).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      })
      .optional(),
  }),
  markRead: z.object({ params: z.object({ id: z.string().uuid() }) }),
};
