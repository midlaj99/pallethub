import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Supplier from '@/models/Supplier';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const suppliers = await Supplier.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, suppliers });
    }

    return NextResponse.json({
      success: true,
      suppliers: [],
    });
  } catch (error: unknown) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Supplier company name, email, and phone are required' },
        { status: 400 }
      );
    }

    const plainPassword = body.password ? body.password.trim() : 'Supplier@123';
    if (plainPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Supplier password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(plainPassword);
    const cleanEmail = body.email.trim().toLowerCase();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const existing = await Supplier.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A supplier with this email already exists' },
        { status: 400 }
      );
    }

    const created = await Supplier.create({
      name: body.name.trim(),
      contactName: body.contactName ? body.contactName.trim() : body.name.trim(),
      email: cleanEmail,
      passwordHash,
      phone: body.phone.trim(),
      website: body.website ? body.website.trim() : '',
      leadTimeDays: Number(body.leadTimeDays) || 3,
      notes: body.notes ? body.notes.trim() : '',
      isActive: true,
    });

    const supplierData = created.toObject();
    delete supplierData.passwordHash;

    return NextResponse.json({ success: true, supplier: supplierData }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Supplier ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      await Supplier.findOneAndDelete({ _id: id });
    }

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
