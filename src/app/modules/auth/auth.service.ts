import prisma from '../../../shared/prisma.client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import config from '../../../config';

import { sendEmailHelper } from '../../../shared/email.helper';
import { jwtHelpers, DecodedToken } from '../../../shared/jwt.helper';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import {
  IAuthResult,
  ILoginPayload,
  IResetPasswordPayload,
  IVerifyOtpPayload,
  IForgotPasswordPayload,
  ILogoutResponse,
} from './auth.interface';

import { generateTokens, toUserResponse } from '../../../utils/generateToken';
import { redisClient } from '../../../database/redis';

const login = async (payload: ILoginPayload): Promise<IAuthResult> => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    throw new ApiError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isPasswordMatch) {
    throw new ApiError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  const tokens = await generateTokens({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion });

  return { ...tokens, user: toUserResponse(user) };
};

const refreshToken = async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
  let decoded: DecodedToken;
  try {
    decoded = jwtHelpers.verifyToken(token, config.jwt.secret);
  } catch {
    throw new ApiError('Invalid or expired refresh token', StatusCodes.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    throw new ApiError('User not found', StatusCodes.UNAUTHORIZED);
  }
  if (user.tokenVersion !== decoded.tokenVersion) {
    throw new ApiError('Refresh token is no longer valid', StatusCodes.UNAUTHORIZED);
  }

  return generateTokens({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion });
};

const verifyOtp = async (payload: IVerifyOtpPayload): Promise<{ verified: boolean }> => {
  const stored = await redisClient.get(`otp:${payload.email}`);
  if (!stored || stored !== payload.otp) {
    throw new ApiError('Invalid or expired OTP', StatusCodes.BAD_REQUEST);
  }

  await redisClient.del(`otp:${payload.email}`);
  await prisma.user.updateMany({
    where: { email: payload.email },
    data: { isVerified: true },
  });

  return { verified: true };
};

const forgotPassword = async (payload: IForgotPasswordPayload): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    await redisClient.set(`reset:${token}`, user.id, 10 * 60);

    const resetUrl = `${config.base_url || ''}/reset-password?token=${token}`;
    await sendEmailHelper.sendEmail(
      user.email,
      'Reset your password',
      `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 10 minutes.</p>`
    );
  }

  return { message: 'If an account with that email exists, a reset link has been sent' };
};

const resetPassword = async (payload: IResetPasswordPayload): Promise<{ message: string }> => {
  const userId = await redisClient.get(`reset:${payload.token}`);
  if (!userId) {
    throw new ApiError('Invalid or expired reset token', StatusCodes.BAD_REQUEST);
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, config.salt_rounds);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
  });

  await redisClient.del(`reset:${payload.token}`);
  return { message: 'Password reset successful' };
};

const logout = async (refreshTokenValue: string): Promise<ILogoutResponse> => {
  if (refreshTokenValue) {
    try {
      const decoded = jwtHelpers.verifyToken(refreshTokenValue, config.jwt.secret);
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { tokenVersion: { increment: 1 } },
      });
    } catch {

    }
  }
  return { message: 'Logged out successfully' };
};

export const AuthService = {
  login,
  refreshToken,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
};