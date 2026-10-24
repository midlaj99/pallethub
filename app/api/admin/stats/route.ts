import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import memoryStore from '@/lib/memoryStore';

export async function GET() {
  try {
    const db = await connectToDatabase();
    let orders = memoryStore.orders;
    let products = memoryStore.products;

    if (db) {
      const dbOrders = await Order.find().lean();
      if (dbOrders.length > 0) orders = dbOrders as unknown as typeof memoryStore.orders;

      const dbProducts = await Product.find().lean();
      if (dbProducts.length > 0) products = dbProducts as unknown as typeof memoryStore.products;
    }

    const totalSales = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const totalOrders = orders.length;

    const statusCounts: Record<string, number> = {
      'Pending Payment': 0,
      'Paid': 0,
      'Processing': 0,
      'Ordered from Supplier': 0,
      'Shipped': 0,
      'Delivered': 0,
      'Cancelled': 0,
      'Refunded': 0,
    };

    orders.forEach((o) => {
      if (statusCounts[o.orderStatus] !== undefined) {
        statusCounts[o.orderStatus]++;
      }
    });

    const lowStockProducts = products.filter((p) => p.stock <= 20);
    const topProducts = [...products]
      .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        pendingSupplierFulfillment:
          (statusCounts['Paid'] || 0) + (statusCounts['Processing'] || 0),
        inTransitCount:
          (statusCounts['Ordered from Supplier'] || 0) + (statusCounts['Shipped'] || 0),
        deliveredCount: statusCounts['Delivered'] || 0,
        statusCounts,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        topProducts,
        totalProducts: products.length,
      },
    });
  } catch (error: unknown) {
    console.error('Error calculating admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
