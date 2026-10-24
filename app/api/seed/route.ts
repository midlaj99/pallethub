import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_COUPONS,
} from '@/lib/data/initialData';

export async function POST() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Operating in in-memory mode. Data initialized.',
      });
    }

    // Clear existing collections and reseed
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await Coupon.deleteMany({});
    await User.deleteMany({});

    await Category.insertMany(INITIAL_CATEGORIES);
    await Product.insertMany(INITIAL_PRODUCTS);
    await Supplier.insertMany(INITIAL_SUPPLIERS);
    await Coupon.insertMany(INITIAL_COUPONS);

    // Create default Admin and Customer accounts
    await User.create([
      {
        name: 'Palette Hubb Admin',
        email: 'admin@palettehubb.com',
        passwordHash: 'admin123456',
        role: 'admin',
        phone: '+91 99999 11111',
      },
      {
        name: 'Demo Customer',
        email: 'customer@palettehubb.com',
        passwordHash: 'customer123',
        role: 'customer',
        phone: '+91 98888 22222',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'MongoDB collections successfully seeded with Palette Hubb catalog',
      counts: {
        categories: INITIAL_CATEGORIES.length,
        products: INITIAL_PRODUCTS.length,
        suppliers: INITIAL_SUPPLIERS.length,
        coupons: INITIAL_COUPONS.length,
      },
    });
  } catch (error: unknown) {
    console.error('Database seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Database seed failed' },
      { status: 500 }
    );
  }
}
