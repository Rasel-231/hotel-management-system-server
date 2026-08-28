import express from 'express';
import { PricingRuleController } from './pricingRule.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { PricingRuleValidation } from './pricingRule.validation';

const router = express.Router();

router.get('/', validateRequest(PricingRuleValidation.getAll), PricingRuleController.getAll);
router.get('/:id', PricingRuleController.getById);
router.post('/', validateRequest(PricingRuleValidation.create), PricingRuleController.create);
router.patch('/:id', validateRequest(PricingRuleValidation.update), PricingRuleController.update);
router.delete('/:id', PricingRuleController.remove);

export const PricingRuleRoutes = router;
