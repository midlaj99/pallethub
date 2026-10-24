import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: Array<{
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String },
    addresses: [
      {
        fullName: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
