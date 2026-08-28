import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import config from '../../../config';
import { RedisService } from '../../../shared/redis';
import { sendEmailHelper } from '../../../shared/sendEmail';
import { jwtHelpers, DecodedToken } from '../../../shared/jwtHelpers';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { User } from '@prisma/client';
import {
  IAuthResult,
  ILoginPayload,
  IRegisterPayload,
  IResetPasswordPayload,
  IUserResponse,
  IVerifyOtpPayload,
  IForgotPasswordPayload,
  ILogoutResponse,
} from './auth.interface';

const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

const toUserResponse = (user: User): IUserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isVerified: user.isVerified,
});

const generateTokens = async (payload: {
  userId: string;
  role: string;
  tokenVersion: number;
}): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = jwtHelpers.createToken(
    { userId: payload.userId, role: payload.role, tokenVersion: payload.tokenVersion },
    config.jwt.secret,
    config.jwt.expires_in
  );
  const refreshToken = jwtHelpers.createToken(
    { userId: payload.userId, role: payload.role, tokenVersion: payload.tokenVersion },
    config.jwt.secret,
    config.jwt.refresh_expires_in
  );

  return { accessToken, refreshToken };
};

const register = async (payload: IRegisterPayload): Promise<IAuthResult> => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError('Email is already registered', StatusCodes.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(payload.password, config.salt_rounds);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      phone: payload.phone,
      role: payload.role ?? 'USER',
    },
  });

  const otp = generateOtp();
  await RedisService.client.set(`otp:${user.email}`, otp, 'EX', 5 * 60);
  await sendEmailHelper.sendEmail(
    user.email,
    'Verify your account',
    `<p>Your verification OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
  );

  const tokens = await generateTokens({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion });
  return { ...tokens, user: toUserResponse(user) };
};

const login = async (payload: ILoginPayload): Promise<IAuthResult> => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new ApiError('Invalid E-mail', StatusCodes.UNAUTHORIZED);
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isPasswordMatch) {
    throw new ApiError('Invalid password', StatusCodes.UNAUTHORIZED);
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
  const stored = await RedisService.client.get(`otp:${payload.email}`);
  if (!stored || stored !== payload.otp) {
    throw new ApiError('Invalid or expired OTP', StatusCodes.BAD_REQUEST);
  }

  await RedisService.client.del(`otp:${payload.email}`);
  await prisma.user.updateMany({
    where: { email: payload.email },
    data: { isVerified: true },
  });

  return { verified: true };
};

const forgotPassword = async (payload: IForgotPasswordPayload): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new ApiError('User not found', StatusCodes.NOT_FOUND);
  }

  const token = crypto.randomBytes(32).toString('hex');
  await RedisService.client.set(`reset:${token}`, user.id, 'EX', 10 * 60);

  const resetUrl = `${config.base_url || ''}/reset-password?token=${token}`;
  await sendEmailHelper.sendEmail(
    user.email,
    'Reset your password',
    `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 10 minutes.</p>`
  );

  return { message: 'Reset link sent to your email' };
};

const resetPassword = async (payload: IResetPasswordPayload): Promise<{ message: string }> => {
  const userId = await RedisService.client.get(`reset:${payload.token}`);
  if (!userId) {
    throw new ApiError('Invalid or expired reset token', StatusCodes.BAD_REQUEST);
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, config.salt_rounds);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
  });

  await RedisService.client.del(`reset:${payload.token}`);
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
      // invalid/expired token -> nothing to revoke, logout still succeeds
    }
  }
  return { message: 'Logged out successfully' };
};

export const AuthService = {
  register,
  login,
  refreshToken,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
};
