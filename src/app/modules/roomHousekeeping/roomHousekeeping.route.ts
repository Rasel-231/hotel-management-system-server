import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { requireHotelAccess } from '../../../middlewares/hotelAccess';
import { RoomHousekeepingController } from './roomHousekeeping.controller';
import { RoomHousekeepingValidation } from './roomHousekeeping.validation';

const router = express.Router();

router.get('/', validateRequest(RoomHousekeepingValidation.getAll), RoomHousekeepingController.getAll);
router.get('/:id', RoomHousekeepingController.getById);
router.post('/', validateRequest(RoomHousekeepingValidation.create), RoomHousekeepingController.create);
router.patch('/:id', validateRequest(RoomHousekeepingValidation.update), RoomHousekeepingController.update);
router.delete('/:id', RoomHousekeepingController.remove);

router.put(
  '/rooms/:id/housekeeping-status',
  auth('OWNER', 'ADMIN'),
  requireHotelAccess('MANAGER', 'HOUSEKEEPING'),
  validateRequest(RoomHousekeepingValidation.update),
  RoomHousekeepingController.setStatus
);

export const RoomHousekeepingRoutes = router;
