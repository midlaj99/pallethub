'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  ChevronDown,
  Menu,
  X,
  Package,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ICategory } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const { totalItemsCount, setIsOpen } = useCart();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

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

            {/* Dynamic Categories & Subcategories added from Admin */}
            {categories.map((cat) => {
              const catName = cat.name;
              const catSlug = cat.slug || cat.name;
              const subcategories = cat.subcategories || [];

              return (
                <div
                  key={cat._id || catSlug}
                  className="relative group py-2"
                  onMouseEnter={() => setActiveDropdown(catName)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={`/shop?category=${encodeURIComponent(catSlug)}`}
                    className="flex items-center gap-1 hover:text-black transition-colors"
                  >
                    <span>{catName}</span>
                    {subcategories.length > 0 && (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Dropdown Menu showing subcategories on hover */}
                  {activeDropdown === catName && subcategories.length > 0 && (
                    <div className="absolute top-full left-0 w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Subcategories
                      </div>

                      <Link
                        href={`/shop?category=${encodeURIComponent(catSlug)}`}
                        className="flex items-center justify-between px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        <span>All {catName}</span>
                        <span className="text-[10px] text-neutral-400 font-semibold">View All →</span>
                      </Link>

                      <div className="h-px bg-neutral-100 my-1" />

                      {subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/shop?category=${encodeURIComponent(catSlug)}&subcategory=${encodeURIComponent(sub)}`}
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors"
                        >
                          <span>{sub}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

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
              placeholder="Search collections..."
              className="w-full bg-[#eeeae0] text-neutral-800 placeholder:text-neutral-500 text-xs rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-black border-transparent"
            />
          </form>

          {/* Right Action Icons: Wishlist & Bag */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wishlist Link */}
            <Link
              href="/shop?wishlist=true"
              className="relative p-2 rounded-full hover:bg-[#ece8de] text-neutral-800 transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button with totalItemsCount Pill */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              {totalItemsCount > 0 && (
                <span className="bg-[#e4d5be] text-black font-extrabold text-[11px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-800 hover:bg-[#ece8de] lg:hidden transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#ded7ca] py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative px-2">
              <Search className="w-4 h-4 text-neutral-400 absolute left-5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full bg-[#eeeae0] text-neutral-800 placeholder:text-neutral-500 text-xs rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </form>

            {/* Mobile Links */}
            <div className="flex flex-col space-y-1 px-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-black" />
                  Shop All Products
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black px-2 py-0.5 rounded-full">
                  Shop
                </span>
              </Link>

              {categories.length > 0 && (
                <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Categories & Subcategories
                </div>
              )}

              {/* Dynamic Mobile Categories & Subcategories */}
              {categories.map((cat) => {
                const catName = cat.name;
                const catSlug = cat.slug || cat.name;
                const subcategories = cat.subcategories || [];
                const isExpanded = mobileCategoryOpen === catName;

                return (
                  <div key={cat._id || catSlug} className="space-y-1">
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white transition-colors">
                      <Link
                        href={`/shop?category=${encodeURIComponent(catSlug)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 font-semibold"
                      >
                        {catName}
                      </Link>
                      {subcategories.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileCategoryOpen(isExpanded ? null : catName);
                          }}
                          className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {isExpanded && subcategories.length > 0 && (
                      <div className="ml-4 pl-3 border-l-2 border-neutral-200 space-y-1 py-1 animate-in fade-in duration-150">
                        <Link
                          href={`/shop?category=${encodeURIComponent(catSlug)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-2.5 py-1.5 text-xs font-bold text-neutral-900 hover:bg-white rounded-md"
                        >
                          All {catName}
                        </Link>
                        {subcategories.map((sub) => (
                          <Link
                            key={sub}
                            href={`/shop?category=${encodeURIComponent(catSlug)}&subcategory=${encodeURIComponent(sub)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-black hover:bg-white rounded-md"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

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
