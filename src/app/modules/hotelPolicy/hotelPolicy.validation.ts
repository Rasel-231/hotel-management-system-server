import { z } from 'zod';

const getAll = z.object({
  query: z
    .object({
      searchTerm: z.string().optional(),
      hotelId: z.string().optional(),
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
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    petPolicy: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    hotelId: z.string().optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    petPolicy: z.string().optional(),
  }),
});

export const HotelPolicyValidation = { getAll, create, update };
