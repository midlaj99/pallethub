import React, { Suspense } from 'react';
import { connection } from 'next/server';
import ShopClient from '@/components/shop/ShopClient';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
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
  try {
    const db = await connectToDatabase();
    if (db) {
      const dbCats = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
      if (dbCats && dbCats.length > 0) {
        categoriesData = JSON.parse(JSON.stringify(dbCats));
      }

      const prods = await Product.find().lean();
      if (prods.length > 0) {
        const plainProds: IProduct[] = JSON.parse(JSON.stringify(prods));
        const categories = Array.from(new Set(plainProds.map((p) => p.category)));
        if (categoriesData.length === 0) {
          categoriesData = memoryStore.categories;
        }
        return { products: plainProds, categories, categoriesData };
      }
    }
  } catch (e) {
    console.error('Error fetching shop data from DB:', e);
  }

  const products = memoryStore.products;
  const categories = Array.from(new Set(products.map((p) => p.category)));
  categoriesData = memoryStore.categories;
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
