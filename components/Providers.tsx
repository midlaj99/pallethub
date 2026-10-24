'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import CartDrawer from '@/components/cart/CartDrawer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
