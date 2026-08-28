import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { HotelService } from './hotel.service';
import { HotelPolicyService } from '../hotelPolicy/hotelPolicy.service';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';

const getAllHotels = catchAsync(async (req: Request, res: Response) => {
  const queryData = req.query as Record<string, unknown>;
  const result = await HotelService.getAllHotels({
    searchTerm: queryData.searchTerm as string,
    location: queryData.location as string,
    ownerId: req.user?.userId,
    page: queryData.page as string,
    limit: queryData.limit as string,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotels fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getHotelBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.getHotelBySlug(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel fetched successfully',
    data: result,
  });
});

const createHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.createHotel(
    req.body as Prisma.HotelUncheckedCreateInput,
    req.user!.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Hotel created successfully',
    data: result,
  });
});

const updateHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.updateHotel(req.params.id, req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel updated successfully',
    data: result,
  });
});

const deleteHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.deleteHotel(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel removed successfully',
    data: result,
  });
});

const approveHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.approveHotel(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel approved successfully',
    data: result,
  });
});

const addGalleryImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const added = [];
  for (const file of files ?? []) {
    const f = file as unknown as { secure_url?: string; path?: string; public_id?: string };
    added.push(
      await HotelService.addImage(req.params.id, req.user!.userId, {
        url: f.secure_url ?? f.path ?? '',
        publicId: f.public_id ?? '',
      })
    );
  }
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Gallery images added',
    data: added,
  });
});

const reorderGallery = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.reorderImages(req.params.id, req.user!.userId, req.body.orderedIds);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Gallery reordered', data: result });
});

const setCoverImage = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.setCover(req.params.id, req.user!.userId, req.params.imageId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Cover image set', data: result });
});

const deleteGalleryImage = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.deleteImage(req.params.id, req.user!.userId, req.params.imageId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Gallery image removed', data: result });
});

const dashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.dashboard(req.params.id, req.user!.userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Dashboard data', data: result });
});

const updatePolicies = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelPolicyService.upsertByHotel(req.params.id, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Policies updated', data: result });
});

export const HotelController = {
  getAllHotels,
  getHotelBySlug,
  createHotel,
  updateHotel,
  deleteHotel,
  approveHotel,
  addGalleryImages,
  reorderGallery,
  setCoverImage,
  deleteGalleryImage,
  dashboard,
  updatePolicies,
};
