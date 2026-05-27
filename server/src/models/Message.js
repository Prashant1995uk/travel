import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, default: 'support', trim: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    senderName: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
