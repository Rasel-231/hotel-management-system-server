import { Worker } from 'bullmq';
import { redisClient } from '../database/redis';
import { EmailJob } from '../shared/queue.manager';
import { sendEmailHelper } from '../shared/email.helper';

new Worker<EmailJob>('email', async (job) => {
  const { to, subject, html } = job.data;
  await sendEmailHelper.sendEmail(to, subject, html);
}, { connection: redisClient.raw });
