'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Package,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const router = useRouter();
  const { totalItemsCount, setIsOpen } = useCart();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navCategories = [
    {
      name: 'Clothing',
      href: '/shop?category=Costume',
      items: [
        { name: 'Oversized T-Shirts', href: '/products/oversized-t-shirt' },
        { name: 'Tailored Formal Blazers', href: '/products/formal-blazer' },
        { name: 'Minimalist Hoodies', href: '/products/oversized-minimalist-hoodie' },
      ],
    },
    {
      name: 'Accessories',
      href: '/shop?category=Accessories',
      items: [
        { name: 'Matte Beaded Bracelets', href: '/products/matte-beaded-bracelet-set' },
        { name: 'Sunglasses & Shades', href: '/shop?category=Accessories' },
        { name: 'All Lifestyle Accessories', href: '/shop?category=Accessories' },
      ],
    },
    {
      name: 'Watches',
      href: '/shop?category=Luxury%20Watches',
      items: [
        { name: "Men's Stealth Watch", href: '/products/mens-watch' },
        { name: 'Matte Chronographs', href: '/shop?category=Luxury%20Watches' },
      ],
    },
    {
      name: 'Chains',
      href: '/shop?category=Chains%20%26%20Necklaces',
      items: [
        { name: 'Miami Cuban Link Chains', href: '/products/chain-necklace' },
        { name: 'Layered Necklaces', href: '/shop?category=Chains%20%26%20Necklaces' },
      ],
    },
    {
      name: 'Caps',
      href: '/shop?category=Caps%20%26%20Hats',
      items: [
        { name: 'Embroidered Dad Caps', href: '/products/trendy-cap' },
        { name: 'Streetwear Snapbacks', href: '/shop?category=Caps%20%26%20Hats' },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f7f5ee] border-b border-[#e5dfd3]/60 transition-colors backdrop-blur-md bg-[#f7f5ee]/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Official Brand Logo */}
          <div className="flex-shrink-0">
            <Logo variant="light" size="md" />
          </div>

          {/* Center-Left: Desktop Navigation with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-neutral-800 text-[14px] font-medium">
            <Link
              href="/"
              className="hover:text-black transition-colors hover:underline underline-offset-8"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="hover:text-black transition-colors hover:underline underline-offset-8"
            >
              Shop
            </Link>

            {navCategories.map((cat) => (
              <div
                key={cat.name}
                className="relative group py-2"
                onMouseEnter={() => setActiveDropdown(cat.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={cat.href}
                  className="flex items-center gap-1 hover:text-black transition-colors"
                >
                  <span>{cat.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                {/* Dropdown Menu */}
                {activeDropdown === cat.name && (
                  <div className="absolute top-full left-0 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {cat.items.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="block px-4 py-2 text-xs sm:text-sm text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/track-order"
              className="hover:text-black transition-colors hover:underline underline-offset-8"
            >
              Track Order
            </Link>
          </nav>

          {/* Center-Right: Search Input Pill */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-xs xl:max-w-sm w-full"
          >
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Product..."
              className="w-full bg-white rounded-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all shadow-sm"
            />
          </form>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Quick Shop Button in Navbar Header Wrapper */}
            <Link
              href="/shop"
              className="lg:hidden flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-full bg-black text-white hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
              aria-label="Shop Catalog"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop</span>
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/shop?wishlist=true"
              className="relative p-2 text-neutral-700 hover:text-black hover:bg-neutral-200/50 rounded-full transition-colors hidden sm:flex"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-neutral-800 hover:text-black hover:bg-neutral-200/50 rounded-full transition-colors flex items-center"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-800 hover:text-black rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200 space-y-3 animate-in fade-in duration-200">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white rounded-xl py-2 pl-9 pr-4 text-sm border border-neutral-200 focus:outline-none shadow-sm"
              />
            </form>

            {/* Primary Action Buttons in Mobile View */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black text-white text-sm font-bold text-center shadow-sm hover:bg-neutral-800 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Catalog</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-neutral-200 text-neutral-800 text-sm font-semibold text-center hover:bg-neutral-50 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-600" />
                <span>Admin Panel</span>
              </Link>
            </div>

            {/* Navigation Links in Mobile View */}
            <div className="space-y-1 pt-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-900 hover:bg-white transition-colors"
              >
                <span>Home</span>
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-neutral-900 bg-white border border-neutral-200 shadow-xs hover:bg-neutral-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-black" />
                  Shop All Products
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black px-2 py-0.5 rounded-full">
                  Shop
                </span>
              </Link>

              <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Categories
              </div>

              {navCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:text-black hover:bg-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-neutral-200/60 space-y-1">
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white transition-colors"
                >
                  <Package className="w-4 h-4 text-neutral-500" />
                  <span>Track Your Order</span>
                </Link>

                <Link
                  href="/shop?wishlist=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-neutral-500" />
                    <span>My Wishlist</span>
                  </span>
                  {wishlist.length > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
