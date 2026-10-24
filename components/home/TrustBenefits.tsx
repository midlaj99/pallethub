'use client';

import React from 'react';
import { Truck, ShieldCheck, Star, Headphones } from 'lucide-react';

export default function TrustBenefits() {
  const benefits = [
    {
      icon: Truck,
      title: 'Worldwide Dropshipping',
      description: 'Get your favorite styles anywhere in the world.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payments',
      description: 'Shop with confidence and peace of mind.',
    },
    {
      icon: Star,
      title: 'Trendy & Premium',
      description: 'Latest trends, best quality products.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: "We're here to help, anytime.",
    },
  ];

  return (
    <section className="bg-[#f7f5ee] py-14 sm:py-18 border-t border-[#e5dfd3]/60 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Title Column matching reference */}
          <div className="lg:col-span-4">
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
              WHY CHOOSE US
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              More Than Just Fashion
            </h2>
          </div>

          {/* Right 4 Benefits Columns matching reference */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-300/60">
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex flex-col pt-4 sm:pt-0 ${
                    idx > 0 ? 'sm:pl-6' : ''
                  }`}
                >
                  <div className="mb-3 text-neutral-900">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
