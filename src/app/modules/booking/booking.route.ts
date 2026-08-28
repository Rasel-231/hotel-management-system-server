import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';

const router = express.Router();

router.post(
  '/',
  auth('USER'),
  validateRequest(BookingValidation.create),
  BookingController.createBooking
);

router.get('/me', auth('USER'), BookingController.getMyBookings);
router.get('/owner', auth('OWNER'), BookingController.getOwnerBookings);

router.get('/:id', auth('USER', 'OWNER', 'ADMIN'), BookingController.getBookingById);
router.patch('/:id/cancel', auth('USER'), BookingController.cancelBooking);
router.patch('/:id/check-in', auth('OWNER'), BookingController.checkInBooking);

export const BookingRoutes = router;
