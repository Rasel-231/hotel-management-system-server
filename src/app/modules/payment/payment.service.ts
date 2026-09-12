import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { BookingStatus } from '@prisma/client';
import { getGateway } from './gateways';
import { emailQueue, pdfQueue, refundQueue } from '../../../shared/queue.manager';
import { cancelBookingExpiry } from '../../../shared/booking.expiry';
import { emitToHotel, SOCKET_EVENTS } from '../../../shared/socket.server';
import { notify } from '../../../shared/notification.helper';
import { releaseBookingLocks, datesBetween } from '../../../shared/booking.lock';
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
  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError('Booking is not payable', StatusCodes.BAD_REQUEST);
  }
  if (booking.expiresAt && new Date(booking.expiresAt).getTime() < Date.now()) {
    throw new ApiError('Booking hold has expired. Please create a new booking.', StatusCodes.BAD_REQUEST);
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

const finalizeConfirmedBooking = async (booking: any) => {
  await releaseBookingLocks(
    booking.roomId,
    datesBetween(new Date(booking.checkIn), new Date(booking.checkOut))
  );

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

const confirmBookingPayment = async (payment: any) => {
  const [updatedPayment, updatedBooking] = await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: 'PAID' } }),
    prisma.booking.updateMany({
      where: { id: payment.bookingId, status: BookingStatus.PENDING },
      data: { status: BookingStatus.CONFIRMED, expiresAt: null },
    }),
  ]);

  const booking = payment.booking;

  if (updatedBooking.count === 0) {
    if (booking.status !== BookingStatus.CONFIRMED) {
      // Booking expired or was cancelled before the payment landed -> auto refund.
      await refundQueue.add('refund', { paymentId: payment.id });
      await notify(booking.userId, 'PAYMENT_REFUNDED', {
        bookingId: booking.id,
        reason: 'BOOKING_NOT_PAYABLE',
      });
      return;
    }
    // Duplicate/late confirmation for an already-confirmed booking.
    await releaseBookingLocks(
      booking.roomId,
      datesBetween(new Date(booking.checkIn), new Date(booking.checkOut))
    );
    return;
  }

  await cancelBookingExpiry(payment.bookingId);
  await finalizeConfirmedBooking(booking);
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
  const { generateInvoicePdf } = await import('../../../shared/invoice.generator');
  return generateInvoicePdf(bookingId);
};

export const PaymentService = {
  initiate,
  handleWebhook,
  refund,
  processRefund,
  getInvoice,
};
