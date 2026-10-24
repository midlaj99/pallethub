import React, { Suspense } from 'react';
import TrackOrderClient from '@/components/order/TrackOrderClient';

export const metadata = {
  title: 'Track Your Order — Palette Hubb',
  description: 'Check live dropship status and courier tracking for your order.',
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f5ee] flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
