import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import ApiError from './api.error';

export const handlePrismaError = (error: unknown, message?: string): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    const meta = error.meta as { target?: string | string[] } | undefined;
    const field = meta?.target
      ? Array.isArray(meta.target)
        ? meta.target.join(', ')
        : meta.target
      : 'value';
    throw new ApiError(message ?? `A record with this ${field} already exists.`, StatusCodes.CONFLICT);
  }
  throw error;
};
