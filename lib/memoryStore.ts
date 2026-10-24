import { ICategory, IProduct, ISupplier, ICoupon, IOrder } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_COUPONS } from './data/initialData';

class MemoryStore {
  public categories: ICategory[] = [...INITIAL_CATEGORIES];
  public products: IProduct[] = [...INITIAL_PRODUCTS];
  public suppliers: ISupplier[] = [...INITIAL_SUPPLIERS];
  public coupons: ICoupon[] = [...INITIAL_COUPONS];
  public orders: IOrder[] = [
    {
      _id: 'ord_1',
      orderNumber: 'PH-98241',
      customer: {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        street: '402, Skyline Residency, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India',
      },
      items: [
        {
          productId: 'prod_1',
          name: 'Oversized T-Shirt',
          slug: 'oversized-t-shirt',
          image: '/images/products/oversized-tshirt.png',
          price: 799,
          quantity: 1,
          size: 'L',
          color: 'Charcoal Black',
        },
        {
          productId: 'prod_4',
          name: "Men's Watch",
          slug: 'mens-watch',
          image: '/images/products/mens-watch.png',
          price: 1999,
          quantity: 1,
          size: '42mm Case',
          color: 'Matte Black PVD',
        },
      ],
      subtotal: 2798,
      discount: 279.8,
      couponCode: 'WELCOME10',
      shipping: 0,
      tax: 125.9,
      total: 2644.1,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      razorpayOrderId: 'order_Nx88a912Kks',
      razorpayPaymentId: 'pay_Nx88b209Llo',
      orderStatus: 'Ordered from Supplier',
      supplierOrderRef: 'SUP-APX-44912',
      trackingNumber: 'BD-8829104',
      trackingCarrier: 'Bluedart Express',
      notes: 'Customer requested fast dispatch.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'ord_2',
      orderNumber: 'PH-98242',
      customer: {
        fullName: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 97123 45678',
        street: '12, Sunrise Avenue, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
      },
      items: [
        {
          productId: 'prod_2',
          name: 'Formal Blazer',
          slug: 'formal-blazer',
          image: '/images/products/formal-blazer.png',
          price: 2499,
          quantity: 1,
          size: '40',
          color: 'Midnight Black',
        },
      ],
      subtotal: 2499,
      discount: 0,
      shipping: 0,
      tax: 124.95,
      total: 2623.95,
      paymentMethod: 'test_pay',
      paymentStatus: 'paid',
      orderStatus: 'Shipped',
      supplierOrderRef: 'SUP-APX-44933',
      trackingNumber: 'DEL-9912847',
      trackingCarrier: 'Delhivery Surface',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];
}

declare global {
  // eslint-disable-next-line no-var
  var __memoryStore: MemoryStore | undefined;
}

const memoryStore: MemoryStore = global.__memoryStore || new MemoryStore();
if (!global.__memoryStore) {
  global.__memoryStore = memoryStore;
}

export default memoryStore;
