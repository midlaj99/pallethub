import mongoose, { Schema, Document } from 'mongoose';

export interface ICouponDoc extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: Date;
  timesUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    timesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model<ICouponDoc>('Coupon', CouponSchema);
