import { z } from 'zod';

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const COMMON_PASSWORDS = [
  'password',
  'password1',
  'password123',
  '12345678',
  'qwerty',
  'admin',
  'welcome',
  'letmein',
  'iloveyou',
];

export const strongPasswordSchema = passwordSchema.refine(
  (value) => !COMMON_PASSWORDS.includes(value.toLowerCase()),
  'Password is too common, please choose a stronger password'
);

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .max(254, 'Email is too long');

export const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be at most 50 characters')
  .regex(/^[\p{L}\p{M}\s.'-]+$/u, 'Name contains invalid characters');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{6,15}$/, 'Invalid phone number')
  .optional();
