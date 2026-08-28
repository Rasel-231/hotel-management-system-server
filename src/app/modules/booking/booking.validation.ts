import { z } from 'zod';

export const BookingValidation = {
  create: z.object({
    body: z.object({
      roomId: z.string({ required_error: 'Room ID is required' }),
      checkIn: z.string({ required_error: 'Check-in date is required' }),
      checkOut: z.string({ required_error: 'Check-out date is required' }),
      totalPrice: z.number({ required_error: 'Total price is required' }),
    }),
  }),
};
