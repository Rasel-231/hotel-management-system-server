import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { requireHotelOwnership } from '../../../middlewares/hotelAccess';
import { PricingRuleController } from './pricingRule.controller';
import { PricingRuleValidation } from './pricingRule.validation';

const router = express.Router();

router.get('/', validateRequest(PricingRuleValidation.getAll), PricingRuleController.getAll);
router.get('/:id', PricingRuleController.getById);
router.post('/', validateRequest(PricingRuleValidation.create), PricingRuleController.create);
router.patch('/:id', validateRequest(PricingRuleValidation.update), PricingRuleController.update);
router.delete('/:id', PricingRuleController.remove);

router.post('/hotel/:hotelId', auth('OWNER'), requireHotelOwnership, validateRequest(PricingRuleValidation.createScoped), PricingRuleController.createForHotel);
router.get('/hotel/:hotelId', auth('OWNER'), requireHotelOwnership, PricingRuleController.listForHotel);

export const PricingRuleRoutes = router;
