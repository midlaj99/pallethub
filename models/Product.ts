import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDoc extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  images: string[];
  stock: number;
  variants: {
    sizes: string[];
    colors: string[];
  };
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isAvailable: boolean;
  supplierId?: Schema.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    images: { type: [String], required: true },
    stock: { type: Number, required: true, default: 10 },
    variants: {
      sizes: { type: [String], default: [] },
      colors: { type: [String], default: [] },
    },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 24 },
    isFeatured: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProductDoc>('Product', ProductSchema);
