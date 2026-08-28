import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';

const router = express.Router();

router.get('/hotel/:hotelId', ReviewController.getReviewsByHotel);

router.post(
  '/',
  auth('USER'),
  validateRequest(ReviewValidation.create),
  ReviewController.createReview
);

router.delete('/:id', auth('ADMIN'), ReviewController.deleteReview);

export const ReviewRoutes = router;
