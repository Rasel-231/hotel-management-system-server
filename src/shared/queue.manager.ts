import { Queue } from 'bullmq';
import { redisClient } from '../database/redis';

export const emailQueue = new Queue('email', { connection: redisClient.raw });
export const pdfQueue = new Queue('pdf-invoice', { connection: redisClient.raw });
export const refundQueue = new Queue('refund', { connection: redisClient.raw });
export const bookingQueue = new Queue('booking', { connection: redisClient.raw });

export interface EmailJob {
  to: string;
  subject: string;
  html: string;
}

export interface PdfJob {
  bookingId: string;
  userId: string;
}

export interface RefundJob {
  paymentId: string;
  amount?: number;
}

export interface BookingJob {
  bookingId: string;
}
