import express from 'express';
import { BookingCheckLogController } from './bookingCheckLog.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { BookingCheckLogValidation } from './bookingCheckLog.validation';

const router = express.Router();

router.get('/', validateRequest(BookingCheckLogValidation.getAll), BookingCheckLogController.getAll);
router.get('/:id', BookingCheckLogController.getById);
router.post('/', validateRequest(BookingCheckLogValidation.create), BookingCheckLogController.create);
router.patch('/:id', validateRequest(BookingCheckLogValidation.update), BookingCheckLogController.update);
router.delete('/:id', BookingCheckLogController.remove);

export const BookingCheckLogRoutes = router;
