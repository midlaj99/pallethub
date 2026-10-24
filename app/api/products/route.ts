import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import memoryStore from '@/lib/memoryStore';
import { IProduct } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
    const sort = searchParams.get('sort') || 'featured';
    const featured = searchParams.get('featured');

    const db = await connectToDatabase();

    if (db) {
      // Build MongoDB query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};

      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      if (featured === 'true') {
        query.isFeatured = true;
      }

      if (minPrice !== null || maxPrice !== null) {
        query.price = {};
        if (minPrice !== null) query.price.$gte = minPrice;
        if (maxPrice !== null) query.price.$lte = maxPrice;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let sortOpt: any = { createdAt: -1 };
      if (sort === 'price-asc') sortOpt = { price: 1 };
      if (sort === 'price-desc') sortOpt = { price: -1 };
      if (sort === 'rating') sortOpt = { rating: -1 };
      if (sort === 'featured') sortOpt = { isFeatured: -1, createdAt: -1 };

      const products = await Product.find(query).sort(sortOpt).lean();

      if (products.length > 0) {
        return NextResponse.json({ success: true, count: products.length, products });
      }
    }

    // Resilient fallback to memory store
    let filtered = [...memoryStore.products];

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase() === catLower ||
          p.category.toLowerCase().includes(catLower)
      );
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.tags?.some((t) => t.toLowerCase().includes(s))
      );
    }

    if (featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    if (minPrice !== null) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      products: filtered,
    });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newProduct: IProduct = {
      _id: `prod_${Date.now()}`,
      name: body.name,
      slug,
      description: body.description || '',
      category: body.category,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      discountPercent: body.originalPrice && body.originalPrice > body.price
        ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100)
        : 0,
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : ['/images/products/oversized-tshirt.png'],
      stock: body.stock ? Number(body.stock) : 10,
      variants: body.variants || { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] },
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: Boolean(body.isFeatured),
      isAvailable: body.isAvailable !== false,
      supplierId: body.supplierId || 'sup_1',
      tags: body.tags || [],
    };

    const db = await connectToDatabase();
    if (db) {
      await Product.create(newProduct);
    }

    memoryStore.products.unshift(newProduct);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
