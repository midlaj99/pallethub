import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import memoryStore from '@/lib/memoryStore';
import { IOrder, IOrderItem } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    const db = await connectToDatabase();
    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};
      if (email) query['customer.email'] = email.toLowerCase();
      if (status && status !== 'all') query.orderStatus = status;

      const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
      if (orders.length > 0) {
        return NextResponse.json({ success: true, count: orders.length, orders });
      }
    }

    let filtered = [...memoryStore.orders];
    if (email) {
      filtered = filtered.filter(
        (o) => o.customer.email.toLowerCase() === email.toLowerCase()
      );
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((o) => o.orderStatus === status);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      orders: filtered,
    });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, couponCode, paymentMethod } = body;

    if (!customer || !customer.fullName || !customer.email || !customer.phone || !customer.street) {
      return NextResponse.json(
        { success: false, error: 'Complete customer shipping address is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE RECALCULATION
    // Fetch real products to compute genuine subtotal
    const verifiedItems: IOrderItem[] = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const dbProduct = memoryStore.products.find(
        (p) => p._id === item.productId || p.slug === item.slug
      );

      const actualPrice = dbProduct ? dbProduct.price : item.price;
      const qty = Math.max(1, Number(item.quantity) || 1);

      verifiedItems.push({
        productId: item.productId,
        name: dbProduct ? dbProduct.name : item.name,
        slug: dbProduct ? dbProduct.slug : item.slug,
        image: dbProduct && dbProduct.images[0] ? dbProduct.images[0] : item.image,
        price: actualPrice,
        quantity: qty,
        size: item.size,
        color: item.color,
      });

      serverSubtotal += actualPrice * qty;
    }

    // Server-side discount calculation
    let discount = 0;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = memoryStore.coupons.find((c) => c.code === cleanCode && c.isActive);
      if (coupon && (!coupon.minOrderAmount || serverSubtotal >= coupon.minOrderAmount)) {
        if (coupon.discountType === 'percentage') {
          discount = (serverSubtotal * coupon.value) / 100;
        } else {
          discount = coupon.value;
        }
        discount = Math.min(discount, serverSubtotal);
      }
    }

    const shipping = serverSubtotal >= 1499 ? 0 : 99; // Free shipping above ₹1499
    const tax = Math.round((serverSubtotal - discount) * 0.05 * 100) / 100; // 5% GST
    const finalTotal = Math.round((serverSubtotal - discount + shipping + tax) * 100) / 100;

    const orderNumber = `PH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: IOrder = {
      _id: `ord_${Date.now()}`,
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        street: customer.street.trim(),
        city: customer.city.trim(),
        state: customer.state.trim(),
        pincode: customer.pincode.trim(),
        country: customer.country || 'India',
      },
      items: verifiedItems,
      subtotal: serverSubtotal,
      discount: Math.round(discount * 100) / 100,
      couponCode: discount > 0 ? couponCode : undefined,
      shipping,
      tax,
      total: finalTotal,
      paymentMethod: paymentMethod || 'test_pay',
      paymentStatus: 'paid',
      razorpayOrderId: body.razorpayOrderId || `order_${Math.random().toString(36).substring(2, 10)}`,
      razorpayPaymentId: body.razorpayPaymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
      orderStatus: 'Paid',
      supplierOrderRef: `SUP-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingNumber: `EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      trackingCarrier: 'Bluedart Express',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = await connectToDatabase();
    if (db) {
      await Order.create(newOrder);
    }

    memoryStore.orders.unshift(newOrder);

    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully',
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
