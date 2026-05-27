import mongoose from 'mongoose';

const bikeBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    bike: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true }, // "HH:mm"
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'approved', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

bikeBookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('BikeBooking', bikeBookingSchema);

