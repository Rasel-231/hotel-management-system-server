import { z } from 'zod';

export const ReportValidation = {
  query: z.object({
    hotelId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
};
