import express from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});


router.post('/login', authLimiter, validateRequest(AuthValidation.login), AuthController.login);
router.post('/refresh-token', validateRequest(AuthValidation.refreshToken), AuthController.refreshToken);
router.post('/verify-otp', validateRequest(AuthValidation.verifyOtp), AuthController.verifyOtp);
router.post('/forgot-password', validateRequest(AuthValidation.forgotPassword), AuthController.forgotPassword);
router.post('/reset-password', validateRequest(AuthValidation.resetPassword), AuthController.resetPassword);
router.post('/logout', validateRequest(AuthValidation.logout), AuthController.logout);

export const AuthRoutes = router;
