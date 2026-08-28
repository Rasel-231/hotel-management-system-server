import express from 'express';
import { auth } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { requireHotelOwnership } from '../../../middlewares/hotelAccess';
import { HotelController } from './hotel.controller';
import { HotelValidation } from './hotel.validation';
import { HotelPolicyValidation } from '../hotelPolicy/hotelPolicy.validation';
import { fileUploadHelper } from '../../../shared/fileUploader';

const router = express.Router();

router.get('/', auth('OWNER'), HotelController.getAllHotels);
router.get('/:slug', HotelController.getHotelBySlug);

router.post('/', auth('OWNER'), validateRequest(HotelValidation.create), HotelController.createHotel);
router.patch('/:id', auth('OWNER'), requireHotelOwnership, validateRequest(HotelValidation.update), HotelController.updateHotel);
router.delete('/:id', auth('OWNER'), requireHotelOwnership, HotelController.deleteHotel);
router.patch('/:id/approve', auth('ADMIN'), HotelController.approveHotel);

router.post(
  '/:id/gallery',
  auth('OWNER'),
  requireHotelOwnership,
  fileUploadHelper.upload.array('images', 10),
  HotelController.addGalleryImages
);
router.patch('/:id/gallery/order', auth('OWNER'), requireHotelOwnership, HotelController.reorderGallery);
router.patch('/:id/gallery/:imageId/cover', auth('OWNER'), requireHotelOwnership, HotelController.setCoverImage);
router.delete('/:id/gallery/:imageId', auth('OWNER'), requireHotelOwnership, HotelController.deleteGalleryImage);

router.get('/:id/dashboard', auth('OWNER'), requireHotelOwnership, HotelController.dashboard);
router.put('/:id/policies', auth('OWNER'), requireHotelOwnership, validateRequest(HotelPolicyValidation.updateByHotel), HotelController.updatePolicies);

export const HotelRoutes = router;
