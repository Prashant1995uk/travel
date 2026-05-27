import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  listMyBookings,
  getBooking,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  [
    body('bookingType').isIn(['bus', 'flight', 'car']),
    body('date').isISO8601().toDate(),
    body('time').trim().notEmpty(),
    body('source').trim().notEmpty(),
    body('destination').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('passengerName').trim().notEmpty(),
    body('passengerEmail').isEmail().normalizeEmail(),
    body('passengerPhone').optional().trim(),
  ],
  createBooking
);

router.get('/', listMyBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

export default router;
