import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { RoomController } from './room.controller';
import { RoomValidation } from './room.validation';

const router = express.Router();

router.get('/hotel/:hotelId', RoomController.getRoomsByHotel);
router.get('/:id/availability', RoomController.getRoomAvailability);

router.post(
  '/',
  auth('OWNER'),
  validateRequest(RoomValidation.create),
  RoomController.createRoom
);

router.patch(
  '/:id',
  auth('OWNER'),
  validateRequest(RoomValidation.update),
  RoomController.updateRoom
);

export const RoomRoutes = router;
