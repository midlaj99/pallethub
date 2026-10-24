'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShieldCheck, Globe, Zap, ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section id="promo" className="bg-[#f7f5ee] py-12 sm:py-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Panoramic Banner Card matching reference */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#111214] text-white overflow-hidden shadow-xl border border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            
            {/* Left Model Photography */}
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 md:col-span-4 w-full overflow-hidden bg-neutral-900">
              <Image
                src="/images/promo/upgrade-style-model.png"
                alt="Upgrade Your Style - Palette Hubb"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#111214]/30 to-[#111214]" />
            </div>

            {/* Center Editorial Copy */}
            <div className="p-6 sm:p-8 md:p-10 md:col-span-5 flex flex-col justify-center">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">
                NEW ARRIVALS
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
                Upgrade Your Style
              </h2>
              <p className="text-sm text-neutral-300 font-light mb-6">
                Fresh drops. Best deals. Only at Palette Hubb.
              </p>
              <div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-md group"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Value Propositions matching reference */}
            <div className="p-6 sm:p-8 md:p-6 md:col-span-3 border-t md:border-t-0 md:border-l border-neutral-800/80 flex flex-col justify-center gap-4 sm:gap-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 flex items-center justify-center text-amber-400">
                  <Star className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                  Premium Quality
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                  Secure Payments
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 flex items-center justify-center text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                  Worldwide Dropshipping
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 flex items-center justify-center text-neutral-200">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                  Fast Delivery
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
