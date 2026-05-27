import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import Bike from '../models/Bike.js';
import BikeBooking from '../models/BikeBooking.js';
import Destination from '../models/Destination.js';

const router = Router();

router.get('/bikes', async (_req, res) => {
  const items = await Bike.find({ isActive: true }).populate('destination').sort({ createdAt: -1 });
  res.json({ items });
});

router.post(
  '/bookings',
  protect,
  [
    body('destinationId').isMongoId(),
    body('bikeId').isMongoId(),
    body('date').trim().notEmpty(),
    body('time').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { destinationId, bikeId, date, time } = req.body;
    const dest = await Destination.findById(destinationId);
    if (!dest || !dest.isActive) return res.status(404).json({ message: 'Destination not found' });

    const bike = await Bike.findById(bikeId);
    if (!bike || !bike.isActive) return res.status(404).json({ message: 'Bike not found' });
    if (bike.destination.toString() !== destinationId) {
      return res.status(400).json({ message: 'Bike does not belong to this destination' });
    }

    const when = new Date(date);
    if (Number.isNaN(when.getTime())) return res.status(400).json({ message: 'Invalid date' });

    const doc = await BikeBooking.create({
      user: req.userId,
      destination: destinationId,
      bike: bikeId,
      date: when,
      time,
      price: bike.price,
      status: 'pending',
    });
    res.status(201).json(doc);
  }
);

router.get('/bookings', protect, async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const items = await BikeBooking.find({ user: req.userId })
    .populate('destination')
    .populate('bike')
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json({ items });
});

router.get('/admin/bikes', protect, adminOnly, async (_req, res) => {
  const items = await Bike.find().populate('destination').sort({ createdAt: -1 });
  res.json({ items });
});

router.post(
  '/admin/bikes',
  protect,
  adminOnly,
  [body('title').trim().notEmpty(), body('destinationId').isMongoId(), body('bikeType').trim().notEmpty(), body('price').isFloat({ min: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, destinationId, bikeType, price } = req.body;
    const dest = await Destination.findById(destinationId);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    const doc = await Bike.create({ title, destination: destinationId, bikeType, price: Number(price) });
    res.status(201).json(doc);
  }
);

router.patch('/admin/bikes/:id', protect, adminOnly, async (req, res) => {
  const allowed = ['title', 'bikeType', 'price', 'currency', 'isActive', 'destination'];
  const updates = {};
  for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
  if (updates.price != null) updates.price = Number(updates.price);
  const doc = await Bike.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('destination');
  if (!doc) return res.status(404).json({ message: 'Bike not found' });
  res.json(doc);
});

router.delete('/admin/bikes/:id', protect, adminOnly, async (req, res) => {
  const doc = await Bike.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Bike not found' });
  await BikeBooking.deleteMany({ bike: req.params.id });
  res.json({ message: 'Bike removed' });
});

router.get('/admin/bookings', protect, adminOnly, async (req, res) => {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const items = await BikeBooking.find()
    .populate('user', 'name email')
    .populate('destination')
    .populate('bike')
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json({ items });
});

router.patch(
  '/admin/bookings/:id/status',
  protect,
  adminOnly,
  [body('status').isIn(['pending', 'approved', 'cancelled'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const doc = await BikeBooking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
      .populate('user', 'name email')
      .populate('destination')
      .populate('bike');
    if (!doc) return res.status(404).json({ message: 'Booking not found' });
    res.json(doc);
  }
);

export default router;

