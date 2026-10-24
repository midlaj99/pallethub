'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Filter,
  SlidersHorizontal,
  Search,
  ShoppingCart,
  Heart,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { IProduct } from '@/types';

interface ShopClientProps {
  initialProducts: IProduct[];
  categories: string[];
}

export default function ShopClient({
  initialProducts,
  categories,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist, wishlist } = useWishlist();

  const [products] = useState<IProduct[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get('sort') || 'featured'
  );
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(
    searchParams.get('wishlist') === 'true'
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    if (searchParams.get('wishlist') === 'true') setShowWishlistOnly(true);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const lower = selectedCategory.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase() === lower ||
          p.category.toLowerCase().includes(lower)
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Price range filter
    result = result.filter((p) => p.price <= priceRange);

    // In-stock only
    if (showInStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Wishlist only
    if (showWishlistOnly) {
      result = result.filter((p) => wishlist.includes(p._id));
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [
    products,
    selectedCategory,
    searchQuery,
    priceRange,
    showInStockOnly,
    showWishlistOnly,
    sortBy,
    wishlist,
  ]);

  const handleAddToCart = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    const size = product.variants?.sizes?.[0] || 'Standard';
    addItem(product, 1, size);

    setAddedIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const handleBuyNow = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.variants?.sizes?.[0] || 'Standard';
    addItem(product, 1, size);
    router.push('/checkout');
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange(5000);
    setShowInStockOnly(false);
    setShowWishlistOnly(false);
    setSortBy('featured');
    router.push('/shop');
  };

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-8 sm:py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">Shop Catalog</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
                {showWishlistOnly
                  ? 'Your Wishlist'
                  : selectedCategory !== 'all'
                  ? selectedCategory
                  : 'All Collections'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Showing {filteredProducts.length} curated products direct from verified suppliers
              </p>
            </div>

            {/* Mobile Filter Toggle & Sort Dropdown */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-neutral-800 focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="featured">Featured Drops</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-white/70 backdrop-blur-sm p-6 rounded-3xl border border-neutral-200/80 shadow-sm h-fit sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
                <Filter className="w-4 h-4" />
                <span>Filter Products</span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-neutral-500 hover:text-black hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Search within catalog */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keyword, product..."
                  className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5">
                Categories
              </label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-black text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter(
                    (p) => p.category.toLowerCase() === cat.toLowerCase()
                  ).length;
                  const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="text-neutral-400 text-[11px]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                <span>Max Price</span>
                <span>₹ {priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="499"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                <span>₹499</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
              <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="rounded text-black focus:ring-0 accent-black cursor-pointer"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWishlistOnly}
                  onChange={(e) => setShowWishlistOnly(e.target.checked)}
                  className="rounded text-black focus:ring-0 accent-black cursor-pointer"
                />
                <span>Wishlisted Only ({wishlist.length})</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <p className="text-base font-bold text-neutral-900 mb-2">
                  No products matched your criteria
                </p>
                <p className="text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your search keywords, price filter, or switching categories.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-black text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-neutral-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = isInWishlist(product._id);
                  const isAdded = addedIds[product._id];

                  return (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl sm:rounded-3xl p-3.5 border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Image container */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100">
                        <Link href={`/products/${product.slug}`} className="block w-full h-full">
                          <Image
                            src={product.images[0] || '/images/products/oversized-tshirt.png'}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </Link>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product._id);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-800 shadow-sm transition-all duration-200 hover:scale-110"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-700'
                            }`}
                          />
                        </button>

                        {/* Badge */}
                        {product.discountPercent && product.discountPercent > 0 ? (
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                            {product.discountPercent}% OFF
                          </span>
                        ) : null}
                      </div>

                      {/* Info */}
                      <div className="pt-4 pb-2">
                        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-bold text-sm sm:text-base text-neutral-900 hover:text-black line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-extrabold text-sm sm:text-base text-black">
                            ₹ {product.price.toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-neutral-400 line-through">
                              ₹ {product.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dual Action buttons: Add to Cart & Buy Now */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock <= 0}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:scale-[0.98]'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Cart</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => handleBuyNow(product, e)}
                          disabled={product.stock <= 0}
                          className="py-2 px-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-black flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="font-bold text-sm text-neutral-900">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Categories</label>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setMobileFilterOpen(false);
                      }}
                      className={`text-left text-xs px-3 py-2 rounded-lg ${
                        selectedCategory === 'all' ? 'bg-black text-white font-bold' : ''
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setSelectedCategory(c);
                          setMobileFilterOpen(false);
                        }}
                        className={`text-left text-xs px-3 py-2 rounded-lg ${
                          selectedCategory === c ? 'bg-black text-white font-bold' : ''
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">
                    Max Price: ₹{priceRange}
                  </label>
                  <input
                    type="range"
                    min="499"
                    max="5000"
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-black"
                  />
                </div>
              </div>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
