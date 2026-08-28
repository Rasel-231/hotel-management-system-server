import express from 'express';
import { validateRequest } from '../../../middlewares/validateRequest';
import { SearchController } from './search.controller';
import { SearchValidation } from './search.validation';

const router = express.Router();

router.get('/hotels', validateRequest(SearchValidation.search), SearchController.search);

export const SearchRoutes = router;
