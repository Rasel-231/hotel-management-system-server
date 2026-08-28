import { z } from 'zod';

export const AIValidation = {
  chat: z.object({
    body: z.object({
      message: z.string({ required_error: 'Message is required' }),
      sessionId: z.string().optional(),
    }),
  }),
  searchParse: z.object({
    body: z.object({ query: z.string({ required_error: 'Query is required' }) }),
  }),
  recommendations: z.object({
    query: z.object({ limit: z.string().optional() }).optional(),
  }),
};
