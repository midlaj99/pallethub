import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Supplier from '@/models/Supplier';
import { comparePassword, createSupplierToken, SUPPLIER_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const supplier = await Supplier.findOne({ email: cleanEmail }).lean();

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!supplier.isActive) {
      return NextResponse.json(
        { success: false, error: 'This supplier account has been deactivated. Please contact administrator.' },
        { status: 403 }
      );
    }

    if (!supplier.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Account credentials not properly configured. Contact administrator.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, supplier.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const supplierId = supplier._id ? supplier._id.toString() : '';
    const token = await createSupplierToken({
      supplierId,
      email: supplier.email,
      name: supplier.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      supplier: {
        id: supplierId,
        name: supplier.name,
        email: supplier.email,
        contactName: supplier.contactName,
      },
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: SUPPLIER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Supplier login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected authentication error occurred' },
      { status: 500 }
    );
  }
}
