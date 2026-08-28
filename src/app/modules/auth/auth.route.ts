import express from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post('/register', validateRequest(AuthValidation.register), AuthController.register);
router.post('/login', validateRequest(AuthValidation.login), AuthController.login);
router.post('/refresh-token', validateRequest(AuthValidation.refreshToken), AuthController.refreshToken);
router.post('/verify-otp', validateRequest(AuthValidation.verifyOtp), AuthController.verifyOtp);
router.post('/forgot-password', validateRequest(AuthValidation.forgotPassword), AuthController.forgotPassword);
router.post('/reset-password', validateRequest(AuthValidation.resetPassword), AuthController.resetPassword);
router.post('/logout', validateRequest(AuthValidation.logout), AuthController.logout);

export const AuthRoutes = router;
