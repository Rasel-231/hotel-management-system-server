import { z } from 'zod';

export const ReviewValidation = {
  create: z.object({
    body: z.object({
      hotelId: z.string({ required_error: 'Hotel ID is required' }),
      bookingId: z.string({ required_error: 'Booking ID is required' }),
      rating: z.number({ required_error: 'Rating is required' }).int().min(1).max(5),
      comment: z.string().optional(),
    }),
  }),
};
