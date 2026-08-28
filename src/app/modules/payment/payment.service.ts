import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { getGateway } from './gateways';
import { emailQueue, pdfQueue } from '../../../shared/queue';
import { emitToHotel, SOCKET_EVENTS } from '../../../shared/socket';
import { notify } from '../../../shared/notify';
import { releaseBookingLocks, datesBetween } from '../../../shared/bookingLock';
import { GatewayName } from './payment.interface';

const initiate = async (
  bookingId: string,
  gatewayName: GatewayName,
  userId: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: { include: { hotel: true } } },
  });
  if (!booking) throw new ApiError('Booking not found', StatusCodes.NOT_FOUND);
  if (booking.userId !== userId) throw new ApiError('Forbidden', StatusCodes.FORBIDDEN);
  if (booking.status !== 'PENDING') {
    throw new ApiError('Booking is not payable', StatusCodes.BAD_REQUEST);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const gateway = getGateway(gatewayName);
  const result = await gateway.initiate({
    amount: booking.totalPrice,
    bookingId,
    userEmail: user!.email,
  });

  await prisma.payment.create({
    data: {
      bookingId,
      gateway: gatewayName,
      transactionId: result.gatewayTransactionId,
      amount: booking.totalPrice,
    },
  });
  return result;
};

const confirmBookingPayment = async (payment: any) => {
  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: 'PAID' } }),
    prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED' } }),
  ]);

  const booking = payment.booking;
  await releaseBookingLocks(booking.roomId, datesBetween(new Date(booking.checkIn), new Date(booking.checkOut)));

  const user = await prisma.user.findUnique({ where: { id: booking.userId } });
  if (user?.email) {
    await emailQueue.add('confirm', {
      to: user.email,
      subject: 'Booking confirmed',
      html: `<p>Your booking ${booking.id} is confirmed.</p>`,
    });
  }
  await pdfQueue.add('invoice', { bookingId: booking.id, userId: booking.userId });
  emitToHotel(booking.room.hotelId, SOCKET_EVENTS.NEW_BOOKING, { bookingId: booking.id });
  await notify(booking.userId, 'BOOKING_CONFIRMED', { bookingId: booking.id });
};

const handleWebhook = async (
  gatewayName: GatewayName,
  rawBody: Buffer,
  signature: string
) => {
  const gateway = getGateway(gatewayName);
  const wh = await gateway.verifyWebhook(rawBody, signature);
  const payment = await prisma.payment.findUnique({
    where: { transactionId: wh.gatewayTransactionId },
    include: { booking: { include: { room: { include: { hotel: true } } } } },
  });
  if (!payment) throw new ApiError('Payment not found', StatusCodes.NOT_FOUND);
  if (wh.status === 'PAID' && payment.status !== 'PAID') {
    await confirmBookingPayment(payment);
  }
};

export const processRefund = async (paymentId: string, amount?: number) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new ApiError('Payment not found', StatusCodes.NOT_FOUND);
  const gateway = getGateway(payment.gateway as GatewayName);
  const result = await gateway.refund(payment.transactionId, amount ?? payment.amount);
  await prisma.payment.update({ where: { id: paymentId }, data: { status: 'REFUNDED' } });
  return result;
};

const refund = async (id: string, amount?: number) => processRefund(id, amount);

const getInvoice = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError('Booking not found', StatusCodes.NOT_FOUND);
  if (booking.userId !== userId) throw new ApiError('Forbidden', StatusCodes.FORBIDDEN);
  const { generateInvoicePdf } = await import('../../../shared/invoicePdf');
  return generateInvoicePdf(bookingId);
};

export const PaymentService = {
  initiate,
  handleWebhook,
  refund,
  processRefund,
  getInvoice,
};
