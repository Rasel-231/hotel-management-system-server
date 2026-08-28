import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { requireHotelOwnership } from '../../../middlewares/hotelAccess';
import { HotelStaffController } from './hotelStaff.controller';
import { HotelStaffValidation } from './hotelStaff.validation';

const router = express.Router();

router.get('/', validateRequest(HotelStaffValidation.getAll), HotelStaffController.getAll);
router.get('/:id', HotelStaffController.getById);
router.post('/', validateRequest(HotelStaffValidation.create), HotelStaffController.create);
router.patch('/:id', validateRequest(HotelStaffValidation.update), HotelStaffController.update);
router.delete('/:id', HotelStaffController.remove);

router.post('/hotel/:hotelId/invite', auth('OWNER'), requireHotelOwnership, validateRequest(HotelStaffValidation.invite), HotelStaffController.invite);
router.get('/hotel/:hotelId', auth('OWNER'), requireHotelOwnership, HotelStaffController.listByHotel);
router.delete('/hotel/:hotelId/:staffId', auth('OWNER'), requireHotelOwnership, HotelStaffController.revoke);

export const HotelStaffRoutes = router;
