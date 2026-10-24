import React from 'react';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export const metadata = {
  title: 'Checkout — Palette Hubb',
  description: 'Complete your fashion order with secure payment and dropship express delivery.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
