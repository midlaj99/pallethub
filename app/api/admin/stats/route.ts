import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import Coupon from '@/models/Coupon';



export async function GET() {
  try {
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: true,
        stats: {
          totalSales: 0,
          totalOrders: 0,
          pendingSupplierFulfillment: 0,
          inTransitCount: 0,
          deliveredCount: 0,
          statusCounts: {
            'Pending Payment': 0,
            'Paid': 0,
            'Processing': 0,
            'Ordered from Supplier': 0,
            'Shipped': 0,
            'Delivered': 0,
            'Cancelled': 0,
            'Refunded': 0,
          },
          lowStockCount: 0,
          lowStockProducts: [],
          topProducts: [],
          totalProducts: 0,
          activeSuppliersCount: 0,
          activeOffersCount: 0,
        },
      });
    }

    const [orders, products, suppliers, coupons] = await Promise.all([
      Order.find().lean(),
      Product.find().lean(),
      Supplier.find().lean(),
      Coupon.find({ isActive: true }).lean(),
    ]);

    const totalSales = orders
      .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
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

    // Real Low Stock Alert: stock <= 10
    const lowStockProducts = products.filter((p) => Number(p.stock) <= 10);

    // Real Best Selling Products: Highest sales count or completed items
    const topProducts = [...products]
      .sort((a, b) => (Number(b.salesCount) || 0) - (Number(a.salesCount) || 0))
      .slice(0, 5);

    // Real Offers Count: Active coupons + products on sale
    const discountedProducts = products.filter(
      (p) => (p.discountPercent && p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price)
    );
    const activeOffersCount = coupons.length + discountedProducts.length;

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
        activeSuppliersCount: suppliers.filter((s) => s.isActive).length,
        activeOffersCount,
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
