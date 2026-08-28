import express from 'express';
import { HotelPolicyController } from './hotelPolicy.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { HotelPolicyValidation } from './hotelPolicy.validation';

const router = express.Router();

router.get('/', validateRequest(HotelPolicyValidation.getAll), HotelPolicyController.getAll);
router.get('/:id', HotelPolicyController.getById);
router.post('/', validateRequest(HotelPolicyValidation.create), HotelPolicyController.create);
router.patch('/:id', validateRequest(HotelPolicyValidation.update), HotelPolicyController.update);
router.delete('/:id', HotelPolicyController.remove);

export const HotelPolicyRoutes = router;
