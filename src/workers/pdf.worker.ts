import { Worker } from 'bullmq';
import { redisClient } from '../database/redis';
import { PdfJob } from '../shared/queue.manager';
import { generateInvoicePdf } from '../shared/invoice.generator';
import { sendEmailHelper } from '../shared/email.helper';
import prisma from '../shared/prisma.client';
import config from '../config';

new Worker<PdfJob>('pdf-invoice', async (job) => {
  const { bookingId, userId } = job.data;

  const buffer = await generateInvoicePdf(bookingId);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) {

    await sendEmailHelper.sendEmail(
      user.email,
      'Your booking invoice',
      '<p>Please find your booking invoice attached.</p>',
      [
        {
          filename: `invoice-${bookingId}.pdf`,
          content: buffer,
          contentType: 'application/pdf',
        }
      ]
    );
  }
  void config;
}, { connection: redisClient.raw });