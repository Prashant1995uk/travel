import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';

export async function createBooking(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {
    bookingType,
    date,
    time,
    source,
    destination,
    price,
    passengerName,
    passengerEmail,
    passengerPhone,
  } = req.body;
  const booking = await Booking.create({
    user: req.userId,
    bookingType,
    date: new Date(date),
    time,
    source,
    destination,
    price: Number(price),
    passengerName,
    passengerEmail,
    passengerPhone: passengerPhone || '',
  });
  res.status(201).json(booking);
}

export async function listMyBookings(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Booking.find({ user: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments({ user: req.userId }),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function getBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.userId });
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  res.json(booking);
}

export async function cancelBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.userId });
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json(booking);
}
