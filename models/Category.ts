import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDoc extends Document {
  name: string;
  slug: string;
  description?: string;
  image: string;
  itemCount: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, required: true },
    itemCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model<ICategoryDoc>('Category', CategorySchema);
