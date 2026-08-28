import { z } from 'zod';

export const RoomValidation = {
  create: z.object({
    body: z.object({
      hotelId: z.string({ required_error: 'Hotel ID is required' }),
      type: z.string({ required_error: 'Room type is required' }),
      price: z.number({ required_error: 'Price is required' }),
      capacity: z.number({ required_error: 'Capacity is required' }),
      amenities: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      type: z.string().optional(),
      price: z.number().optional(),
      capacity: z.number().optional(),
      amenities: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
    }),
  }),
};
