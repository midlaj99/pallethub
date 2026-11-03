import React from 'react';
import SupplierDashboardClient from '@/components/supplier/SupplierDashboardClient';

export const metadata = {
  title: 'Supplier Portal & Fulfillment Center — Palette Hubb',
  description: 'Dedicated portal for Palette Hubb fulfillment partners to manage orders and delivery states.',
  robots: 'noindex, nofollow',
};

export default function SupplierDashboardPage() {
  return <SupplierDashboardClient />;
}
