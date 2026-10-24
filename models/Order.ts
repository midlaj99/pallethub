import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDoc extends Document {
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: 'razorpay' | 'cod' | 'test_pay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus:
    | 'Pending Payment'
    | 'Paid'
    | 'Processing'
    | 'Ordered from Supplier'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled'
    | 'Refunded';
  supplierOrderRef?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String },
        color: { type: String },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod', 'test_pay'],
      default: 'test_pay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderStatus: {
      type: String,
      enum: [
        'Pending Payment',
        'Paid',
        'Processing',
        'Ordered from Supplier',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Refunded',
      ],
      default: 'Paid',
      index: true,
    },
    supplierOrderRef: { type: String },
    trackingNumber: { type: String },
    trackingCarrier: { type: String, default: 'Bluedart Express' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrderDoc>('Order', OrderSchema);
