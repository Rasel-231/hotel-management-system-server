import { z } from 'zod';

const getAll = z.object({
  query: z
    .object({
      searchTerm: z.string().optional(),
      hotelId: z.string().optional(),
      userId: z.string().optional(),
      subRole: z.enum(['MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']).optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
    })
    .optional(),
});

const create = z.object({
  body: z.object({
    hotelId: z.string({ required_error: 'Hotel ID is required' }),
    userId: z.string({ required_error: 'User ID is required' }),
    subRole: z.enum(['MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']),
    permissions: z.array(z.string()).optional(),
  }),
});

const update = z.object({
  body: z.object({
    hotelId: z.string().optional(),
    userId: z.string().optional(),
    subRole: z.enum(['MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']).optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

const invite = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      userId: z.string().optional(),
      subRole: z.enum(['MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']),
      permissions: z.array(z.string()).optional(),
    })
    .refine((d) => d.email || d.userId, {
      message: 'Either email or userId is required',
    }),
});

export const HotelStaffValidation = { getAll, create, update, invite };
