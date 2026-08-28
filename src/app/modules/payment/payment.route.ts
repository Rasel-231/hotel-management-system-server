import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router = express.Router();

router.post('/initiate', auth('USER'), validateRequest(PaymentValidation.initiate), PaymentController.initiate);
router.post('/webhook/:gateway', PaymentController.webhook);
router.get('/:bookingId/invoice', auth('USER'), PaymentController.getInvoice);
router.post('/refund', auth('ADMIN'), validateRequest(PaymentValidation.refund), PaymentController.refund);

export const PaymentRoutes = router;
