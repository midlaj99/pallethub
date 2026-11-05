'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section id="promo" className="bg-[#f7f5ee] py-12 sm:py-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Panoramic Banner Card */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#111214] text-white overflow-hidden shadow-xl border border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            
            {/* Left Model Photography */}
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 md:col-span-5 w-full overflow-hidden bg-neutral-900">
              <Image
                src="/images/promo/upgrade-style-model.png"
                alt="Explore Collections - Palette Hubb"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#111214]/40 to-[#111214]" />
            </div>

            {/* Right-Aligned Editorial Text */}
            <div className="p-6 sm:p-10 md:p-12 md:col-span-7 flex flex-col justify-center items-start md:items-end text-left md:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/10 text-white/90 text-xs font-semibold tracking-widest uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Curated Drops</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3">
                Explore Collections
              </h2>

              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-lg mb-6">
                Fresh drops. Best deals. Elevate your everyday wardrobe with our curated seasonal styles. Only at Palette Hubb.
              </p>

              <div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group hover:scale-[1.02]"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Value Highlights */}
              <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center gap-3 text-[11px] sm:text-xs text-neutral-400 flex-wrap justify-start md:justify-end">
                <span>✦ Premium Quality</span>
                <span className="text-neutral-600">•</span>
                <span>Worldwide Delivery</span>
                <span className="text-neutral-600">•</span>
                <span>Secure Checkout</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
