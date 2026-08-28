import { z } from 'zod';

const getAll = z.object({
  query: z
    .object({
      searchTerm: z.string().optional(),
      bookingId: z.string().optional(),
      handledBy: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
    })
    .optional(),
});

const create = z.object({
  body: z.object({
    bookingId: z.string({ required_error: 'Booking ID is required' }),
    checkInAt: z.string().optional(),
    checkOutAt: z.string().optional(),
    handledBy: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    bookingId: z.string().optional(),
    checkInAt: z.string().optional(),
    checkOutAt: z.string().optional(),
    handledBy: z.string().optional(),
  }),
});

export const BookingCheckLogValidation = { getAll, create, update };
