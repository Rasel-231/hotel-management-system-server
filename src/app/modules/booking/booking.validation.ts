import { z } from 'zod';

export const BookingValidation = {
  create: z.object({
    body: z.object({
      roomId: z.string({ required_error: 'Room ID is required' }),
      checkIn: z.string({ required_error: 'Check-in date is required' }),
      checkOut: z.string({ required_error: 'Check-out date is required' }),
      guests: z.number({ required_error: 'Guest count is required' }).int().min(1).max(20),
      adults: z.number().int().min(0).optional(),
      children: z.number().int().min(0).optional(),
      roomsCount: z.number().int().min(1).optional(),
      specialRequests: z.string().max(1000).optional(),
    }),
  }),
  walkIn: z.object({
    body: z.object({
      roomId: z.string({ required_error: 'Room ID is required' }),
      checkIn: z.string({ required_error: 'Check-in date is required' }),
      checkOut: z.string({ required_error: 'Check-out date is required' }),
      guests: z.number().int().min(1).max(20),
      guestName: z.string().optional(),
      guestPhone: z.string().optional(),
    }),
  }),
};
