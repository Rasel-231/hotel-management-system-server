import { z } from 'zod';
import { emailSchema, nameSchema, phoneSchema, strongPasswordSchema } from '../../../shared/validation.rule';

const register = z.object({
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: strongPasswordSchema,
    phone: phoneSchema,
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshToken = z.object({
  body: z.object({}),
});

const verifyOtp = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(4).max(8, 'Invalid OTP format'),
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const resetPassword = z.object({
  body: z.object({
    token: z.string({ required_error: 'Reset token is required' }),
    newPassword: strongPasswordSchema,
  }),
});

const logout = z.object({
  body: z.object({}),
});

export const AuthValidation = {
  register,
  login,
  refreshToken,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
};
