import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.post('/', protect, adminOnly, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

export default router;
