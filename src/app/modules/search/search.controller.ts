import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { searchHotels } from './search.service';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { validateRequest } from '../../../middlewares/validateRequest';
import { SearchValidation } from './search.validation';

const search = catchAsync(async (req: Request, res: Response) => {
  const q = req.query as Record<string, string | undefined>;
  const result = await searchHotels({
    q: q.q,
    location: q.location,
    checkIn: q.checkIn,
    checkOut: q.checkOut,
    priceMax: q.priceMax ? Number(q.priceMax) : undefined,
    guests: q.guests ? Number(q.guests) : undefined,
    amenities: q.amenities ? q.amenities.split(',').map((a) => a.trim()) : undefined,
    rating: q.rating ? Number(q.rating) : undefined,
    lat: q.lat ? Number(q.lat) : undefined,
    lng: q.lng ? Number(q.lng) : undefined,
    radius: q.radius ? Number(q.radius) : undefined,
    page: q.page ? Number(q.page) : 1,
    limit: q.limit ? Number(q.limit) : 10,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotels fetched',
    meta: result.meta,
    data: result.data,
  });
});

export const SearchController = { search };
