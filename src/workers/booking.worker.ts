import { Worker } from 'bullmq';
import { redisClient } from '../database/redis';
import { bookingQueue, BookingJob } from '../shared/queue.manager';
import {
  BOOKING_EXPIRY_JOB,
  BOOKING_SWEEP_JOB,
  BOOKING_SWEEP_INTERVAL_MS,
} from '../shared/booking.expiry';
import { BookingService } from '../app/modules/booking/booking.service';

new Worker<BookingJob>(
  'booking',
  async (job) => {
    switch (job.name) {
      case BOOKING_EXPIRY_JOB:
        await BookingService.expireBooking(job.data.bookingId);
        break;
      case BOOKING_SWEEP_JOB:
        await BookingService.sweepExpiredBookings();
        break;
    }
  },
  { connection: redisClient.raw }
);

export const scheduleBookingSweep = async (): Promise<void> => {
  await bookingQueue.upsertJobScheduler(
    BOOKING_SWEEP_JOB,
    { every: BOOKING_SWEEP_INTERVAL_MS },
    {
      name: BOOKING_SWEEP_JOB,
      data: {},
      opts: { removeOnComplete: true, removeOnFail: true },
    }
  );
};