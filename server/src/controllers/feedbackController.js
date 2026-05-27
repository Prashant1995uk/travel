import { validationResult } from 'express-validator';
import Feedback from '../models/Feedback.js';

export async function createFeedback(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { rating, comment, category, name, email } = req.body;
  const doc = await Feedback.create({
    user: req.userId || null,
    name: req.user?.name || name || '',
    email: req.user?.email || email || '',
    rating: Number(rating),
    comment,
    category: category || 'general',
    approved: false,
  });
  res.status(201).json(doc);
}

export async function listFeedback(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Feedback.find({ approved: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name'),
    Feedback.countDocuments({ approved: true }),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}
