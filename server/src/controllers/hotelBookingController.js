import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import HotelBooking from '../models/HotelBooking.js';

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export async function createHotelBooking(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { hotelId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone } = req.body;
  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel id' });
  }
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return res.status(404).json({ message: 'Hotel not found' });
  }
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (outDate <= inDate) {
    return res.status(400).json({ message: 'Check-out must be after check-in' });
  }
  const nights = nightsBetween(inDate, outDate);
  const totalPrice = nights * hotel.pricePerNight * Number(guests);

  const booking = await HotelBooking.create({
    user: req.userId,
    hotel: hotel._id,
    checkIn: inDate,
    checkOut: outDate,
    guests: Number(guests),
    totalPrice,
    guestName,
    guestEmail,
    guestPhone: guestPhone || '',
  });
  await booking.populate('hotel');
  res.status(201).json(booking);
}

export async function listMyHotelBookings(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    HotelBooking.find({ user: req.userId })
      .populate('hotel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    HotelBooking.countDocuments({ user: req.userId }),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}
