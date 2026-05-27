import { Router } from 'express';
import SiteSetting from '../models/SiteSetting.js';

const router = Router();

router.get('/public', async (_req, res) => {
  const doc = await SiteSetting.findOne({ key: 'siteName' });
  res.json({ siteName: (doc?.value && String(doc.value)) || 'Nature Touch' });
});

export default router;

