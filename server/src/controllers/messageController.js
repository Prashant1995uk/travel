import Message from '../models/Message.js';

export async function listMessages(req, res) {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const room = (req.query.room || 'support').trim();
  const items = await Message.find({ room }).sort({ createdAt: -1 }).limit(limit);
  res.json({ items: items.reverse() });
}
