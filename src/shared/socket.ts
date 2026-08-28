import { Server } from 'socket.io';
import config from '../config';

let io: Server | null = null;

export const initSocket = (server: unknown): Server => {
  io = new Server(server as never, {
    cors: {
      origin: config.frontend_url || '*',
      credentials: true,
    },
  });
  return io;
};

export const getIO = (): Server | null => io;

export const emitToHotel = (hotelId: string, event: string, payload: unknown): void => {
  io?.to(`hotel:${hotelId}`).emit(event, payload);
};

export const emitToUser = (userId: string, event: string, payload: unknown): void => {
  io?.to(`user:${userId}`).emit(event, payload);
};

export const SOCKET_EVENTS = {
  NEW_BOOKING: 'new_booking',
  BOOKING_CANCELLED: 'booking_cancelled',
  LOW_AVAILABILITY: 'low_availability',
  AI_TOKEN: 'ai_token',
  NOTIFICATION: 'notification',
} as const;
