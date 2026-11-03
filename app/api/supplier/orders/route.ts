import { NextRequest, NextResponse } from 'next/server';
import { getSupplierSession } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { notifyOrderUpdated } from '@/lib/realtime';

export async function GET(req: NextRequest) {
  try {
    const session = await getSupplierSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized supplier' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: true, count: 0, orders: [] });
    }

    // Query orders that contain at least one item assigned to this supplier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      $or: [
        { 'items.supplierId': session.supplierId },
        { 'items.supplierName': session.name },
      ],
    };

    if (status && status !== 'all') {
      query['items.itemStatus'] = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Map each order to highlight items specifically belonging to this supplier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supplierOrders = orders.map((ord: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assignedItems = ord.items.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (it: any) => it.supplierId === session.supplierId || it.supplierName === session.name
      );
      return {
        ...ord,
        assignedItems,
      };
    });

    return NextResponse.json({
      success: true,
      count: supplierOrders.length,
      orders: supplierOrders,
    });
  } catch (error: unknown) {
    console.error('Supplier orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve supplier orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSupplierSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, productId, itemStatus, trackingNumber, trackingCarrier, notes } = body;

    if (!orderId || !itemStatus) {
      return NextResponse.json(
        { success: false, error: 'orderId and itemStatus are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(itemStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid delivery status provided' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    let modified = false;

    // Update item(s) assigned to this supplier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order.items.forEach((item: any) => {
      const isMyItem =
        item.supplierId === session.supplierId ||
        item.supplierName === session.name ||
        (!item.supplierId && !item.supplierName); // fallback if product had no explicit supplier

      const matchesProduct = !productId || item.productId === productId;

      if (isMyItem && matchesProduct) {
        item.itemStatus = itemStatus;
        if (trackingNumber) item.trackingNumber = trackingNumber;
        if (trackingCarrier) item.trackingCarrier = trackingCarrier;
        modified = true;
      }
    });

    if (!modified) {
      return NextResponse.json(
        { success: false, error: 'No items matching this supplier in the specified order' },
        { status: 403 }
      );
    }

    // Auto-update overall order status if all items have progressed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allDelivered = order.items.every((it: any) => it.itemStatus === 'Delivered');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allDispatchedOrDelivered = order.items.every(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (it: any) => it.itemStatus === 'Dispatched' || it.itemStatus === 'Delivered'
    );

    if (allDelivered) {
      order.orderStatus = 'Delivered';
    } else if (allDispatchedOrDelivered) {
      order.orderStatus = 'Shipped';
    } else if (itemStatus === 'Processing' && order.orderStatus === 'Paid') {
      order.orderStatus = 'Processing';
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingCarrier) order.trackingCarrier = trackingCarrier;
    if (notes) order.notes = notes;

    await order.save();

    notifyOrderUpdated(order);

    return NextResponse.json({
      success: true,
      message: 'Fulfillment status updated successfully',
      order,
    });
  } catch (error: unknown) {
    console.error('Supplier order status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
