import mongoose from 'mongoose';

const bikeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    bikeType: { type: String, required: true, trim: true }, // e.g. "Standard", "Cruiser", "Sports"
    price: { type: Number, required: true, min: 0 }, // flat price for a ride slot
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Bike', bikeSchema);

