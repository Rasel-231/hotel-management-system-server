import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { HotelController } from './hotel.controller';
import { HotelValidation } from './hotel.validation';

const router = express.Router();

router.get('/', HotelController.getAllHotels);
router.get('/:slug', HotelController.getHotelBySlug);
router.post('/', auth('OWNER'), validateRequest(HotelValidation.create), HotelController.createHotel);
router.patch('/:id', auth('OWNER'), validateRequest(HotelValidation.update), HotelController.updateHotel);
router.delete('/:id', auth('OWNER', 'ADMIN'), HotelController.deleteHotel);
router.patch('/:id/approve', auth('ADMIN'), HotelController.approveHotel);

export const HotelRoutes = router;
