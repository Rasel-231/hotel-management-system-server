import { bookingQueue } from './queue.manager';
import config from '../config';

export const BOOKING_EXPIRY_JOB = 'expire-booking';
export const BOOKING_SWEEP_JOB = 'sweep-expired';
export const BOOKING_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

export const expiryJobId = (bookingId: string): string => `booking-expiry-${bookingId}`;

export const scheduleBookingExpiry = async (bookingId: string): Promise<void> => {
  await bookingQueue.add(
    BOOKING_EXPIRY_JOB,
    { bookingId },
    {
      delay: config.booking.hold_minutes * 60 * 1000,
      jobId: expiryJobId(bookingId),
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
};

export const cancelBookingExpiry = async (bookingId: string): Promise<void> => {
  try {
    await bookingQueue.remove(expiryJobId(bookingId));
  } catch {
    // job may not exist; expiry sweeper is the safety net
  }
};