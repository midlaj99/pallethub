'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const { applyCoupon } = useCart();

  if (!isVisible) return null;

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    await applyCoupon('WELCOME10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <aside
      aria-label="Promotion"
      className="bg-[#0e261a] text-white text-xs sm:text-sm py-2 px-4 transition-all duration-300 relative z-50 select-none border-b border-emerald-950/40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close promotion banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Center message & pill badge */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap text-center">
          <span className="bg-white text-[#0e261a] font-semibold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Special
          </span>
          <span className="text-neutral-100 font-medium">
            10% Off Your First Purchase
          </span>
          <button
            onClick={handleApplyCoupon}
            className="text-white underline underline-offset-4 font-semibold hover:text-emerald-200 transition-colors cursor-pointer"
          >
            {copied ? 'Applied (WELCOME10)!' : 'Get Started'}
          </button>
        </div>

        {/* Right spacing balance */}
        <div className="w-5 hidden sm:block" />
      </div>
    </aside>
  );
}
