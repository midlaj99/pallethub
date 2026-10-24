import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import memoryStore from '@/lib/memoryStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const db = await connectToDatabase();

    if (db) {
      const product = await Product.findOne({ slug }).lean();
      if (product) {
        return NextResponse.json({ success: true, product });
      }
    }

    const memoryProduct = memoryStore.products.find(
      (p) => p.slug === slug || p._id === slug
    );

    if (memoryProduct) {
      return NextResponse.json({ success: true, product: memoryProduct });
    }

    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    const db = await connectToDatabase();
    if (db) {
      await Product.findOneAndUpdate({ slug }, { $set: body }, { new: true });
    }

    const index = memoryStore.products.findIndex(
      (p) => p.slug === slug || p._id === slug
    );
    if (index !== -1) {
      memoryStore.products[index] = { ...memoryStore.products[index], ...body };
    }

    return NextResponse.json({
      success: true,
      product: memoryStore.products[index] || body,
    });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const db = await connectToDatabase();
    if (db) {
      await Product.findOneAndDelete({ slug });
    }

    memoryStore.products = memoryStore.products.filter(
      (p) => p.slug !== slug && p._id !== slug
    );

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
