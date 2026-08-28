import { z } from 'zod';

export const RoomValidation = {
  create: z.object({
    body: z.object({
      hotelId: z.string({ required_error: 'Hotel ID is required' }),
      type: z.string({ required_error: 'Room type is required' }).min(2).max(50),
      price: z.number({ required_error: 'Price is required' }).positive(),
      basePrice: z.number().positive().optional(),
      capacity: z.number({ required_error: 'Capacity is required' }).int().min(1).max(20),
      bedConfig: z.string().max(50).optional(),
      quantity: z.number().int().min(1).max(1000).optional(),
      isActive: z.boolean().optional(),
      amenities: z.array(z.string().trim().min(1)).max(50).optional(),
      images: z.array(z.string().url()).max(20).optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      type: z.string().min(2).max(50).optional(),
      price: z.number().positive().optional(),
      basePrice: z.number().positive().optional(),
      capacity: z.number().int().min(1).max(20).optional(),
      bedConfig: z.string().max(50).optional(),
      quantity: z.number().int().min(1).max(1000).optional(),
      isActive: z.boolean().optional(),
      amenities: z.array(z.string().trim().min(1)).max(50).optional(),
      images: z.array(z.string().url()).max(20).optional(),
    }),
  }),
  block: z.object({
    body: z.object({
      startDate: z.string({ required_error: 'Start date is required' }),
      endDate: z.string({ required_error: 'End date is required' }),
      reason: z.string().max(200).optional(),
    }),
  }),
};
