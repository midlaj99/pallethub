import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplierDoc extends Document {
  name: string;
  contactName: string;
  email: string;
  passwordHash: string;
  phone: string;
  website?: string;
  leadTimeDays: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplierDoc>(
  {
    name: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    website: { type: String, default: '' },
    leadTimeDays: { type: Number, default: 3, min: 0 },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Supplier || mongoose.model<ISupplierDoc>('Supplier', SupplierSchema);
