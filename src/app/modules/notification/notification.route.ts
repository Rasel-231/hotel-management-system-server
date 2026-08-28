import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { NotificationController } from './notification.controller';
import { NotificationValidation } from './notification.validation';

const router = express.Router();

router.get('/', auth('USER'), validateRequest(NotificationValidation.list), NotificationController.list);
router.patch('/:id/read', auth('USER'), validateRequest(NotificationValidation.markRead), NotificationController.markRead);

export const NotificationRoutes = router;
