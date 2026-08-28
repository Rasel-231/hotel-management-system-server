import { Worker } from 'bullmq';
import { redisClient } from '../database/redis';
import { pdfQueue, PdfJob } from '../shared/queue';
import { generateInvoicePdf } from '../shared/invoicePdf';
import { sendEmailHelper } from '../shared/sendEmail';
import prisma from '../shared/prisma';
import config from '../config';

new Worker<PdfJob>('pdf-invoice', async (job) => {
  const { bookingId, userId } = job.data;
  const buffer = await generateInvoicePdf(bookingId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) {
    await sendEmailHelper.sendEmail(
      user.email,
      'Your booking invoice',
      '<p>Please find your invoice attached.</p>'
    );
  }
  void config;
}, { connection: redisClient.raw });
