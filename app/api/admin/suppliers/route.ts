import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Supplier from '@/models/Supplier';
import memoryStore from '@/lib/memoryStore';
import { ISupplier } from '@/types';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const suppliers = await Supplier.find().lean();
      if (suppliers.length > 0) {
        return NextResponse.json({ success: true, suppliers });
      }
    }

    return NextResponse.json({
      success: true,
      suppliers: memoryStore.suppliers,
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

    const newSupplier: ISupplier = {
      _id: `sup_${Date.now()}`,
      name: body.name,
      contactName: body.contactName || body.name,
      email: body.email,
      phone: body.phone,
      website: body.website || '',
      leadTimeDays: Number(body.leadTimeDays) || 3,
      notes: body.notes || '',
      isActive: true,
    };

    const db = await connectToDatabase();
    if (db) {
      await Supplier.create(newSupplier);
    }

    memoryStore.suppliers.push(newSupplier);

    return NextResponse.json({ success: true, supplier: newSupplier }, { status: 201 });
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

    memoryStore.suppliers = memoryStore.suppliers.filter((s) => s._id !== id);

    return NextResponse.json({ success: true, message: 'Supplier deleted' });
  } catch (error: unknown) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
