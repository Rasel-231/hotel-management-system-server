import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { ReportController } from './report.controller';
import { ReportValidation } from './report.validation';

const router = express.Router();

router.get('/revenue', auth('OWNER', 'ADMIN'), validateRequest(ReportValidation.query), ReportController.revenue);
router.get('/occupancy', auth('OWNER', 'ADMIN'), validateRequest(ReportValidation.query), ReportController.occupancy);

export const ReportRoutes = router;
