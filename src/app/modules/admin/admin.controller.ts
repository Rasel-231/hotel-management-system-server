import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma, Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { adminAssignRoleFields } from './admin.constant';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { pick } from '../../../shared/pick';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers(
    req.query as {
      searchTerm?: string;
      page?: string | number;
      limit?: string | number;
    }
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const assignRole = catchAsync(async (req: Request, res: Response) => {
  const { role } = pick(req.body as Record<string, unknown>, adminAssignRoleFields);
  const result = await AdminService.assignRole(req.params.id, role as Role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Role assigned successfully',
    data: result,
  });
});

const getAnalytics = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getAnalytics();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Analytics fetched successfully',
    data: result,
  });
});

const getRolesPermissions = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getRolesPermissions();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Roles and permissions fetched successfully',
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  assignRole,
  getAnalytics,
  getRolesPermissions,
};
