import { z } from 'zod';
import { emailSchema, nameSchema, phoneSchema, strongPasswordSchema } from '../../../shared/validation.rule';

const updateProfile = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

const adminUpdate = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OWNER', 'USER', 'GUEST']).optional(),
    isVerified: z.boolean().optional(),
  }),
});

const userRegisterZodValidation = z
  .object({
    body: z
      .object({
        name: nameSchema,
        email: emailSchema,
        password: strongPasswordSchema,
        phone: phoneSchema,
        address: z.string().trim().max(500, 'Address is too long').optional(),
      })
      .refine((data) => !data.password.toLowerCase().includes(data.email.split('@')[0]?.toLowerCase() || ''), {
        message: 'Password must not contain part of your email',
        path: ['password'],
      }),
  });

const getAll = z.object({
  query: z
    .object({
      searchTerm: z.string().optional(),
      role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OWNER', 'USER', 'GUEST']).optional(),
      isVerified: z.enum(['true', 'false']).optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
    })
    .optional(),
});

export const UserValidation = { updateProfile, adminUpdate, getAll, userRegisterZodValidation };
