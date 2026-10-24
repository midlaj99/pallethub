import React, { Suspense } from 'react';
import { connection } from 'next/server';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanner from '@/components/home/PromoBanner';
import TrustBenefits from '@/components/home/TrustBenefits';
import memoryStore from '@/lib/memoryStore';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { IProduct } from '@/types';

async function getFeaturedProducts(): Promise<IProduct[]> {
  await connection();
  try {
    const db = await connectToDatabase();
    if (db) {
      const prods = await Product.find({ isFeatured: true }).limit(5).lean();
      if (prods.length > 0) {
        return JSON.parse(JSON.stringify(prods));
      }
    }
  } catch (e) {
    console.error('Error fetching featured products for homepage', e);
  }
  return memoryStore.products.filter((p) => p.isFeatured).slice(0, 5);
}

async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProducts();
  return <FeaturedProducts initialProducts={featuredProducts} />;
}

function FeaturedProductsFallback() {
  const fallback = memoryStore.products.filter((p) => p.isFeatured).slice(0, 5);
  return <FeaturedProducts initialProducts={fallback} />;
}

export default function HomePage() {
  return (
    <div className="w-full">
      {/* 1. Hero Section matching original-db63c2b0d1ac5bdae882a2cc4b2643e4.webp */}
      <HeroSection />

      {/* 2. Shop By Category matching Palette Hubb Fashion Store Homepage.png */}
      <CategoryGrid />

      {/* 3. Featured Products Top Picks matching Palette Hubb Fashion Store Homepage.png */}
      <Suspense fallback={<FeaturedProductsFallback />}>
        <FeaturedProductsSection />
      </Suspense>

      {/* 4. Promotional Banner Upgrade Your Style matching Palette Hubb Fashion Store Homepage.png */}
      <PromoBanner />

      {/* 5. Why Choose Us More Than Just Fashion matching Palette Hubb Fashion Store Homepage.png */}
      <TrustBenefits />
    </div>
  );
}
