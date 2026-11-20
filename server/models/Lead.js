import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    course: { type: String, required: true, trim: true, maxlength: 120 },
    branch: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('Lead', leadSchema);
