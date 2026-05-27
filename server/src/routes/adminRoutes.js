import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import { uploadImage } from '../middleware/upload.js';
import {
  listUsers,
  updateUserRole,
  setUserBlocked,
  deleteUser,
  listAllBookings,
  listAllHotelBookings,
  createHotel,
  updateHotel,
  deleteHotel,
  appendHotelImage,
  listContacts,
  deleteContact,
  listFeedbacksAdmin,
  approveFeedback,
  deleteFeedback,
  updateBookingStatus,
  updateHotelBookingStatus,
  getSiteName,
  setSiteName,
} from '../controllers/adminController.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/users', listUsers);
router.patch('/users/:id/role', [body('role').isIn(['user', 'admin'])], updateUserRole);
router.patch('/users/:id/block', [body('blocked').isBoolean().toBoolean()], setUserBlocked);
router.delete('/users/:id', deleteUser);

router.get('/settings/site-name', getSiteName);
router.patch('/settings/site-name', [body('siteName').trim().notEmpty()], setSiteName);

router.get('/bookings', listAllBookings);
router.patch('/bookings/:id/status', [body('status').isIn(['pending', 'confirmed', 'cancelled'])], updateBookingStatus);

router.get('/hotel-bookings', listAllHotelBookings);
router.patch(
  '/hotel-bookings/:id/status',
  [body('status').isIn(['pending', 'confirmed', 'cancelled'])],
  updateHotelBookingStatus
);

router.post(
  '/hotels',
  [
    body('name').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('pricePerNight').isFloat({ min: 0 }),
    body('rating').optional().isFloat({ min: 0, max: 5 }),
    body('images').optional().isArray(),
    body('description').optional().trim(),
  ],
  createHotel
);
router.patch('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);
router.post('/hotels/:id/images', uploadImage.single('image'), appendHotelImage);

router.get('/contacts', listContacts);
router.delete('/contacts/:id', deleteContact);
router.get('/feedbacks', listFeedbacksAdmin);
router.patch('/feedbacks/:id/approve', [body('approved').isBoolean().toBoolean()], approveFeedback);
router.delete('/feedbacks/:id', deleteFeedback);

export default router;
