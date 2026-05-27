import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingType: { type: String, enum: ['bus', 'flight', 'car'], required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    passengerName: { type: String, required: true, trim: true },
    passengerEmail: { type: String, required: true, trim: true },
    passengerPhone: { type: String, default: '', trim: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
