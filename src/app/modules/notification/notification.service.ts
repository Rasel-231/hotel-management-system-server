import prisma from '../../../shared/prisma';
import { Prisma } from '@prisma/client';

const list = async (userId: string, query: Record<string, unknown>) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;
  const skip = (page - 1) * limit;
  const where: Prisma.NotificationWhereInput = { userId };
  if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

  const [data, total] = await prisma.$transaction([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where }),
  ]);
  return { data, meta: { page, limit, total } };
};

const markRead = async (id: string, userId: string) => {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error('Notification not found');
  }
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

export const NotificationService = { list, markRead };
