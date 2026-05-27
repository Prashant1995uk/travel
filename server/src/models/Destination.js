import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
    description: { type: String, trim: true, default: '' },
    featuredPhotos: { type: [String], default: [] },
    featuredVideos: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Destination', destinationSchema);

