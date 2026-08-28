import { z } from 'zod';

const getAll = z.object({
  query: z
    .object({
      searchTerm: z.string().optional(),
      hotelId: z.string().optional(),
      roomTypeId: z.string().optional(),
      type: z.enum(['SEASONAL', 'WEEKEND', 'LENGTH_OF_STAY']).optional(),
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
    roomTypeId: z.string({ required_error: 'Room type ID is required' }),
    type: z.enum(['SEASONAL', 'WEEKEND', 'LENGTH_OF_STAY']),
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
    modifier: z.number({ required_error: 'Modifier is required' }),
  }),
});

const update = z.object({
  body: z.object({
    hotelId: z.string().optional(),
    roomTypeId: z.string().optional(),
    type: z.enum(['SEASONAL', 'WEEKEND', 'LENGTH_OF_STAY']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    modifier: z.number().optional(),
  }),
});

export const PricingRuleValidation = { getAll, create, update };
