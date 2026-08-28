import { z } from 'zod';

export const AdminValidation = {
  assignRole: z.object({
    body: z.object({
      role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OWNER', 'USER', 'GUEST']),
    }),
  }),
};
