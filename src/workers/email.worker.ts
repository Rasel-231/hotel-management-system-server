import { Worker } from 'bullmq';
import { redisClient } from '../database/redis';
import { emailQueue, EmailJob } from '../shared/queue';
import { sendEmailHelper } from '../shared/sendEmail';

new Worker<EmailJob>('email', async (job) => {
  const { to, subject, html } = job.data;
  await sendEmailHelper.sendEmail(to, subject, html);
}, { connection: redisClient.raw });
