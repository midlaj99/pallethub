import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import memoryStore from '@/lib/memoryStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = await connectToDatabase();

    if (db) {
      const order = await Order.findOne({
        $or: [{ orderNumber: id }, { _id: id }],
      }).lean();
      if (order) {
        return NextResponse.json({ success: true, order });
      }
    }

    const memoryOrder = memoryStore.orders.find(
      (o) => o.orderNumber.toLowerCase() === id.toLowerCase() || o._id === id
    );

    if (memoryOrder) {
      return NextResponse.json({ success: true, order: memoryOrder });
    }

    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const allowedFields = [
      'orderStatus',
      'paymentStatus',
      'supplierOrderRef',
      'trackingNumber',
      'trackingCarrier',
      'notes',
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = { updatedAt: new Date().toISOString() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const db = await connectToDatabase();
    if (db) {
      await Order.findOneAndUpdate(
        { $or: [{ orderNumber: id }, { _id: id }] },
        { $set: updates },
        { new: true }
      );
    }

    const index = memoryStore.orders.findIndex(
      (o) => o.orderNumber === id || o._id === id
    );
    if (index !== -1) {
      memoryStore.orders[index] = { ...memoryStore.orders[index], ...updates };
      return NextResponse.json({
        success: true,
        order: memoryStore.orders[index],
      });
    }

    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
