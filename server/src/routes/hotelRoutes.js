import { Router } from 'express';
import { listHotels, getHotel } from '../controllers/hotelController.js';

const router = Router();

router.get('/', listHotels);
router.get('/:id', getHotel);

export default router;
