import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { notifyOrderUpdated } from '@/lib/realtime';

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
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const db = await connectToDatabase();
    if (db) {
      const updated = await Order.findOneAndUpdate(
        { $or: [{ orderNumber: id }, { _id: id }] },
        { $set: updates },
        { new: true }
      ).lean();

      if (updated) {
        notifyOrderUpdated(updated);
        return NextResponse.json({
          success: true,
          order: updated,
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Order not found or database unavailable' },
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
