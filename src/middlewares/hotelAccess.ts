import { Request, Response, NextFunction } from 'express';
import prisma from '../shared/prisma';
import ApiError from '../shared/ApiError';
import { StatusCodes } from 'http-status-codes';

declare global {
  namespace Express {
    interface Request {
      staffId?: string;
    }
  }
}

const resolveHotelId = (req: Request): string | undefined =>
  req.params.id || req.params.hotelId;

export const requireHotelOwnership = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = resolveHotelId(req);
    if (!hotelId) throw new ApiError('Hotel id is required', StatusCodes.BAD_REQUEST);

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { ownerId: true },
    });
    if (!hotel) throw new ApiError('Hotel not found', StatusCodes.NOT_FOUND);
    if (hotel.ownerId !== req.user!.userId) {
      throw new ApiError('Forbidden: you do not own this hotel', StatusCodes.FORBIDDEN);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const requireHotelAccess =
  (...subRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const hotelId = resolveHotelId(req);
      if (!hotelId) throw new ApiError('Hotel id is required', StatusCodes.BAD_REQUEST);

      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        select: { ownerId: true },
      });
      if (!hotel) throw new ApiError('Hotel not found', StatusCodes.NOT_FOUND);

      if (hotel.ownerId === req.user!.userId) return next();

      const staff = await prisma.hotelStaff.findUnique({
        where: { hotelId_userId: { hotelId, userId: req.user!.userId } },
      });
      if (!staff) throw new ApiError('Forbidden: no access to this hotel', StatusCodes.FORBIDDEN);
      if (subRoles.length && !subRoles.includes(staff.subRole)) {
        throw new ApiError('Insufficient staff permissions', StatusCodes.FORBIDDEN);
      }
      req.staffId = staff.id;
      next();
    } catch (error) {
      next(error);
    }
  };
