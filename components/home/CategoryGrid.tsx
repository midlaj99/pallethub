'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Costume',
    slug: 'Costume',
    image: '/images/categories/costume.png',
  },
  {
    name: 'Accessories',
    slug: 'Accessories',
    image: '/images/categories/accessories.png',
  },
  {
    name: 'Caps',
    slug: 'Caps & Hats',
    image: '/images/categories/caps.png',
  },
  {
    name: 'Hoodies',
    slug: 'Hoodies & Shows',
    image: '/images/categories/hoodies.png',
  },
  {
    name: 'Watches',
    slug: 'Luxury Watches',
    image: '/images/categories/watches.png',
  },
  {
    name: 'Chains',
    slug: 'Chains & Necklaces',
    image: '/images/categories/chains.png',
  },
];

export default function CategoryGrid() {
  return (
    <section id="categories" className="bg-[#f7f5ee] py-10 sm:py-14 border-b border-[#e5dfd3]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#985842] uppercase">
            Curated Collections
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mt-1.5">
            Shop By Category
          </h2>
          <div className="w-12 h-0.5 bg-[#985842]/40 mx-auto mt-3 rounded-full" />
        </div>

        {/* Centered Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 justify-center items-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group flex flex-col items-center text-center mx-auto w-full max-w-[200px]"
            >
              {/* Rounded card image container */}
              <div className="relative w-full aspect-[4/3] sm:aspect-square bg-[#ece8de] rounded-2xl sm:rounded-3xl p-3 sm:p-4 overflow-hidden border border-[#ded7ca]/60 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] flex items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={240}
                  height={240}
                  className="object-contain max-h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Title & Arrow */}
              <div className="mt-3.5 flex items-center justify-center gap-1.5 text-neutral-900 group-hover:text-black font-semibold text-sm sm:text-base">
                <span>{cat.name}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
