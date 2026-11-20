import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    amount: { type: Number, required: true, min: 1, max: 100_000_000 },
    method: { type: String, enum: ['card', 'bank-transfer', 'cash'], required: true },
    reference: { type: String, trim: true, maxlength: 100, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('Payment', paymentSchema);
