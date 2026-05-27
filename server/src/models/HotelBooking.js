import mongoose from 'mongoose';

const hotelBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    guestName: { type: String, required: true, trim: true },
    guestEmail: { type: String, required: true, trim: true },
    guestPhone: { type: String, default: '', trim: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

export default mongoose.model('HotelBooking', hotelBookingSchema);
