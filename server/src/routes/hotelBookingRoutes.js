import { Router } from 'express';
import { body } from 'express-validator';
import { createHotelBooking, listMyHotelBookings } from '../controllers/hotelBookingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  [
    body('hotelId').notEmpty(),
    body('checkIn').isISO8601().toDate(),
    body('checkOut').isISO8601().toDate(),
    body('guests').isInt({ min: 1 }),
    body('guestName').trim().notEmpty(),
    body('guestEmail').isEmail().normalizeEmail(),
    body('guestPhone').optional().trim(),
  ],
  createHotelBooking
);

router.get('/', listMyHotelBookings);

export default router;
