import './email.worker';
import './pdf.worker';
import './refund.worker';
import './booking.worker';
import { scheduleBookingSweep } from './booking.worker';

export const startWorkers = async (): Promise<void> => {
  await scheduleBookingSweep();
};