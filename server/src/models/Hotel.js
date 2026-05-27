import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
    pricePerNight: { type: Number, required: true, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    images: [{ type: String }],
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

hotelSchema.index({ name: 'text', location: 'text', city: 'text' });

export default mongoose.model('Hotel', hotelSchema);
