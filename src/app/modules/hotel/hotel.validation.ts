import { z } from 'zod';

export const HotelValidation = {
  create: z.object({
    body: z.object({
      name: z.string({ required_error: 'Hotel name is required' }),
      slug: z.string({ required_error: 'Hotel slug is required' }),
      description: z.string().optional(),
      location: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
  }),
};
