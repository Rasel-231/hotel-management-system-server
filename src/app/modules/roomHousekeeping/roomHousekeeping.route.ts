import express from 'express';
import { RoomHousekeepingController } from './roomHousekeeping.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { RoomHousekeepingValidation } from './roomHousekeeping.validation';

const router = express.Router();

router.get('/', validateRequest(RoomHousekeepingValidation.getAll), RoomHousekeepingController.getAll);
router.get('/:id', RoomHousekeepingController.getById);
router.post('/', validateRequest(RoomHousekeepingValidation.create), RoomHousekeepingController.create);
router.patch('/:id', validateRequest(RoomHousekeepingValidation.update), RoomHousekeepingController.update);
router.delete('/:id', RoomHousekeepingController.remove);

export const RoomHousekeepingRoutes = router;
