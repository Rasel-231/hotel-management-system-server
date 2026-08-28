import { Worker } from 'bullmq';
import { redisClient } from '../database/redis';
import { refundQueue, RefundJob } from '../shared/queue.manager';
import { processRefund } from '../app/modules/payment/payment.service';

new Worker<RefundJob>('refund', async (job) => {
  const { paymentId, amount } = job.data;
  await processRefund(paymentId, amount);
}, { connection: redisClient.raw });
