import React, { Suspense } from 'react';
import { connection } from 'next/server';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustBenefits from '@/components/home/TrustBenefits';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { IProduct, ICategory } from '@/types';

async function getHomePageData(): Promise<{
  featuredProducts: IProduct[];
  categories: ICategory[];
}> {
  await connection();
  let featuredProducts: IProduct[] = [];
  let categories: ICategory[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const [prods, cats] = await Promise.all([
        Product.find({ isFeatured: true, isAvailable: true }).limit(5).lean(),
        Category.find({ isActive: true }).sort({ order: 1 }).lean(),
      ]);

      if (prods && prods.length > 0) {
        featuredProducts = JSON.parse(JSON.stringify(prods));
      }
      if (cats && cats.length > 0) {
        categories = JSON.parse(JSON.stringify(cats));
      }
    }
  } catch (e) {
    console.error('Error fetching homepage data from DB:', e);
  }

  return { featuredProducts, categories };
}

async function HomeContent() {
  const { featuredProducts, categories } = await getHomePageData();

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Shop By Category */}
      <CategoryGrid initialCategories={categories} />

      {/* 3. Featured Products */}
      <FeaturedProducts initialProducts={featuredProducts} />

      {/* 4. Why Choose Us */}
      <TrustBenefits />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#f7f5ee] flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  );
}
