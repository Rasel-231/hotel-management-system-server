import express from 'express';
import { HotelStaffController } from './hotelStaff.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { HotelStaffValidation } from './hotelStaff.validation';

const router = express.Router();

router.get('/', validateRequest(HotelStaffValidation.getAll), HotelStaffController.getAll);
router.get('/:id', HotelStaffController.getById);
router.post('/', validateRequest(HotelStaffValidation.create), HotelStaffController.create);
router.patch('/:id', validateRequest(HotelStaffValidation.update), HotelStaffController.update);
router.delete('/:id', HotelStaffController.remove);

export const HotelStaffRoutes = router;
