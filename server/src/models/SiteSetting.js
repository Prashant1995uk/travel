import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('SiteSetting', siteSettingSchema);

