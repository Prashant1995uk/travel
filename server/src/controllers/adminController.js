import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import HotelBooking from '../models/HotelBooking.js';
import Contact from '../models/Contact.js';
import Feedback from '../models/Feedback.js';
import SiteSetting from '../models/SiteSetting.js';

export async function listUsers(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const q = (req.query.q || '').trim();
  const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
  const [items, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function updateUserRole(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
    '-password'
  );
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
}

export async function listAllBookings(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Booking.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function listAllHotelBookings(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    HotelBooking.find()
      .populate('user', 'name email')
      .populate('hotel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    HotelBooking.countDocuments(),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function createHotel(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, location, city, country, pricePerNight, rating, images, description } = req.body;
  const hotel = await Hotel.create({
    name,
    location,
    city: city || '',
    country: country || 'India',
    pricePerNight: Number(pricePerNight),
    rating: rating != null ? Number(rating) : 0,
    images: Array.isArray(images) ? images : [],
    description: description || '',
  });
  res.status(201).json(hotel);
}

export async function updateHotel(req, res) {
  const allowed = ['name', 'location', 'city', 'country', 'pricePerNight', 'rating', 'images', 'description'];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  if (updates.pricePerNight != null) updates.pricePerNight = Number(updates.pricePerNight);
  if (updates.rating != null) updates.rating = Number(updates.rating);
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }
  res.json(hotel);
}

export async function deleteHotel(req, res) {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }
  await HotelBooking.deleteMany({ hotel: req.params.id });
  res.json({ message: 'Hotel removed' });
}

export async function appendHotelImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }
  hotel.images.push(fullUrl);
  await hotel.save();
  res.json({ hotel, uploadedUrl: fullUrl });
}

export async function listContacts(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function listFeedbacksAdmin(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Feedback.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Feedback.countDocuments(),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function setUserBlocked(req, res) {
  const blocked = Boolean(req.body?.blocked);
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: blocked }, { new: true }).select(
    '-password'
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

export async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
}

export async function approveFeedback(req, res) {
  const approved = Boolean(req.body?.approved);
  const doc = await Feedback.findByIdAndUpdate(req.params.id, { approved }, { new: true }).populate(
    'user',
    'name email'
  );
  if (!doc) return res.status(404).json({ message: 'Feedback not found' });
  res.json(doc);
}

export async function deleteFeedback(req, res) {
  const doc = await Feedback.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Feedback not found' });
  res.json({ message: 'Feedback removed' });
}

export async function deleteContact(req, res) {
  const doc = await Contact.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Contact not found' });
  res.json({ message: 'Contact removed' });
}

export async function getSiteName(req, res) {
  const doc = await SiteSetting.findOne({ key: 'siteName' });
  res.json({ siteName: (doc?.value && String(doc.value)) || 'Nature Touch' });
}

export async function setSiteName(req, res) {
  const name = String(req.body?.siteName || '').trim();
  if (!name) return res.status(400).json({ message: 'siteName is required' });
  const doc = await SiteSetting.findOneAndUpdate(
    { key: 'siteName' },
    { value: name },
    { upsert: true, new: true }
  );
  res.json({ siteName: String(doc.value) });
}

export async function updateBookingStatus(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  res.json(booking);
}

export async function updateHotelBookingStatus(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const booking = await HotelBooking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
    'hotel'
  );
  if (!booking) {
    return res.status(404).json({ message: 'Hotel booking not found' });
  }
  res.json(booking);
}
