import { z } from 'zod';

const slugSchema = z
  .string({ required_error: 'Hotel slug is required' })
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case (e.g. grand-plaza)');

const nameSchema = z
  .string({ required_error: 'Hotel name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters');

export const HotelValidation = {
  create: z.object({
    body: z.object({
      name: nameSchema,
      slug: slugSchema,
      description: z.string().trim().max(2000).optional(),
      location: z.string().trim().max(150).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      starRating: z.number().int().min(1).max(5).optional(),
      amenities: z.array(z.string().trim().min(1)).max(50).optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      name: nameSchema.optional(),
      slug: slugSchema.optional(),
      description: z.string().trim().max(2000).optional(),
      location: z.string().trim().max(150).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      starRating: z.number().int().min(1).max(5).optional(),
      amenities: z.array(z.string().trim().min(1)).max(50).optional(),
    }),
  }),
};
