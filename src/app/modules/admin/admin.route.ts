import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AdminController } from './admin.controller';
import { AdminValidation } from './admin.validation';

const router = express.Router();

router.get('/users', auth('ADMIN'), AdminController.getAllUsers);
router.patch(
  '/users/:id/role',
  auth('ADMIN'),
  validateRequest(AdminValidation.assignRole),
  AdminController.assignRole
);
router.get('/analytics', auth('ADMIN'), AdminController.getAnalytics);
router.get('/roles-permissions', auth('ADMIN'), AdminController.getRolesPermissions);

export const AdminRoutes = router;
