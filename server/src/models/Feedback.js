import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, trim: true, default: 'general' },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
