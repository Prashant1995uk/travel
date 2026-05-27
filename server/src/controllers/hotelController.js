import Hotel from '../models/Hotel.js';

export async function listHotels(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;
  const q = (req.query.q || '').trim();
  const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null;
  const minRating = req.query.minRating != null ? Number(req.query.minRating) : null;

  const filter = {};
  if (q) {
    filter.$text = { $search: q };
  }
  if (Number.isFinite(minPrice)) filter.pricePerNight = { ...filter.pricePerNight, $gte: minPrice };
  if (Number.isFinite(maxPrice)) {
    filter.pricePerNight = { ...filter.pricePerNight, $lte: maxPrice };
  }
  if (Number.isFinite(minRating)) filter.rating = { $gte: minRating };

  const sort = q ? { score: { $meta: 'textScore' } } : { rating: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Hotel.find(filter, q ? { score: { $meta: 'textScore' } } : {})
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Hotel.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function getHotel(req, res) {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }
  res.json(hotel);
}
