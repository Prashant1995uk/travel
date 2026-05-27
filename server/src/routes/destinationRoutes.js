import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import { uploadImage, uploadMedia } from '../middleware/upload.js';
import Destination from '../models/Destination.js';
import { validationResult } from 'express-validator';

const router = Router();

router.get('/', async (req, res) => {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const q = (req.query.q || '').trim();
  const filter = { isActive: true };
  if (q) filter.name = new RegExp(q, 'i');
  const items = await Destination.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json({ items });
});

router.get('/admin/list', protect, adminOnly, async (req, res) => {
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 100));
  const q = (req.query.q || '').trim();
  const filter = q ? { name: new RegExp(q, 'i') } : {};
  const items = await Destination.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json({ items });
});

router.get('/:id', async (req, res) => {
  const doc = await Destination.findById(req.params.id);
  if (!doc || !doc.isActive) return res.status(404).json({ message: 'Destination not found' });
  res.json(doc);
});

router.post(
  '/',
  protect,
  adminOnly,
  [body('name').trim().notEmpty(), body('description').optional().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, city, country, description } = req.body;
    const doc = await Destination.create({ name, city: city || '', country: country || 'India', description: description || '' });
    res.status(201).json(doc);
  }
);

router.patch('/:id', protect, adminOnly, async (req, res) => {
  const allowed = ['name', 'city', 'country', 'description', 'featuredPhotos', 'featuredVideos', 'isActive'];
  const updates = {};
  for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
  const doc = await Destination.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!doc) return res.status(404).json({ message: 'Destination not found' });
  res.json(doc);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const doc = await Destination.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Destination not found' });
  res.json({ message: 'Destination removed' });
});

router.post('/:id/featured-photo', protect, adminOnly, uploadImage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const doc = await Destination.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Destination not found' });
  doc.featuredPhotos.push(fullUrl);
  await doc.save();
  res.json({ destination: doc, uploadedUrl: fullUrl });
});

router.post('/:id/featured-video', protect, adminOnly, uploadMedia.single('media'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const doc = await Destination.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Destination not found' });
  doc.featuredVideos.push(fullUrl);
  await doc.save();
  res.json({ destination: doc, uploadedUrl: fullUrl });
});

export default router;

