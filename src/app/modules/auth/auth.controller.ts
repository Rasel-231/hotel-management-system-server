import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from './auth.service';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';
import { setCookies, clearSetCookies } from '../../../shared/cookie.helper';



const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  setCookies(res, result);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Login successful',
    data: { user: result.user },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies?.refreshToken;
  if (!refreshTokenValue) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: 'Refresh token is missing',
      data: null,
    });
  }
  const result = await AuthService.refreshToken(refreshTokenValue);
  setCookies(res, result);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Token refreshed successfully',
    data: null,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyOtp(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'OTP verified successfully',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies?.refreshToken;
  const result = await AuthService.logout(refreshTokenValue);
  clearSetCookies(res);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const AuthController = {
  login,
  refreshToken,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
};
