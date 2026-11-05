'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ICategory } from '@/types';

export default function CategoryGrid({ initialCategories }: { initialCategories?: ICategory[] }) {
  const [categories, setCategories] = useState<ICategory[]>(initialCategories || []);
  const [loading, setLoading] = useState<boolean>(!initialCategories);

  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialCategories]);

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

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-neutral-200/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 justify-center items-center">
            {categories.map((cat) => (
              <Link
                key={cat.slug || cat.name}
                href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                className="group flex flex-col items-center text-center mx-auto w-full max-w-[200px]"
              >
                {/* Rounded card image container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-square bg-[#ece8de] rounded-2xl sm:rounded-3xl p-3 sm:p-4 overflow-hidden border border-[#ded7ca]/60 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] flex items-center justify-center">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={240}
                      height={240}
                      className="object-contain w-auto h-auto max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400 text-xs">
                      {cat.name}
                    </div>
                  )}
                </div>

                {/* Title & Arrow */}
                <div className="mt-3.5 flex items-center justify-center gap-1.5 text-neutral-900 group-hover:text-black font-semibold text-sm sm:text-base">
                  <span>{cat.name}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state when no categories created yet */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12 bg-white/60 rounded-3xl border border-dashed border-[#ded7ca] p-6 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-[#985842] mx-auto mb-2" />
            <h3 className="text-base font-bold text-neutral-800">Collections Being Prepared</h3>
            <p className="text-xs text-neutral-500 mt-1">
              New arrivals and curated categories will appear here once added in the Admin Dashboard.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
