import { z } from 'zod';

export const PaymentValidation = {
  initiate: z.object({
    body: z.object({
      bookingId: z.string().uuid('Invalid booking id'),
      gateway: z.enum(['STRIPE', 'SSLCOMMERZ']),
    }),
  }),
  refund: z.object({
    body: z.object({
      id: z.string().uuid('Invalid payment id'),
      amount: z.number().positive().optional(),
    }),
  }),
};
