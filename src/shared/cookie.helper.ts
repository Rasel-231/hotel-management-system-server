import { Response } from 'express';
import config from '../config';

const parseDurationToMs = (duration: string): number => {
  const match = /^(\d+)\s*([smhd])$/.exec(duration.trim());
  if (!match) return 0;
  const value = Number(match[1]);
  const multiplier: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * multiplier[match[2]];
};

const baseOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const setCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
): void => {
  res.cookie('accessToken', tokens.accessToken, {
    ...baseOptions,
    maxAge: parseDurationToMs(config.jwt.expires_in),
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...baseOptions,
    maxAge: parseDurationToMs(config.jwt.refresh_expires_in),
  });
};

export const clearSetCookies = (res: Response): void => {
  res.clearCookie('accessToken', baseOptions);
  res.clearCookie('refreshToken', baseOptions);
};
