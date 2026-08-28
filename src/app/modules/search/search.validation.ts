import { z } from 'zod';

export const SearchValidation = {
  search: z.object({
    query: z
      .object({
        q: z.string().optional(),
        location: z.string().optional(),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        priceMax: z.string().optional(),
        guests: z.string().optional(),
        amenities: z.string().optional(),
        rating: z.string().optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
        radius: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      })
      .optional(),
  }),
};
