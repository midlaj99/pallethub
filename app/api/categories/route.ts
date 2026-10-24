import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
import { ICategory } from '@/types';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
      if (categories.length > 0) {
        return NextResponse.json({ success: true, categories });
      }
    }

    return NextResponse.json({
      success: true,
      categories: memoryStore.categories,
    });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory: ICategory = {
      _id: `cat_${Date.now()}`,
      name: body.name,
      slug,
      description: body.description || '',
      image: body.image || '/images/categories/costume.png',
      itemCount: 0,
      isActive: true,
    };

    const db = await connectToDatabase();
    if (db) {
      await Category.create(newCategory);
    }

    memoryStore.categories.push(newCategory);

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Category slug is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      await Category.findOneAndDelete({ slug });
    }

    memoryStore.categories = memoryStore.categories.filter((c) => c.slug !== slug);

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
