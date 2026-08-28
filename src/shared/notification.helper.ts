import prisma from './prisma.client';
import { emitToUser, SOCKET_EVENTS } from './socket.server';

export const notify = async (userId: string, type: string, payload: unknown) => {
  const notification = await prisma.notification.create({
    data: { userId, type, payload: payload as object },
  });
  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION, notification);
  return notification;
};
