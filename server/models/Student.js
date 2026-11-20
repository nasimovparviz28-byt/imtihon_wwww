import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    phoneDigits: { type: String, required: true, unique: true },
    course: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('Student', studentSchema);
