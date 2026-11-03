import React, { Suspense } from 'react';
import { connection } from 'next/server';
import ShopClient from '@/components/shop/ShopClient';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { IProduct, ICategory } from '@/types';

export const metadata = {
  title: 'Shop All Collections — Palette Hubb Fashion & Accessories',
  description:
    'Browse our complete catalog of oversized streetwear tees, formal blazers, caps, luxury watches, and cuban chains.',
};

async function getShopData(): Promise<{
  products: IProduct[];
  categories: string[];
  categoriesData: ICategory[];
}> {
  await connection();
  let categoriesData: ICategory[] = [];
  let products: IProduct[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const [dbCats, dbProds] = await Promise.all([
        Category.find({ isActive: true }).sort({ order: 1 }).lean(),
        Product.find({ isAvailable: true }).sort({ createdAt: -1 }).lean(),
      ]);

      if (dbCats && dbCats.length > 0) {
        categoriesData = JSON.parse(JSON.stringify(dbCats));
      }
      if (dbProds && dbProds.length > 0) {
        products = JSON.parse(JSON.stringify(dbProds));
      }
    }
  } catch (e) {
    console.error('Error fetching shop data from DB:', e);
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));
  return { products, categories, categoriesData };
}

async function ShopContent() {
  const { products, categories, categoriesData } = await getShopData();
  return (
    <ShopClient
      initialProducts={products}
      categories={categories}
      categoriesData={categoriesData}
    />
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f5ee] flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
