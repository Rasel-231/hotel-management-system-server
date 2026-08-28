import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import { requireHotelAccess } from '../../../middlewares/hotelAccess';

const router = express.Router();

router.post('/', auth('USER'), validateRequest(BookingValidation.create), BookingController.createBooking);
router.post(
  '/walk-in',
  auth('OWNER', 'ADMIN'),
  requireHotelAccess('MANAGER', 'FRONT_DESK'),
  validateRequest(BookingValidation.walkIn),
  BookingController.walkInCreate
);

router.get('/me', auth('USER'), BookingController.getMyBookings);
router.get('/owner', auth('OWNER'), BookingController.getOwnerBookings);

router.get('/:id', auth('USER', 'OWNER', 'ADMIN'), BookingController.getBookingById);
router.patch('/:id/cancel', auth('USER'), BookingController.cancelBooking);
router.patch('/:id/check-in', auth('OWNER', 'ADMIN'), requireHotelAccess('MANAGER', 'FRONT_DESK'), BookingController.checkInBooking);
router.patch('/:id/check-out', auth('OWNER', 'ADMIN'), requireHotelAccess('MANAGER', 'FRONT_DESK'), BookingController.checkOutBooking);

export const BookingRoutes = router;
