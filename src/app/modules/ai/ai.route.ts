import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AIController } from './ai.controller';
import { AIValidation } from './ai.validation';

const router = express.Router();

router.post('/chat', validateRequest(AIValidation.chat), AIController.chat);
router.post('/search-parse', validateRequest(AIValidation.searchParse), AIController.searchParse);
router.get('/recommendations', auth('USER'), validateRequest(AIValidation.recommendations), AIController.recommendations);

export const AIRoutes = router;
