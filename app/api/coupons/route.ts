import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Coupon from '@/models/Coupon';
import memoryStore from '@/lib/memoryStore';
import { ICoupon } from '@/types';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      if (coupons.length > 0) {
        return NextResponse.json({ success: true, coupons });
      }
    }

    return NextResponse.json({ success: true, coupons: memoryStore.coupons });
  } catch (error: unknown) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve coupons' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.code || body.value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Coupon code and value are required' },
        { status: 400 }
      );
    }

    const code = String(body.code).trim().toUpperCase();
    const newCoupon: ICoupon = {
      _id: `coup_${Date.now()}`,
      code,
      discountType: body.discountType === 'fixed' ? 'fixed' : 'percentage',
      value: Number(body.value),
      minOrderAmount: Number(body.minOrderAmount) || 0,
      isActive: body.isActive !== false,
      expiresAt: body.expiresAt || undefined,
    };

    const db = await connectToDatabase();
    if (db) {
      await Coupon.findOneAndUpdate(
        { code },
        { $set: newCoupon },
        { upsert: true, new: true }
      );
    }

    const existingIdx = memoryStore.coupons.findIndex((c) => c.code === code);
    if (existingIdx !== -1) {
      memoryStore.coupons[existingIdx] = newCoupon;
    } else {
      memoryStore.coupons.unshift(newCoupon);
    }

    return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const code = String(body.code).trim().toUpperCase();
    const db = await connectToDatabase();
    if (db) {
      await Coupon.findOneAndUpdate({ code }, { $set: body }, { new: true });
    }

    const idx = memoryStore.coupons.findIndex((c) => c.code === code);
    if (idx !== -1) {
      memoryStore.coupons[idx] = { ...memoryStore.coupons[idx], ...body };
    }

    return NextResponse.json({ success: true, coupon: memoryStore.coupons[idx] || body });
  } catch (error: unknown) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.toUpperCase();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      await Coupon.findOneAndDelete({ code });
    }

    memoryStore.coupons = memoryStore.coupons.filter((c) => c.code !== code);

    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error: unknown) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
