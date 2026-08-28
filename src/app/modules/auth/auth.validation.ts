import { z } from 'zod';

const register = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OWNER', 'USER', 'GUEST']).optional(),
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
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
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
