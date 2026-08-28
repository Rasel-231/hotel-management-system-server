import express from 'express';
import rateLimit from 'express-rate-limit';
import { UserController } from './user.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { auth } from '../../../middlewares/auth';
import { UserValidation } from './user.validation';
const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts, please try again later' },
});

router.post('/register', registerLimiter, validateRequest(UserValidation.userRegisterZodValidation), UserController.registerUser);
router.get('/profile', auth(), UserController.getProfile);
router.patch('/profile', auth(), validateRequest(UserValidation.updateProfile), UserController.updateProfile);
router.get('/', auth('ADMIN', 'SUPER_ADMIN'), validateRequest(UserValidation.getAll), UserController.getAllUsers);
router.get('/:id', auth('ADMIN', 'SUPER_ADMIN'), UserController.getById);
router.patch('/:id', auth('ADMIN', 'SUPER_ADMIN'), validateRequest(UserValidation.adminUpdate), UserController.updateUser);
router.delete('/:id', auth('ADMIN', 'SUPER_ADMIN'), UserController.deleteUser);

export const UserRoutes = router;
